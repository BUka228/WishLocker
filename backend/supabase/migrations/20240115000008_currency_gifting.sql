-- Currency Gifting System Migration

-- Create notifications table for gift notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transfer currency between friends (atomic operation)
CREATE OR REPLACE FUNCTION public.transfer_currency_to_friend(
    p_sender_id UUID,
    p_receiver_id UUID,
    p_currency currency_type,
    p_amount INTEGER
)
RETURNS JSONB AS $
DECLARE
    sender_balance INTEGER;
    receiver_user RECORD;
    sender_user RECORD;
    friendship_exists BOOLEAN := FALSE;
BEGIN
    -- Validate input
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_AMOUNT', 'message', 'Сумма должна быть больше нуля');
    END IF;
    
    IF p_sender_id = p_receiver_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'SELF_TRANSFER', 'message', 'Нельзя переводить средства самому себе');
    END IF;
    
    -- Check if users are friends
    SELECT EXISTS(
        SELECT 1 FROM public.friendships 
        WHERE ((user_id = p_sender_id AND friend_id = p_receiver_id) OR 
               (user_id = p_receiver_id AND friend_id = p_sender_id))
        AND status = 'accepted'
    ) INTO friendship_exists;
    
    IF NOT friendship_exists THEN
        RETURN jsonb_build_object('success', false, 'error', 'NOT_FRIENDS', 'message', 'Переводы возможны только между друзьями');
    END IF;
    
    -- Get sender's current balance
    CASE p_currency
        WHEN 'green' THEN
            SELECT green_balance INTO sender_balance FROM public.wallets WHERE user_id = p_sender_id;
        WHEN 'blue' THEN
            SELECT blue_balance INTO sender_balance FROM public.wallets WHERE user_id = p_sender_id;
        WHEN 'red' THEN
            SELECT red_balance INTO sender_balance FROM public.wallets WHERE user_id = p_sender_id;
    END CASE;
    
    -- Check if sender has enough balance
    IF sender_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_FUNDS', 'message', 'Недостаточно средств для перевода');
    END IF;
    
    -- Get user information for notifications
    SELECT username INTO sender_user FROM public.users WHERE id = p_sender_id;
    SELECT username INTO receiver_user FROM public.users WHERE id = p_receiver_id;
    
    -- Perform atomic transfer
    BEGIN
        -- Deduct from sender
        IF NOT public.update_wallet_balance(
            p_sender_id,
            p_currency,
            -p_amount,
            'Подарок для ' || receiver_user.username || ': ' || p_amount || ' ' || p_currency,
            'spend'
        ) THEN
            RETURN jsonb_build_object('success', false, 'error', 'TRANSFER_FAILED', 'message', 'Ошибка списания средств');
        END IF;
        
        -- Add to receiver
        IF NOT public.update_wallet_balance(
            p_receiver_id,
            p_currency,
            p_amount,
            'Подарок от ' || sender_user.username || ': ' || p_amount || ' ' || p_currency,
            'earn'
        ) THEN
            -- Rollback sender transaction if receiver update fails
            PERFORM public.update_wallet_balance(
                p_sender_id,
                p_currency,
                p_amount,
                'Возврат средств после неудачного перевода',
                'earn'
            );
            RETURN jsonb_build_object('success', false, 'error', 'TRANSFER_FAILED', 'message', 'Ошибка начисления средств получателю');
        END IF;
        
        -- Create notification for receiver
        PERFORM public.create_notification(
            p_receiver_id,
            'currency_gift',
            'Получен подарок!',
            sender_user.username || ' подарил вам ' || p_amount || ' ' || 
            CASE p_currency
                WHEN 'green' THEN 'зеленых желаний 💚'
                WHEN 'blue' THEN 'синих желаний 💙'
                WHEN 'red' THEN 'красных желаний ❤️'
            END,
            jsonb_build_object(
                'sender_id', p_sender_id,
                'sender_username', sender_user.username,
                'currency', p_currency,
                'amount', p_amount
            )
        );
        
        RETURN jsonb_build_object('success', true, 'message', 'Перевод успешно выполнен');
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback on any error
        RETURN jsonb_build_object('success', false, 'error', 'TRANSACTION_ERROR', 'message', 'Ошибка выполнения транзакции');
    END;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
    p_notification_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $
BEGIN
    UPDATE public.notifications 
    SET read = TRUE 
    WHERE id = p_notification_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(
    p_user_id UUID
)
RETURNS INTEGER AS $
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count 
    FROM public.notifications 
    WHERE user_id = p_user_id AND read = FALSE;
    
    RETURN count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;