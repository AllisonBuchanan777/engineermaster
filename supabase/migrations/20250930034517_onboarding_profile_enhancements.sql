-- Location: supabase/migrations/20250930034517_onboarding_profile_enhancements.sql
-- Schema Analysis: Existing engineering platform with user_profiles, achievements, lessons
-- Integration Type: Enhancement for onboarding and profile management
-- Dependencies: user_profiles, achievement_types, lessons

-- Enhanced enums for onboarding and user management
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped');
CREATE TYPE public.achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
CREATE TYPE public.skill_node_status AS ENUM ('locked', 'available', 'in_progress', 'completed', 'mastered');

-- Onboarding tracking table
CREATE TABLE public.user_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.onboarding_status DEFAULT 'not_started'::public.onboarding_status,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 5,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Skill trees structure for visual progression
CREATE TABLE public.skill_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline public.engineering_discipline NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Individual skill nodes within skill trees
CREATE TABLE public.skill_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_tree_id UUID REFERENCES public.skill_trees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    tier public.achievement_tier DEFAULT 'bronze'::public.achievement_tier,
    xp_required INTEGER DEFAULT 100,
    is_milestone BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User progress on skill nodes
CREATE TABLE public.user_skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    skill_node_id UUID REFERENCES public.skill_nodes(id) ON DELETE CASCADE,
    status public.skill_node_status DEFAULT 'locked'::public.skill_node_status,
    progress_percentage INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_node_id)
);

-- Enhanced achievement tiers for gamification
ALTER TABLE public.achievement_types 
ADD COLUMN tier public.achievement_tier DEFAULT 'bronze'::public.achievement_tier,
ADD COLUMN category TEXT DEFAULT 'general',
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- User learning goals and preferences
CREATE TABLE public.user_learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL,
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Essential indexes for performance
CREATE INDEX idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX idx_skill_trees_discipline ON public.skill_trees(discipline);
CREATE INDEX idx_skill_nodes_skill_tree_id ON public.skill_nodes(skill_tree_id);
CREATE INDEX idx_skill_nodes_lesson_id ON public.skill_nodes(lesson_id);
CREATE INDEX idx_user_skill_progress_user_id ON public.user_skill_progress(user_id);
CREATE INDEX idx_user_skill_progress_skill_node_id ON public.user_skill_progress(skill_node_id);
CREATE INDEX idx_user_learning_goals_user_id ON public.user_learning_goals(user_id);
CREATE INDEX idx_achievement_types_tier ON public.achievement_types(tier);

-- Helper functions for skill tree logic
CREATE OR REPLACE FUNCTION public.check_skill_node_prerequisites(node_id UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT CASE 
    WHEN (SELECT prerequisites FROM public.skill_nodes WHERE id = node_id) = '[]'::jsonb THEN true
    ELSE (
        SELECT NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text((SELECT prerequisites FROM public.skill_nodes WHERE id = node_id)) prereq_id
            WHERE NOT EXISTS (
                SELECT 1 FROM public.user_skill_progress usp 
                WHERE usp.user_id = user_id_param 
                AND usp.skill_node_id = prereq_id::uuid 
                AND usp.status IN ('completed', 'mastered')
            )
        )
    )
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_skill_tree_progress(user_id_param UUID, tree_id UUID)
RETURNS TABLE(
    total_nodes INTEGER,
    completed_nodes INTEGER,
    progress_percentage INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    COUNT(sn.id)::INTEGER as total_nodes,
    COUNT(CASE WHEN usp.status IN ('completed', 'mastered') THEN 1 END)::INTEGER as completed_nodes,
    COALESCE(
        ROUND((COUNT(CASE WHEN usp.status IN ('completed', 'mastered') THEN 1 END)::DECIMAL / COUNT(sn.id)) * 100), 
        0
    )::INTEGER as progress_percentage
FROM public.skill_nodes sn
LEFT JOIN public.user_skill_progress usp ON sn.id = usp.skill_node_id AND usp.user_id = user_id_param
WHERE sn.skill_tree_id = tree_id;
$$;

-- RLS Policies
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_goals ENABLE ROW LEVEL SECURITY;

-- Pattern 2: Simple user ownership for personal data
CREATE POLICY "users_manage_own_onboarding"
ON public.user_onboarding
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_skill_progress"
ON public.user_skill_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_learning_goals"
ON public.user_learning_goals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read, private write for content
CREATE POLICY "public_can_read_skill_trees"
ON public.skill_trees
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_can_manage_skill_trees"
ON public.skill_trees
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

CREATE POLICY "public_can_read_skill_nodes"
ON public.skill_nodes
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_can_manage_skill_nodes"
ON public.skill_nodes
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

-- Mock data for skill trees and nodes
DO $$
DECLARE
    mech_tree_id UUID := gen_random_uuid();
    elec_tree_id UUID := gen_random_uuid();
    civil_tree_id UUID := gen_random_uuid();
    statics_node_id UUID := gen_random_uuid();
    dynamics_node_id UUID := gen_random_uuid();
    circuits_node_id UUID := gen_random_uuid();
    structures_node_id UUID := gen_random_uuid();
    existing_user_id UUID;
    existing_lesson_id UUID;
BEGIN
    -- Get existing user and lesson for references
    SELECT id INTO existing_user_id FROM public.user_profiles WHERE role = 'student' LIMIT 1;
    SELECT id INTO existing_lesson_id FROM public.lessons LIMIT 1;

    -- Create skill trees for main disciplines
    INSERT INTO public.skill_trees (id, discipline, name, description, icon_name, order_index) VALUES
        (mech_tree_id, 'mechanical', 'Mechanical Engineering Fundamentals', 'Master core mechanical engineering concepts', 'Cog', 1),
        (elec_tree_id, 'electrical', 'Electrical Engineering Basics', 'Learn electrical circuits and systems', 'Zap', 2),
        (civil_tree_id, 'civil', 'Civil Engineering Foundation', 'Understand structural and infrastructure design', 'Building', 3);

    -- Create skill nodes with progression paths
    INSERT INTO public.skill_nodes (id, skill_tree_id, name, description, lesson_id, prerequisites, position_x, position_y, tier, xp_required, is_milestone) VALUES
        (statics_node_id, mech_tree_id, 'Statics', 'Force equilibrium and static analysis', existing_lesson_id, '[]'::jsonb, 100, 100, 'bronze', 100, true),
        (dynamics_node_id, mech_tree_id, 'Dynamics', 'Motion and dynamic systems', null, jsonb_build_array(statics_node_id), 200, 150, 'silver', 200, true),
        (circuits_node_id, elec_tree_id, 'Basic Circuits', 'Ohms law and circuit analysis', existing_lesson_id, '[]'::jsonb, 100, 100, 'bronze', 100, false),
        (structures_node_id, civil_tree_id, 'Structural Analysis', 'Load analysis and structural design', null, '[]'::jsonb, 100, 100, 'gold', 300, true);

    -- Create sample user progress if user exists
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.user_skill_progress (user_id, skill_node_id, status, progress_percentage, started_at) VALUES
            (existing_user_id, statics_node_id, 'completed', 100, NOW() - INTERVAL '5 days'),
            (existing_user_id, circuits_node_id, 'in_progress', 60, NOW() - INTERVAL '2 days');

        INSERT INTO public.user_onboarding (user_id, status, current_step, completed_steps, preferences) VALUES
            (existing_user_id, 'in_progress', 3, '["welcome", "discipline_selection", "skill_assessment"]'::jsonb, 
             '{"preferred_discipline": "mechanical", "learning_pace": "moderate", "daily_time": 30}'::jsonb);

        INSERT INTO public.user_learning_goals (user_id, goal_type, target_value, current_value, target_date) VALUES
            (existing_user_id, 'weekly_lessons', 5, 3, CURRENT_DATE + INTERVAL '7 days'),
            (existing_user_id, 'monthly_xp', 1000, 250, CURRENT_DATE + INTERVAL '30 days');
    END IF;

    -- Update achievement types with tiers
    UPDATE public.achievement_types SET 
        tier = 'bronze'::public.achievement_tier, 
        category = 'learning', 
        sort_order = 1 
    WHERE name = 'First Steps';

    UPDATE public.achievement_types SET 
        tier = 'silver'::public.achievement_tier, 
        category = 'learning', 
        sort_order = 2 
    WHERE name = 'Knowledge Seeker';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation failed: %', SQLERRM;
END $$;