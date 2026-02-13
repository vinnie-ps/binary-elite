-- Create Featured Members Table
CREATE TABLE IF NOT EXISTS public.featured_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    gallery_bio text,
    role_in_community text,
    contributions text[], -- Array of contribution strings
    profile_image_url text,
    social_links jsonb, -- { "twitter": "url", "linkedin": "url", "github": "url" }
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(profile_id)
);

-- Create Public Announcements Table
CREATE TABLE IF NOT EXISTS public.public_announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    category text DEFAULT 'update', -- 'newsletter', 'event', 'update'
    image_url text,
    is_published boolean DEFAULT false,
    publish_date timestamp with time zone DEFAULT now(),
    author_id uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_announcements ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR FEATURED MEMBERS

-- Public can read featured members
CREATE POLICY "Public read featured members" ON public.featured_members
FOR SELECT USING (is_featured = true);

-- Authenticated users can view their own record
CREATE POLICY "Users view own featured profile" ON public.featured_members
FOR SELECT TO authenticated
USING (auth.uid() = profile_id);

-- Users can update their own record
CREATE POLICY "Users update own featured profile" ON public.featured_members
FOR UPDATE TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Admins manage all featured members
CREATE POLICY "Admins manage featured members" ON public.featured_members
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS POLICIES FOR PUBLIC ANNOUNCEMENTS

-- Public can read published announcements
CREATE POLICY "Public read published announcements" ON public.public_announcements
FOR SELECT USING (is_published = true AND publish_date <= now());

-- Admins manage all announcements
CREATE POLICY "Admins manage announcements" ON public.public_announcements
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create indexes for performance
CREATE INDEX idx_featured_members_is_featured ON public.featured_members(is_featured);
CREATE INDEX idx_featured_members_display_order ON public.featured_members(display_order);
CREATE INDEX idx_announcements_published ON public.public_announcements(is_published, publish_date);
CREATE INDEX idx_announcements_category ON public.public_announcements(category);
