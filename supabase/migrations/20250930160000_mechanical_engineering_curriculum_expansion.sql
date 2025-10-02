-- Location: supabase/migrations/20250930160000_mechanical_engineering_curriculum_expansion.sql
-- Schema Analysis: Lessons table already has discipline column and index from previous migrations
-- Integration Type: Addition - adding mechanical engineering curriculum data
-- Dependencies: lessons, learning_paths, user_profiles, skill_trees, achievement_types, daily_challenges tables

-- Create Mechanical Engineering learning path
DO $$
DECLARE
    mechanical_path_id UUID := gen_random_uuid();
    
    -- Module lesson IDs
    statics_lesson_1_id UUID := gen_random_uuid();
    statics_lesson_2_id UUID := gen_random_uuid();
    statics_lesson_3_id UUID := gen_random_uuid();
    
    materials_lesson_1_id UUID := gen_random_uuid();
    materials_lesson_2_id UUID := gen_random_uuid();
    materials_lesson_3_id UUID := gen_random_uuid();
    
    thermo_lesson_1_id UUID := gen_random_uuid();
    thermo_lesson_2_id UUID := gen_random_uuid();
    thermo_lesson_3_id UUID := gen_random_uuid();
    
    fluids_lesson_1_id UUID := gen_random_uuid();
    fluids_lesson_2_id UUID := gen_random_uuid();
    fluids_lesson_3_id UUID := gen_random_uuid();
    
    design_lesson_1_id UUID := gen_random_uuid();
    design_lesson_2_id UUID := gen_random_uuid();
    design_lesson_3_id UUID := gen_random_uuid();
    
    manufacturing_lesson_1_id UUID := gen_random_uuid();
    manufacturing_lesson_2_id UUID := gen_random_uuid();
    manufacturing_lesson_3_id UUID := gen_random_uuid();
    
    robotics_lesson_1_id UUID := gen_random_uuid();
    robotics_lesson_2_id UUID := gen_random_uuid();
    robotics_lesson_3_id UUID := gen_random_uuid();
    
    -- Skill tree and node IDs
    mechanical_skill_tree_id UUID := gen_random_uuid();
    basic_mechanics_node_id UUID := gen_random_uuid();
    materials_node_id UUID := gen_random_uuid();
    thermal_node_id UUID := gen_random_uuid();
    fluid_node_id UUID := gen_random_uuid();
    design_node_id UUID := gen_random_uuid();
    manufacturing_node_id UUID := gen_random_uuid();
    robotics_node_id UUID := gen_random_uuid();

BEGIN
    -- Create mechanical engineering learning path
    INSERT INTO public.learning_paths (
        id, name, description, discipline, difficulty, estimated_duration_hours,
        is_published, created_at, updated_at
    ) VALUES (
        mechanical_path_id,
        'Complete Mechanical Engineering Mastery',
        'Master mechanical engineering from statics and dynamics to advanced robotics and manufacturing processes',
        'mechanical',
        'intermediate',
        18,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

    -- Create Statics & Dynamics lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (statics_lesson_1_id, mechanical_path_id, 'statics-forces-equilibrium', 'Forces and Equilibrium',
         'Learn fundamental concepts of forces, moments, and static equilibrium in mechanical systems',
         'beginner', 'mechanical', 'theory', 45, 50, 'free', 1, true,
         ARRAY['Understand force vectors and components', 'Apply equilibrium conditions', 'Analyze simple trusses'],
         '{"sections": [{"title": "Force Vectors", "content": "Introduction to force representation"}, {"title": "Equilibrium Conditions", "content": "Sum of forces and moments equals zero"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (statics_lesson_2_id, mechanical_path_id, 'statics-moments-couples', 'Moments and Couples',
         'Master the calculation of moments, couples, and their applications in structural analysis',
         'beginner', 'mechanical', 'theory', 50, 60, 'free', 2, true,
         ARRAY['Calculate moments about a point', 'Understand couple systems', 'Apply moment equilibrium'],
         '{"sections": [{"title": "Moment Calculation", "content": "Distance times force perpendicular component"}, {"title": "Couples", "content": "Pure rotational effects"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (statics_lesson_3_id, mechanical_path_id, 'dynamics-kinematics-energy', 'Kinematics and Energy Methods',
         'Explore motion analysis and energy-based solutions for dynamic mechanical systems',
         'intermediate', 'mechanical', 'theory', 60, 80, 'premium', 3, true,
         ARRAY['Analyze particle motion', 'Apply work-energy theorem', 'Use conservation of energy'],
         '{"sections": [{"title": "Kinematics", "content": "Position, velocity, and acceleration relationships"}, {"title": "Energy Methods", "content": "Kinetic and potential energy applications"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create Materials Science lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (materials_lesson_1_id, mechanical_path_id, 'materials-stress-strain', 'Stress and Strain Analysis',
         'Understand fundamental relationships between stress, strain, and material deformation',
         'beginner', 'mechanical', 'theory', 45, 50, 'free', 4, true,
         ARRAY['Define stress and strain', 'Apply Hooke''s law', 'Analyze elastic deformation'],
         '{"sections": [{"title": "Stress Concepts", "content": "Normal and shear stress definitions"}, {"title": "Strain Analysis", "content": "Linear and shear strain relationships"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (materials_lesson_2_id, mechanical_path_id, 'materials-elasticity-properties', 'Elasticity and Material Properties',
         'Explore elastic behavior, modulus values, and material property relationships',
         'intermediate', 'mechanical', 'theory', 50, 60, 'free', 5, true,
         ARRAY['Calculate elastic modulus', 'Understand Poisson''s ratio', 'Compare material properties'],
         '{"sections": [{"title": "Elastic Modulus", "content": "Young''s modulus and shear modulus"}, {"title": "Material Properties", "content": "Comparing metals, polymers, and composites"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (materials_lesson_3_id, mechanical_path_id, 'materials-fatigue-failure', 'Fatigue and Failure Analysis',
         'Learn about material failure modes, fatigue life, and design safety factors',
         'advanced', 'mechanical', 'theory', 65, 90, 'premium', 6, true,
         ARRAY['Analyze fatigue failure', 'Calculate safety factors', 'Design for material limits'],
         '{"sections": [{"title": "Fatigue Analysis", "content": "S-N curves and fatigue life prediction"}, {"title": "Failure Modes", "content": "Brittle vs ductile failure mechanisms"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create Thermodynamics lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (thermo_lesson_1_id, mechanical_path_id, 'thermodynamics-laws', 'Laws of Thermodynamics',
         'Master the fundamental laws governing energy transfer and thermodynamic processes',
         'intermediate', 'mechanical', 'theory', 55, 70, 'free', 7, true,
         ARRAY['Apply first law of thermodynamics', 'Understand entropy and second law', 'Analyze thermodynamic cycles'],
         '{"sections": [{"title": "First Law", "content": "Conservation of energy in thermodynamic systems"}, {"title": "Second Law", "content": "Entropy and thermodynamic irreversibility"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (thermo_lesson_2_id, mechanical_path_id, 'thermodynamics-cycles', 'Thermodynamic Cycles',
         'Analyze power and refrigeration cycles including Otto, Diesel, and Rankine cycles',
         'intermediate', 'mechanical', 'theory', 60, 80, 'premium', 8, true,
         ARRAY['Analyze Otto and Diesel cycles', 'Understand Rankine cycle', 'Calculate cycle efficiency'],
         '{"sections": [{"title": "Power Cycles", "content": "Otto, Diesel, and Brayton cycle analysis"}, {"title": "Rankine Cycle", "content": "Steam power plant thermodynamics"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (thermo_lesson_3_id, mechanical_path_id, 'heat-transfer', 'Heat Transfer Fundamentals',
         'Explore conduction, convection, and radiation heat transfer mechanisms',
         'intermediate', 'mechanical', 'theory', 50, 70, 'premium', 9, true,
         ARRAY['Apply Fourier''s law of conduction', 'Analyze convective heat transfer', 'Calculate radiation heat exchange'],
         '{"sections": [{"title": "Conduction", "content": "Fourier''s law and thermal conductivity"}, {"title": "Convection", "content": "Natural and forced convection heat transfer"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create Fluid Mechanics lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (fluids_lesson_1_id, mechanical_path_id, 'fluid-mechanics-bernoulli', 'Bernoulli Principle and Flow',
         'Understand fluid flow principles, Bernoulli equation, and flow measurement techniques',
         'intermediate', 'mechanical', 'theory', 45, 60, 'free', 10, true,
         ARRAY['Apply Bernoulli''s equation', 'Analyze fluid flow in pipes', 'Calculate pressure losses'],
         '{"sections": [{"title": "Bernoulli Equation", "content": "Energy conservation in fluid flow"}, {"title": "Flow Measurement", "content": "Venturi meters and orifice plates"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (fluids_lesson_2_id, mechanical_path_id, 'fluid-mechanics-flow-types', 'Laminar and Turbulent Flow',
         'Distinguish between laminar and turbulent flow and their engineering applications',
         'intermediate', 'mechanical', 'theory', 50, 70, 'premium', 11, true,
         ARRAY['Calculate Reynolds number', 'Analyze laminar flow', 'Understand turbulent flow characteristics'],
         '{"sections": [{"title": "Reynolds Number", "content": "Criterion for flow transition"}, {"title": "Flow Characteristics", "content": "Velocity profiles and friction factors"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (fluids_lesson_3_id, mechanical_path_id, 'pumps-compressors', 'Pumps and Compressors',
         'Learn about pump selection, performance curves, and compressor fundamentals',
         'advanced', 'mechanical', 'theory', 55, 80, 'premium', 12, true,
         ARRAY['Select appropriate pumps', 'Analyze pump performance curves', 'Understand compressor types'],
         '{"sections": [{"title": "Pump Selection", "content": "Centrifugal vs positive displacement pumps"}, {"title": "Performance Curves", "content": "Head-capacity relationships"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create Mechanical Design lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (design_lesson_1_id, mechanical_path_id, 'mechanical-design-gears', 'Gears and Power Transmission',
         'Design and analyze gear systems for power transmission applications',
         'intermediate', 'mechanical', 'practical', 60, 80, 'premium', 13, true,
         ARRAY['Design spur and helical gears', 'Calculate gear ratios', 'Analyze gear stresses'],
         '{"sections": [{"title": "Gear Types", "content": "Spur, helical, bevel, and worm gears"}, {"title": "Gear Design", "content": "Tooth geometry and stress analysis"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (design_lesson_2_id, mechanical_path_id, 'mechanical-design-bearings', 'Bearings and Linkages',
         'Select and design bearings, linkages, and mechanical joints for various applications',
         'intermediate', 'mechanical', 'practical', 55, 75, 'premium', 14, true,
         ARRAY['Select appropriate bearings', 'Design four-bar linkages', 'Analyze joint forces'],
         '{"sections": [{"title": "Bearing Types", "content": "Ball, roller, and sleeve bearings"}, {"title": "Linkage Mechanisms", "content": "Four-bar and slider-crank mechanisms"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (design_lesson_3_id, mechanical_path_id, 'mechanical-drawings', 'Mechanical Drawings and CAD',
         'Create technical drawings and use CAD software for mechanical design documentation',
         'beginner', 'mechanical', 'practical', 70, 60, 'free', 15, true,
         ARRAY['Create technical drawings', 'Apply GD&T principles', 'Use CAD software effectively'],
         '{"sections": [{"title": "Technical Drawings", "content": "Orthographic projections and sections"}, {"title": "CAD Fundamentals", "content": "3D modeling and assembly design"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create Manufacturing Processes lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (manufacturing_lesson_1_id, mechanical_path_id, 'manufacturing-machining', 'Machining Processes',
         'Learn about turning, milling, drilling, and other machining operations',
         'intermediate', 'mechanical', 'practical', 50, 70, 'premium', 16, true,
         ARRAY['Understand machining fundamentals', 'Select cutting tools', 'Calculate machining parameters'],
         '{"sections": [{"title": "Machining Operations", "content": "Turning, milling, drilling, and grinding"}, {"title": "Tool Selection", "content": "Cutting tool materials and geometries"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (manufacturing_lesson_2_id, mechanical_path_id, 'manufacturing-welding', 'Welding and Joining',
         'Explore welding processes, joint design, and quality control in metal joining',
         'intermediate', 'mechanical', 'practical', 55, 80, 'premium', 17, true,
         ARRAY['Compare welding processes', 'Design welded joints', 'Apply quality control methods'],
         '{"sections": [{"title": "Welding Processes", "content": "Arc, gas, and resistance welding"}, {"title": "Joint Design", "content": "Weld symbols and joint configurations"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (manufacturing_lesson_3_id, mechanical_path_id, 'additive-manufacturing', 'Additive Manufacturing',
         'Understand 3D printing technologies, design considerations, and post-processing',
         'advanced', 'mechanical', 'practical', 60, 90, 'premium', 18, true,
         ARRAY['Compare AM technologies', 'Design for additive manufacturing', 'Plan post-processing operations'],
         '{"sections": [{"title": "AM Technologies", "content": "FDM, SLA, SLS, and metal AM processes"}, {"title": "Design Guidelines", "content": "Support structures and design optimization"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create Robotics Fundamentals lessons
    INSERT INTO public.lessons (
        id, learning_path_id, slug, title, description, difficulty, discipline,
        lesson_type, estimated_duration_minutes, xp_reward, access_level,
        order_index, is_published, learning_objectives, content, created_at, updated_at
    ) VALUES
        (robotics_lesson_1_id, mechanical_path_id, 'robotics-actuators', 'Actuators and Control Systems',
         'Learn about servo motors, stepper motors, and basic control systems for robotics',
         'intermediate', 'mechanical', 'practical', 55, 80, 'premium', 19, true,
         ARRAY['Select appropriate actuators', 'Design basic control systems', 'Understand feedback control'],
         '{"sections": [{"title": "Actuator Types", "content": "DC motors, stepper motors, and servo systems"}, {"title": "Control Fundamentals", "content": "Open-loop vs closed-loop control"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (robotics_lesson_2_id, mechanical_path_id, 'robotics-sensors', 'Sensors and Data Acquisition',
         'Explore various sensors used in robotics and data acquisition techniques',
         'intermediate', 'mechanical', 'practical', 50, 75, 'premium', 20, true,
         ARRAY['Select appropriate sensors', 'Interface sensors with controllers', 'Process sensor data'],
         '{"sections": [{"title": "Sensor Types", "content": "Position, force, vision, and proximity sensors"}, {"title": "Data Processing", "content": "Signal conditioning and filtering"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         
        (robotics_lesson_3_id, mechanical_path_id, 'robot-mechanics', 'Basic Robot Mechanics',
         'Understand robot kinematics, dynamics, and mechanical design principles',
         'advanced', 'mechanical', 'practical', 65, 100, 'premium', 21, true,
         ARRAY['Analyze robot kinematics', 'Calculate joint torques', 'Design robot mechanisms'],
         '{"sections": [{"title": "Robot Kinematics", "content": "Forward and inverse kinematics"}, {"title": "Robot Dynamics", "content": "Joint forces and torque calculations"}]}',
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Create mechanical engineering skill tree
    INSERT INTO public.skill_trees (
        id, name, description, discipline, is_active, created_at
    ) VALUES (
        mechanical_skill_tree_id,
        'Mechanical Engineering Mastery Path',
        'Progressive skill development path for mechanical engineering expertise',
        'mechanical',
        true,
        CURRENT_TIMESTAMP
    );

    -- Create skill nodes for mechanical engineering
    INSERT INTO public.skill_nodes (
        id, skill_tree_id, name, description, tier, position_x, position_y,
        prerequisites, lesson_id, xp_required, created_at
    ) VALUES
        (basic_mechanics_node_id, mechanical_skill_tree_id, 'Basic Mechanics', 'Foundation in statics and dynamics', 'bronze'::achievement_tier, 100, 100,
         '[]'::jsonb, statics_lesson_1_id, 50, CURRENT_TIMESTAMP),
         
        (materials_node_id, mechanical_skill_tree_id, 'Materials Science', 'Understanding of material properties', 'silver'::achievement_tier, 200, 80,
         to_jsonb(ARRAY[basic_mechanics_node_id]), materials_lesson_1_id, 120, CURRENT_TIMESTAMP),
         
        (thermal_node_id, mechanical_skill_tree_id, 'Thermal Systems', 'Thermodynamics and heat transfer', 'silver'::achievement_tier, 200, 120,
         to_jsonb(ARRAY[basic_mechanics_node_id]), thermo_lesson_1_id, 140, CURRENT_TIMESTAMP),
         
        (fluid_node_id, mechanical_skill_tree_id, 'Fluid Systems', 'Fluid mechanics and flow analysis', 'gold'::achievement_tier, 300, 60,
         to_jsonb(ARRAY[materials_node_id]), fluids_lesson_1_id, 200, CURRENT_TIMESTAMP),
         
        (design_node_id, mechanical_skill_tree_id, 'Mechanical Design', 'Machine design and CAD', 'gold'::achievement_tier, 300, 100,
         to_jsonb(ARRAY[materials_node_id]), design_lesson_1_id, 220, CURRENT_TIMESTAMP),
         
        (manufacturing_node_id, mechanical_skill_tree_id, 'Manufacturing', 'Production processes', 'platinum'::achievement_tier, 400, 80,
         to_jsonb(ARRAY[design_node_id]), manufacturing_lesson_1_id, 300, CURRENT_TIMESTAMP),
         
        (robotics_node_id, mechanical_skill_tree_id, 'Robotics', 'Automation and control', 'platinum'::achievement_tier, 400, 120,
         to_jsonb(ARRAY[design_node_id, thermal_node_id]), robotics_lesson_1_id, 350, CURRENT_TIMESTAMP);

    -- Create mechanical engineering achievements - FIXED column names
    INSERT INTO public.achievement_types (
        id, name, description, category, icon_name, badge_color, xp_reward,
        unlock_criteria, tier, is_active, sort_order, created_at
    ) VALUES
        (gen_random_uuid(), 'Statics Master', 'Complete all statics and dynamics lessons', 'mechanical', 'trophy', '#10B981', 100,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "statics", "count": 3}}',
         'bronze', true, 1, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Materials Expert', 'Master material properties and failure analysis', 'mechanical', 'atom', '#3B82F6', 150,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "materials", "count": 3}}',
         'bronze', true, 2, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Thermal Engineer', 'Complete thermodynamics and heat transfer studies', 'mechanical', 'flame', '#EF4444', 150,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "thermal", "count": 3}}',
         'silver', true, 3, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Fluid Dynamics Pro', 'Master fluid mechanics and pump systems', 'mechanical', 'waves', '#06B6D4', 150,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "fluids", "count": 3}}',
         'silver', true, 4, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Design Engineer', 'Complete mechanical design and CAD lessons', 'mechanical', 'cog', '#8B5CF6', 200,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "design", "count": 3}}',
         'silver', true, 5, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Manufacturing Specialist', 'Master manufacturing processes', 'mechanical', 'tool', '#F59E0B', 200,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "manufacturing", "count": 3}}',
         'gold', true, 6, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Robotics Engineer', 'Complete robotics and automation studies', 'mechanical', 'cpu', '#EC4899', 250,
         '{"type": "lesson_completion_count", "criteria": {"discipline": "mechanical", "category": "robotics", "count": 3}}',
         'gold', true, 7, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Mechanical Engineering Master', 'Complete entire mechanical engineering curriculum', 'mechanical', 'crown', '#7C3AED', 500,
         '{"type": "curriculum_completion", "criteria": {"discipline": "mechanical", "completion_percentage": 100}}',
         'platinum', true, 8, CURRENT_TIMESTAMP);

    -- Create mechanical engineering daily challenges with conflict handling
    INSERT INTO public.daily_challenges (
        id, description, difficulty, challenge_date, reward_points,
        lesson_id, discipline, is_active, created_at
    ) VALUES
        (gen_random_uuid(), 'Force Vector Challenge: Solve complex force vector problems in 3D space', 'intermediate',
         CURRENT_DATE + INTERVAL '5 days', 25, statics_lesson_1_id, 'mechanical', true, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Material Selection Quiz: Choose the right materials for various engineering applications', 'intermediate',
         CURRENT_DATE + INTERVAL '6 days', 30, materials_lesson_2_id, 'mechanical', true, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Thermodynamic Cycle Analysis: Analyze efficiency of different power cycles', 'advanced',
         CURRENT_DATE + INTERVAL '7 days', 40, thermo_lesson_2_id, 'mechanical', true, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Fluid Flow Calculation: Calculate pressure losses in pipe systems', 'intermediate',
         CURRENT_DATE + INTERVAL '8 days', 35, fluids_lesson_1_id, 'mechanical', true, CURRENT_TIMESTAMP),
         
        (gen_random_uuid(), 'Gear Design Challenge: Design optimal gear systems for power transmission', 'advanced',
         CURRENT_DATE + INTERVAL '9 days', 45, design_lesson_1_id, 'mechanical', true, CURRENT_TIMESTAMP)
    ON CONFLICT (challenge_date) DO NOTHING;

    RAISE NOTICE 'Mechanical engineering curriculum successfully created with % lessons', 21;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mechanical engineering curriculum: %', SQLERRM;
        RAISE;
END $$;

-- Create optimized function for mechanical engineering curriculum
CREATE OR REPLACE FUNCTION public.get_mechanical_lessons_with_progress(
    user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    title TEXT,
    description TEXT,
    difficulty public.difficulty_level,
    estimated_duration_minutes INTEGER,
    xp_reward INTEGER,
    access_level TEXT,
    order_index INTEGER,
    learning_objectives TEXT[],
    user_completion_percentage INTEGER,
    user_status TEXT,
    is_locked BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.slug,
        l.title,
        l.description,
        l.difficulty,
        l.estimated_duration_minutes,
        l.xp_reward,
        l.access_level,
        l.order_index,
        l.learning_objectives,
        COALESCE(ulp.completion_percentage, 0)::INTEGER as user_completion_percentage,
        COALESCE(ulp.status, 'not_started')::TEXT as user_status,
        (l.access_level = 'premium' AND user_id_param IS NULL) as is_locked
    FROM public.lessons l
    LEFT JOIN public.user_lesson_progress ulp ON (
        l.id = ulp.lesson_id 
        AND ulp.user_id = user_id_param
    )
    WHERE l.discipline = 'mechanical'
    AND l.is_published = true
    ORDER BY l.order_index, l.created_at;
END;
$$;

-- Create function to get mechanical engineering achievements - FIXED column names
CREATE OR REPLACE FUNCTION public.get_mechanical_achievements_with_progress(
    user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    icon_name TEXT,
    badge_color TEXT,
    xp_reward INTEGER,
    tier TEXT,
    is_earned BOOLEAN,
    earned_at TIMESTAMPTZ,
    progress_percentage INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        at.id,
        at.name,
        at.description,
        at.icon_name,
        at.badge_color,
        at.xp_reward,
        at.tier,
        (ua.id IS NOT NULL) as is_earned,
        ua.earned_at,
        COALESCE(
            CASE 
                WHEN at.unlock_criteria->>'type' = 'lesson_completion_count' THEN
                    LEAST(100, (
                        SELECT COUNT(*)::INTEGER * 100 / (at.unlock_criteria->'criteria'->>'count')::INTEGER
                        FROM public.user_lesson_progress ulp
                        JOIN public.lessons l ON ulp.lesson_id = l.id
                        WHERE ulp.user_id = user_id_param
                        AND l.discipline = 'mechanical'
                        AND ulp.completion_percentage = 100
                    ))
                ELSE 0
            END, 0
        )::INTEGER as progress_percentage
    FROM public.achievement_types at
    LEFT JOIN public.user_achievements ua ON (
        at.id = ua.achievement_id 
        AND ua.user_id = user_id_param
    )
    WHERE at.category = 'mechanical'
    AND at.is_active = true
    ORDER BY at.sort_order;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.get_mechanical_lessons_with_progress IS 'Get all mechanical engineering lessons with user progress and lock status';
COMMENT ON FUNCTION public.get_mechanical_achievements_with_progress IS 'Get all mechanical engineering achievements with user progress tracking';