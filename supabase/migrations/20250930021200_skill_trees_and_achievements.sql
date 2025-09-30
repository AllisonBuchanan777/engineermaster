-- Schema Analysis: Existing schema has achievement_types and user_achievements tables
-- Integration Type: Addition - Adding skill trees functionality to existing achievement system  
-- Dependencies: user_profiles, achievement_types, lessons, learning_paths

-- 1. Create skill tree types first
CREATE TYPE public.skill_tree_status AS ENUM ('locked', 'available', 'completed');
CREATE TYPE public.skill_node_type AS ENUM ('foundation', 'core', 'advanced', 'specialization', 'mastery');
CREATE TYPE public.achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- 2. Create skill trees table
CREATE TABLE public.skill_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    discipline public.engineering_discipline NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'TreePine',
    color_scheme JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#60A5FA", "accent": "#F59E0B"}'::JSONB,
    total_nodes INTEGER DEFAULT 0,
    required_xp INTEGER DEFAULT 0,
    unlock_requirements JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- 3. Create skill nodes table
CREATE TABLE public.skill_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_tree_id UUID REFERENCES public.skill_trees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    node_type public.skill_node_type DEFAULT 'core',
    position_x DECIMAL(5,2) DEFAULT 0,
    position_y DECIMAL(5,2) DEFAULT 0,
    required_xp INTEGER DEFAULT 100,
    xp_reward INTEGER DEFAULT 50,
    icon_name TEXT DEFAULT 'Star',
    prerequisites UUID[] DEFAULT '{}',
    unlocks UUID[] DEFAULT '{}',
    associated_lessons UUID[] DEFAULT '{}',
    achievement_id UUID REFERENCES public.achievement_types(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create user skill progress table
CREATE TABLE public.user_skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    skill_tree_id UUID REFERENCES public.skill_trees(id) ON DELETE CASCADE,
    skill_node_id UUID REFERENCES public.skill_nodes(id) ON DELETE CASCADE,
    status public.skill_tree_status DEFAULT 'locked',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    xp_earned INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_node_id)
);

-- 5. Add achievement tier column to existing achievement_types table
ALTER TABLE public.achievement_types 
ADD COLUMN tier public.achievement_tier DEFAULT 'bronze';

-- 6. Create indexes for performance
CREATE INDEX idx_skill_trees_discipline ON public.skill_trees(discipline);
CREATE INDEX idx_skill_trees_active ON public.skill_trees(is_active) WHERE is_active = true;
CREATE INDEX idx_skill_nodes_tree_id ON public.skill_nodes(skill_tree_id);
CREATE INDEX idx_skill_nodes_type ON public.skill_nodes(node_type);
CREATE INDEX idx_user_skill_progress_user_id ON public.user_skill_progress(user_id);
CREATE INDEX idx_user_skill_progress_tree_id ON public.user_skill_progress(skill_tree_id);
CREATE INDEX idx_user_skill_progress_status ON public.user_skill_progress(status);
CREATE INDEX idx_achievement_types_tier ON public.achievement_types(tier);

-- 7. Functions for skill tree operations
CREATE OR REPLACE FUNCTION public.calculate_skill_tree_progress(user_uuid UUID, tree_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    ROUND(
        (COUNT(CASE WHEN usp.status = 'completed' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(*), 0)
    ), 0
)::INTEGER
FROM public.skill_nodes sn
LEFT JOIN public.user_skill_progress usp ON sn.id = usp.skill_node_id AND usp.user_id = user_uuid
WHERE sn.skill_tree_id = tree_uuid AND sn.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.check_skill_node_prerequisites(user_uuid UUID, node_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $func$
DECLARE
    prereq_ids UUID[];
    prereq_id UUID;
    completed_count INTEGER;
    required_count INTEGER;
BEGIN
    -- Get prerequisites for the node
    SELECT prerequisites INTO prereq_ids 
    FROM public.skill_nodes 
    WHERE id = node_uuid;
    
    -- If no prerequisites, return true
    IF prereq_ids IS NULL OR array_length(prereq_ids, 1) IS NULL THEN
        RETURN true;
    END IF;
    
    -- Count completed prerequisites
    SELECT COUNT(*) INTO completed_count
    FROM public.user_skill_progress usp
    WHERE usp.user_id = user_uuid 
    AND usp.skill_node_id = ANY(prereq_ids)
    AND usp.status = 'completed';
    
    required_count := array_length(prereq_ids, 1);
    
    RETURN completed_count >= required_count;
END;
$func$;

-- 8. Enable RLS for all skill tree tables
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies following Pattern 4 (Public Read, Private Write)
CREATE POLICY "public_can_read_skill_trees"
ON public.skill_trees
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "instructors_manage_skill_trees"
ON public.skill_trees
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'instructor'
))
WITH CHECK (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'instructor'
));

CREATE POLICY "public_can_read_skill_nodes"
ON public.skill_nodes
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "instructors_manage_skill_nodes"
ON public.skill_nodes
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.skill_trees st
    JOIN public.user_profiles up ON st.created_by = up.id
    WHERE st.id = skill_tree_id AND (st.created_by = auth.uid() OR up.role = 'instructor')
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.skill_trees st
    JOIN public.user_profiles up ON st.created_by = up.id
    WHERE st.id = skill_tree_id AND (st.created_by = auth.uid() OR up.role = 'instructor')
));

CREATE POLICY "users_manage_own_skill_progress"
ON public.user_skill_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. Mock data for skill trees and enhanced achievements
DO $$
DECLARE
    instructor_id UUID;
    mech_tree_id UUID := gen_random_uuid();
    elec_tree_id UUID := gen_random_uuid();
    mech_foundation_node UUID := gen_random_uuid();
    mech_statics_node UUID := gen_random_uuid();
    mech_dynamics_node UUID := gen_random_uuid();
    mech_materials_node UUID := gen_random_uuid();
    mech_mastery_node UUID := gen_random_uuid();
    elec_foundation_node UUID := gen_random_uuid();
    elec_circuits_node UUID := gen_random_uuid();
    elec_electronics_node UUID := gen_random_uuid();
    elec_power_node UUID := gen_random_uuid();
    elec_mastery_node UUID := gen_random_uuid();
    sample_user_id UUID;
BEGIN
    -- Get instructor ID
    SELECT id INTO instructor_id FROM public.user_profiles WHERE role = 'instructor' LIMIT 1;
    
    -- Create skill trees
    INSERT INTO public.skill_trees (id, name, discipline, description, icon_name, color_scheme, total_nodes, required_xp, created_by) VALUES
        (mech_tree_id, 'Mechanical Engineering Mastery', 'mechanical', 'Complete pathway from fundamentals to advanced mechanical engineering expertise', 'Cog', '{"primary": "#EF4444", "secondary": "#F87171", "accent": "#FCD34D"}'::JSONB, 5, 500, instructor_id),
        (elec_tree_id, 'Electrical Engineering Excellence', 'electrical', 'Comprehensive electrical engineering skill development pathway', 'Zap', '{"primary": "#3B82F6", "secondary": "#60A5FA", "accent": "#34D399"}'::JSONB, 5, 600, instructor_id);
    
    -- Create skill nodes for Mechanical Engineering
    INSERT INTO public.skill_nodes (id, skill_tree_id, name, description, node_type, position_x, position_y, required_xp, xp_reward, icon_name, prerequisites, unlocks) VALUES
        (mech_foundation_node, mech_tree_id, 'Engineering Fundamentals', 'Master basic engineering principles and problem-solving approaches', 'foundation', 50.0, 10.0, 0, 100, 'BookOpen', '{}', ARRAY[mech_statics_node]),
        (mech_statics_node, mech_tree_id, 'Statics & Equilibrium', 'Understand forces, moments, and equilibrium in static systems', 'core', 30.0, 30.0, 100, 150, 'Target', ARRAY[mech_foundation_node], ARRAY[mech_dynamics_node]),
        (mech_dynamics_node, mech_tree_id, 'Dynamics & Motion', 'Analyze motion, acceleration, and dynamic forces in mechanical systems', 'core', 70.0, 30.0, 250, 150, 'Activity', ARRAY[mech_statics_node], ARRAY[mech_materials_node]),
        (mech_materials_node, mech_tree_id, 'Materials & Mechanics', 'Study material properties, stress analysis, and failure mechanics', 'advanced', 50.0, 50.0, 400, 200, 'Layers', ARRAY[mech_statics_node, mech_dynamics_node], ARRAY[mech_mastery_node]),
        (mech_mastery_node, mech_tree_id, 'Design Mastery', 'Advanced mechanical design and system optimization', 'mastery', 50.0, 70.0, 600, 300, 'Crown', ARRAY[mech_materials_node], '{}');
    
    -- Create skill nodes for Electrical Engineering
    INSERT INTO public.skill_nodes (id, skill_tree_id, name, description, node_type, position_x, position_y, required_xp, xp_reward, icon_name, prerequisites, unlocks) VALUES
        (elec_foundation_node, elec_tree_id, 'Electrical Fundamentals', 'Master voltage, current, resistance, and basic electrical concepts', 'foundation', 50.0, 10.0, 0, 100, 'Zap', '{}', ARRAY[elec_circuits_node]),
        (elec_circuits_node, elec_tree_id, 'Circuit Analysis', 'Analyze DC and AC circuits using various techniques', 'core', 30.0, 30.0, 100, 150, 'GitBranch', ARRAY[elec_foundation_node], ARRAY[elec_electronics_node]),
        (elec_electronics_node, elec_tree_id, 'Electronics & Devices', 'Understand semiconductors, diodes, transistors, and amplifiers', 'advanced', 70.0, 30.0, 250, 150, 'Cpu', ARRAY[elec_circuits_node], ARRAY[elec_power_node]),
        (elec_power_node, elec_tree_id, 'Power Systems', 'Study power generation, transmission, and electrical machines', 'advanced', 50.0, 50.0, 400, 200, 'Battery', ARRAY[elec_electronics_node], ARRAY[elec_mastery_node]),
        (elec_mastery_node, elec_tree_id, 'Electrical Mastery', 'Advanced electrical system design and control theory', 'mastery', 50.0, 70.0, 600, 300, 'Crown', ARRAY[elec_power_node], '{}');
    
    -- Update existing achievement types with tiers and add new tier-based achievements
    UPDATE public.achievement_types SET tier = 'bronze' WHERE name = 'First Steps';
    UPDATE public.achievement_types SET tier = 'silver' WHERE name = 'Knowledge Seeker';
    
    -- Add new tier-based achievements
    INSERT INTO public.achievement_types (name, description, tier, icon_name, badge_color, xp_reward, unlock_criteria) VALUES
        ('Bronze Explorer', 'Complete your first skill tree foundation node', 'bronze', 'Medal', '#CD7F32', 25, '{"type":"skill_node_completion","node_type":"foundation","count":1}'::JSONB),
        ('Silver Achiever', 'Complete 5 core skill nodes across all disciplines', 'silver', 'Award', '#C0C0C0', 100, '{"type":"skill_node_completion","node_type":"core","count":5}'::JSONB),
        ('Gold Master', 'Complete 3 advanced skill nodes and earn 1000 XP', 'gold', 'Trophy', '#FFD700', 250, '{"type":"combined","requirements":[{"type":"skill_node_completion","node_type":"advanced","count":3},{"type":"xp_earned","amount":1000}]}'::JSONB),
        ('Platinum Elite', 'Achieve mastery in 2 different engineering disciplines', 'platinum', 'Crown', '#E5E4E2', 500, '{"type":"skill_tree_mastery","disciplines":2}'::JSONB),
        ('Skill Tree Pioneer', 'Unlock your first skill tree', 'bronze', 'TreePine', '#10B981', 50, '{"type":"skill_tree_unlock","count":1}'::JSONB),
        ('Node Collector', 'Complete 10 skill nodes total', 'silver', 'Target', '#3B82F6', 150, '{"type":"skill_node_completion","count":10}'::JSONB),
        ('Engineering Scholar', 'Complete foundational nodes in 3 disciplines', 'gold', 'GraduationCap', '#8B5CF6', 300, '{"type":"foundation_mastery","disciplines":3}'::JSONB),
        ('Ultimate Engineer', 'Achieve platinum mastery in all available disciplines', 'platinum', 'Star', '#F59E0B', 1000, '{"type":"complete_mastery","all_disciplines":true}'::JSONB);
    
    -- Create sample user progress
    SELECT id INTO sample_user_id FROM public.user_profiles WHERE role = 'student' LIMIT 1;
    
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO public.user_skill_progress (user_id, skill_tree_id, skill_node_id, status, progress_percentage, xp_earned, unlocked_at, completed_at) VALUES
            (sample_user_id, mech_tree_id, mech_foundation_node, 'completed', 100, 100, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
            (sample_user_id, mech_tree_id, mech_statics_node, 'available', 60, 60, NOW() - INTERVAL '4 days', NULL),
            (sample_user_id, elec_tree_id, elec_foundation_node, 'completed', 100, 100, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
            (sample_user_id, elec_tree_id, elec_circuits_node, 'available', 30, 30, NOW() - INTERVAL '2 days', NULL);
    END IF;
END $$;

-- 11. Add more comprehensive lessons for all engineering disciplines
DO $$
DECLARE
    instructor_id UUID;
    mech_path_id UUID;
    elec_path_id UUID;
    lesson_id UUID;
BEGIN
    -- Get existing learning paths and instructor
    SELECT id INTO instructor_id FROM public.user_profiles WHERE role = 'instructor' LIMIT 1;
    SELECT id INTO mech_path_id FROM public.learning_paths WHERE discipline = 'mechanical' LIMIT 1;
    SELECT id INTO elec_path_id FROM public.learning_paths WHERE discipline = 'electrical' LIMIT 1;
    
    -- Add comprehensive mechanical engineering lessons
    INSERT INTO public.lessons (title, slug, description, content, difficulty, estimated_duration_minutes, xp_reward, lesson_type, access_level, learning_path_id, created_by, is_published, order_index) VALUES
        ('Advanced Statics: Trusses and Frames', 'advanced-statics-trusses-frames', 'Learn to analyze complex truss structures and frame systems using method of joints and sections', '{"sections":[{"type":"theory","content":"Advanced structural analysis principles"},{"type":"examples","problems":[{"title":"Bridge Truss Analysis","difficulty":"intermediate"},{"title":"Building Frame Design","difficulty":"advanced"}]},{"type":"simulation","tool":"truss_analyzer"}]}'::JSONB, 'intermediate', 75, 100, 'Engineering', 'free', mech_path_id, instructor_id, true, 2),
        
        ('Dynamics: Rotational Motion', 'dynamics-rotational-motion', 'Master rotational dynamics, angular momentum, and moment of inertia calculations', '{"sections":[{"type":"theory","content":"Rotational kinematics and dynamics"},{"type":"interactive","component":"rotating_systems_simulator"},{"type":"problems","count":15,"difficulty":"mixed"}]}'::JSONB, 'intermediate', 60, 90, 'Engineering', 'free', mech_path_id, instructor_id, true, 3),
        
        ('Materials Science: Stress-Strain Analysis', 'materials-stress-strain', 'Understand material behavior under various loading conditions and failure theories', '{"sections":[{"type":"theory","content":"Material properties and behavior"},{"type":"lab","experiment":"tensile_test_virtual"},{"type":"applications","examples":["aerospace_materials","automotive_components","construction_materials"]}]}'::JSONB, 'advanced', 90, 120, 'Engineering', 'premium', mech_path_id, instructor_id, true, 4),
        
        ('Thermodynamics: Heat Engines', 'thermodynamics-heat-engines', 'Analyze the performance of various heat engine cycles and their applications', '{"sections":[{"type":"theory","content":"Thermodynamic cycles and efficiency"},{"type":"case_studies",Examples":["otto_cycle","diesel_cycle","brayton_cycle"]},{"type":"design_project","title":"Design Your Own Heat Engine"}]}'::JSONB, 'advanced', 100, 150, 'Engineering', 'premium', mech_path_id, instructor_id, true, 5),
        
        ('Fluid Mechanics: Pipe Flow and Pumps', 'fluid-mechanics-pipe-flow', 'Study fluid flow in pipes, pressure losses, and pump selection criteria', '{"sections":[{"type":"theory","content":"Pipe flow fundamentals"},{"type":"calculator","tool":"pipe_flow_calculator"},{"type":"real_world","applications":["water_distribution","hvac_systems","industrial_processes"]}]}'::JSONB, 'intermediate', 70, 85, 'Engineering', 'free', mech_path_id, instructor_id, true, 6),
        
        ('Machine Design: Gears and Power Transmission', 'machine-design-gears', 'Design gear systems for power transmission in mechanical applications', '{"sections":[{"type":"theory","content":"Gear design principles"},{"type":"software_tutorial","tool":"solidworks_gear_design"},{"type":"project","title":"Gearbox Design Challenge"}]}'::JSONB, 'advanced', 120, 180, 'Engineering', 'premium', mech_path_id, instructor_id, true, 7);
    
    -- Add comprehensive electrical engineering lessons  
    INSERT INTO public.lessons (title, slug, description, content, difficulty, estimated_duration_minutes, xp_reward, lesson_type, access_level, learning_path_id, created_by, is_published, order_index) VALUES
        ('AC Circuit Analysis: Phasors and Impedance', 'ac-circuit-phasors', 'Master AC circuit analysis using phasor diagrams and complex impedance', '{"sections":[{"type":"theory","content":"AC fundamentals and phasor representation"},{"type":"interactive","tool":"phasor_simulator"},{"type":"problems","count":20,"topics":["RLC_circuits","power_calculations","resonance"]}]}'::JSONB, 'intermediate', 80, 110, 'Electrical', 'free', elec_path_id, instructor_id, true, 2),
        
        ('Semiconductor Devices: Diodes and Applications', 'semiconductor-diodes', 'Understand diode characteristics and their applications in electronic circuits', '{"sections":[{"type":"theory","content":"Semiconductor physics and diode operation"},{"type":"lab","experiment":"diode_characterization"},{"type":"applications","circuits":["rectifiers","clippers","clampers","voltage_regulators"]}]}'::JSONB, 'intermediate', 85, 100, 'Electrical', 'free', elec_path_id, instructor_id, true, 3),
        
        ('Transistor Amplifiers: BJT and FET', 'transistor-amplifiers', 'Design and analyze amplifier circuits using bipolar junction transistors and field-effect transistors', '{"sections":[{"type":"theory","content":"Transistor operation and biasing"},{"type":"design_tool","software":"spice_simulator"},{"type":"projects",[{"title":"Audio Amplifier Design","complexity":"advanced"},{"title":"Op-Amp Applications","complexity":"intermediate"}]}]}'::JSONB, 'advanced', 95, 140, 'Electrical', 'premium', elec_path_id, instructor_id, true, 4),
        
        ('Digital Logic Design: Combinational Circuits', 'digital-logic-combinational', 'Design combinational logic circuits using Boolean algebra and logic gates', '{"sections":[{"type":"theory","content":"Boolean algebra and logic minimization"},{"type":"simulator","tool":"digital_logic_simulator"},{"type":"hands_on","projects":["7_segment_decoder","arithmetic_logic_unit","multiplexer_design"]}]}'::JSONB, 'intermediate', 75, 95, 'Electrical', 'free', elec_path_id, instructor_id, true, 5),
        
        ('Electric Machines: Motors and Generators', 'electric-machines', 'Study the operation and characteristics of DC and AC electric machines', '{"sections":[{"type":"theory","content":"Electromagnetic principles in rotating machines"},{"type":"virtual_lab","experiments":["motor_speed_control","generator_loading","efficiency_testing"]},{"type":"industry_insights","applications":["industrial_automation","renewable_energy","transportation"]}]}'::JSONB, 'advanced', 110, 160, 'Electrical', 'premium', elec_path_id, instructor_id, true, 6),
        
        ('Power Systems: Generation and Distribution', 'power-systems-generation', 'Understand electrical power generation, transmission, and distribution systems', '{"sections":[{"type":"theory","content":"Power system fundamentals"},{"type":"case_study","topic":"smart_grid_technology"},{"type":"analysis_tools",[{"name":"load_flow_analysis","software":"matlab_simulink"},{"name":"fault_analysis","methodology":"symmetrical_components"}]}]}'::JSONB, 'advanced', 105, 170, 'Electrical', 'premium', elec_path_id, instructor_id, true, 7),
        
        ('Control Systems: Feedback and Stability', 'control-systems-feedback', 'Design and analyze feedback control systems for engineering applications', '{"sections":[{"type":"theory","content":"Control system fundamentals and stability analysis"},{"type":"software","tools":["matlab_control_toolbox","simulink_modeling"]},{"type":"real_world","applications":["autopilot_systems","process_control","robotics"]}]}'::JSONB, 'advanced', 100, 155, 'Electrical', 'premium', elec_path_id, instructor_id, true, 8);
    
    -- Create additional learning paths for other disciplines
    INSERT INTO public.learning_paths (name, discipline, difficulty, description, is_published, estimated_duration_hours, learning_objectives, prerequisites, created_by) VALUES
        ('Civil Engineering Foundations', 'civil', 'beginner', 'Comprehensive introduction to structural analysis, materials, and construction methods', true, 45, ARRAY['Understand structural loads and forces','Apply material science to construction','Design basic structural elements','Analyze soil mechanics principles'], ARRAY['Basic calculus','Physics fundamentals','Engineering mathematics'], instructor_id),
        
        ('Chemical Engineering Processes', 'chemical', 'intermediate', 'Process design, reaction engineering, and separation techniques in chemical engineering', true, 50, ARRAY['Design chemical reactors','Understand mass and energy balances','Apply thermodynamics to processes','Optimize separation processes'], ARRAY['Chemistry fundamentals','Thermodynamics basics','Fluid mechanics'], instructor_id),
        
        ('Computer Engineering Systems', 'computer', 'intermediate', 'Hardware-software integration, embedded systems, and computer architecture', true, 40, ARRAY['Design embedded systems','Understand computer architecture','Program microcontrollers','Integrate hardware and software'], ARRAY['Programming fundamentals','Digital logic','Electronics basics'], instructor_id),
        
        ('Aerospace Engineering Dynamics', 'aerospace', 'advanced', 'Flight mechanics, propulsion systems, and aerospace structures', true, 60, ARRAY['Analyze flight dynamics','Design propulsion systems','Understand aerodynamics','Apply structural analysis to aircraft'], ARRAY['Advanced mathematics','Thermodynamics','Fluid mechanics','Solid mechanics'], instructor_id);
END $$;

-- 12. Update statistics for skill trees
UPDATE public.skill_trees 
SET total_nodes = (
    SELECT COUNT(*) 
    FROM public.skill_nodes sn 
    WHERE sn.skill_tree_id = skill_trees.id AND sn.is_active = true
);