-- Create a public storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- Allow authenticated users (admins) to upload files
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );

-- Allow authenticated users (admins) to update files
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );
