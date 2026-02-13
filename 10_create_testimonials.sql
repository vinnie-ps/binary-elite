-- Create Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    role text, -- Optional override for the member's role display
    rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
    is_approved boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- 1. Public can read featured testimonials
CREATE POLICY "Public read featured testimonials" ON public.testimonials
FOR SELECT
TO anon, authenticated
USING (is_featured = true);

-- 2. Members can read their own testimonials
CREATE POLICY "Members view own testimonials" ON public.testimonials
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- 3. Members can create their own testimonials
CREATE POLICY "Members create testimonials" ON public.testimonials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- 4. Members can update their own testimonials (only if not yet approved?) 
-- Let's allow updates but maybe reset approval? For now, simple update.
CREATE POLICY "Members update own testimonials" ON public.testimonials
FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- 5. Members can delete their own testimonials
CREATE POLICY "Members delete own testimonials" ON public.testimonials
FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 6. Admins have full access
CREATE POLICY "Admins manage testimonials" ON public.testimonials
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Indexes
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX idx_testimonials_profile_id ON public.testimonials(profile_id);
