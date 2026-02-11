-- Create a new public bucket for site assets (icons, logos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Public Read Access
DROP POLICY IF EXISTS "Public Access Site Assets" ON storage.objects;
CREATE POLICY "Public Access Site Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- 2. Admin Only Management (Upload/Delete/Update)
-- Uses the secure is_admin() function we created earlier
DROP POLICY IF EXISTS "Admins Manage Site Assets" ON storage.objects;
CREATE POLICY "Admins Manage Site Assets"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'site-assets' AND public.is_admin() )
WITH CHECK ( bucket_id = 'site-assets' AND public.is_admin() );
