-- Achievement System Implementation
-- This migration adds achievement tracking functions and triggers

-- Create achievement types enum for better type safety
CREATE TYPE achievement_type_enum AS ENUM (
    'first_wish',
    'wish_master', 
    'converter',
    'legendary_fulfiller'
);

-- Add achievement_type_enum column to achievements table
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS achievement_type_enum achievement_type_enum;

-- Update existing achievement_type column to use enum where possible
UPDATE public.achievements 
SET achievement_type_enum = CASE 
    WHEN achievement_type = 'first_wish' THEN 'first_wish'::achievement_type_enum
    WHEN achievement_type = 'wish_master' THEN 'wish_master'::achievement_type_enum
    WHEN achievement_type = 'converter' THEN 'converter'::achievement_type_enum
    WHEN achievement_type = 'legendary_fulfiller' THEN 'legendary_fulfiller'::achievement_type_enum
    ELSE NULL
END;

-- Function to award achievement to user
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
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award achievements based on user actions
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $
DECLARE
    wish_count INTEGER;
    completed_wishes INTEGER;
    has_converted BOOLEAN;
    has_red_completion BOOLEAN;
BEGIN
    CASE p_event_type
        WHEN 'wish_created' THEN
            -- Check for "First Wish" achievement
            SELECT COUNT(*) INTO wish_count 
            FROM public.wishes 
            WHERE creator_id = p_user_id;
            
            IF wish_count = 1 THEN
                PERFORM public.award_achievement(
                    p_user_id,
                    'first_wish'::achievement_type_enum,
                    'Первое желание',
                    'Создал своё первое желание в системе'
                );
            END IF;
            
        WHEN 'wish_completed' THEN
            -- Check for "Wish Master" achievement (5 completed wishes)
            SELECT COUNT(*) INTO completed_wishes
            FROM public.wishes 
            WHERE assignee_id = p_user_id AND status = 'completed';
            
            IF completed_wishes = 5 THEN
                PERFORM public.award_achievement(
                    p_user_id,
                    'wish_master'::achievement_type_enum,
                    'Мастер желаний',
                    'Выполнил 5 желаний других пользователей'
                );
            END IF;
            
            -- Check for "Legendary Fulfiller" achievement (completed red wish)
            SELECT EXISTS(
                SELECT 1 FROM public.wishes 
                WHERE assignee_id = p_user_id 
                AND status = 'completed' 
                AND type = 'red'
            ) INTO has_red_completion;
            
            IF has_red_completion THEN
                PERFORM public.award_achievement(
                    p_user_id,
                    'legendary_fulfiller'::achievement_type_enum,
                    'Легендарный исполнитель',
                    'Выполнил красное (легендарное) желание'
                );
            END IF;
            
        WHEN 'currency_converted' THEN
            -- Check for "Converter" achievement (first currency conversion)
            SELECT EXISTS(
                SELECT 1 FROM public.transactions 
                WHERE user_id = p_user_id AND type = 'convert'
            ) INTO has_converted;
            
            IF has_converted THEN
                PERFORM public.award_achievement(
                    p_user_id,
                    'converter'::achievement_type_enum,
                    'Конвертер',
                    'Впервые конвертировал валюту'
                );
            END IF;
    END CASE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user achievement progress
CREATE OR REPLACE FUNCTION public.get_achievement_progress(p_user_id UUID)
RETURNS TABLE(
    achievement_type achievement_type_enum,
    title TEXT,
    description TEXT,
    earned BOOLEAN,
    earned_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER,
    max_progress INTEGER
) AS $
DECLARE
    wish_count INTEGER;
    completed_wishes INTEGER;
    has_converted BOOLEAN;
    has_red_completion BOOLEAN;
BEGIN
    -- Get current user stats
    SELECT COUNT(*) INTO wish_count FROM public.wishes WHERE creator_id = p_user_id;
    SELECT COUNT(*) INTO completed_wishes FROM public.wishes WHERE assignee_id = p_user_id AND status = 'completed';
    SELECT EXISTS(SELECT 1 FROM public.transactions WHERE user_id = p_user_id AND type = 'convert') INTO has_converted;
    SELECT EXISTS(SELECT 1 FROM public.wishes WHERE assignee_id = p_user_id AND status = 'completed' AND type = 'red') INTO has_red_completion;
    
    -- First Wish achievement
    RETURN QUERY
    SELECT 
        'first_wish'::achievement_type_enum,
        'Первое желание'::TEXT,
        'Создал своё первое желание в системе'::TEXT,
        EXISTS(SELECT 1 FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'first_wish'),
        (SELECT earned_at FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'first_wish'),
        LEAST(wish_count, 1),
        1;
    
    -- Wish Master achievement
    RETURN QUERY
    SELECT 
        'wish_master'::achievement_type_enum,
        'Мастер желаний'::TEXT,
        'Выполнил 5 желаний других пользователей'::TEXT,
        EXISTS(SELECT 1 FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'wish_master'),
        (SELECT earned_at FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'wish_master'),
        LEAST(completed_wishes, 5),
        5;
    
    -- Converter achievement
    RETURN QUERY
    SELECT 
        'converter'::achievement_type_enum,
        'Конвертер'::TEXT,
        'Впервые конвертировал валюту'::TEXT,
        EXISTS(SELECT 1 FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'converter'),
        (SELECT earned_at FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'converter'),
        CASE WHEN has_converted THEN 1 ELSE 0 END,
        1;
    
    -- Legendary Fulfiller achievement
    RETURN QUERY
    SELECT 
        'legendary_fulfiller'::achievement_type_enum,
        'Легендарный исполнитель'::TEXT,
        'Выполнил красное (легендарное) желание'::TEXT,
        EXISTS(SELECT 1 FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'legendary_fulfiller'),
        (SELECT earned_at FROM public.achievements WHERE user_id = p_user_id AND achievement_type_enum = 'legendary_fulfiller'),
        CASE WHEN has_red_completion THEN 1 ELSE 0 END,
        1;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for wish creation
CREATE OR REPLACE FUNCTION public.trigger_wish_created()
RETURNS TRIGGER AS $
BEGIN
    PERFORM public.check_and_award_achievements(NEW.creator_id, 'wish_created');
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for wish completion
CREATE OR REPLACE FUNCTION public.trigger_wish_completed()
RETURNS TRIGGER AS $
BEGIN
    -- Only trigger when status changes to completed and assignee is set
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.assignee_id IS NOT NULL THEN
        PERFORM public.check_and_award_achievements(NEW.assignee_id, 'wish_completed');
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for currency conversion
CREATE OR REPLACE FUNCTION public.trigger_currency_converted()
RETURNS TRIGGER AS $
BEGIN
    -- Only trigger for convert transactions
    IF NEW.type = 'convert' THEN
        PERFORM public.check_and_award_achievements(NEW.user_id, 'currency_converted');
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER achievement_wish_created
    AFTER INSERT ON public.wishes
    FOR EACH ROW EXECUTE FUNCTION public.trigger_wish_created();

CREATE TRIGGER achievement_wish_completed
    AFTER UPDATE ON public.wishes
    FOR EACH ROW EXECUTE FUNCTION public.trigger_wish_completed();

CREATE TRIGGER achievement_currency_converted
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.trigger_currency_converted();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON public.achievements(user_id, achievement_type_enum);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON public.achievements(earned_at);