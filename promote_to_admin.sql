-- ⚠️ REPLACE 'your_email@example.com' WITH YOUR ACTUAL EMAIL ADDRESS
DO $$
DECLARE
    target_email TEXT := 'your_email@example.com'; -- <<< PUT YOUR EMAIL HERE
BEGIN
    -- 1. Ensure the profile exists (sync from auth.users if missing)
    INSERT INTO public.profiles (id, email, role, status, full_name)
    SELECT 
        id, 
        email, 
        'admin', 
        'active',
        raw_user_meta_data->>'full_name'
    FROM auth.users
    WHERE email = target_email
    ON CONFLICT (id) DO UPDATE
    SET 
        role = 'admin',
        status = 'active';

    -- 2. Verification log
    RAISE NOTICE 'User % has been promoted to Admin.', target_email;
END $$;
