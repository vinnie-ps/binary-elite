-- 1. Create a helper function to check admin status securely
-- SECURITY DEFINER means this runs with the permissions of the creator (postgres/admin), 
-- bypassing RLS on the table itself during the check.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 3. Re-create policies using the safe function
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ( public.is_admin() );

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING ( public.is_admin() );

-- 4. Verify other policies are still safe
-- "Users can read own profile" is fine (no circular dependency)
-- "Users can update own profile" is fine
