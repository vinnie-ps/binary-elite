-- Enable RLS on profiles if not already enabled (it should be)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can update ANY profile
-- Dropping existing policy if it might conflict or be too restrictive
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admins can view ANY profile (for listing members)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR
  auth.uid() = id -- Users can view their own
);
