-- 1. DROP EXISTING TABLE (Clean Slate)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE TABLE
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NULL,
  role text NULL DEFAULT 'member'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  status text NULL DEFAULT 'inactive'::text,
  full_name text NULL,
  mobile_number text NULL,
  location text NULL,
  joining_reason text NULL,
  experience_level text NULL,
  website_link text NULL,
  portfolio_images text[] NULL DEFAULT '{}'::text[],
  profile_photo_url text NULL,
  consent_to_feature boolean NULL DEFAULT false,
  is_featured boolean NULL DEFAULT false,
  
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  CONSTRAINT profiles_status_check CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text]))
) TABLESPACE pg_default;

-- 3. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Strict & Clear)

-- Policy A: Users can READ their OWN profile (Critical for Middleware)
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- Policy B: Admins can READ ALL profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
);

-- Policy C: Admins can UPDATE ALL profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
);

-- Policy D: Users can UPDATE their OWN profile (Only specific fields ideally, but for now open)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ( auth.uid() = id );

-- Policy E: Public can READ FEATURED profiles (For Landing Page)
CREATE POLICY "Public can read featured profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING ( is_featured = true );


-- 5. TRIGGER FOR NEW USERS (Auto-create Profile)
-- This ensures every new signup immediately gets a 'member' profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, full_name)
  VALUES (
    new.id, 
    new.email, 
    'member',   -- Default role is ALWAYS member
    'inactive', -- Default status
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. STORAGE BUCKET (Ensure it exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-uploads', 'member-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Simplified for robustness)
DROP POLICY IF EXISTS "Public Access Member Uploads" ON storage.objects;
CREATE POLICY "Public Access Member Uploads" ON storage.objects FOR SELECT USING ( bucket_id = 'member-uploads' );

DROP POLICY IF EXISTS "Authenticated Member Upload" ON storage.objects;
CREATE POLICY "Authenticated Member Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'member-uploads' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Users Update Own Uploads" ON storage.objects;
CREATE POLICY "Users Update Own Uploads" ON storage.objects FOR UPDATE USING ( bucket_id = 'member-uploads' AND auth.uid() = owner );
