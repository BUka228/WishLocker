-- Function to send friend request with validation
CREATE OR REPLACE FUNCTION public.send_friend_request(
    p_user_id UUID,
    p_friend_id UUID
)
RETURNS JSON AS $
DECLARE
    existing_friendship RECORD;
    result JSON;
BEGIN
    -- Prevent self-friendship
    IF p_user_id = p_friend_id THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Нельзя добавить себя в друзья'
        );
    END IF;
    
    -- Check if any relationship already exists
    SELECT * INTO existing_friendship 
    FROM public.friendships 
    WHERE (user_id = p_user_id AND friend_id = p_friend_id) 
       OR (user_id = p_friend_id AND friend_id = p_user_id);
    
    IF FOUND THEN
        CASE existing_friendship.status
            WHEN 'pending' THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Запрос в друзья уже отправлен'
                );
            WHEN 'accepted' THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Вы уже друзья'
                );
            WHEN 'blocked' THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Пользователь заблокирован'
                );
        END CASE;
    END IF;
    
    -- Create friend request
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (p_user_id, p_friend_id, 'pending');
    
    RETURN json_build_object(
        'success', true,
        'message', 'Запрос в друзья отправлен'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при отправке запроса: ' || SQLERRM
        );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept friend request
CREATE OR REPLACE FUNCTION public.accept_friend_request(
    p_request_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $
DECLARE
    request_record RECORD;
    result JSON;
BEGIN
    -- Get the friend request
    SELECT * INTO request_record 
    FROM public.friendships 
    WHERE id = p_request_id 
      AND friend_id = p_user_id 
      AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Запрос в друзья не найден'
        );
    END IF;
    
    -- Update the request status to accepted
    UPDATE public.friendships 
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Create reciprocal friendship
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (p_user_id, request_record.user_id, 'accepted')
    ON CONFLICT (user_id, friend_id) DO UPDATE SET
        status = 'accepted',
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Запрос в друзья принят'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при принятии запроса: ' || SQLERRM
        );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject friend request
CREATE OR REPLACE FUNCTION public.reject_friend_request(
    p_request_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $
DECLARE
    result JSON;
BEGIN
    -- Delete the friend request
    DELETE FROM public.friendships 
    WHERE id = p_request_id 
      AND friend_id = p_user_id 
      AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Запрос в друзья не найден'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Запрос в друзья отклонен'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при отклонении запроса: ' || SQLERRM
        );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block user
CREATE OR REPLACE FUNCTION public.block_user(
    p_user_id UUID,
    p_target_id UUID
)
RETURNS JSON AS $
BEGIN
    -- Prevent self-blocking
    IF p_user_id = p_target_id THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Нельзя заблокировать себя'
        );
    END IF;
    
    -- Remove any existing friendships
    DELETE FROM public.friendships 
    WHERE (user_id = p_user_id AND friend_id = p_target_id)
       OR (user_id = p_target_id AND friend_id = p_user_id);
    
    -- Create blocked relationship
    INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (p_user_id, p_target_id, 'blocked')
    ON CONFLICT (user_id, friend_id) DO UPDATE SET
        status = 'blocked',
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Пользователь заблокирован'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при блокировке: ' || SQLERRM
        );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unblock user
CREATE OR REPLACE FUNCTION public.unblock_user(
    p_user_id UUID,
    p_target_id UUID
)
RETURNS JSON AS $
BEGIN
    -- Remove blocked relationship
    DELETE FROM public.friendships 
    WHERE user_id = p_user_id 
      AND friend_id = p_target_id 
      AND status = 'blocked';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Пользователь не заблокирован'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Пользователь разблокирован'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ошибка при разблокировке: ' || SQLERRM
        );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;