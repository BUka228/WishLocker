-- Add validation constraints for wishes table

-- Add title length constraint (already exists in schema but let's ensure it's there)
ALTER TABLE public.wishes 
ADD CONSTRAINT check_title_length 
CHECK (length(title) > 0 AND length(title) <= 100);

-- Add description length constraint
ALTER TABLE public.wishes 
ADD CONSTRAINT check_description_length 
CHECK (description IS NULL OR length(description) <= 500);

-- Ensure cost is always 1 for now (as per requirements)
ALTER TABLE public.wishes 
DROP CONSTRAINT IF EXISTS wishes_cost_check;

ALTER TABLE public.wishes 
ADD CONSTRAINT wishes_cost_check 
CHECK (cost = 1);

-- Add function to create wish with automatic cost assignment
CREATE OR REPLACE FUNCTION public.create_wish(
    p_title TEXT,
    p_description TEXT,
    p_type wish_type,
    p_creator_id UUID,
    p_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
    wish_id UUID;
    wish_cost INTEGER := 1; -- 1 currency unit per type as per requirements
BEGIN
    -- Validate input
    IF length(p_title) = 0 OR length(p_title) > 100 THEN
        RAISE EXCEPTION 'INVALID_TITLE: Title must be between 1 and 100 characters';
    END IF;
    
    IF p_description IS NOT NULL AND length(p_description) > 500 THEN
        RAISE EXCEPTION 'INVALID_DESCRIPTION: Description cannot exceed 500 characters';
    END IF;
    
    -- Insert wish
    INSERT INTO public.wishes (
        title, 
        description, 
        type, 
        cost, 
        status, 
        creator_id, 
        deadline
    )
    VALUES (
        trim(p_title),
        CASE WHEN p_description IS NOT NULL THEN trim(p_description) ELSE NULL END,
        p_type,
        wish_cost,
        'active',
        p_creator_id,
        p_deadline
    )
    RETURNING id INTO wish_id;
    
    RETURN wish_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to update wish status with validation
CREATE OR REPLACE FUNCTION public.update_wish_status(
    p_wish_id UUID,
    p_status wish_status,
    p_assignee_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $
DECLARE
    wish_record RECORD;
BEGIN
    -- Get current wish
    SELECT * INTO wish_record FROM public.wishes WHERE id = p_wish_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'WISH_NOT_FOUND: Wish not found';
    END IF;
    
    -- Validate status transitions
    CASE p_status
        WHEN 'in_progress' THEN
            IF wish_record.status != 'active' THEN
                RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: Can only accept active wishes';
            END IF;
            IF p_assignee_id IS NULL THEN
                RAISE EXCEPTION 'ASSIGNEE_REQUIRED: Assignee required for in_progress status';
            END IF;
            IF wish_record.creator_id = p_assignee_id THEN
                RAISE EXCEPTION 'SELF_ASSIGNMENT: Cannot assign wish to creator';
            END IF;
        WHEN 'completed' THEN
            IF wish_record.status != 'in_progress' THEN
                RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: Can only complete in_progress wishes';
            END IF;
            IF p_user_id IS NULL OR wish_record.assignee_id != p_user_id THEN
                RAISE EXCEPTION 'UNAUTHORIZED: Only assignee can complete wish';
            END IF;
    END CASE;
    
    -- Update wish
    UPDATE public.wishes 
    SET 
        status = p_status,
        assignee_id = COALESCE(p_assignee_id, assignee_id),
        updated_at = NOW()
    WHERE id = p_wish_id;
    
    -- If completing wish, handle payment
    IF p_status = 'completed' THEN
        PERFORM public.complete_wish(p_wish_id, wish_record.assignee_id);
    END IF;
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;