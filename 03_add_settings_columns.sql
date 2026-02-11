-- Add Settings and Notifications columns to Profiles table

-- 1. Create a type for notification preferences if we want JSON, 
--    but simple columns are easier for RLS and modification.
--    Let's use specific boolean columns for clarity.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS joining_reason TEXT,
ADD COLUMN IF NOT EXISTS billing_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active',

-- Notification Preferences
ADD COLUMN IF NOT EXISTS notify_marketing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_security BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_updates BOOLEAN DEFAULT false;

-- Add a policy to allow users to update these new columns
-- (Existing "Users can update own profile" policy should cover this, but good to verify)
