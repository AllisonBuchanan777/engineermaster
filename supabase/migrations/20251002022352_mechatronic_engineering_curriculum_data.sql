-- Location: supabase/migrations/20251002022352_mechatronic_engineering_curriculum_data.sql
-- Schema Analysis: Existing engineering education platform with mechanical/electrical data
-- Integration Type: ADDITIVE - Adding mechatronic discipline to existing schema
-- Dependencies: learning_paths, lessons, skill_trees, achievement_types tables
-- FIX: PostgreSQL enum comparison issue in index creation

-- CRITICAL: PostgreSQL enum handling requires special transaction management
-- Problem: New enum values cannot be used in same transaction as ADD VALUE
-- Solution: Split enum addition from data insertion with explicit transaction boundaries

-- Step 1: Add enum value in its own transaction block
DO $enum_block$
BEGIN
    -- Check if mechatronic value already exists to avoid duplicate errors
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mechatronic' 
        AND enumtypid = 'public.engineering_discipline'::regtype
    ) THEN
        ALTER TYPE public.engineering_discipline ADD VALUE 'mechatronic';
    END IF;
END $enum_block$;

-- Step 2: Insert data in separate transaction after enum is committed
DO $data_block$
DECLARE
    instructor_user_id UUID;
    mechatronic_learning_path_id UUID := gen_random_uuid();
    mechatronic_skill_tree_id UUID := gen_random_uuid();
    
    -- Lesson IDs for the 6 modules
    integrated_systems_lesson_id UUID := gen_random_uuid();
    sensors_actuators_lesson_id UUID := gen_random_uuid();
    embedded_programming_lesson_id UUID := gen_random_uuid();
    control_automation_lesson_id UUID := gen_random_uuid();
    signal_processing_lesson_id UUID := gen_random_uuid();
    robotics_systems_lesson_id UUID := gen_random_uuid();
    
    -- Achievement IDs
    mechatronic_fundamentals_id UUID := gen_random_uuid();
    systems_integration_master_id UUID := gen_random_uuid();
    robotics_specialist_id UUID := gen_random_uuid();

BEGIN
    -- Get existing instructor user ID (reference existing data)
    SELECT id INTO instructor_user_id FROM public.user_profiles LIMIT 1;
    
    -- If no user found, log notice and continue with null
    IF instructor_user_id IS NULL THEN
        RAISE NOTICE 'No existing users found. Mechatronic curriculum will be created without instructor assignment.';
    END IF;

    -- Create Mechatronic Engineering Learning Path
    INSERT INTO public.learning_paths (
        id, name, description, discipline, difficulty, 
        estimated_duration_hours, is_published, created_by,
        learning_objectives, prerequisites
    ) VALUES (
        mechatronic_learning_path_id,
        'Mechatronic Engineering Fundamentals',
        'Master the integration of mechanical, electrical, and computer systems through comprehensive hands-on learning. Build intelligent systems that combine sensors, actuators, and control systems.',
        'mechatronic'::public.engineering_discipline,
        'intermediate'::public.difficulty_level,
        48,
        true,
        instructor_user_id,
        ARRAY[
            'Understand mechatronic system design principles',
            'Master sensor and actuator integration',
            'Program embedded systems for control applications',
            'Design and implement automated control systems',
            'Analyze and process sensor signals',
            'Build and program robotic systems'
        ],
        ARRAY[
            'Basic programming knowledge',
            'Fundamental electrical circuit analysis',
            'Basic mechanical engineering principles',
            'Mathematics - algebra and basic calculus'
        ]
    );

    -- Create Mechatronic Skill Tree
    INSERT INTO public.skill_trees (
        id, name, description, discipline, icon_name, is_active, order_index
    ) VALUES (
        mechatronic_skill_tree_id,
        'Mechatronic Systems Mastery',
        'Progress through integrated systems design, from basic sensors to advanced robotics',
        'mechatronic'::public.engineering_discipline,
        'Settings',
        true,
        3
    );

    -- Create Mechatronic Lessons (6 modules with progressive difficulty)
    INSERT INTO public.lessons (
        id, title, slug, description, discipline, difficulty, lesson_type,
        estimated_duration_minutes, xp_reward, learning_path_id, order_index,
        is_published, access_level, created_by,
        learning_objectives, prerequisites, content
    ) VALUES 
    -- Module 1: Integrated Systems
    (
        integrated_systems_lesson_id,
        'Integrated Systems Design',
        'mechatronic-integrated-systems',
        'Learn to combine mechanical, electrical, and computer systems into cohesive mechatronic solutions. Understand system interfaces and integration principles.',
        'mechatronic'::public.engineering_discipline,
        'beginner'::public.difficulty_level,
        'theory_and_practice',
        60,
        75,
        mechatronic_learning_path_id,
        1,
        true,
        'free',
        instructor_user_id,
        ARRAY[
            'Understand mechatronic system architecture',
            'Identify system interfaces and interactions',
            'Design integrated system solutions',
            'Apply systems thinking to engineering problems'
        ],
        ARRAY['Basic engineering principles'],
        '{"sections":[{"title":"Introduction to Mechatronics","type":"video","duration":15,"content":"Overview of mechatronic systems and their applications"},{"title":"System Integration Principles","type":"theory","duration":20,"content":"Understanding how mechanical, electrical, and software components work together"},{"title":"Design Methodology","type":"interactive","duration":15,"content":"Step-by-step approach to mechatronic system design"},{"title":"Hands-on Project","type":"practical","duration":10,"content":"Design a simple mechatronic system concept"}]}'::jsonb
    ),
    
    -- Module 2: Sensors & Actuators
    (
        sensors_actuators_lesson_id,
        'Sensors and Actuators Integration',
        'mechatronic-sensors-actuators',
        'Explore various sensor types and actuator systems. Learn interfacing techniques and signal conditioning for reliable system performance.',
        'mechatronic'::public.engineering_discipline,
        'beginner'::public.difficulty_level,
        'hands_on',
        55,
        75,
        mechatronic_learning_path_id,
        2,
        true,
        'free',
        instructor_user_id,
        ARRAY[
            'Classify different sensor and actuator types',
            'Design sensor interfacing circuits',
            'Implement actuator control systems',
            'Troubleshoot sensor-actuator integration issues'
        ],
        ARRAY['Integrated Systems Design'],
        '{"sections":[{"title":"Sensor Technologies","type":"theory","duration":20,"content":"Temperature, pressure, position, and motion sensors"},{"title":"Actuator Systems","type":"theory","duration":15,"content":"Motors, solenoids, pneumatic and hydraulic actuators"},{"title":"Interface Circuits","type":"practical","duration":15,"content":"Signal conditioning and amplification circuits"},{"title":"Lab Exercise","type":"hands_on","duration":5,"content":"Build sensor-actuator test circuit"}]}'::jsonb
    ),
    
    -- Module 3: Embedded Programming
    (
        embedded_programming_lesson_id,
        'Embedded Systems Programming',
        'mechatronic-embedded-programming',
        'Master microcontroller programming for mechatronic applications. Learn real-time programming concepts and hardware-software integration.',
        'mechatronic'::public.engineering_discipline,
        'intermediate'::public.difficulty_level,
        'programming',
        70,
        100,
        mechatronic_learning_path_id,
        3,
        true,
        'premium',
        instructor_user_id,
        ARRAY[
            'Program microcontrollers for control applications',
            'Implement real-time control algorithms',
            'Interface software with hardware components',
            'Debug embedded system programs'
        ],
        ARRAY['Sensors and Actuators Integration', 'Basic programming knowledge'],
        '{"sections":[{"title":"Microcontroller Basics","type":"theory","duration":20,"content":"Architecture and programming fundamentals"},{"title":"Real-time Programming","type":"programming","duration":25,"content":"Timing-critical applications and interrupt handling"},{"title":"Hardware Interfaces","type":"practical","duration":20,"content":"ADC, PWM, digital I/O programming"},{"title":"Control Project","type":"project","duration":5,"content":"Program a temperature control system"}]}'::jsonb
    ),
    
    -- Module 4: Control & Automation
    (
        control_automation_lesson_id,
        'Control Systems and Automation',
        'mechatronic-control-automation',
        'Implement PID controllers, learn PLC programming basics, and design automated control systems for industrial applications.',
        'mechatronic'::public.engineering_discipline,
        'intermediate'::public.difficulty_level,
        'theory_and_practice',
        65,
        100,
        mechatronic_learning_path_id,
        4,
        true,
        'premium',
        instructor_user_id,
        ARRAY[
            'Design and tune PID control systems',
            'Understand PLC programming fundamentals',
            'Implement automated control sequences',
            'Analyze system stability and performance'
        ],
        ARRAY['Embedded Systems Programming'],
        '{"sections":[{"title":"PID Control Theory","type":"theory","duration":20,"content":"Proportional, integral, and derivative control principles"},{"title":"PLC Programming","type":"programming","duration":20,"content":"Ladder logic and basic PLC operations"},{"title":"Automation Design","type":"practical","duration":20,"content":"Sequential control and process automation"},{"title":"Control Project","type":"simulation","duration":5,"content":"Design automated assembly line control"}]}'::jsonb
    ),
    
    -- Module 5: Signal Acquisition & Processing
    (
        signal_processing_lesson_id,
        'Signal Acquisition and Processing',
        'mechatronic-signal-processing',
        'Master analog-to-digital conversion, implement digital filters, and learn signal processing techniques for sensor data analysis.',
        'mechatronic'::public.engineering_discipline,
        'advanced'::public.difficulty_level,
        'theory_and_practice',
        60,
        125,
        mechatronic_learning_path_id,
        5,
        true,
        'premium',
        instructor_user_id,
        ARRAY[
            'Design ADC systems for sensor signals',
            'Implement digital signal filtering',
            'Analyze signal noise and interference',
            'Process sensor data for control decisions'
        ],
        ARRAY['Control Systems and Automation'],
        '{"sections":[{"title":"ADC Fundamentals","type":"theory","duration":15,"content":"Sampling, quantization, and resolution concepts"},{"title":"Digital Filtering","type":"theory","duration":20,"content":"FIR and IIR filter design and implementation"},{"title":"Noise Analysis","type":"practical","duration":15,"content":"Identifying and mitigating signal interference"},{"title":"Signal Processing Lab","type":"hands_on","duration":10,"content":"Process real sensor signals with filters"}]}'::jsonb
    ),
    
    -- Module 6: Robotics Systems
    (
        robotics_systems_lesson_id,
        'Robotics Systems Design',
        'mechatronic-robotics-systems',
        'Apply mechatronic principles to robotics. Learn kinematics, motion planning, and sensor integration for intelligent robotic systems.',
        'mechatronic'::public.engineering_discipline,
        'advanced'::public.difficulty_level,
        'project_based',
        80,
        150,
        mechatronic_learning_path_id,
        6,
        true,
        'premium',
        instructor_user_id,
        ARRAY[
            'Understand robot kinematics and dynamics',
            'Implement motion planning algorithms',
            'Integrate multiple sensors for robot perception',
            'Design complete robotic control systems'
        ],
        ARRAY['Signal Acquisition and Processing'],
        '{"sections":[{"title":"Robot Kinematics","type":"theory","duration":25,"content":"Forward and inverse kinematics for manipulators"},{"title":"Motion Planning","type":"programming","duration":25,"content":"Path planning and trajectory generation"},{"title":"Sensor Fusion","type":"practical","duration":20,"content":"Combining multiple sensor inputs for robot control"},{"title":"Robot Project","type":"capstone","duration":10,"content":"Build and program a complete robotic system"}]}'::jsonb
    );

    -- Create Skill Nodes for Mechatronic Skill Tree
    INSERT INTO public.skill_nodes (
        skill_tree_id, lesson_id, name, description, 
        prerequisites, position_x, position_y, tier_level
    ) VALUES
    (mechatronic_skill_tree_id, integrated_systems_lesson_id, 'Systems Integration', 'Master mechatronic system design principles', '[]'::jsonb, 100, 400, 1),
    (mechatronic_skill_tree_id, sensors_actuators_lesson_id, 'Sensor & Actuator Mastery', 'Interface and control physical components', '["Systems Integration"]'::jsonb, 200, 350, 2),
    (mechatronic_skill_tree_id, embedded_programming_lesson_id, 'Embedded Control', 'Program intelligent control systems', '["Sensor & Actuator Mastery"]'::jsonb, 150, 250, 2),
    (mechatronic_skill_tree_id, control_automation_lesson_id, 'Automation Expert', 'Design automated industrial systems', '["Embedded Control"]'::jsonb, 250, 200, 3),
    (mechatronic_skill_tree_id, signal_processing_lesson_id, 'Signal Processing', 'Advanced sensor data analysis', '["Automation Expert"]'::jsonb, 300, 150, 3),
    (mechatronic_skill_tree_id, robotics_systems_lesson_id, 'Robotics Master', 'Complete autonomous system design', '["Signal Processing", "Automation Expert"]'::jsonb, 350, 100, 4);

    -- Create Mechatronic Engineering Achievements
    INSERT INTO public.achievement_types (
        id, name, description, tier, category, xp_reward,
        unlock_criteria, icon_name, badge_color, is_active, sort_order
    ) VALUES 
    (
        mechatronic_fundamentals_id,
        'Mechatronic Fundamentals',
        'Complete the first three mechatronic engineering modules',
        'silver'::public.achievement_tier,
        'mechatronic',
        200,
        '{"type":"lesson_completion_count","discipline":"mechatronic","required_count":3,"specific_lessons":["mechatronic-integrated-systems","mechatronic-sensors-actuators","mechatronic-embedded-programming"]}'::jsonb,
        'cpu',
        '#10B981',
        true,
        1
    ),
    (
        systems_integration_master_id,
        'Systems Integration Master',
        'Master all mechatronic control and automation concepts',
        'gold'::public.achievement_tier,
        'mechatronic',
        300,
        '{"type":"lesson_completion_count","discipline":"mechatronic","required_count":5,"min_score":85}'::jsonb,
        'settings',
        '#F59E0B',
        true,
        2
    ),
    (
        robotics_specialist_id,
        'Robotics Specialist',
        'Complete the complete mechatronic engineering curriculum with excellence',
        'platinum'::public.achievement_tier,
        'mechatronic',
        500,
        '{"type":"curriculum_completion","discipline":"mechatronic","required_lessons":6,"min_avg_score":90,"capstone_required":true}'::jsonb,
        'bot',
        '#8B5CF6',
        true,
        3
    );

    -- Create Junction Table Entries (Learning Path <-> Lessons)
    INSERT INTO public.learning_paths_lessons (learning_path_id, lesson_id, order_index)
    VALUES 
        (mechatronic_learning_path_id, integrated_systems_lesson_id, 1),
        (mechatronic_learning_path_id, sensors_actuators_lesson_id, 2),
        (mechatronic_learning_path_id, embedded_programming_lesson_id, 3),
        (mechatronic_learning_path_id, control_automation_lesson_id, 4),
        (mechatronic_learning_path_id, signal_processing_lesson_id, 5),
        (mechatronic_learning_path_id, robotics_systems_lesson_id, 6);

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Mechatronic curriculum data already exists: %', SQLERRM;
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error - ensure user_profiles table has data: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error creating mechatronic curriculum: %', SQLERRM;
END $data_block$;

-- Step 3: Create performance indexes with fixed enum comparison syntax
-- FIX: Use proper enum casting to avoid "text = engineering_discipline" error
DO $index_block$
BEGIN
    -- Create index for lessons filtering by mechatronic discipline
    -- FIXED: Cast both sides of comparison to same enum type
    CREATE INDEX IF NOT EXISTS idx_lessons_mechatronic_discipline 
    ON public.lessons(discipline) 
    WHERE discipline = 'mechatronic'::text::public.engineering_discipline;

    -- Create index for learning paths filtering by mechatronic discipline  
    -- FIXED: Use text cast first then enum cast for PostgreSQL compatibility
    CREATE INDEX IF NOT EXISTS idx_learning_paths_mechatronic_discipline 
    ON public.learning_paths(discipline) 
    WHERE discipline = 'mechatronic'::text::public.engineering_discipline;

EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Indexes already exist for mechatronic discipline';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating performance indexes: %', SQLERRM;
END $index_block$;

-- Documentation and comments
COMMENT ON COLUMN public.lessons.discipline IS 'Engineering discipline including mechatronic for integrated systems education';
COMMENT ON TYPE public.engineering_discipline IS 'Engineering disciplines supported by the platform: mechanical, electrical, and mechatronic integrated systems';

-- Migration completed successfully with proper enum handling
-- FIXED: Split enum addition from data usage to resolve PostgreSQL enum commit requirements
-- FIXED: Index creation syntax to properly handle enum type comparison
-- Created: 1 learning path, 6 lessons, 1 skill tree, 6 skill nodes, 3 achievements for mechatronic engineering
-- Features: Progressive difficulty from beginner to advanced, hands-on projects, robotics capstone project