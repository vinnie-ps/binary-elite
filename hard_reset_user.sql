-- ⚠️ WARNING: THIS WILL DELETE THE USER ACCOUNT COMPLETELY
-- Replace 'finetarch001@gmail.com' with the exact email to delete

-- 1. Delete from auth.users (this should cascade to profiles too)
DELETE FROM auth.users 
WHERE email = 'finetarch001@gmail.com';

-- 2. Verification
DO $$
DECLARE
    found_count INTEGER;
BEGIN
    SELECT count(*) INTO found_count FROM auth.users WHERE email = 'finetarch001@gmail.com';
    IF found_count = 0 THEN
        RAISE NOTICE 'User deleted successfully. You can now Register again.';
    ELSE
        RAISE EXCEPTION 'Failed to delete user. Check permissions.';
    END IF;
END $$;
