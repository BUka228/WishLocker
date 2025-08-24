-- Real-time Notifications Enhancement Migration
-- This migration adds comprehensive notification functions for all real-time features

-- Enhanced notification creation function with better error handling
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
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create notification: %', SQLERRM;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create friend request notification
CREATE OR REPLACE FUNCTION public.create_friend_request_notification(
    p_receiver_id UUID,
    p_sender_id UUID,
    p_sender_username TEXT
)
RETURNS UUID AS $
DECLARE
    notification_id UUID;
BEGIN
    SELECT public.create_notification(
        p_receiver_id,
        'friend_request',
        'Новый запрос в друзья!',
        p_sender_username || ' хочет добавить вас в друзья',
        jsonb_build_object(
            'sender_id', p_sender_id,
            'sender_username', p_sender_username
        )
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create friend request accepted notification
CREATE OR REPLACE FUNCTION public.create_friend_accepted_notification(
    p_sender_id UUID,
    p_accepter_id UUID,
    p_accepter_username TEXT
)
RETURNS UUID AS $
DECLARE
    notification_id UUID;
BEGIN
    SELECT public.create_notification(
        p_sender_id,
        'friend_accepted',
        'Запрос в друзья принят!',
        p_accepter_username || ' принял ваш запрос в друзья',
        jsonb_build_object(
            'accepter_id', p_accepter_id,
            'accepter_username', p_accepter_username
        )
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create wish status notification
CREATE OR REPLACE FUNCTION public.create_wish_status_notification(
    p_user_id UUID,
    p_wish_id UUID,
    p_wish_title TEXT,
    p_status TEXT,
    p_other_user_id UUID DEFAULT NULL,
    p_other_username TEXT DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
    notification_id UUID;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    CASE p_status
        WHEN 'accepted' THEN
            notification_title := 'Желание принято!';
            notification_message := COALESCE(p_other_username, 'Кто-то') || ' принял ваше желание "' || p_wish_title || '"';
        WHEN 'completed' THEN
            notification_title := 'Желание выполнено!';
            notification_message := 'Ваше желание "' || p_wish_title || '" было выполнено';
        WHEN 'disputed' THEN
            notification_title := 'Спор по желанию';
            notification_message := 'Возник спор по вашему желанию "' || p_wish_title || '"';
        ELSE
            notification_title := 'Обновление желания';
            notification_message := 'Статус вашего желания "' || p_wish_title || '" изменился';
    END CASE;
    
    SELECT public.create_notification(
        p_user_id,
        'wish_status',
        notification_title,
        notification_message,
        jsonb_build_object(
            'wish_id', p_wish_id,
            'wish_title', p_wish_title,
            'status', p_status,
            'other_user_id', p_other_user_id,
            'other_username', p_other_username
        )
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create new wish notification for friends
CREATE OR REPLACE FUNCTION public.create_new_wish_notification(
    p_friend_id UUID,
    p_creator_id UUID,
    p_creator_username TEXT,
    p_wish_id UUID,
    p_wish_title TEXT,
    p_wish_type TEXT
)
RETURNS UUID AS $
DECLARE
    notification_id UUID;
BEGIN
    SELECT public.create_notification(
        p_friend_id,
        'new_wish',
        'Новое желание от друга!',
        p_creator_username || ' создал новое ' || 
        CASE p_wish_type
            WHEN 'green' THEN 'зеленое'
            WHEN 'blue' THEN 'синее'
            WHEN 'red' THEN 'красное'
        END || ' желание: "' || p_wish_title || '"',
        jsonb_build_object(
            'wish_id', p_wish_id,
            'creator_id', p_creator_id,
            'creator_username', p_creator_username,
            'wish_title', p_wish_title,
            'wish_type', p_wish_type
        )
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced friend request function with notifications
CREATE OR REPLACE FUNCTION public.send_friend_request(
    p_user_id UUID,
    p_friend_id UUID
)
RETURNS BOOLEAN AS $
DECLARE
    sender_username TEXT;
BEGIN
    -- Prevent self-friendship
    IF p_user_id = p_friend_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if friendship already exists
    IF EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE (user_id = p_user_id AND friend_id = p_friend_id) 
           OR (user_id = p_friend_id AND friend_id = p_user_id)
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Get sender username
    SELECT username INTO sender_username FROM public.users WHERE id = p_user_id;
    
    -- Create friendship request
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (p_user_id, p_friend_id, 'pending');
    
    -- Create notification for receiver
    PERFORM public.create_friend_request_notification(
        p_friend_id,
        p_user_id,
        sender_username
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced accept friend request function with notifications
CREATE OR REPLACE FUNCTION public.accept_friend_request(
    p_request_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $
DECLARE
    sender_id UUID;
    accepter_username TEXT;
BEGIN
    -- Get the sender ID and update status
    UPDATE public.friendships 
    SET status = 'accepted'
    WHERE id = p_request_id AND friend_id = p_user_id AND status = 'pending'
    RETURNING user_id INTO sender_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get accepter username
    SELECT username INTO accepter_username FROM public.users WHERE id = p_user_id;
    
    -- Create reciprocal friendship
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (p_user_id, sender_id, 'accepted');
    
    -- Create notification for original sender
    PERFORM public.create_friend_accepted_notification(
        sender_id,
        p_user_id,
        accepter_username
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification preferences (for future use)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    friend_requests BOOLEAN DEFAULT TRUE,
    wish_updates BOOLEAN DEFAULT TRUE,
    achievements BOOLEAN DEFAULT TRUE,
    currency_gifts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Function to get or create notification preferences
CREATE OR REPLACE FUNCTION public.get_notification_preferences(p_user_id UUID)
RETURNS public.notification_preferences AS $
DECLARE
    prefs public.notification_preferences;
BEGIN
    SELECT * INTO prefs FROM public.notification_preferences WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.notification_preferences (user_id)
        VALUES (p_user_id)
        RETURNING * INTO prefs;
    END IF;
    
    RETURN prefs;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update notification preferences
CREATE OR REPLACE FUNCTION public.update_notification_preferences(
    p_user_id UUID,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_push_notifications BOOLEAN DEFAULT NULL,
    p_friend_requests BOOLEAN DEFAULT NULL,
    p_wish_updates BOOLEAN DEFAULT NULL,
    p_achievements BOOLEAN DEFAULT NULL,
    p_currency_gifts BOOLEAN DEFAULT NULL
)
RETURNS public.notification_preferences AS $
DECLARE
    prefs public.notification_preferences;
BEGIN
    -- Ensure preferences exist
    PERFORM public.get_notification_preferences(p_user_id);
    
    -- Update preferences
    UPDATE public.notification_preferences
    SET 
        email_notifications = COALESCE(p_email_notifications, email_notifications),
        push_notifications = COALESCE(p_push_notifications, push_notifications),
        friend_requests = COALESCE(p_friend_requests, friend_requests),
        wish_updates = COALESCE(p_wish_updates, wish_updates),
        achievements = COALESCE(p_achievements, achievements),
        currency_gifts = COALESCE(p_currency_gifts, currency_gifts),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO prefs;
    
    RETURN prefs;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON public.users;
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_notification_preferences();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);