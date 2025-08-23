-- Insert test users (these will be created through auth, but we can prepare some test data)

-- Test wishes data
INSERT INTO public.wishes (id, title, description, type, cost, status, creator_id, created_at) VALUES
(
    uuid_generate_v4(),
    'Сделай мне чай',
    'Хочу зеленый чай с медом',
    'green',
    1,
    'active',
    '00000000-0000-0000-0000-000000000001', -- This will need to be replaced with real user IDs
    NOW() - INTERVAL '1 hour'
),
(
    uuid_generate_v4(),
    'Приготовь ужин',
    'Что-то вкусное и сытное на двоих',
    'blue',
    1,
    'active',
    '00000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 hours'
),
(
    uuid_generate_v4(),
    'Организуй поездку на дачу',
    'Хочу провести выходные на природе, организуй все детали',
    'red',
    1,
    'active',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day'
);

-- Test achievements
INSERT INTO public.achievements (user_id, achievement_type, title, description) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'first_wish',
    'Первое желание',
    'Создал свое первое желание'
),
(
    '00000000-0000-0000-0000-000000000002',
    'wish_master',
    'Мастер желаний',
    'Выполнил 5 желаний'
);