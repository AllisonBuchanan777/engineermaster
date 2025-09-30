-- Location: supabase/migrations/20250930021259_skill_trees_and_enhanced_achievements.sql
-- Schema Analysis: Existing achievement system with achievement_types and user_achievements tables
-- Integration Type: Extension - Adding skill trees and enhanced achievement tiers
-- Dependencies: user_profiles, achievement_types, lessons, learning_paths

-- 1. Create enums for new functionality
CREATE TYPE public.achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE public.skill_node_status AS ENUM ('locked', 'available', 'in_progress', 'mastered');

-- 2. Create skill_trees table
CREATE TABLE public.skill_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline public.engineering_discipline NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    total_nodes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create skill_nodes table
CREATE TABLE public.skill_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_tree_id UUID REFERENCES public.skill_trees(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    prerequisites UUID[] DEFAULT '{}',
    mastery_requirements JSONB DEFAULT '{}',
    xp_reward INTEGER DEFAULT 100,
    tier public.achievement_tier DEFAULT 'bronze',
    related_lessons UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create user_skill_progress table
CREATE TABLE public.user_skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    skill_node_id UUID REFERENCES public.skill_nodes(id) ON DELETE CASCADE NOT NULL,
    status public.skill_node_status DEFAULT 'locked',
    progress_percentage INTEGER DEFAULT 0,
    mastery_data JSONB DEFAULT '{}',
    unlocked_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_node_id)
);

-- 5. Add tier column to existing achievement_types table
ALTER TABLE public.achievement_types 
ADD COLUMN tier public.achievement_tier DEFAULT 'bronze';

-- 6. Create indexes for performance
CREATE INDEX idx_skill_trees_discipline ON public.skill_trees(discipline);
CREATE INDEX idx_skill_nodes_tree_id ON public.skill_nodes(skill_tree_id);
CREATE INDEX idx_skill_nodes_tier ON public.skill_nodes(tier);
CREATE INDEX idx_user_skill_progress_user_id ON public.user_skill_progress(user_id);
CREATE INDEX idx_user_skill_progress_skill_node_id ON public.user_skill_progress(skill_node_id);
CREATE INDEX idx_user_skill_progress_status ON public.user_skill_progress(status);
CREATE INDEX idx_achievement_types_tier ON public.achievement_types(tier);

-- 7. Enable RLS on new tables
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;

-- 8. Helper functions
CREATE OR REPLACE FUNCTION public.check_skill_prerequisites(user_uuid UUID, skill_node_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT (
    SELECT CASE 
        WHEN array_length(sn.prerequisites, 1) IS NULL THEN true
        ELSE (
            SELECT COUNT(*) = array_length(sn.prerequisites, 1)
            FROM public.user_skill_progress usp
            WHERE usp.user_id = user_uuid
            AND usp.skill_node_id = ANY(sn.prerequisites)
            AND usp.status = 'mastered'
        )
    END
    FROM public.skill_nodes sn
    WHERE sn.id = skill_node_uuid
);
$$;

CREATE OR REPLACE FUNCTION public.get_user_skill_tree_progress(user_uuid UUID, tree_uuid UUID)
RETURNS TABLE(
    total_nodes INTEGER,
    mastered_nodes INTEGER,
    progress_percentage DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    COUNT(sn.id)::INTEGER as total_nodes,
    COUNT(CASE WHEN usp.status = 'mastered' THEN 1 END)::INTEGER as mastered_nodes,
    ROUND(
        CASE 
            WHEN COUNT(sn.id) = 0 THEN 0
            ELSE (COUNT(CASE WHEN usp.status = 'mastered' THEN 1 END)::DECIMAL / COUNT(sn.id)::DECIMAL) * 100
        END, 2
    ) as progress_percentage
FROM public.skill_nodes sn
LEFT JOIN public.user_skill_progress usp ON sn.id = usp.skill_node_id AND usp.user_id = user_uuid
WHERE sn.skill_tree_id = tree_uuid;
$$;

-- 9. RLS Policies using Pattern 4 (Public Read, Private Write) for skill trees and nodes
CREATE POLICY "public_can_read_skill_trees"
ON public.skill_trees
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_skill_nodes" 
ON public.skill_nodes
FOR SELECT
TO public
USING (true);

-- Pattern 2 (Simple User Ownership) for user progress
CREATE POLICY "users_manage_own_skill_progress"
ON public.user_skill_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skill_trees_updated_at 
    BEFORE UPDATE ON public.skill_trees 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_nodes_updated_at 
    BEFORE UPDATE ON public.skill_nodes 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_skill_progress_updated_at 
    BEFORE UPDATE ON public.user_skill_progress 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Mock Data with proper references to existing data
DO $$
DECLARE
    electrical_tree_id UUID := gen_random_uuid();
    mechanical_tree_id UUID := gen_random_uuid();
    aerospace_tree_id UUID := gen_random_uuid();
    mechatronics_tree_id UUID := gen_random_uuid();
    
    -- Electrical nodes
    circuits_basics_id UUID := gen_random_uuid();
    advanced_circuits_id UUID := gen_random_uuid();
    power_systems_id UUID := gen_random_uuid();
    control_systems_id UUID := gen_random_uuid();
    
    -- Mechanical nodes  
    statics_id UUID := gen_random_uuid();
    dynamics_id UUID := gen_random_uuid();
    thermodynamics_id UUID := gen_random_uuid();
    materials_id UUID := gen_random_uuid();
    
    -- Get existing user for progress
    existing_user_id UUID;
BEGIN
    -- Get existing user
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Insert skill trees
    INSERT INTO public.skill_trees (id, discipline, name, description, icon_name, total_nodes) VALUES
        (electrical_tree_id, 'electrical', 'Electrical Engineering Mastery', 'Master the fundamentals of electrical engineering from basic circuits to advanced power systems', 'Zap', 4),
        (mechanical_tree_id, 'mechanical', 'Mechanical Engineering Path', 'Complete mechanical engineering curriculum covering statics, dynamics, and thermodynamics', 'Cog', 4),
        (aerospace_tree_id, 'aerospace', 'Aerospace Engineering Journey', 'Advanced aerospace engineering concepts and applications', 'Plane', 3),
        (mechatronics_tree_id, 'computer', 'Mechatronics Integration', 'Interdisciplinary engineering combining mechanical, electrical, and software systems', 'Cpu', 3);

    -- Insert electrical engineering skill nodes
    INSERT INTO public.skill_nodes (id, skill_tree_id, name, description, icon_name, position_x, position_y, prerequisites, tier, xp_reward) VALUES
        (circuits_basics_id, electrical_tree_id, 'Circuit Fundamentals', 'Master Ohm''s law, Kirchhoff''s laws, and basic circuit analysis', 'Zap', 100, 100, '{}', 'bronze', 100),
        (advanced_circuits_id, electrical_tree_id, 'Advanced Circuits', 'Complex AC/DC analysis, impedance, and frequency response', 'Activity', 250, 100, ARRAY[circuits_basics_id], 'silver', 200),
        (power_systems_id, electrical_tree_id, 'Power Systems', 'Three-phase systems, transformers, and power distribution', 'Battery', 400, 100, ARRAY[advanced_circuits_id], 'gold', 300),
        (control_systems_id, electrical_tree_id, 'Control Systems', 'Feedback systems, PID controllers, and system stability', 'Settings', 550, 100, ARRAY[power_systems_id], 'platinum', 500);

    -- Insert mechanical engineering skill nodes  
    INSERT INTO public.skill_nodes (id, skill_tree_id, name, description, icon_name, position_x, position_y, prerequisites, tier, xp_reward) VALUES
        (statics_id, mechanical_tree_id, 'Statics & Equilibrium', 'Forces, moments, and equilibrium of rigid bodies', 'Anchor', 100, 200, '{}', 'bronze', 100),
        (dynamics_id, mechanical_tree_id, 'Dynamics & Motion', 'Kinematics and kinetics of particles and rigid bodies', 'Move', 250, 200, ARRAY[statics_id], 'silver', 200),
        (thermodynamics_id, mechanical_tree_id, 'Thermodynamics', 'Heat transfer, energy conversion, and thermodynamic cycles', 'Thermometer', 400, 200, ARRAY[dynamics_id], 'gold', 300),
        (materials_id, mechanical_tree_id, 'Materials Science', 'Material properties, stress analysis, and failure modes', 'Wrench', 550, 200, ARRAY[thermodynamics_id], 'platinum', 500);

    -- Insert sample user progress (if user exists)
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.user_skill_progress (user_id, skill_node_id, status, progress_percentage, unlocked_at) VALUES
            (existing_user_id, circuits_basics_id, 'mastered', 100, CURRENT_TIMESTAMP - INTERVAL '10 days'),
            (existing_user_id, advanced_circuits_id, 'in_progress', 65, CURRENT_TIMESTAMP - INTERVAL '3 days'),
            (existing_user_id, statics_id, 'mastered', 100, CURRENT_TIMESTAMP - INTERVAL '15 days'),
            (existing_user_id, dynamics_id, 'available', 25, CURRENT_TIMESTAMP - INTERVAL '1 day');
    END IF;

    -- Update achievement_types with tiers for existing achievements
    UPDATE public.achievement_types SET tier = 'bronze' WHERE name = 'First Steps';
    UPDATE public.achievement_types SET tier = 'silver' WHERE name = 'Knowledge Seeker';
    
    -- Insert new tiered achievements
    INSERT INTO public.achievement_types (name, description, icon_name, tier, xp_reward, unlock_criteria) VALUES
        ('Circuit Master', 'Complete all electrical circuit nodes', 'Zap', 'gold', 500, '{"type": "skill_mastery", "discipline": "electrical", "nodes_required": 4}'),
        ('Mechanical Expert', 'Master all mechanical engineering fundamentals', 'Cog', 'gold', 500, '{"type": "skill_mastery", "discipline": "mechanical", "nodes_required": 4}'),
        ('Engineering Legend', 'Achieve platinum tier in any discipline', 'Crown', 'platinum', 1000, '{"type": "tier_achievement", "tier": "platinum", "count": 1}'),
        ('Interdisciplinary Master', 'Complete skill trees in 3+ disciplines', 'Star', 'platinum', 1500, '{"type": "tree_completion", "trees_required": 3}');

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in mock data generation: %', SQLERRM;
END $$;