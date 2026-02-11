-- Logic to make the FIRST user an 'admin', and subsequent users 'member'
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
BEGIN
  -- Check if any profiles exist
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    CASE WHEN is_first_user THEN 'admin' ELSE 'member' END
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- COMMAND TO PROMOTE YOUR CURRENT USER (Run this if you already registered)
-- Replace 'your_email@example.com' with your actual email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';

-- Verification query
-- SELECT * FROM public.profiles;
