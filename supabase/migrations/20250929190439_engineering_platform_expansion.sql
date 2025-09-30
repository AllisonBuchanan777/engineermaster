-- Location: supabase/migrations/20250929190439_engineering_platform_expansion.sql
-- Schema Analysis: Existing learning platform with paths, lessons, progress tracking, and gamification
-- Integration Type: Additive expansion for subscriptions, enhanced curriculum, and interactive tools
-- Dependencies: user_profiles, learning_paths, lessons, user_lesson_progress, achievement_types, xp_transactions

-- 1. SUBSCRIPTION & MONETIZATION SYSTEM
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'professional', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'paused');
CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'disputed');

-- User subscription management
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier,
    status public.subscription_status DEFAULT 'trial'::public.subscription_status,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
    features_access JSONB DEFAULT '{
        "lessons_limit": 5,
        "advanced_simulations": false,
        "certification_exams": false,
        "mentorship": false,
        "download_materials": false
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription transactions
CREATE TABLE public.subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENHANCED CURRICULUM SYSTEM
CREATE TYPE public.lesson_type AS ENUM (
    'theory', 'video', 'interactive', 'simulation', 'quiz', 'project', 
    'lab_exercise', 'case_study', 'coding_challenge', 'design_challenge'
);

CREATE TYPE public.content_access_level AS ENUM ('free', 'premium', 'professional', 'enterprise');

-- Enhanced lesson content structure
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS lesson_type public.lesson_type DEFAULT 'theory'::public.lesson_type,
ADD COLUMN IF NOT EXISTS access_level public.content_access_level DEFAULT 'free'::public.content_access_level,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS simulation_config JSONB,
ADD COLUMN IF NOT EXISTS downloadable_resources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interactive_elements JSONB DEFAULT '[]'::jsonb;

-- Lesson modules for better organization
CREATE TABLE public.lesson_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    module_type public.lesson_type NOT NULL,
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 15,
    is_mandatory BOOLEAN DEFAULT true,
    access_level public.content_access_level DEFAULT 'free'::public.content_access_level,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz and assessment system
CREATE TABLE public.lesson_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- Array of question objects
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER DEFAULT 30,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User quiz attempts
CREATE TABLE public.user_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    time_spent_minutes INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, quiz_id, attempt_number)
);

-- 3. INTERACTIVE SIMULATIONS & TOOLS
CREATE TYPE public.simulation_type AS ENUM (
    'circuit_builder', 'bridge_stress', 'fluid_dynamics', 'cad_modeling', 
    'control_systems', 'heat_transfer', 'materials_testing', 'robotics'
);

CREATE TABLE public.simulation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    simulation_type public.simulation_type NOT NULL,
    discipline public.engineering_discipline NOT NULL,
    difficulty public.difficulty_level DEFAULT 'beginner'::public.difficulty_level,
    description TEXT,
    configuration JSONB NOT NULL,
    learning_objectives TEXT[],
    access_level public.content_access_level DEFAULT 'free'::public.content_access_level,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User simulation sessions
CREATE TABLE public.simulation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.simulation_templates(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    session_data JSONB NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CERTIFICATION & ASSESSMENT SYSTEM
CREATE TYPE public.certification_status AS ENUM ('in_progress', 'completed', 'failed', 'expired');

CREATE TABLE public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discipline public.engineering_discipline NOT NULL,
    level public.difficulty_level DEFAULT 'intermediate'::public.difficulty_level,
    required_lessons UUID[] DEFAULT '{}',
    required_score INTEGER DEFAULT 80,
    validity_months INTEGER DEFAULT 24,
    access_level public.content_access_level DEFAULT 'premium'::public.content_access_level,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    certification_id UUID REFERENCES public.certifications(id) ON DELETE CASCADE,
    status public.certification_status DEFAULT 'in_progress'::public.certification_status,
    score INTEGER,
    attempts_used INTEGER DEFAULT 0,
    earned_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, certification_id)
);

-- 5. DAILY CHALLENGES & STREAKS ENHANCEMENT
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS daily_challenge_completed_today BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weekly_xp_goal INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS monthly_lessons_goal INTEGER DEFAULT 20;

CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL UNIQUE,
    discipline public.engineering_discipline,
    challenge_type TEXT NOT NULL, -- 'quiz', 'simulation', 'problem_solving'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content JSONB NOT NULL,
    xp_reward INTEGER DEFAULT 25,
    difficulty public.difficulty_level DEFAULT 'intermediate'::public.difficulty_level,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, challenge_id)
);

-- 6. ENHANCED ACHIEVEMENT SYSTEM
INSERT INTO public.achievement_types (name, description, icon_name, unlock_criteria, xp_reward, badge_color) VALUES
('Subscription Starter', 'Upgrade to premium subscription', 'Crown', '{"type":"subscription_upgrade","tier":"premium"}', 100, '#FFD700'),
('Engineering Expert', 'Complete all lessons in one discipline', 'GraduationCap', '{"type":"discipline_mastery","count":1}', 500, '#8B5CF6'),
('Simulation Master', 'Complete 50 simulation exercises', 'Zap', '{"type":"simulation_completion","count":50}', 200, '#F59E0B'),
('Quiz Champion', 'Score 100% on 10 different quizzes', 'Trophy', '{"type":"perfect_quiz_score","count":10}', 150, '#10B981'),
('Streak Legend', 'Maintain a 30-day learning streak', 'Flame', '{"type":"streak_achievement","days":30}', 300, '#EF4444'),
('Certified Engineer', 'Earn your first professional certification', 'Award', '{"type":"certification_earned","count":1}', 1000, '#6366F1'),
('Daily Challenger', 'Complete 7 daily challenges in a row', 'Calendar', '{"type":"daily_challenge_streak","days":7}', 100, '#14B8A6');

-- 7. CONTENT RECOMMENDATIONS SYSTEM
CREATE TABLE public.user_learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    discipline_preferences public.engineering_discipline[],
    learning_pace_minutes_per_day INTEGER DEFAULT 30,
    preferred_difficulty public.difficulty_level DEFAULT 'intermediate'::public.difficulty_level,
    weak_topics TEXT[] DEFAULT '{}',
    strong_topics TEXT[] DEFAULT '{}',
    recommended_lessons UUID[] DEFAULT '{}',
    last_recommendation_update TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. COMPREHENSIVE INDEXES FOR PERFORMANCE
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_subscription_transactions_user_id ON public.subscription_transactions(user_id);
CREATE INDEX idx_lesson_modules_lesson_id ON public.lesson_modules(lesson_id);
CREATE INDEX idx_lesson_quizzes_lesson_id ON public.lesson_quizzes(lesson_id);
CREATE INDEX idx_user_quiz_attempts_user_id ON public.user_quiz_attempts(user_id);
CREATE INDEX idx_simulation_templates_type ON public.simulation_templates(simulation_type);
CREATE INDEX idx_simulation_sessions_user_id ON public.simulation_sessions(user_id);
CREATE INDEX idx_user_certifications_user_id ON public.user_certifications(user_id);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX idx_user_daily_challenges_user_id ON public.user_daily_challenges(user_id);
CREATE INDEX idx_user_learning_analytics_user_id ON public.user_learning_analytics(user_id);

-- 9. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_analytics ENABLE ROW LEVEL SECURITY;

-- User subscription management
CREATE POLICY "users_manage_own_subscriptions" ON public.user_subscriptions
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_view_own_transactions" ON public.subscription_transactions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Content policies
CREATE POLICY "public_can_read_lesson_modules" ON public.lesson_modules
FOR SELECT TO public
USING (true);

CREATE POLICY "public_can_read_quizzes" ON public.lesson_quizzes
FOR SELECT TO public
USING (true);

CREATE POLICY "users_manage_own_quiz_attempts" ON public.user_quiz_attempts
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "public_can_read_simulations" ON public.simulation_templates
FOR SELECT TO public
USING (true);

CREATE POLICY "users_manage_own_sessions" ON public.simulation_sessions
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Certification policies
CREATE POLICY "public_can_read_certifications" ON public.certifications
FOR SELECT TO public
USING (true);

CREATE POLICY "users_manage_own_certifications" ON public.user_certifications
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Challenge policies
CREATE POLICY "public_can_read_daily_challenges" ON public.daily_challenges
FOR SELECT TO public
USING (true);

CREATE POLICY "users_manage_own_challenge_attempts" ON public.user_daily_challenges
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_analytics" ON public.user_learning_analytics
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. FUNCTIONS FOR BUSINESS LOGIC
CREATE OR REPLACE FUNCTION public.check_subscription_access(
    user_uuid UUID,
    required_level public.content_access_level
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    CASE 
        WHEN required_level = 'free' THEN true
        WHEN required_level = 'premium' THEN 
            EXISTS (
                SELECT 1 FROM public.user_subscriptions us
                WHERE us.user_id = user_uuid 
                AND us.status = 'active'
                AND us.tier IN ('premium', 'professional', 'enterprise')
                AND (us.current_period_end IS NULL OR us.current_period_end > now())
            )
        WHEN required_level = 'professional' THEN 
            EXISTS (
                SELECT 1 FROM public.user_subscriptions us
                WHERE us.user_id = user_uuid 
                AND us.status = 'active'
                AND us.tier IN ('professional', 'enterprise')
                AND (us.current_period_end IS NULL OR us.current_period_end > now())
            )
        WHEN required_level = 'enterprise' THEN 
            EXISTS (
                SELECT 1 FROM public.user_subscriptions us
                WHERE us.user_id = user_uuid 
                AND us.status = 'active'
                AND us.tier = 'enterprise'
                AND (us.current_period_end IS NULL OR us.current_period_end > now())
            )
        ELSE false
    END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update streak when user completes lesson or daily challenge
    UPDATE public.user_profiles
    SET 
        current_streak = CASE 
            WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
                OR last_activity_date = CURRENT_DATE THEN current_streak + 1
            ELSE 1
        END,
        longest_streak = GREATEST(
            longest_streak, 
            CASE 
                WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
                    OR last_activity_date = CURRENT_DATE THEN current_streak + 1
                ELSE 1
            END
        ),
        last_activity_date = CURRENT_DATE
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$;

-- Trigger to update streaks
CREATE TRIGGER update_streak_on_lesson_complete
    AFTER UPDATE OF completion_percentage ON public.user_lesson_progress
    FOR EACH ROW
    WHEN (NEW.completion_percentage = 100 AND OLD.completion_percentage < 100)
    EXECUTE FUNCTION public.update_user_streak();

CREATE TRIGGER update_streak_on_challenge_complete
    AFTER INSERT ON public.user_daily_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_streak();

-- 11. SAMPLE DATA FOR COMPREHENSIVE CURRICULUM
DO $$
DECLARE
    mech_path_id UUID;
    elec_path_id UUID;
    civil_path_id UUID;
    comp_path_id UUID;
    instructor_id UUID;
    lesson_id UUID;
    quiz_id UUID;
    cert_id UUID;
    challenge_id UUID;
BEGIN
    -- Get instructor ID with LIMIT to prevent multiple row error
    SELECT id INTO instructor_id FROM public.user_profiles WHERE role = 'instructor' LIMIT 1;
    
    -- Skip data generation if no instructor exists
    IF instructor_id IS NULL THEN
        RAISE NOTICE 'No instructor user found, skipping sample data generation';
        RETURN;
    END IF;
    
    -- Create comprehensive learning paths and get mech_path_id safely
    INSERT INTO public.learning_paths (name, discipline, difficulty, description, learning_objectives, estimated_duration_hours, is_published, created_by) VALUES
    ('Complete Mechanical Engineering', 'mechanical', 'beginner', 
     'Comprehensive mechanical engineering curriculum from basics to advanced applications', 
     ARRAY['Master statics and dynamics', 'Understand thermodynamics', 'Design mechanical systems', 'Analyze materials properties'],
     120, true, instructor_id)
    RETURNING id INTO mech_path_id;

    -- Create other learning paths
    INSERT INTO public.learning_paths (name, discipline, difficulty, description, learning_objectives, estimated_duration_hours, is_published, created_by) VALUES
    ('Advanced Electrical Systems', 'electrical', 'advanced', 
     'Advanced electrical engineering covering power systems, control theory, and digital signal processing',
     ARRAY['Design power systems', 'Implement control algorithms', 'Process digital signals', 'Analyze electromagnetic fields'],
     100, true, instructor_id);

    INSERT INTO public.learning_paths (name, discipline, difficulty, description, learning_objectives, estimated_duration_hours, is_published, created_by) VALUES
    ('Structural Engineering Mastery', 'civil', 'intermediate',
     'Complete structural engineering from foundation to skyscraper design',
     ARRAY['Analyze structural loads', 'Design concrete structures', 'Understand soil mechanics', 'Plan construction projects'],
     90, true, instructor_id);

    INSERT INTO public.learning_paths (name, discipline, difficulty, description, learning_objectives, estimated_duration_hours, is_published, created_by) VALUES
    ('Software Engineering Fundamentals', 'computer', 'beginner',
     'Modern software engineering practices and computer science principles',
     ARRAY['Master data structures', 'Implement algorithms', 'Design software architecture', 'Practice DevOps'],
     80, true, instructor_id);

    -- Get path IDs safely with LIMIT 1
    SELECT id INTO elec_path_id FROM public.learning_paths WHERE name = 'Advanced Electrical Systems' LIMIT 1;
    SELECT id INTO civil_path_id FROM public.learning_paths WHERE name = 'Structural Engineering Mastery' LIMIT 1;
    SELECT id INTO comp_path_id FROM public.learning_paths WHERE name = 'Software Engineering Fundamentals' LIMIT 1;

    -- Create comprehensive lessons only if all path IDs are found
    IF mech_path_id IS NOT NULL AND elec_path_id IS NOT NULL AND civil_path_id IS NOT NULL AND comp_path_id IS NOT NULL THEN
        INSERT INTO public.lessons (learning_path_id, title, slug, description, difficulty, lesson_type, access_level, order_index, estimated_duration_minutes, xp_reward, content, is_published, created_by)
        VALUES
        -- Mechanical Engineering Lessons
        (mech_path_id, 'Advanced Statics Analysis', 'advanced-statics-analysis', 'Deep dive into static equilibrium and force analysis', 'intermediate', 'interactive', 'premium', 2, 60, 75,
         '{"sections": [{"type": "theory", "content": "Advanced statics principles"}, {"type": "simulation", "config": {"type": "truss_analysis"}}, {"type": "quiz", "questions": 10}]}', true, instructor_id),
        (mech_path_id, 'Thermodynamics Laboratory', 'thermodynamics-laboratory', 'Hands-on thermodynamics experiments and analysis', 'advanced', 'lab_exercise', 'professional', 3, 90, 100,
         '{"sections": [{"type": "video", "url": "/videos/thermo_lab.mp4"}, {"type": "interactive", "elements": ["heat_engine_sim", "entropy_calculator"]}, {"type": "project", "deliverables": ["lab_report", "analysis"]}]}', true, instructor_id),
        
        -- Electrical Engineering Lessons  
        (elec_path_id, 'Power Systems Design', 'power-systems-design', 'Comprehensive power system analysis and design', 'expert', 'project', 'professional', 1, 120, 150,
         '{"sections": [{"type": "theory", "content": "Power flow analysis"}, {"type": "simulation", "config": {"type": "power_grid"}}, {"type": "design_challenge", "requirements": ["Load forecasting", "Grid stability"]}]}', true, instructor_id),
        (elec_path_id, 'Digital Signal Processing', 'digital-signal-processing', 'Advanced DSP techniques and applications', 'expert', 'coding_challenge', 'enterprise', 2, 100, 125,
         '{"sections": [{"type": "theory", "content": "FFT and filtering"}, {"type": "interactive", "elements": ["spectrum_analyzer", "filter_designer"]}, {"type": "coding_challenge", "language": "MATLAB"}]}', true, instructor_id),
        
        -- Civil Engineering Lessons
        (civil_path_id, 'Reinforced Concrete Design', 'reinforced-concrete-design', 'Structural design of reinforced concrete members', 'advanced', 'design_challenge', 'premium', 1, 80, 90,
         '{"sections": [{"type": "theory", "content": "ACI code requirements"}, {"type": "simulation", "config": {"type": "beam_design"}}, {"type": "design_challenge", "deliverable": "structural_drawings"}]}', true, instructor_id),
        (civil_path_id, 'Earthquake Engineering', 'earthquake-engineering', 'Seismic design and analysis of structures', 'expert', 'simulation', 'professional', 2, 70, 110,
         '{"sections": [{"type": "case_study", "content": "Historical earthquake analysis"}, {"type": "simulation", "config": {"type": "seismic_analysis"}}, {"type": "project", "scope": "Retrofit design"}]}', true, instructor_id),
        
        -- Computer Engineering Lessons
        (comp_path_id, 'Algorithm Design Patterns', 'algorithm-design-patterns', 'Advanced algorithms and optimization techniques', 'advanced', 'coding_challenge', 'premium', 1, 50, 80,
         '{"sections": [{"type": "theory", "content": "Dynamic programming"}, {"type": "coding_challenge", "platform": "LeetCode"}, {"type": "interactive", "elements": ["complexity_analyzer"]}]}', true, instructor_id),
        (comp_path_id, 'System Architecture Design', 'system-architecture-design', 'Scalable system design principles', 'expert', 'case_study', 'professional', 2, 90, 120,
         '{"sections": [{"type": "case_study", "content": "Large-scale system examples"}, {"type": "design_challenge", "scope": "Microservices architecture"}, {"type": "project", "deliverable": "System design document"}]}', true, instructor_id);

        -- Create lesson modules for interactive content
        INSERT INTO public.lesson_modules (lesson_id, module_name, module_type, content, order_index, estimated_duration_minutes, access_level)
        SELECT 
            l.id,
            'Interactive Simulation',
            'simulation',
            ('{"type": "' || 
                CASE l.title 
                    WHEN 'Advanced Statics Analysis' THEN 'truss_analysis'
                    WHEN 'Power Systems Design' THEN 'power_grid'
                    WHEN 'Reinforced Concrete Design' THEN 'beam_design'
                    ELSE 'general_simulation'
                END || '", "parameters": {"complexity": "advanced", "guided": true}}')::jsonb,
            1,
            20,
            l.access_level
        FROM public.lessons l
        WHERE l.lesson_type IN ('simulation', 'interactive');

        -- Create comprehensive quizzes
        INSERT INTO public.lesson_quizzes (lesson_id, title, description, questions, passing_score, max_attempts, time_limit_minutes)
        SELECT 
            id,
            'Mastery Assessment: ' || title,
            'Comprehensive quiz covering all key concepts from ' || title,
            '[
                {
                    "type": "multiple_choice",
                    "question": "What is the primary principle covered in this lesson?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct": 0,
                    "explanation": "Detailed explanation of the correct answer."
                },
                {
                    "type": "numerical",
                    "question": "Calculate the result for the given scenario:",
                    "answer": 42,
                    "tolerance": 0.1,
                    "units": "N/m²"
                },
                {
                    "type": "essay",
                    "question": "Explain the practical applications of this concept:",
                    "max_words": 200,
                    "rubric": ["Technical accuracy", "Real-world examples", "Clear communication"]
                }
            ]'::jsonb,
            80,
            3,
            45
        FROM public.lessons
        WHERE access_level IN ('premium', 'professional', 'enterprise');
    END IF;

    -- Create certifications
    INSERT INTO public.certifications (name, description, discipline, level, required_score, validity_months, access_level)
    VALUES
    ('Professional Mechanical Engineer', 'Comprehensive mechanical engineering certification', 'mechanical', 'expert', 85, 24, 'professional'),
    ('Advanced Electrical Systems Engineer', 'Specialization in electrical power and control systems', 'electrical', 'expert', 90, 18, 'enterprise'),
    ('Licensed Structural Engineer', 'Professional structural engineering certification', 'civil', 'expert', 88, 36, 'professional'),
    ('Software Architecture Specialist', 'Advanced software engineering and system design', 'computer', 'advanced', 82, 12, 'premium');

    -- Create simulation templates
    INSERT INTO public.simulation_templates (name, simulation_type, discipline, difficulty, description, configuration, learning_objectives, access_level, created_by)
    VALUES
    ('Circuit Analysis Lab', 'circuit_builder', 'electrical', 'intermediate', 
     'Interactive circuit building and analysis tool',
     '{"components": ["resistor", "capacitor", "inductor", "voltage_source"], "tools": ["multimeter", "oscilloscope"], "challenges": ["ac_analysis", "transient_response"]}',
     ARRAY['Build circuits', 'Measure electrical properties', 'Analyze AC/DC behavior'], 'premium', instructor_id),
    ('Bridge Load Testing', 'bridge_stress', 'civil', 'advanced',
     'Structural analysis of bridge designs under various loads',
     '{"bridge_types": ["truss", "beam", "suspension"], "load_cases": ["dead_load", "live_load", "wind_load"], "materials": ["steel", "concrete", "composite"]}',
     ARRAY['Design bridge structures', 'Analyze stress distribution', 'Optimize for safety'], 'professional', instructor_id),
    ('Fluid Flow Simulator', 'fluid_dynamics', 'mechanical', 'advanced',
     'CFD simulation for fluid flow analysis',
     '{"flow_types": ["laminar", "turbulent"], "geometries": ["pipe", "channel", "airfoil"], "properties": ["velocity", "pressure", "temperature"]}',
     ARRAY['Understand fluid behavior', 'Analyze flow patterns', 'Design fluid systems'], 'professional', instructor_id),
    ('Robotic Control System', 'robotics', 'computer', 'expert',
     'Program and control robotic systems',
     '{"robot_types": ["arm", "mobile", "drone"], "sensors": ["camera", "lidar", "imu"], "controllers": ["pid", "fuzzy", "neural"]}',
     ARRAY['Program robot behavior', 'Implement control algorithms', 'Integrate sensors'], 'enterprise', instructor_id);

    -- Create daily challenges for this month
    FOR i IN 1..30 LOOP
        INSERT INTO public.daily_challenges (challenge_date, discipline, challenge_type, title, description, content, xp_reward, difficulty)
        VALUES
        (CURRENT_DATE + (i - 15) * INTERVAL '1 day',
         (ARRAY['mechanical'::public.engineering_discipline, 'electrical'::public.engineering_discipline, 'civil'::public.engineering_discipline, 'computer'::public.engineering_discipline])[1 + (i % 4)],
         (ARRAY['quiz', 'simulation', 'problem_solving'])[1 + (i % 3)],
         'Daily Challenge ' || i || ': ' || (ARRAY['Quick Quiz', 'Mini Simulation', 'Problem Solving'])[1 + (i % 3)],
         'Test your engineering knowledge with today''s challenge',
         '{"type": "' || (ARRAY['quiz', 'simulation', 'problem_solving'])[1 + (i % 3)] || '", "difficulty": "' || (ARRAY['beginner', 'intermediate', 'advanced'])[1 + (i % 3)] || '", "questions": 5}',
         25 + (i % 3) * 10,
         (ARRAY['beginner', 'intermediate', 'advanced'])[1 + (i % 3)]::public.difficulty_level);
    END LOOP;

END $$;