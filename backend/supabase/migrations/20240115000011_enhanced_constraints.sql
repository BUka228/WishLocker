-- Enhanced database constraints and validation for error handling

-- Add check constraints for better validation
ALTER TABLE public.users 
ADD CONSTRAINT users_username_length CHECK (length(username) >= 3 AND length(username) <= 20),
ADD CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
ADD CONSTRAINT users_username_no_consecutive_special CHECK (
  username !~ '--' AND 
  username !~ '__' AND 
  username !~ '-_' AND 
  username !~ '_-'
),
ADD CONSTRAINT users_username_no_start_end_special CHECK (
  username !~ '^[-_]' AND 
  username !~ '[-_]$'
),
ADD CONSTRAINT users_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Add check constraints for wishes
ALTER TABLE public.wishes
ADD CONSTRAINT wishes_title_length CHECK (length(title) >= 3 AND length(title) <= 100),
ADD CONSTRAINT wishes_description_length CHECK (description IS NULL OR length(description) <= 500),
ADD CONSTRAINT wishes_cost_positive CHECK (cost > 0),
ADD CONSTRAINT wishes_deadline_future CHECK (deadline IS NULL OR deadline > created_at);

-- Add check constraints for wallets
ALTER TABLE public.wallets
ADD CONSTRAINT wallets_balances_non_negative CHECK (
  green_balance >= 0 AND 
  blue_balance >= 0 AND 
  red_balance >= 0
),
ADD CONSTRAINT wallets_balances_reasonable CHECK (
  green_balance <= 1000000 AND 
  blue_balance <= 100000 AND 
  red_balance <= 10000
);

-- Add check constraints for transactions
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0),
ADD CONSTRAINT transactions_amount_reasonable CHECK (amount <= 1000000);

-- Add check constraints for friendships
ALTER TABLE public.friendships
ADD CONSTRAINT friendships_no_self_friend CHECK (user_id != friend_id);

-- Add check constraints for disputes
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_comment_length CHECK (length(comment) >= 3 AND length(comment) <= 1000),
ADD CONSTRAINT disputes_alternative_description_length CHECK (
  alternative_description IS NULL OR 
  length(alternative_description) <= 500
);

-- Create function to validate currency conversion
CREATE OR REPLACE FUNCTION validate_currency_conversion(
  p_from_currency currency_type,
  p_to_currency currency_type,
  p_amount INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow upward conversions
  IF (p_from_currency = 'green' AND p_to_currency = 'blue') OR
     (p_from_currency = 'blue' AND p_to_currency = 'red') THEN
    -- Check if amount is divisible by conversion rate (10)
    IF p_amount % 10 = 0 THEN
      RETURN TRUE;
    ELSE
      RAISE EXCEPTION 'INVALID_CONVERSION: Amount must be divisible by 10';
    END IF;
  ELSE
    RAISE EXCEPTION 'INVALID_CONVERSION: Invalid conversion direction';
  END IF;
END;
$$;

-- Create function to validate sufficient balance
CREATE OR REPLACE FUNCTION validate_sufficient_balance(
  p_user_id UUID,
  p_currency currency_type,
  p_amount INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT 
    CASE 
      WHEN p_currency = 'green' THEN green_balance
      WHEN p_currency = 'blue' THEN blue_balance
      WHEN p_currency = 'red' THEN red_balance
    END
  INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND: User wallet not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Not enough % balance. Required: %, Available: %', 
      p_currency, p_amount, v_balance;
  END IF;

  RETURN TRUE;
END;
$$;

-- Create function to validate wish ownership and status
CREATE OR REPLACE FUNCTION validate_wish_action(
  p_wish_id UUID,
  p_user_id UUID,
  p_action TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_wish RECORD;
BEGIN
  SELECT * INTO v_wish
  FROM public.wishes
  WHERE id = p_wish_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WISH_NOT_FOUND: Wish not found';
  END IF;

  CASE p_action
    WHEN 'accept' THEN
      IF v_wish.status != 'active' THEN
        RAISE EXCEPTION 'WISH_NOT_AVAILABLE: Wish is not available for acceptance';
      END IF;
      IF v_wish.creator_id = p_user_id THEN
        RAISE EXCEPTION 'CANNOT_ACCEPT_OWN_WISH: Cannot accept your own wish';
      END IF;
    
    WHEN 'complete' THEN
      IF v_wish.status != 'in_progress' THEN
        RAISE EXCEPTION 'WISH_NOT_IN_PROGRESS: Wish is not in progress';
      END IF;
      IF v_wish.assignee_id != p_user_id THEN
        RAISE EXCEPTION 'NOT_WISH_ASSIGNEE: Only the assignee can complete the wish';
      END IF;
    
    WHEN 'dispute' THEN
      IF v_wish.status NOT IN ('active', 'in_progress') THEN
        RAISE EXCEPTION 'WISH_NOT_DISPUTABLE: Wish cannot be disputed in current status';
      END IF;
      IF v_wish.creator_id = p_user_id THEN
        RAISE EXCEPTION 'CANNOT_DISPUTE_OWN_WISH: Cannot dispute your own wish';
      END IF;
    
    WHEN 'cancel' THEN
      IF v_wish.creator_id != p_user_id THEN
        RAISE EXCEPTION 'NOT_WISH_CREATOR: Only the creator can cancel the wish';
      END IF;
      IF v_wish.status = 'completed' THEN
        RAISE EXCEPTION 'CANNOT_CANCEL_COMPLETED_WISH: Cannot cancel completed wish';
      END IF;
  END CASE;

  RETURN TRUE;
END;
$$;

-- Create function to validate friendship actions
CREATE OR REPLACE FUNCTION validate_friendship_action(
  p_user_id UUID,
  p_friend_id UUID,
  p_action TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_friendship RECORD;
BEGIN
  IF p_user_id = p_friend_id THEN
    RAISE EXCEPTION 'CANNOT_ADD_SELF: Cannot add yourself as a friend';
  END IF;

  SELECT * INTO v_existing_friendship
  FROM public.friendships
  WHERE (user_id = p_user_id AND friend_id = p_friend_id) OR
        (user_id = p_friend_id AND friend_id = p_user_id);

  CASE p_action
    WHEN 'send_request' THEN
      IF FOUND THEN
        IF v_existing_friendship.status = 'accepted' THEN
          RAISE EXCEPTION 'ALREADY_FRIENDS: Users are already friends';
        ELSIF v_existing_friendship.status = 'pending' THEN
          RAISE EXCEPTION 'REQUEST_ALREADY_SENT: Friend request already sent';
        ELSIF v_existing_friendship.status = 'blocked' THEN
          RAISE EXCEPTION 'USER_BLOCKED: Cannot send request to blocked user';
        END IF;
      END IF;
    
    WHEN 'accept_request' THEN
      IF NOT FOUND THEN
        RAISE EXCEPTION 'REQUEST_NOT_FOUND: Friend request not found';
      END IF;
      IF v_existing_friendship.status != 'pending' THEN
        RAISE EXCEPTION 'REQUEST_NOT_PENDING: Request is not pending';
      END IF;
      IF v_existing_friendship.friend_id != p_user_id THEN
        RAISE EXCEPTION 'NOT_REQUEST_RECIPIENT: You are not the recipient of this request';
      END IF;
  END CASE;

  RETURN TRUE;
END;
$$;

-- Create function to log constraint violations
CREATE OR REPLACE FUNCTION log_constraint_violation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.error_logs (
    table_name,
    operation,
    error_message,
    user_id,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    SQLERRM,
    COALESCE(NEW.user_id, NEW.creator_id, NEW.id),
    NOW()
  );
  
  RETURN NULL;
END;
$$;

-- Create error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  error_message TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for error_logs (only system can insert, users can read their own)
CREATE POLICY "Users can view their own error logs" ON public.error_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create triggers for constraint violation logging
CREATE OR REPLACE TRIGGER users_constraint_violation_trigger
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW
  WHEN (pg_trigger_depth() = 0)
  EXECUTE FUNCTION log_constraint_violation();

CREATE OR REPLACE TRIGGER wishes_constraint_violation_trigger
  AFTER INSERT OR UPDATE ON public.wishes
  FOR EACH ROW
  WHEN (pg_trigger_depth() = 0)
  EXECUTE FUNCTION log_constraint_violation();

CREATE OR REPLACE TRIGGER wallets_constraint_violation_trigger
  AFTER INSERT OR UPDATE ON public.wallets
  FOR EACH ROW
  WHEN (pg_trigger_depth() = 0)
  EXECUTE FUNCTION log_constraint_violation();

-- Create function to get user-friendly error messages
CREATE OR REPLACE FUNCTION get_user_friendly_error(p_error_code TEXT, p_error_message TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_error_code
    WHEN '23505' THEN -- unique_violation
      IF p_error_message LIKE '%users_username_key%' THEN
        RETURN 'Это имя пользователя уже занято';
      ELSIF p_error_message LIKE '%users_email_key%' THEN
        RETURN 'Пользователь с таким email уже зарегистрирован';
      ELSE
        RETURN 'Данные уже существуют в системе';
      END IF;
    
    WHEN '23514' THEN -- check_violation
      IF p_error_message LIKE '%username_length%' THEN
        RETURN 'Имя пользователя должно содержать от 3 до 20 символов';
      ELSIF p_error_message LIKE '%username_format%' THEN
        RETURN 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания';
      ELSIF p_error_message LIKE '%email_format%' THEN
        RETURN 'Неверный формат email адреса';
      ELSIF p_error_message LIKE '%title_length%' THEN
        RETURN 'Название желания должно содержать от 3 до 100 символов';
      ELSIF p_error_message LIKE '%description_length%' THEN
        RETURN 'Описание желания не может превышать 500 символов';
      ELSIF p_error_message LIKE '%balances_non_negative%' THEN
        RETURN 'Баланс не может быть отрицательным';
      ELSIF p_error_message LIKE '%no_self_friend%' THEN
        RETURN 'Нельзя добавить себя в друзья';
      ELSE
        RETURN 'Данные не соответствуют требованиям системы';
      END IF;
    
    WHEN '23503' THEN -- foreign_key_violation
      RETURN 'Ссылка на несуществующие данные';
    
    ELSE
      RETURN 'Произошла ошибка базы данных';
  END CASE;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.error_logs TO authenticated;
GRANT EXECUTE ON FUNCTION validate_currency_conversion TO authenticated;
GRANT EXECUTE ON FUNCTION validate_sufficient_balance TO authenticated;
GRANT EXECUTE ON FUNCTION validate_wish_action TO authenticated;
GRANT EXECUTE ON FUNCTION validate_friendship_action TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_friendly_error TO authenticated;