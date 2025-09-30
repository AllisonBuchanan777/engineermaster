-- Location: supabase/migrations/20250929194400_subscription_and_analytics_tables.sql
-- Schema Analysis: Existing gamification system with user_profiles, lessons, learning paths, achievements
-- Integration Type: Addition - New subscription and analytics tables
-- Dependencies: user_profiles (existing), lessons (existing), learning_paths (existing)

-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'professional', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired', 'past_due');

-- User subscriptions table (referenced by existing edge function)
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier,
    status public.subscription_status DEFAULT 'trial'::public.subscription_status,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    features_access JSONB DEFAULT '{}'::jsonb,
    trial_ends_at TIMESTAMPTZ,
    billing_cycle_start TIMESTAMPTZ,
    billing_cycle_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Subscription plans configuration
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier public.subscription_tier NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Daily challenges table (referenced in user requirements)
CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    reward_points INTEGER DEFAULT 0,
    difficulty public.difficulty_level DEFAULT 'beginner'::public.difficulty_level,
    discipline public.engineering_discipline,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_date)
);

-- User daily challenge completions
CREATE TABLE public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    score INTEGER DEFAULT 0,
    time_taken_minutes INTEGER DEFAULT 0,
    UNIQUE(user_id, challenge_id)
);

-- Learning path lessons junction table (referenced in user requirements)
CREATE TABLE public.learning_paths_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(learning_path_id, lesson_id)
);

-- Essential indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_tier ON public.user_subscriptions(tier);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX idx_daily_challenges_discipline ON public.daily_challenges(discipline);
CREATE INDEX idx_user_daily_challenges_user_id ON public.user_daily_challenges(user_id);
CREATE INDEX idx_user_daily_challenges_challenge_id ON public.user_daily_challenges(challenge_id);
CREATE INDEX idx_learning_paths_lessons_learning_path_id ON public.learning_paths_lessons(learning_path_id);
CREATE INDEX idx_learning_paths_lessons_lesson_id ON public.learning_paths_lessons(lesson_id);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths_lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_daily_challenges"
ON public.user_daily_challenges
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Public read access for plans and challenges
CREATE POLICY "public_can_read_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "public_can_read_daily_challenges"
ON public.daily_challenges
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "public_can_read_learning_paths_lessons"
ON public.learning_paths_lessons
FOR SELECT
TO public
USING (true);

-- Admin management policies using Pattern 6A (Auth metadata)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE POLICY "admin_can_manage_subscription_plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_can_manage_daily_challenges"
ON public.daily_challenges
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_can_manage_learning_paths_lessons"
ON public.learning_paths_lessons
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Mock data for subscription plans
DO $$
BEGIN
    -- Insert subscription plans
    INSERT INTO public.subscription_plans (tier, name, description, price_monthly, price_yearly, features, sort_order) VALUES
    ('free', 'Free Plan', 'Perfect for getting started with engineering fundamentals', 0.00, 0.00, '{"lessons_limit": 10, "advanced_simulations": false, "certification_exams": false, "mentorship": false, "download_materials": false, "priority_support": false}', 1),
    ('premium', 'Pro Plan', 'Unlock advanced features and unlimited lessons', 19.99, 199.99, '{"lessons_limit": -1, "advanced_simulations": true, "certification_exams": false, "mentorship": false, "download_materials": true, "priority_support": false}', 2),
    ('professional', 'Professional Plan', 'Everything you need for serious engineering study', 39.99, 399.99, '{"lessons_limit": -1, "advanced_simulations": true, "certification_exams": true, "mentorship": true, "download_materials": true, "priority_support": true}', 3),
    ('enterprise', 'Enterprise Plan', 'Complete solution for teams and organizations', 99.99, 999.99, '{"lessons_limit": -1, "advanced_simulations": true, "certification_exams": true, "mentorship": true, "download_materials": true, "priority_support": true, "team_management": true, "custom_content": true}', 4);

    -- Create sample daily challenges
    INSERT INTO public.daily_challenges (challenge_date, lesson_id, description, reward_points, difficulty, discipline) VALUES
    (CURRENT_DATE, (SELECT id FROM public.lessons LIMIT 1), 'Complete the Introduction to Statics lesson and solve 3 practice problems', 50, 'beginner', 'mechanical'),
    (CURRENT_DATE + 1, (SELECT id FROM public.lessons ORDER BY id LIMIT 1 OFFSET 1), 'Master Ohm''s Law by building a simple circuit simulation', 75, 'intermediate', 'electrical'),
    (CURRENT_DATE + 2, (SELECT id FROM public.lessons LIMIT 1), 'Apply thermodynamics principles to solve real-world engineering problems', 100, 'advanced', 'mechanical');

    -- Link lessons to learning paths
    INSERT INTO public.learning_paths_lessons (learning_path_id, lesson_id, order_index, is_required)
    SELECT 
        lp.id,
        l.id,
        ROW_NUMBER() OVER (PARTITION BY lp.id ORDER BY l.created_at) as order_index,
        true
    FROM public.learning_paths lp
    JOIN public.lessons l ON l.learning_path_id = lp.id
    ON CONFLICT (learning_path_id, lesson_id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;