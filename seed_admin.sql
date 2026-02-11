-- RUN THIS SCRIPT *AFTER* REGISTERING YOUR ACCOUNT
-- Replace 'finetarch001@gmail.com' with your email

DO $$
BEGIN
    UPDATE public.profiles
    SET 
        role = 'admin',
        status = 'active'
    WHERE email = 'finetarch001@gmail.com';

    IF FOUND THEN
        RAISE NOTICE 'Admin privileges granted to finetarch001@gmail.com';
    ELSE
        RAISE WARNING 'User not found! Did you register yet?';
    END IF;
END $$;
