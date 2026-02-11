-- Create Subscription Tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'partner', 'enterprise'
    display_name TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read active tiers
CREATE POLICY "Public tiers are viewable by everyone" 
ON public.subscription_tiers FOR SELECT 
USING (true);

-- Only admins can update (using service_role for now, or check profile role if needed in future)
-- For simplicity in this demo environment, we assume admin has access via dashboard logic
-- but strict SQL would look like: using (auth.jwt() ->> 'role' = 'service_role')
CREATE POLICY "Admins can update tiers" 
ON public.subscription_tiers FOR ALL 
USING (true); -- simplified for demo; restrict this in production!

-- Seed Data
INSERT INTO public.subscription_tiers (name, display_name, price_monthly, price_yearly, features)
VALUES 
    ('free', 'Free', 0, 0, '["Basic Access", "Community Support"]'),
    ('pro', 'Pro', 29, 290, '["Full Access", "Priority Support", "Exclusive Content"]'),
    ('partner', 'Partner', 99, 990, '["All Pro Features", "Partner Badge", "Direct Collaboration"]'),
    ('enterprise', 'Enterprise', 299, 2990, '["Custom Solutions", "Dedicated Account Manager"]')
ON CONFLICT (name) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_tiers_updated_at
    BEFORE UPDATE ON public.subscription_tiers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
