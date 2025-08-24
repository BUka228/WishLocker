-- Notification System for Achievement Notifications
-- This migration adds notification infrastructure for achievement notifications

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Function to create achievement notification
CREATE OR REPLACE FUNCTION public.create_achievement_notification(
    p_user_id UUID,
    p_achievement_type TEXT,
    p_achievement_title TEXT,
    p_achievement_description TEXT
)
RETURNS VOID AS $
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        p_user_id,
        'achievement',
        'Новое достижение!',
        'Вы получили достижение: ' || p_achievement_title,
        jsonb_build_object(
            'achievement_type', p_achievement_type,
            'achievement_title', p_achievement_title,
            'achievement_description', p_achievement_description
        )
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.notifications
        WHERE user_id = p_user_id AND read = FALSE
    );
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
    WHERE id = p_notification_id AND user_id = p_user_id AND read = FALSE;
    
    RETURN FOUND;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update achievement award function to create notifications
CREATE OR REPLACE FUNCTION public.award_achievement(
    p_user_id UUID,
    p_achievement_type achievement_type_enum,
    p_title TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $
BEGIN
    -- Check if user already has this achievement
    IF EXISTS (
        SELECT 1 FROM public.achievements 
        WHERE user_id = p_user_id AND achievement_type_enum = p_achievement_type
    ) THEN
        RETURN FALSE; -- Achievement already exists
    END IF;
    
    -- Award the achievement
    INSERT INTO public.achievements (user_id, achievement_type, achievement_type_enum, title, description)
    VALUES (p_user_id, p_achievement_type::text, p_achievement_type, p_title, p_description);
    
    -- Create notification for the achievement
    PERFORM public.create_achievement_notification(
        p_user_id,
        p_achievement_type::text,
        p_title,
        p_description
    );
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);