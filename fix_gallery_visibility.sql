-- 1. Sync existing featured members to profiles table
UPDATE public.profiles
SET is_featured = true
WHERE id IN (
    SELECT profile_id 
    FROM public.featured_members 
    WHERE is_featured = true
);

-- 2. Update Profiles RLS to be aware of the featured_members table
-- This allows the landing page to read profile details (name, avatar) 
-- for anyone currently featured in the gallery.
DROP POLICY IF EXISTS "Public can read featured profiles" ON public.profiles;

CREATE POLICY "Public can read featured profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING ( 
    is_featured = true OR 
    EXISTS (
        SELECT 1 FROM public.featured_members fm
        WHERE fm.profile_id = public.profiles.id
        AND fm.is_featured = true
    )
);

-- 3. Ensure the featured_members table itself is readable by public
DROP POLICY IF EXISTS "Public read featured members" ON public.featured_members;
CREATE POLICY "Public read featured members" ON public.featured_members
FOR SELECT TO anon, authenticated
USING (is_featured = true);
