-- TEMPORARY DEBUGGING FIX
-- Make profiles readable by everyone to ensure Login Page can fetch the 'role'
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read" ON profiles;

CREATE POLICY "Public profiles read"
ON profiles
FOR SELECT
USING (true);

-- Ensure Admins can update too (keep this)
DROP POLICY IF EXISTS "Admins update all" ON profiles;
CREATE POLICY "Admins update all"
ON profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
