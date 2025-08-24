-- Enhanced wish completion function with proper balance validation and error handling
CREATE OR REPLACE FUNCTION public.complete_wish(
    p_wish_id UUID,
    p_assignee_id UUID
)
RETURNS JSON AS $
DECLARE
    wish_record RECORD;
    creator_balance INTEGER;
BEGIN
    -- Get wish details
    SELECT * INTO wish_record FROM public.wishes WHERE id = p_wish_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'WISH_NOT_FOUND', 'message', 'Желание не найдено');
    END IF;
    
    -- Check if wish is in correct status
    IF wish_record.status != 'in_progress' THEN
        RETURN json_build_object('success', false, 'error', 'INVALID_STATUS', 'message', 'Желание должно быть в статусе "в процессе"');
    END IF;
    
    -- Check if assignee matches
    IF wish_record.assignee_id != p_assignee_id THEN
        RETURN json_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Только назначенный исполнитель может завершить желание');
    END IF;
    
    -- Get creator's current balance
    CASE wish_record.type
        WHEN 'green' THEN
            SELECT green_balance INTO creator_balance FROM public.wallets WHERE user_id = wish_record.creator_id;
        WHEN 'blue' THEN
            SELECT blue_balance INTO creator_balance FROM public.wallets WHERE user_id = wish_record.creator_id;
        WHEN 'red' THEN
            SELECT red_balance INTO creator_balance FROM public.wallets WHERE user_id = wish_record.creator_id;
    END CASE;
    
    -- Check if creator has sufficient funds
    IF creator_balance < wish_record.cost THEN
        RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_FUNDS', 'message', 'У создателя желания недостаточно средств для оплаты');
    END IF;
    
    -- Begin atomic transaction
    BEGIN
        -- Update wish status
        UPDATE public.wishes 
        SET status = 'completed', updated_at = NOW()
        WHERE id = p_wish_id;
        
        -- Deduct cost from creator's wallet
        IF NOT public.update_wallet_balance(
            wish_record.creator_id,
            wish_record.type::currency_type,
            -wish_record.cost,
            'Оплата желания: ' || wish_record.title,
            'spend',
            p_wish_id
        ) THEN
            RAISE EXCEPTION 'Failed to deduct from creator wallet';
        END IF;
        
        -- Add reward to assignee's wallet
        IF NOT public.update_wallet_balance(
            p_assignee_id,
            wish_record.type::currency_type,
            wish_record.cost,
            'Награда за выполнение: ' || wish_record.title,
            'earn',
            p_wish_id
        ) THEN
            RAISE EXCEPTION 'Failed to add to assignee wallet';
        END IF;
        
        RETURN json_build_object('success', true, 'message', 'Желание успешно выполнено');
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', 'TRANSACTION_FAILED', 'message', 'Ошибка при выполнении транзакции: ' || SQLERRM);
    END;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a wish (change status to in_progress and assign executor)
CREATE OR REPLACE FUNCTION public.accept_wish(
    p_wish_id UUID,
    p_assignee_id UUID
)
RETURNS JSON AS $
DECLARE
    wish_record RECORD;
BEGIN
    -- Get wish details
    SELECT * INTO wish_record FROM public.wishes WHERE id = p_wish_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'WISH_NOT_FOUND', 'message', 'Желание не найдено');
    END IF;
    
    -- Check if wish is in correct status
    IF wish_record.status != 'active' THEN
        RETURN json_build_object('success', false, 'error', 'INVALID_STATUS', 'message', 'Желание должно быть активным');
    END IF;
    
    -- Check if user is not the creator
    IF wish_record.creator_id = p_assignee_id THEN
        RETURN json_build_object('success', false, 'error', 'SELF_ASSIGNMENT', 'message', 'Нельзя принять собственное желание');
    END IF;
    
    -- Update wish status and assign executor
    UPDATE public.wishes 
    SET status = 'in_progress', assignee_id = p_assignee_id, updated_at = NOW()
    WHERE id = p_wish_id;
    
    RETURN json_build_object('success', true, 'message', 'Желание принято к выполнению');
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'TRANSACTION_FAILED', 'message', 'Ошибка при принятии желания: ' || SQLERRM);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;