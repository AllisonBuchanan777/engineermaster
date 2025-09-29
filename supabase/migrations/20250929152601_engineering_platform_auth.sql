-- Location: supabase/migrations/20250929152601_engineering_platform_auth.sql
-- Schema Analysis: Fresh project - no existing tables
-- Integration Type: Complete authentication system
-- Dependencies: None (first migration)

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.engineering_discipline AS ENUM (
  'mechanical', 'electrical', 'civil', 'chemical', 'computer', 
  'aerospace', 'biomedical', 'environmental', 'materials', 'industrial'
);

-- 2. Core user profiles table (intermediary for auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    role public.user_role DEFAULT 'student'::public.user_role,
    specialization public.engineering_discipline,
    bio TEXT,
    avatar_url TEXT,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Achievement types and user achievements
CREATE TABLE public.achievement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name TEXT,
    badge_color TEXT DEFAULT '#3B82F6',
    xp_reward INTEGER DEFAULT 0,
    unlock_criteria JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievement_types(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    progress_data JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

-- 4. XP tracking and level progression
CREATE TABLE public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- lesson_completion, quiz_success, daily_login, etc.
    reference_id UUID, -- ID of lesson, quiz, etc.
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Learning paths and roadmaps
CREATE TABLE public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discipline public.engineering_discipline NOT NULL,
    difficulty public.difficulty_level DEFAULT 'beginner',
    estimated_duration_hours INTEGER,
    prerequisites TEXT[],
    learning_objectives TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lessons and curriculum structure
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    content JSONB, -- Structured lesson content (videos, text, interactive elements)
    difficulty public.difficulty_level DEFAULT 'beginner',
    estimated_duration_minutes INTEGER,
    prerequisites UUID[], -- Array of lesson IDs
    learning_objectives TEXT[],
    xp_reward INTEGER DEFAULT 50,
    order_index INTEGER,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. User progress tracking
CREATE TABLE public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    quiz_scores JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- 8. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at);
CREATE INDEX idx_learning_paths_discipline ON public.learning_paths(discipline);
CREATE INDEX idx_lessons_learning_path_id ON public.lessons(learning_path_id);
CREATE INDEX idx_lessons_slug ON public.lessons(slug);
CREATE INDEX idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);

-- 9. Functions for user management and XP calculation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, username, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_user_level(user_xp INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
SELECT CASE 
  WHEN user_xp < 100 THEN 1
  WHEN user_xp < 300 THEN 2
  WHEN user_xp < 600 THEN 3
  WHEN user_xp < 1000 THEN 4
  WHEN user_xp < 1500 THEN 5
  WHEN user_xp < 2100 THEN 6
  WHEN user_xp < 2800 THEN 7
  WHEN user_xp < 3600 THEN 8
  WHEN user_xp < 4500 THEN 9
  ELSE 10
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_xp_and_level()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  new_total_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Calculate new total XP
  SELECT COALESCE(SUM(amount), 0) INTO new_total_xp
  FROM public.xp_transactions
  WHERE user_id = NEW.user_id;
  
  -- Calculate new level
  SELECT public.calculate_user_level(new_total_xp) INTO new_level;
  
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    total_xp = new_total_xp,
    current_level = new_level,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 10. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies using safe patterns
-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read, private write for achievement types
CREATE POLICY "public_can_read_achievement_types"
ON public.achievement_types
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_can_manage_achievement_types"
ON public.achievement_types
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_profiles up
  WHERE up.id = auth.uid() AND up.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_profiles up
  WHERE up.id = auth.uid() AND up.role = 'admin'
));

-- Pattern 2: Simple user ownership for user achievements
CREATE POLICY "users_manage_own_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for XP transactions
CREATE POLICY "users_manage_own_xp_transactions"
ON public.xp_transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read for learning paths, instructors can manage
CREATE POLICY "public_can_read_learning_paths"
ON public.learning_paths
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "instructors_can_manage_learning_paths"
ON public.learning_paths
FOR ALL
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('instructor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('instructor', 'admin')
  )
);

-- Pattern 4: Public read for lessons, instructors can manage
CREATE POLICY "public_can_read_lessons"
ON public.lessons
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "instructors_can_manage_lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('instructor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('instructor', 'admin')
  )
);

-- Pattern 2: Simple user ownership for lesson progress
CREATE POLICY "users_manage_own_lesson_progress"
ON public.user_lesson_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 12. Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_xp_transaction_change
  AFTER INSERT OR UPDATE ON public.xp_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp_and_level();

-- 13. Mock Data with Complete Auth Users
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    instructor_uuid UUID := gen_random_uuid();
    student_uuid UUID := gen_random_uuid();
    path1_uuid UUID := gen_random_uuid();
    path2_uuid UUID := gen_random_uuid();
    lesson1_uuid UUID := gen_random_uuid();
    lesson2_uuid UUID := gen_random_uuid();
    achievement1_uuid UUID := gen_random_uuid();
    achievement2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create complete auth.users records with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@engineermaster.com', crypt('AdminPass123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Sarah Johnson", "username": "admin_sarah", "role": "admin"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (instructor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'instructor@engineermaster.com', crypt('InstructorPass123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Prof. Michael Chen", "username": "prof_chen", "role": "instructor"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (student_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'student@engineermaster.com', crypt('StudentPass123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Alex Rodriguez", "username": "alex_student", "role": "student"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create achievement types
    INSERT INTO public.achievement_types (id, name, description, icon_name, badge_color, xp_reward, unlock_criteria) VALUES
        (achievement1_uuid, 'First Steps', 'Complete your first lesson', 'Award', '#10B981', 25, 
         '{"type": "lesson_completion", "count": 1}'::jsonb),
        (achievement2_uuid, 'Knowledge Seeker', 'Complete 10 lessons in any discipline', 'BookOpen', '#3B82F6', 100,
         '{"type": "lesson_completion", "count": 10}'::jsonb);

    -- Create learning paths
    INSERT INTO public.learning_paths (id, name, description, discipline, difficulty, estimated_duration_hours, prerequisites, learning_objectives, is_published, created_by) VALUES
        (path1_uuid, 'Mechanical Engineering Fundamentals', 
         'Master the core principles of mechanical engineering including statics, dynamics, and thermodynamics',
         'mechanical', 'beginner', 40, 
         ARRAY['Basic calculus', 'Physics fundamentals'], 
         ARRAY['Understand static equilibrium', 'Apply Newton''s laws', 'Analyze thermodynamic cycles'],
         true, instructor_uuid),
        (path2_uuid, 'Electrical Circuits Mastery',
         'Learn electrical circuit analysis, from basic DC circuits to complex AC systems',
         'electrical', 'intermediate', 35,
         ARRAY['Basic algebra', 'Physics - electricity'], 
         ARRAY['Analyze DC circuits', 'Design AC circuits', 'Understand power systems'],
         true, instructor_uuid);

    -- Create sample lessons
    INSERT INTO public.lessons (id, learning_path_id, title, slug, description, content, difficulty, estimated_duration_minutes, xp_reward, order_index, is_published, created_by) VALUES
        (lesson1_uuid, path1_uuid, 'Introduction to Statics', 'intro-to-statics',
         'Learn the fundamental principles of static equilibrium and force analysis',
         '{"sections": [{"type": "video", "url": "/videos/statics-intro.mp4"}, {"type": "text", "content": "Static equilibrium occurs when..."}, {"type": "quiz", "questions": []}]}'::jsonb,
         'beginner', 45, 50, 1, true, instructor_uuid),
        (lesson2_uuid, path2_uuid, 'Ohm''s Law and Basic Circuits', 'ohms-law-circuits',
         'Master Ohm''s law and apply it to analyze simple electrical circuits',
         '{"sections": [{"type": "interactive", "simulation": "circuit_builder"}, {"type": "text", "content": "Ohm''s law states that..."}, {"type": "practice", "exercises": []}]}'::jsonb,
         'beginner', 30, 40, 1, true, instructor_uuid);

    -- Create sample progress and XP transactions for student
    INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, completion_percentage, time_spent_minutes, completed_at) VALUES
        (student_uuid, lesson1_uuid, 'completed', 100, 47, now() - interval '2 days');

    INSERT INTO public.xp_transactions (user_id, amount, source, reference_id, description) VALUES
        (student_uuid, 50, 'lesson_completion', lesson1_uuid, 'Completed Introduction to Statics'),
        (student_uuid, 25, 'daily_login', null, 'Daily login bonus'),
        (student_uuid, 25, 'achievement_earned', achievement1_uuid, 'Earned First Steps achievement');

    -- Award achievements
    INSERT INTO public.user_achievements (user_id, achievement_id, progress_data) VALUES
        (student_uuid, achievement1_uuid, '{"lessons_completed": 1}'::jsonb);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;