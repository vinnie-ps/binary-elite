-- Update profiles table with member management fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS joining_reason TEXT, -- 'buy', 'learn', 'explore', 'partner'
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS website_link TEXT,
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS consent_to_feature BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create storage bucket for member uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-uploads', 'member-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for member-uploads

-- 1. Public can view all member uploads
DROP POLICY IF EXISTS "Public Access Member Uploads" ON storage.objects;
CREATE POLICY "Public Access Member Uploads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'member-uploads' );

-- 2. Authenticated users can upload files
DROP POLICY IF EXISTS "Authenticated Member Upload" ON storage.objects;
CREATE POLICY "Authenticated Member Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'member-uploads' AND auth.role() = 'authenticated' );

-- 3. Users can update/delete their own files (owner matches auth.uid())
DROP POLICY IF EXISTS "Users Update Own Uploads" ON storage.objects;
CREATE POLICY "Users Update Own Uploads"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'member-uploads' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users Delete Own Uploads" ON storage.objects;
CREATE POLICY "Users Delete Own Uploads"
ON storage.objects FOR DELETE
USING ( bucket_id = 'member-uploads' AND auth.uid() = owner );
