-- 1. Insert missing profiles for ANY user currently in auth.users
-- This fixes your current "Ghost" state
INSERT INTO public.profiles (id, email, role, status, full_name)
SELECT 
    id, 
    email, 
    'member', 
    'inactive',
    raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Re-apply the Trigger (to fix future registrations)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, full_name)
  VALUES (
    new.id, 
    new.email, 
    'member',
    'inactive',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and Recreate Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Confirm success
DO $$
DECLARE
    p_count INTEGER;
BEGIN
    SELECT count(*) INTO p_count FROM public.profiles;
    RAISE NOTICE 'Fixed! Profiles table now has % rows.', p_count;
END $$;
