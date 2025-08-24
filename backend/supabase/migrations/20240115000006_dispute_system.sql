-- Add dispute system to wish bank

-- Create dispute status enum
CREATE TYPE dispute_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create disputes table
CREATE TABLE public.disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wish_id UUID REFERENCES public.wishes(id) ON DELETE CASCADE NOT NULL,
    disputer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL CHECK (length(comment) > 0),
    alternative_description TEXT,
    status dispute_status DEFAULT 'pending',
    resolution_comment TEXT,
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_disputes_wish_id ON public.disputes(wish_id);
CREATE INDEX idx_disputes_disputer_id ON public.disputes(disputer_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_created_at ON public.disputes(created_at);

-- Add disputed status to wish_status enum
ALTER TYPE wish_status ADD VALUE 'disputed';

-- Function to create a dispute
CREATE OR REPLACE FUNCTION create_dispute(
    p_wish_id UUID,
    p_disputer_id UUID,
    p_comment TEXT,
    p_alternative_description TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_wish RECORD;
    v_dispute_id UUID;
    v_result JSON;
BEGIN
    -- Check if wish exists and is not completed
    SELECT * INTO v_wish FROM public.wishes WHERE id = p_wish_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Желание не найдено'
        );
    END IF;
    
    -- Check if wish is in a state that can be disputed
    IF v_wish.status IN ('completed', 'rejected') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Нельзя оспорить завершенное или отклоненное желание'
        );
    END IF;
    
    -- Check if user is not the creator of the wish
    IF v_wish.creator_id = p_disputer_id THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Нельзя оспорить собственное желание'
        );
    END IF;
    
    -- Check if there's already a pending dispute for this wish by this user
    IF EXISTS (
        SELECT 1 FROM public.disputes 
        WHERE wish_id = p_wish_id 
        AND disputer_id = p_disputer_id 
        AND status = 'pending'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'У вас уже есть активный спор по этому желанию'
        );
    END IF;
    
    -- Create the dispute
    INSERT INTO public.disputes (
        wish_id,
        disputer_id,
        comment,
        alternative_description
    ) VALUES (
        p_wish_id,
        p_disputer_id,
        p_comment,
        p_alternative_description
    ) RETURNING id INTO v_dispute_id;
    
    -- Update wish status to disputed if it's not already
    IF v_wish.status != 'disputed' THEN
        UPDATE public.wishes 
        SET status = 'disputed', updated_at = NOW()
        WHERE id = p_wish_id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Спор успешно создан',
        'dispute_id', v_dispute_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при создании спора: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve a dispute
CREATE OR REPLACE FUNCTION resolve_dispute(
    p_dispute_id UUID,
    p_resolver_id UUID,
    p_action TEXT, -- 'accept' or 'reject'
    p_resolution_comment TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_dispute RECORD;
    v_wish RECORD;
    v_result JSON;
BEGIN
    -- Get dispute details
    SELECT d.*, w.creator_id, w.title, w.description
    INTO v_dispute
    FROM public.disputes d
    JOIN public.wishes w ON d.wish_id = w.id
    WHERE d.id = p_dispute_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Спор не найден'
        );
    END IF;
    
    -- Check if resolver is the wish creator
    IF v_dispute.creator_id != p_resolver_id THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Только создатель желания может разрешить спор'
        );
    END IF;
    
    -- Check if dispute is still pending
    IF v_dispute.status != 'pending' THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Спор уже разрешен'
        );
    END IF;
    
    -- Validate action
    IF p_action NOT IN ('accept', 'reject') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Неверное действие. Используйте accept или reject'
        );
    END IF;
    
    -- Update dispute status
    UPDATE public.disputes 
    SET 
        status = CASE WHEN p_action = 'accept' THEN 'accepted'::dispute_status 
                     ELSE 'rejected'::dispute_status END,
        resolution_comment = p_resolution_comment,
        resolved_by = p_resolver_id,
        resolved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_dispute_id;
    
    -- If dispute is accepted and has alternative description, update wish
    IF p_action = 'accept' AND v_dispute.alternative_description IS NOT NULL THEN
        UPDATE public.wishes 
        SET 
            description = v_dispute.alternative_description,
            status = 'active',
            updated_at = NOW()
        WHERE id = v_dispute.wish_id;
    ELSE
        -- If rejected or no alternative, restore wish to active status
        -- Check if there are other pending disputes
        IF NOT EXISTS (
            SELECT 1 FROM public.disputes 
            WHERE wish_id = v_dispute.wish_id 
            AND status = 'pending' 
            AND id != p_dispute_id
        ) THEN
            UPDATE public.wishes 
            SET status = 'active', updated_at = NOW()
            WHERE id = v_dispute.wish_id;
        END IF;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', CASE WHEN p_action = 'accept' THEN 'Спор принят' ELSE 'Спор отклонен' END,
        'action', p_action
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при разрешении спора: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get disputes for a wish
CREATE OR REPLACE FUNCTION get_wish_disputes(p_wish_id UUID)
RETURNS TABLE (
    id UUID,
    wish_id UUID,
    disputer_id UUID,
    disputer_username TEXT,
    comment TEXT,
    alternative_description TEXT,
    status dispute_status,
    resolution_comment TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.wish_id,
        d.disputer_id,
        u.username as disputer_username,
        d.comment,
        d.alternative_description,
        d.status,
        d.resolution_comment,
        d.resolved_by,
        d.resolved_at,
        d.created_at,
        d.updated_at
    FROM public.disputes d
    JOIN public.users u ON d.disputer_id = u.id
    WHERE d.wish_id = p_wish_id
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's disputes (as disputer)
CREATE OR REPLACE FUNCTION get_user_disputes(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    wish_id UUID,
    wish_title TEXT,
    wish_creator_username TEXT,
    comment TEXT,
    alternative_description TEXT,
    status dispute_status,
    resolution_comment TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.wish_id,
        w.title as wish_title,
        u.username as wish_creator_username,
        d.comment,
        d.alternative_description,
        d.status,
        d.resolution_comment,
        d.resolved_at,
        d.created_at
    FROM public.disputes d
    JOIN public.wishes w ON d.wish_id = w.id
    JOIN public.users u ON w.creator_id = u.id
    WHERE d.disputer_id = p_user_id
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get disputes for wishes created by user (as creator)
CREATE OR REPLACE FUNCTION get_creator_disputes(p_creator_id UUID)
RETURNS TABLE (
    id UUID,
    wish_id UUID,
    wish_title TEXT,
    disputer_username TEXT,
    comment TEXT,
    alternative_description TEXT,
    status dispute_status,
    resolution_comment TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.wish_id,
        w.title as wish_title,
        u.username as disputer_username,
        d.comment,
        d.alternative_description,
        d.status,
        d.resolution_comment,
        d.resolved_at,
        d.created_at
    FROM public.disputes d
    JOIN public.wishes w ON d.wish_id = w.id
    JOIN public.users u ON d.disputer_id = u.id
    WHERE w.creator_id = p_creator_id
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;