-- Improved function to automatically create wallet for new users with better username handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
    user_username TEXT;
    counter INTEGER := 0;
    base_username TEXT;
BEGIN
    -- Get username from metadata or generate from email
    base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    user_username := base_username;
    
    -- Ensure username is unique by appending numbers if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = user_username) LOOP
        counter := counter + 1;
        user_username := base_username || '_' || counter::text;
    END LOOP;
    
    -- Create user record
    INSERT INTO public.users (id, email, username)
    VALUES (NEW.id, NEW.email, user_username);
    
    -- Create wallet with starting balance of 5 green wishes
    INSERT INTO public.wallets (user_id, green_balance, blue_balance, red_balance)
    VALUES (NEW.id, 5, 0, 0);
    
    -- Record initial transaction for starting balance
    INSERT INTO public.transactions (user_id, type, currency, amount, description)
    VALUES (NEW.id, 'earn', 'green', 5, 'Стартовый баланс при регистрации');
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add validation constraints for username
ALTER TABLE public.users 
ADD CONSTRAINT username_length_check 
CHECK (length(username) >= 3 AND length(username) <= 20);

ALTER TABLE public.users 
ADD CONSTRAINT username_format_check 
CHECK (username ~ '^[a-zA-Z0-9_-]+$');