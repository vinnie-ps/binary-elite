-- Binary Elite Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE project_status AS ENUM ('live', 'mvp', 'in_progress');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    status project_status NOT NULL DEFAULT 'in_progress',
    features TEXT[] NOT NULL DEFAULT '{}',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FEATURE CARDS TABLE
-- ============================================
CREATE TABLE feature_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type TEXT NOT NULL DEFAULT 'text',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status application_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    notes TEXT
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- PROJECTS: Public read for active projects, admin full access
CREATE POLICY "Public can view active projects"
    ON projects FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can do everything with projects"
    ON projects FOR ALL
    USING (auth.role() = 'authenticated');

-- FEATURE CARDS: Public read for active cards, admin full access
CREATE POLICY "Public can view active feature cards"
    ON feature_cards FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can do everything with feature cards"
    ON feature_cards FOR ALL
    USING (auth.role() = 'authenticated');

-- SITE SETTINGS: Public read all, admin full access
CREATE POLICY "Public can view all site settings"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can do everything with site settings"
    ON site_settings FOR ALL
    USING (auth.role() = 'authenticated');

-- APPLICATIONS: Public can insert, admins full access
CREATE POLICY "Anyone can submit an application"
    ON applications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update applications"
    ON applications FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_projects_order ON projects(order_index);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_active ON projects(is_active);

CREATE INDEX idx_feature_cards_order ON feature_cards(order_index);
CREATE INDEX idx_feature_cards_active ON feature_cards(is_active);

CREATE INDEX idx_site_settings_key ON site_settings(setting_key);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted ON applications(submitted_at DESC);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default feature cards
INSERT INTO feature_cards (title, description, icon, order_index) VALUES
('Learn', 'Curated knowledge workshops, and edtech insights', '🧠', 1),
('Build', 'Real projects, startups, and open-source tools', '🔧', 2),
('Share', 'Community, mentorship, and collaboration', '🔗', 3);

-- Insert default projects
INSERT INTO projects (title, description, icon, status, features, order_index) VALUES
(
    'EdTech Innovation',
    'Innovative learning platforms and tools',
    '📚',
    'live',
    ARRAY['Learning Platforms', 'AI Tutors & Tools', 'Developer-Focused Education'],
    1
),
(
    'Code Mentor',
    'AI-powered coding assistance',
    '💻',
    'mvp',
    ARRAY['Open-Source Tools', 'Experimental AI Products', 'Builder-First Sales'],
    2
),
(
    'Brainy Hub',
    'Collaborative learning community',
    '🤖',
    'in_progress',
    ARRAY['Invite-Only AI Resources', 'Peer Learning', 'Hack Sessions & Challenges'],
    3
);

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
('hero_title', 'Binary Elite', 'text'),
('hero_tagline', 'Where elite tech minds build the future of education', 'text'),
('hero_description', 'A collective of developers, designers, and AI builders pushing the boundaries of learning through technology.', 'text'),
('about_title', 'What is Binary Elite?', 'text'),
('about_subtitle', 'Tech-Driven, Education-Focused, Forward-Thinking', 'text'),
('about_description', 'Binary Elite (BE) is a group of like-minded individuals united by technology, innovation, and education. We build tools, platforms, and ideas that empower the next generation of learners and creators.', 'text'),
('projects_title', 'Featured Projects', 'text'),
('projects_subtitle', 'Innovating at the Intersection of Tech & Education', 'text'),
('exclusive_title', 'Who It''s For', 'text'),
('exclusive_statement', 'Binary Elite isn''t for everyone — and that''s intentional.', 'text'),
('footer_text', '© 2026 Binary Elite. Building the future of education.', 'text');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_cards_updated_at
    BEFORE UPDATE ON feature_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
