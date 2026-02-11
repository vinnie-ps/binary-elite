-- Add link column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS link TEXT;
