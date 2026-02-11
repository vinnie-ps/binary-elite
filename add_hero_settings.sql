-- Add new settings for Hero Video and Secondary Logo
INSERT INTO site_settings (setting_key, setting_value, setting_type)
VALUES 
('hero_video_url', '', 'text'),
('secondary_logo_url', '', 'text')
ON CONFLICT (setting_key) DO NOTHING;
