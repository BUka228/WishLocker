-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view friends' profiles" ON public.users
    FOR SELECT USING (
        id IN (
            SELECT friend_id FROM public.friendships 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Wallets policies
CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- Wishes policies
CREATE POLICY "Users can view wishes they created or are assigned to" ON public.wishes
    FOR SELECT USING (
        auth.uid() = creator_id OR 
        auth.uid() = assignee_id OR
        creator_id IN (
            SELECT friend_id FROM public.friendships 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Users can create wishes" ON public.wishes
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update wishes they created or are assigned to" ON public.wishes
    FOR UPDATE USING (
        auth.uid() = creator_id OR 
        auth.uid() = assignee_id
    );

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends' achievements" ON public.achievements
    FOR SELECT USING (
        user_id IN (
            SELECT friend_id FROM public.friendships 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Friendships policies
CREATE POLICY "Users can view their own friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of" ON public.friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);