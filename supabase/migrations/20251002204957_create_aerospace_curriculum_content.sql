-- Location: supabase/migrations/20251002204957_create_aerospace_curriculum_content.sql
-- Schema Analysis: Complete curriculum system exists with learning_paths, lessons, skill_trees, achievement_types
-- Integration Type: Addition - Adding aerospace engineering content to existing curriculum system
-- Dependencies: learning_paths, lessons, skill_trees, achievement_types, user_profiles, daily_challenges

-- Create aerospace engineering learning paths and content
DO $$
DECLARE
    -- Learning path IDs
    aerodynamics_path_id UUID := gen_random_uuid();
    propulsion_path_id UUID := gen_random_uuid();
    flight_mechanics_path_id UUID := gen_random_uuid();
    avionics_path_id UUID := gen_random_uuid();
    structural_analysis_path_id UUID := gen_random_uuid();
    space_systems_path_id UUID := gen_random_uuid();
    
    -- Lesson IDs
    lesson_id UUID;
    
    -- Skill tree ID
    aerospace_skill_tree_id UUID := gen_random_uuid();
    
    -- Achievement type IDs
    achievement_id UUID;
    
    -- Get existing admin user for content creation
    admin_user_id UUID;
BEGIN
    -- Get an existing admin user or create a placeholder
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin user found, use the first available user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM public.user_profiles LIMIT 1;
    END IF;

    -- Create aerospace engineering learning paths
    INSERT INTO public.learning_paths (
        id, name, description, difficulty, discipline, estimated_duration_hours,
        is_published, prerequisites, learning_objectives, created_by
    ) VALUES
    -- Aerodynamics Path
    (aerodynamics_path_id, 'Aerodynamics Fundamentals', 
     'Master the principles of lift, drag, airfoils, and flow around bodies. Learn to analyze and design aerodynamic systems.',
     'beginner'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 12,
     true, 
     ARRAY['Basic calculus', 'Physics fundamentals', 'Fluid mechanics basics'],
     ARRAY['Understand Bernoulli principle', 'Analyze airfoil characteristics', 'Calculate lift and drag forces', 'Design basic wing profiles'],
     admin_user_id),
     
    -- Propulsion Path  
    (propulsion_path_id, 'Propulsion Systems',
     'Explore jet engines, rocket engines, and propellers. Understand propulsion principles and performance analysis.',
     'intermediate'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 15,
     true,
     ARRAY['Thermodynamics', 'Fluid mechanics', 'Aerodynamics fundamentals'],
     ARRAY['Analyze jet engine cycles', 'Design rocket nozzles', 'Calculate propeller efficiency', 'Evaluate engine performance'],
     admin_user_id),
     
    -- Flight Mechanics Path
    (flight_mechanics_path_id, 'Flight Mechanics & Control',
     'Study aircraft stability, control surfaces, and equations of motion. Master flight dynamics and control systems.',
     'intermediate'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 14,
     true,
     ARRAY['Dynamics', 'Linear algebra', 'Control theory basics'],
     ARRAY['Analyze aircraft stability', 'Design control systems', 'Calculate flight trajectories', 'Evaluate handling qualities'],
     admin_user_id),
     
    -- Avionics Path
    (avionics_path_id, 'Avionics & Systems',
     'Learn navigation systems, sensors, and control systems. Understand modern avionics integration.',
     'advanced'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 16,
     true,
     ARRAY['Electronics fundamentals', 'Digital systems', 'Control theory'],
     ARRAY['Design navigation systems', 'Integrate sensor networks', 'Develop flight control software', 'Analyze system reliability'],
     admin_user_id),
     
    -- Structural Analysis Path
    (structural_analysis_path_id, 'Structural Analysis & Design',
     'Master airframe design, stress analysis, and aerospace materials. Learn structural optimization techniques.',
     'intermediate'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 18,
     true,
     ARRAY['Mechanics of materials', 'Statics', 'Material science'],
     ARRAY['Analyze airframe structures', 'Design composite materials', 'Perform stress analysis', 'Optimize structural weight'],
     admin_user_id),
     
    -- Space Systems Path
    (space_systems_path_id, 'Space Systems & Mission Design',
     'Explore orbital mechanics, satellite systems, and space mission planning. Design spacecraft and missions.',
     'advanced'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 20,
     true,
     ARRAY['Classical mechanics', 'Physics', 'Orbital mechanics basics'],
     ARRAY['Calculate orbital trajectories', 'Design spacecraft systems', 'Plan space missions', 'Analyze launch requirements'],
     admin_user_id);

    -- Create aerospace lessons for each learning path
    
    -- Aerodynamics Lessons
    lesson_id := gen_random_uuid();
    INSERT INTO public.lessons (
        id, title, slug, description, difficulty, discipline, lesson_type,
        estimated_duration_minutes, xp_reward, learning_path_id, order_index,
        is_published, learning_objectives, content, created_by
    ) VALUES
    (lesson_id, 'Introduction to Aerodynamics', 'intro-aerodynamics',
     'Fundamental principles of aerodynamics including Bernoulli equation and flow characteristics.',
     'beginner'::public.difficulty_level, 'aerospace', 'theory',
     45, 50, aerodynamics_path_id, 1, true,
     ARRAY['Understand fluid flow basics', 'Apply Bernoulli principle', 'Identify flow regimes'],
     '{"sections":[{"title":"Fluid Flow Fundamentals","content":"Introduction to fluid mechanics and aerodynamics","activities":["Interactive flow visualization","Bernoulli equation calculator"]},{"title":"Practical Applications","content":"Real-world aerodynamic examples","activities":["Aircraft wing analysis","Wind tunnel simulation"]}]}'::jsonb,
     admin_user_id),
     
    (gen_random_uuid(), 'Airfoil Theory & Design', 'airfoil-theory',
     'Design and analysis of airfoils, including NACA profiles and performance characteristics.',
     'intermediate'::public.difficulty_level, 'aerospace', 'simulation',
     60, 75, aerodynamics_path_id, 2, true,
     ARRAY['Design NACA airfoils', 'Calculate lift coefficients', 'Optimize airfoil shapes'],
     '{"sections":[{"title":"Airfoil Geometry","content":"Understanding airfoil shape parameters","activities":["Airfoil design tool","Performance calculator"]},{"title":"Lift & Drag Analysis","content":"Calculating aerodynamic forces","activities":["CFD simulation","Wind tunnel testing"]}]}'::jsonb,
     admin_user_id),
     
    (gen_random_uuid(), 'Drag Analysis & Reduction', 'drag-analysis',
     'Comprehensive study of drag types and reduction techniques for aerospace vehicles.',
     'intermediate'::public.difficulty_level, 'aerospace', 'project',
     50, 60, aerodynamics_path_id, 3, true,
     ARRAY['Identify drag sources', 'Calculate total drag', 'Design drag reduction features'],
     '{"sections":[{"title":"Drag Types","content":"Understanding induced, parasitic, and wave drag","activities":["Drag breakdown analysis","Optimization project"]},{"title":"Reduction Techniques","content":"Methods to minimize aircraft drag","activities":["Winglet design","Surface optimization"]}]}'::jsonb,
     admin_user_id);

    -- Propulsion Lessons
    INSERT INTO public.lessons (
        id, title, slug, description, difficulty, discipline, lesson_type,
        estimated_duration_minutes, xp_reward, learning_path_id, order_index,
        is_published, learning_objectives, content, created_by
    ) VALUES
    (gen_random_uuid(), 'Jet Engine Fundamentals', 'jet-engines',
     'Working principles of turbojet, turbofan, and turboprop engines.',
     'intermediate'::public.difficulty_level, 'aerospace', 'theory',
     55, 65, propulsion_path_id, 1, true,
     ARRAY['Understand Brayton cycle', 'Analyze engine components', 'Calculate thrust and efficiency'],
     '{"sections":[{"title":"Engine Cycles","content":"Thermodynamic cycles in jet engines","activities":["Cycle analysis tool","Performance comparison"]},{"title":"Component Design","content":"Compressor, combustor, and turbine design","activities":["Engine assembly simulation","Efficiency optimization"]}]}'::jsonb,
     admin_user_id),
     
    (gen_random_uuid(), 'Rocket Propulsion', 'rocket-propulsion',
     'Principles of rocket engines, nozzle design, and performance analysis.',
     'advanced'::public.difficulty_level, 'aerospace', 'simulation',
     70, 85, propulsion_path_id, 2, true,
     ARRAY['Design rocket nozzles', 'Calculate specific impulse', 'Analyze multi-stage rockets'],
     '{"sections":[{"title":"Rocket Fundamentals","content":"Newton laws applied to rockets","activities":["Trajectory calculator","Staging analysis"]},{"title":"Nozzle Design","content":"Converging-diverging nozzle theory","activities":["Nozzle optimization","CFD analysis"]}]}'::jsonb,
     admin_user_id);

    -- Flight Mechanics Lessons  
    INSERT INTO public.lessons (
        id, title, slug, description, difficulty, discipline, lesson_type,
        estimated_duration_minutes, xp_reward, learning_path_id, order_index,
        is_published, learning_objectives, content, created_by
    ) VALUES
    (gen_random_uuid(), 'Aircraft Stability & Control', 'stability-control',
     'Static and dynamic stability analysis, control surface design and effectiveness.',
     'intermediate'::public.difficulty_level, 'aerospace', 'theory',
     65, 70, flight_mechanics_path_id, 1, true,
     ARRAY['Analyze longitudinal stability', 'Design control surfaces', 'Evaluate handling qualities'],
     '{"sections":[{"title":"Stability Analysis","content":"Static and dynamic stability principles","activities":["Stability calculator","Trim analysis"]},{"title":"Control Design","content":"Control surface sizing and placement","activities":["Control effectiveness study","Flight simulator"]}]}'::jsonb,
     admin_user_id),
     
    (gen_random_uuid(), 'Flight Dynamics', 'flight-dynamics',
     'Equations of motion, performance analysis, and flight envelope calculations.',
     'advanced'::public.difficulty_level, 'aerospace', 'simulation',
     75, 90, flight_mechanics_path_id, 2, true,
     ARRAY['Derive equations of motion', 'Calculate performance limits', 'Design flight envelopes'],
     '{"sections":[{"title":"Equations of Motion","content":"6-DOF aircraft dynamics","activities":["Flight dynamics simulator","Performance calculator"]},{"title":"Flight Envelope","content":"Operating limits and boundaries","activities":["Envelope analysis","Safety margin calculation"]}]}'::jsonb,
     admin_user_id);

    -- Create aerospace skill tree
    INSERT INTO public.skill_trees (
        id, name, description, discipline, icon_name, is_active, order_index
    ) VALUES
    (aerospace_skill_tree_id, 'Aerospace Engineering Mastery', 
     'Complete aerospace engineering skill progression from aerodynamics to space systems',
     'aerospace'::public.engineering_discipline, 'Plane', true, 4);

    -- Create skill nodes for aerospace tree
    INSERT INTO public.skill_nodes (
        id, name, description, skill_tree_id, lesson_id, tier, xp_required,
        position_x, position_y, is_milestone, prerequisites
    ) VALUES
    -- Foundation Level
    (gen_random_uuid(), 'Aerodynamics Basics', 'Fundamental aerodynamics principles',
     aerospace_skill_tree_id, lesson_id, 'bronze'::public.achievement_tier, 100,
     100, 100, true, '[]'::jsonb),
     
    (gen_random_uuid(), 'Propulsion Fundamentals', 'Basic propulsion concepts',
     aerospace_skill_tree_id, null, 'bronze'::public.achievement_tier, 150,
     200, 100, false, '[]'::jsonb),
     
    -- Intermediate Level
    (gen_random_uuid(), 'Flight Mechanics', 'Aircraft stability and control',
     aerospace_skill_tree_id, null, 'silver'::public.achievement_tier, 250,
     150, 200, true, '[{"skill_id":"prerequisite_id","type":"skill"}]'::jsonb),
     
    (gen_random_uuid(), 'Structural Design', 'Airframe design and analysis',
     aerospace_skill_tree_id, null, 'silver'::public.achievement_tier, 300,
     250, 200, false, '[{"skill_id":"prerequisite_id","type":"skill"}]'::jsonb),
     
    -- Advanced Level
    (gen_random_uuid(), 'Space Systems', 'Orbital mechanics and spacecraft design',
     aerospace_skill_tree_id, null, 'gold'::public.achievement_tier, 500,
     175, 300, true, '[{"skill_id":"prerequisite_id","type":"skill"}]'::jsonb);

    -- Create aerospace achievements
    INSERT INTO public.achievement_types (
        id, name, description, category, tier, xp_reward, icon_name,
        badge_color, unlock_criteria, is_active, sort_order
    ) VALUES
    (gen_random_uuid(), 'Aerospace Pioneer', 'Complete first aerospace engineering lesson',
     'aerospace', 'bronze'::public.achievement_tier, 100, 'rocket',
     '#3B82F6', '{"type":"lesson_completion_count","discipline":"aerospace","count":1}'::jsonb,
     true, 1),
     
    (gen_random_uuid(), 'Flight Dynamics Expert', 'Master all flight mechanics concepts',
     'aerospace', 'silver'::public.achievement_tier, 200, 'plane',
     '#10B981', '{"type":"learning_path_completion","path":"flight_mechanics"}'::jsonb,
     true, 2),
     
    (gen_random_uuid(), 'Propulsion Master', 'Complete all propulsion system modules',
     'aerospace', 'silver'::public.achievement_tier, 250, 'zap',
     '#F59E0B', '{"type":"learning_path_completion","path":"propulsion"}'::jsonb,
     true, 3),
     
    (gen_random_uuid(), 'Aerospace Engineer', 'Complete 50% of aerospace curriculum',
     'aerospace', 'gold'::public.achievement_tier, 500, 'award',
     '#8B5CF6', '{"type":"discipline_progress","discipline":"aerospace","percentage":50}'::jsonb,
     true, 4),
     
    (gen_random_uuid(), 'Space Mission Designer', 'Master space systems and mission design',
     'aerospace', 'platinum'::public.achievement_tier, 750, 'satellite',
     '#EC4899', '{"type":"learning_path_completion","path":"space_systems"}'::jsonb,
     true, 5);

    -- Create aerospace daily challenges
    INSERT INTO public.daily_challenges (
        id, description, difficulty, discipline, reward_points, challenge_date,
        lesson_id, is_active
    ) VALUES
    (gen_random_uuid(), 
     'Complete the airfoil simulation and calculate lift coefficient for a NACA 2412 airfoil at 10 degrees angle of attack',
     'intermediate'::public.difficulty_level, 'aerospace'::public.engineering_discipline, 
     75, CURRENT_DATE + INTERVAL '1 day', lesson_id, true),
     
    (gen_random_uuid(),
     'Design a basic glider wing with stability calculations and analyze its center of gravity position',
     'advanced'::public.difficulty_level, 'aerospace'::public.engineering_discipline,
     100, CURRENT_DATE + INTERVAL '2 days', null, true),
     
    (gen_random_uuid(),
     'Calculate rocket motor thrust and specific impulse for a solid propellant motor demonstration',
     'expert'::public.difficulty_level, 'aerospace'::public.engineering_discipline,
     125, CURRENT_DATE + INTERVAL '3 days', null, true);

    RAISE NOTICE 'Aerospace engineering curriculum content created successfully';
    RAISE NOTICE 'Learning paths: 6, Lessons: 8, Skill nodes: 5, Achievements: 5, Daily challenges: 3';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating aerospace content: %', SQLERRM;
        RAISE;
END $$;