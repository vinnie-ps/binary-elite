-- Create Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    duration integer, -- in minutes
    video_url text, -- YouTube/Vimeo/MP4 link
    is_locked boolean DEFAULT true, -- if false, can be viewed without completion of previous?
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create Enrollments Table (Tracks if a user has started a course)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
    progress integer DEFAULT 0, -- percent completion
    enrolled_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, class_id)
);

-- Enable RLS for Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create Lesson Progress Table (Tracks individual lesson completion)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS for Lesson Progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- LESSONS
-- Public/Members can view lessons if they have access to the class (handled by class visibility, but lessons need their own policy)
-- For now, authenticated users can read lessons
CREATE POLICY "Authenticated read lessons" ON public.lessons
FOR SELECT TO authenticated
USING (true);

-- Admins manage lessons
CREATE POLICY "Admins manage lessons" ON public.lessons
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ENROLLMENTS
-- Users can view/create their own enrollments
CREATE POLICY "Users manage own enrollments" ON public.enrollments
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins view all enrollments
CREATE POLICY "Admins view enrollments" ON public.enrollments
FOR SELECT TO authenticated
USING (public.is_admin());

-- LESSON PROGRESS
-- Users manage own progress
CREATE POLICY "Users manage own progress" ON public.lesson_progress
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins view all progress
CREATE POLICY "Admins view progress" ON public.lesson_progress
FOR SELECT TO authenticated
USING (public.is_admin());
