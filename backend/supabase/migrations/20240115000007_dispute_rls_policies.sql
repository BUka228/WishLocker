-- Row Level Security policies for disputes table

-- Enable RLS on disputes table
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view disputes they created
CREATE POLICY "Users can view their own disputes" ON public.disputes
    FOR SELECT USING (disputer_id = auth.uid());

-- Policy: Users can view disputes on wishes they created
CREATE POLICY "Creators can view disputes on their wishes" ON public.disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wishes 
            WHERE wishes.id = disputes.wish_id 
            AND wishes.creator_id = auth.uid()
        )
    );

-- Policy: Users can create disputes on others' wishes
CREATE POLICY "Users can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (
        disputer_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.wishes 
            WHERE wishes.id = disputes.wish_id 
            AND wishes.creator_id != auth.uid()
        )
    );

-- Policy: Only wish creators can update disputes (for resolution)
CREATE POLICY "Creators can resolve disputes on their wishes" ON public.disputes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.wishes 
            WHERE wishes.id = disputes.wish_id 
            AND wishes.creator_id = auth.uid()
        )
    );

-- Policy: Users can delete their own pending disputes
CREATE POLICY "Users can delete their own pending disputes" ON public.disputes
    FOR DELETE USING (
        disputer_id = auth.uid() 
        AND status = 'pending'
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disputes TO authenticated;
GRANT USAGE ON SEQUENCE public.disputes_id_seq TO authenticated;

-- Grant execute permissions on dispute functions
GRANT EXECUTE ON FUNCTION create_dispute(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_dispute(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wish_disputes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_disputes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_creator_disputes(UUID) TO authenticated;