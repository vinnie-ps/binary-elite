-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID DEFAULT gen_random_uuid(), -- Optional: Group messages by thread if needed later
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null recipient means "To Admins" generally? Or better to use specific ID.
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- RLS Policies

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Members can insert messages where they are the sender
CREATE POLICY "Members can insert their own messages" ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Members can view messages where they are sender or recipient
CREATE POLICY "Members can view their own messages" ON public.messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Policy 3: Admins can do everything
-- Note: Requires a way to check admin status. Assuming profiles.role or similar check from previous setup.
-- If 'is_admin' function exists or direct role check:
CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR status = 'admin') -- Adjust based on actual schema
        )
    );

-- Realtime
-- Enable realtime for messages table
alter publication supabase_realtime add table public.messages;
