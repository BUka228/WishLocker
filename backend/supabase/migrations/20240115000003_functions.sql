-- Function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    INSERT INTO public.wallets (user_id, green_balance, blue_balance, red_balance)
    VALUES (NEW.id, 5, 0, 0); -- Starting balance: 5 green wishes
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
    p_user_id UUID,
    p_currency currency_type,
    p_amount INTEGER,
    p_description TEXT DEFAULT '',
    p_transaction_type transaction_type DEFAULT 'earn',
    p_related_wish_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    CASE p_currency
        WHEN 'green' THEN
            SELECT green_balance INTO current_balance FROM public.wallets WHERE user_id = p_user_id;
        WHEN 'blue' THEN
            SELECT blue_balance INTO current_balance FROM public.wallets WHERE user_id = p_user_id;
        WHEN 'red' THEN
            SELECT red_balance INTO current_balance FROM public.wallets WHERE user_id = p_user_id;
    END CASE;
    
    -- Check if user has enough balance for spending
    IF p_transaction_type = 'spend' AND current_balance < ABS(p_amount) THEN
        RETURN FALSE;
    END IF;
    
    -- Update wallet balance
    CASE p_currency
        WHEN 'green' THEN
            UPDATE public.wallets 
            SET green_balance = green_balance + p_amount, updated_at = NOW()
            WHERE user_id = p_user_id;
        WHEN 'blue' THEN
            UPDATE public.wallets 
            SET blue_balance = blue_balance + p_amount, updated_at = NOW()
            WHERE user_id = p_user_id;
        WHEN 'red' THEN
            UPDATE public.wallets 
            SET red_balance = red_balance + p_amount, updated_at = NOW()
            WHERE user_id = p_user_id;
    END CASE;
    
    -- Record transaction
    INSERT INTO public.transactions (user_id, type, currency, amount, description, related_wish_id)
    VALUES (p_user_id, p_transaction_type, p_currency, p_amount, p_description, p_related_wish_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert currency
CREATE OR REPLACE FUNCTION public.convert_currency(
    p_user_id UUID,
    p_from_currency currency_type,
    p_to_currency currency_type,
    p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    conversion_rate INTEGER := 10;
    converted_amount INTEGER;
BEGIN
    -- Validate conversion direction (only upward conversions allowed)
    IF (p_from_currency = 'green' AND p_to_currency != 'blue') OR
       (p_from_currency = 'blue' AND p_to_currency != 'red') OR
       (p_from_currency = 'red') THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate converted amount
    converted_amount := p_amount / conversion_rate;
    
    -- Check if conversion is possible (must have exact amount)
    IF p_amount % conversion_rate != 0 OR converted_amount = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Perform the conversion
    IF NOT public.update_wallet_balance(
        p_user_id, 
        p_from_currency, 
        -p_amount, 
        'Конвертация в ' || p_to_currency::text,
        'convert'
    ) THEN
        RETURN FALSE;
    END IF;
    
    PERFORM public.update_wallet_balance(
        p_user_id, 
        p_to_currency, 
        converted_amount, 
        'Конвертация из ' || p_from_currency::text,
        'convert'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a wish
CREATE OR REPLACE FUNCTION public.complete_wish(
    p_wish_id UUID,
    p_assignee_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    wish_record RECORD;
BEGIN
    -- Get wish details
    SELECT * INTO wish_record FROM public.wishes WHERE id = p_wish_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update wish status
    UPDATE public.wishes 
    SET status = 'completed', assignee_id = p_assignee_id, updated_at = NOW()
    WHERE id = p_wish_id;
    
    -- Deduct cost from creator's wallet
    PERFORM public.update_wallet_balance(
        wish_record.creator_id,
        wish_record.type::currency_type,
        -wish_record.cost,
        'Оплата желания: ' || wish_record.title,
        'spend',
        p_wish_id
    );
    
    -- Add reward to assignee's wallet
    PERFORM public.update_wallet_balance(
        p_assignee_id,
        wish_record.type::currency_type,
        wish_record.cost,
        'Награда за выполнение: ' || wish_record.title,
        'earn',
        p_wish_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;