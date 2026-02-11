-- 1. Create Enums for better data integrity
CREATE TYPE public.visibility_type AS ENUM ('public', 'member', 'hidden');

-- 2. Add visibility to existing tables
ALTER TABLE public.feature_cards 
ADD COLUMN IF NOT EXISTS visibility public.visibility_type DEFAULT 'public';

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS visibility public.visibility_type DEFAULT 'public';

-- 3. Create Tools Table
CREATE TABLE IF NOT EXISTS public.tools (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    price text, -- e.g. "$29.99" or "Free"
    link text,
    image_url text,
    visibility public.visibility_type DEFAULT 'member',
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    instructor text,
    status text, -- 'open', 'ongoing', 'closed'
    link text,
    image_url text,
    visibility public.visibility_type DEFAULT 'member',
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Tools
-- Public can read 'public' tools
CREATE POLICY "Public read public tools" ON public.tools
FOR SELECT USING (visibility = 'public');

-- Members can read 'member' or 'public' tools
CREATE POLICY "Members read all tools" ON public.tools
FOR SELECT TO authenticated
USING (visibility IN ('public', 'member'));

-- Admins can do everything
CREATE POLICY "Admins manage tools" ON public.tools
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. RLS Policies for Classes
-- Public can read 'public' classes
CREATE POLICY "Public read public classes" ON public.classes
FOR SELECT USING (visibility = 'public');

-- Members can read 'member' or 'public' classes
CREATE POLICY "Members read all classes" ON public.classes
FOR SELECT TO authenticated
USING (visibility IN ('public', 'member'));

-- Admins can do everything
CREATE POLICY "Admins manage classes" ON public.classes
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. Update Existing Policies for Projects & Features
-- We previously had "is_active", now we should also check visibility for public
-- But 'is_active' is still a useful "soft delete" or "draft" state.
-- Let's assume:
-- Public Landing Page sees: is_active = true AND visibility = 'public'
-- Member Dashboard sees: is_active = true AND visibility IN ('public', 'member')

-- (Optional: You might want to update the 'Public read...' policies for projects/features 
-- if you strictly want to enforce the visibility enum, but the current is_active boolean 
-- is safe enough for now. We will handle the filtering in the Frontend queries).
