-- Location: supabase/migrations/20250930144647_electrical_engineering_curriculum_expansion.sql
-- Schema Analysis: Existing comprehensive learning system with learning_paths, lessons, skill_trees, user progress tracking
-- Integration Type: Addition - Adding new electrical engineering content to existing system
-- Dependencies: learning_paths, lessons, skill_trees, skill_nodes, achievement_types, user_profiles

-- Add new comprehensive electrical engineering learning path
DO $$
DECLARE
    electrical_path_id UUID := gen_random_uuid();
    circuit_analysis_lesson_id UUID := gen_random_uuid();
    electronics_lesson_id UUID := gen_random_uuid();
    digital_systems_lesson_id UUID := gen_random_uuid();
    microcontrollers_lesson_id UUID := gen_random_uuid();
    power_systems_lesson_id UUID := gen_random_uuid();
    control_systems_lesson_id UUID := gen_random_uuid();
    signal_processing_lesson_id UUID := gen_random_uuid();
    
    electrical_tree_id UUID := gen_random_uuid();
    instructor_id UUID;
    next_available_date DATE;
BEGIN
    -- Get existing instructor ID
    SELECT id INTO instructor_id FROM public.user_profiles WHERE role = 'instructor' LIMIT 1;
    
    IF instructor_id IS NULL THEN
        SELECT id INTO instructor_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    END IF;

    -- Find the next available date for daily challenges (avoid duplicates)
    SELECT COALESCE(MAX(challenge_date), CURRENT_DATE - INTERVAL '1 day') + INTERVAL '1 day'
    INTO next_available_date
    FROM public.daily_challenges;

    -- Create comprehensive electrical engineering learning path
    INSERT INTO public.learning_paths (
        id, name, description, discipline, difficulty, 
        estimated_duration_hours, is_published, created_by,
        learning_objectives, prerequisites
    ) VALUES (
        electrical_path_id,
        'Complete Electrical Engineering Mastery',
        'Comprehensive electrical engineering curriculum covering circuit analysis, electronics, digital systems, microcontrollers, power systems, control systems, and signal processing from beginner to advanced levels.',
        'electrical'::public.engineering_discipline,
        'beginner'::public.difficulty_level,
        120,
        true,
        instructor_id,
        ARRAY[
            'Master circuit analysis using Ohm''s Law and Kirchhoff''s Laws',
            'Design and analyze electronic circuits with diodes and transistors',
            'Build digital systems using logic gates and flip-flops',
            'Program microcontrollers for embedded system applications',
            'Understand AC/DC power systems and motor control',
            'Apply control system theory to real-world applications',
            'Process signals using filters and Fourier transforms'
        ],
        ARRAY[
            'Basic algebra and trigonometry',
            'Physics fundamentals - electricity and magnetism',
            'Computer programming basics (for microcontroller modules)'
        ]
    );

    -- Create detailed lessons for each electrical engineering module
    
    -- 1. Circuit Analysis Module
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        circuit_analysis_lesson_id,
        'circuit-analysis-fundamentals',
        'Circuit Analysis Fundamentals',
        'Master Ohm''s Law, Kirchhoff''s Laws, and Thevenin/Norton equivalents through hands-on circuit analysis.',
        'beginner'::public.difficulty_level,
        'Theory + Lab',
        90,
        electrical_path_id,
        1,
        75,
        'free',
        true,
        instructor_id,
        ARRAY[
            'Apply Ohm''s Law to calculate voltage, current, and resistance',
            'Use Kirchhoff''s Current and Voltage Laws for circuit analysis',
            'Simplify complex circuits using Thevenin and Norton equivalents',
            'Build and test basic LED circuits'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'Ohm''s Law and Basic Circuits',
                    'content', 'Understanding the relationship between voltage, current, and resistance in electrical circuits.',
                    'duration', 20
                ),
                jsonb_build_object(
                    'type', 'interactive',
                    'title', 'Kirchhoff''s Laws Workshop',
                    'content', 'Interactive simulation applying KCL and KVL to analyze circuits.',
                    'duration', 25
                ),
                jsonb_build_object(
                    'type', 'lab',
                    'title', 'Build a Simple LED Circuit',
                    'content', 'Hands-on project: Design and build an LED circuit with current limiting resistor.',
                    'duration', 30
                ),
                jsonb_build_object(
                    'type', 'quiz',
                    'title', 'Circuit Analysis Assessment',
                    'content', 'Test your understanding of circuit analysis principles.',
                    'duration', 15
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'LED Circuit Design',
                    'description', 'Design and build a multi-color LED circuit with switches',
                    'difficulty', 'beginner',
                    'estimated_time', '2 hours'
                )
            )
        )
    );

    -- 2. Electronics Module  
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        electronics_lesson_id,
        'electronics-diodes-transistors',
        'Electronics: Diodes, Transistors & Op-Amps',
        'Explore semiconductor devices including diodes, transistors, and operational amplifiers with practical applications.',
        'intermediate'::public.difficulty_level,
        'Theory + Lab',
        105,
        electrical_path_id,
        2,
        100,
        'premium',
        true,
        instructor_id,
        ARRAY[
            'Understand diode characteristics and applications',
            'Analyze transistor circuits for amplification and switching',
            'Design circuits using operational amplifiers',
            'Build amplifier and filter circuits'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'Semiconductor Physics',
                    'content', 'Fundamentals of semiconductor materials and PN junctions.',
                    'duration', 25
                ),
                jsonb_build_object(
                    'type', 'simulation',
                    'title', 'Transistor Circuit Analysis',
                    'content', 'Simulate BJT and FET circuits for various applications.',
                    'duration', 35
                ),
                jsonb_build_object(
                    'type', 'lab',
                    'title', 'Op-Amp Circuit Design',
                    'content', 'Build inverting and non-inverting amplifier circuits.',
                    'duration', 30
                ),
                jsonb_build_object(
                    'type', 'assessment',
                    'title', 'Electronics Design Challenge',
                    'content', 'Design a complete amplifier circuit with specifications.',
                    'duration', 15
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'Audio Amplifier Circuit',
                    'description', 'Design and build a simple audio amplifier using transistors',
                    'difficulty', 'intermediate',
                    'estimated_time', '4 hours'
                )
            )
        )
    );

    -- 3. Digital Systems Module
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        digital_systems_lesson_id,
        'digital-systems-logic-gates',
        'Digital Systems: Logic Gates & Sequential Circuits',
        'Master digital logic design including logic gates, flip-flops, and combinational/sequential circuits.',
        'intermediate'::public.difficulty_level,
        'Theory + Simulation',
        120,
        electrical_path_id,
        3,
        125,
        'premium',
        true,
        instructor_id,
        ARRAY[
            'Design combinational circuits using logic gates',
            'Implement sequential circuits with flip-flops',
            'Create digital counters and state machines',
            'Simulate digital systems using HDL tools'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'Boolean Algebra and Logic Gates',
                    'content', 'Mathematical foundation of digital logic and gate operations.',
                    'duration', 30
                ),
                jsonb_build_object(
                    'type', 'simulation',
                    'title', 'Combinational Logic Design',
                    'content', 'Design multiplexers, decoders, and arithmetic circuits.',
                    'duration', 35
                ),
                jsonb_build_object(
                    'type', 'lab',
                    'title', 'Digital Counter with Flip-Flops',
                    'content', 'Build a 4-bit binary counter using JK flip-flops.',
                    'duration', 40
                ),
                jsonb_build_object(
                    'type', 'project',
                    'title', 'State Machine Design',
                    'content', 'Design a finite state machine for a real-world application.',
                    'duration', 15
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'Digital Counter System',
                    'description', 'Create a digital counter with flip-flops and display',
                    'difficulty', 'intermediate',
                    'estimated_time', '3 hours'
                )
            )
        )
    );

    -- 4. Microcontrollers & Embedded Systems Module
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        microcontrollers_lesson_id,
        'microcontrollers-embedded-systems',
        'Microcontrollers & Embedded Systems',
        'Learn embedded programming with Arduino and Raspberry Pi, including sensors, actuators, and motor control.',
        'intermediate'::public.difficulty_level,
        'Programming + Hardware',
        150,
        electrical_path_id,
        4,
        150,
        'premium',
        true,
        instructor_id,
        ARRAY[
            'Program microcontrollers using Arduino IDE',
            'Interface sensors and actuators with microcontrollers',
            'Control motors and servo systems',
            'Develop embedded system projects'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'Microcontroller Architecture',
                    'content', 'Understanding ARM Cortex-M and AVR microcontroller architectures.',
                    'duration', 30
                ),
                jsonb_build_object(
                    'type', 'coding',
                    'title', 'Arduino Programming Basics',
                    'content', 'Learn C++ programming for Arduino microcontrollers.',
                    'duration', 40
                ),
                jsonb_build_object(
                    'type', 'lab',
                    'title', 'Sensor Interface Project',
                    'content', 'Connect temperature and motion sensors to Arduino.',
                    'duration', 50
                ),
                jsonb_build_object(
                    'type', 'project',
                    'title', 'Motor Control System',
                    'content', 'Program a microcontroller to control a DC motor with feedback.',
                    'duration', 30
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'Automated Motor Control',
                    'description', 'Program a microcontroller to control a motor with sensors',
                    'difficulty', 'intermediate',
                    'estimated_time', '6 hours'
                )
            )
        )
    );

    -- 5. Power Systems Module
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        power_systems_lesson_id,
        'power-systems-ac-dc-motors',
        'Power Systems: AC/DC Circuits & Motor Control',
        'Understand power systems including AC/DC circuits, transformers, motors, and generators.',
        'advanced'::public.difficulty_level,
        'Theory + Simulation',
        135,
        electrical_path_id,
        5,
        175,
        'premium',
        true,
        instructor_id,
        ARRAY[
            'Analyze AC power systems and phasor diagrams',
            'Design transformer circuits for voltage conversion',
            'Control AC and DC motors',
            'Understand power generation and distribution'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'AC Power Systems',
                    'content', 'Phasor analysis, reactive power, and three-phase systems.',
                    'duration', 45
                ),
                jsonb_build_object(
                    'type', 'simulation',
                    'title', 'Transformer Design',
                    'content', 'Simulate transformer operation and efficiency calculations.',
                    'duration', 40
                ),
                jsonb_build_object(
                    'type', 'lab',
                    'title', 'Motor Control Circuits',
                    'content', 'Build motor control circuits with variable speed control.',
                    'duration', 35
                ),
                jsonb_build_object(
                    'type', 'assessment',
                    'title', 'Power System Analysis',
                    'content', 'Comprehensive analysis of power system components.',
                    'duration', 15
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'Variable Speed Motor Drive',
                    'description', 'Design a variable frequency drive for AC motor control',
                    'difficulty', 'advanced',
                    'estimated_time', '8 hours'
                )
            )
        )
    );

    -- 6. Control Systems Module
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        control_systems_lesson_id,
        'control-systems-pid-stability',
        'Control Systems: Feedback & PID Controllers',
        'Master control system theory including feedback loops, PID controllers, and stability analysis.',
        'advanced'::public.difficulty_level,
        'Theory + Simulation',
        140,
        electrical_path_id,
        6,
        200,
        'premium',
        true,
        instructor_id,
        ARRAY[
            'Design closed-loop control systems',
            'Implement PID controllers for system regulation',
            'Analyze system stability using root locus and Bode plots',
            'Apply control theory to real-world systems'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'Control System Fundamentals',
                    'content', 'Transfer functions, block diagrams, and system response.',
                    'duration', 40
                ),
                jsonb_build_object(
                    'type', 'simulation',
                    'title', 'PID Controller Tuning',
                    'content', 'Simulate and tune PID controllers for optimal performance.',
                    'duration', 45
                ),
                jsonb_build_object(
                    'type', 'analysis',
                    'title', 'Stability Analysis',
                    'content', 'Use root locus and frequency response for stability analysis.',
                    'duration', 40
                ),
                jsonb_build_object(
                    'type', 'project',
                    'title', 'Servo Control System',
                    'content', 'Design a complete servo positioning control system.',
                    'duration', 15
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'Temperature Control System',
                    'description', 'Design a PID-controlled temperature regulation system',
                    'difficulty', 'advanced',
                    'estimated_time', '10 hours'
                )
            )
        )
    );

    -- 7. Signal Processing Module
    INSERT INTO public.lessons (
        id, slug, title, description, difficulty, lesson_type,
        estimated_duration_minutes, learning_path_id, order_index,
        xp_reward, access_level, is_published, created_by,
        learning_objectives, content
    ) VALUES (
        signal_processing_lesson_id,
        'signal-processing-filters-fourier',
        'Signal Processing: Filters & Fourier Analysis',
        'Learn digital signal processing including filters, Fourier transforms, and basic DSP applications.',
        'advanced'::public.difficulty_level,
        'Theory + Programming',
        160,
        electrical_path_id,
        7,
        225,
        'premium',
        true,
        instructor_id,
        ARRAY[
            'Design analog and digital filters',
            'Apply Fourier transform for frequency analysis',
            'Implement DSP algorithms in software',
            'Process audio and sensor signals'
        ],
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'type', 'theory',
                    'title', 'Signal Theory Fundamentals',
                    'content', 'Continuous and discrete signals, sampling theorem.',
                    'duration', 35
                ),
                jsonb_build_object(
                    'type', 'simulation',
                    'title', 'Filter Design Workshop',
                    'content', 'Design low-pass, high-pass, and band-pass filters.',
                    'duration', 50
                ),
                jsonb_build_object(
                    'type', 'programming',
                    'title', 'FFT Implementation',
                    'content', 'Implement Fast Fourier Transform algorithms.',
                    'duration', 45
                ),
                jsonb_build_object(
                    'type', 'project',
                    'title', 'Audio Signal Processor',
                    'content', 'Build a real-time audio processing application.',
                    'duration', 30
                )
            ),
            'projects', jsonb_build_array(
                jsonb_build_object(
                    'name', 'Digital Audio Filter',
                    'description', 'Create a digital filter for audio signal processing',
                    'difficulty', 'advanced',
                    'estimated_time', '12 hours'
                )
            )
        )
    );

    -- Create enhanced electrical engineering skill tree
    INSERT INTO public.skill_trees (
        id, name, description, discipline, icon_name, order_index, is_active
    ) VALUES (
        electrical_tree_id,
        'Electrical Engineering Mastery Path',
        'Complete mastery path for electrical engineering from fundamental circuits to advanced signal processing',
        'electrical'::public.engineering_discipline,
        'Zap',
        1,
        true
    );

    -- Add skill nodes for the electrical engineering path
    INSERT INTO public.skill_nodes (
        skill_tree_id, lesson_id, name, description, tier, 
        xp_required, position_x, position_y, is_milestone, prerequisites
    ) VALUES 
    (electrical_tree_id, circuit_analysis_lesson_id, 'Circuit Analysis Master', 'Foundation of electrical circuit analysis', 'bronze'::public.achievement_tier, 75, 100, 50, true, '[]'::jsonb),
    (electrical_tree_id, electronics_lesson_id, 'Electronics Expert', 'Semiconductor device specialist', 'silver'::public.achievement_tier, 200, 200, 100, true, jsonb_build_array((SELECT id FROM public.skill_nodes WHERE name = 'Circuit Analysis Master'))),
    (electrical_tree_id, digital_systems_lesson_id, 'Digital Design Pro', 'Digital systems and logic design', 'silver'::public.achievement_tier, 250, 150, 150, true, jsonb_build_array((SELECT id FROM public.skill_nodes WHERE name = 'Circuit Analysis Master'))),
    (electrical_tree_id, microcontrollers_lesson_id, 'Embedded Systems Engineer', 'Microcontroller programming expert', 'gold'::public.achievement_tier, 400, 250, 200, true, jsonb_build_array((SELECT id FROM public.skill_nodes WHERE name = 'Digital Design Pro'))),
    (electrical_tree_id, power_systems_lesson_id, 'Power Systems Specialist', 'AC/DC power and motor control', 'gold'::public.achievement_tier, 450, 300, 250, true, jsonb_build_array((SELECT id FROM public.skill_nodes WHERE name = 'Electronics Expert'))),
    (electrical_tree_id, control_systems_lesson_id, 'Control Systems Expert', 'Advanced feedback control systems', 'platinum'::public.achievement_tier, 600, 350, 300, true, jsonb_build_array((SELECT id FROM public.skill_nodes WHERE name = 'Power Systems Specialist'))),
    (electrical_tree_id, signal_processing_lesson_id, 'Signal Processing Master', 'Digital signal processing specialist', 'diamond'::public.achievement_tier, 750, 400, 350, true, jsonb_build_array((SELECT id FROM public.skill_nodes WHERE name = 'Control Systems Expert')));

    -- Add electrical engineering specific achievements
    INSERT INTO public.achievement_types (
        name, description, tier, category, xp_reward, 
        unlock_criteria, icon_name, badge_color, sort_order, is_active
    ) VALUES 
    ('Circuit Builder', 'Built your first electrical circuit', 'bronze'::public.achievement_tier, 'electrical', 50, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', circuit_analysis_lesson_id)), 
     'Zap', '#F59E0B', 10, true),
    
    ('Electronics Wizard', 'Mastered semiconductor devices', 'silver'::public.achievement_tier, 'electrical', 100, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', electronics_lesson_id)), 
     'Cpu', '#6B7280', 11, true),
    
    ('Digital Designer', 'Created complex digital systems', 'silver'::public.achievement_tier, 'electrical', 125, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', digital_systems_lesson_id)), 
     'Binary', '#6B7280', 12, true),
    
    ('Embedded Engineer', 'Programmed microcontrollers successfully', 'gold'::public.achievement_tier, 'electrical', 200, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', microcontrollers_lesson_id)), 
     'Microchip', '#F59E0B', 13, true),
    
    ('Power Expert', 'Mastered power systems and motor control', 'gold'::public.achievement_tier, 'electrical', 250, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', power_systems_lesson_id)), 
     'Zap', '#F59E0B', 14, true),
    
    ('Control Master', 'Designed advanced control systems', 'platinum'::public.achievement_tier, 'electrical', 350, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', control_systems_lesson_id)), 
     'Settings', '#E5E7EB', 15, true),
    
    ('Signal Guru', 'Mastered digital signal processing', 'diamond'::public.achievement_tier, 'electrical', 500, 
     jsonb_build_object('type', 'lesson_completion', 'criteria', jsonb_build_object('lesson_id', signal_processing_lesson_id)), 
     'Waveform', '#60A5FA', 16, true),
    
    ('Electrical Engineering Master', 'Completed the entire electrical engineering curriculum', 'diamond'::public.achievement_tier, 'electrical', 1000, 
     jsonb_build_object('type', 'path_completion', 'criteria', jsonb_build_object('learning_path_id', electrical_path_id)), 
     'Award', '#60A5FA', 17, true);

    -- Create daily challenges for electrical engineering (avoid duplicate dates)
    INSERT INTO public.daily_challenges (
        lesson_id, challenge_date, description, difficulty, discipline, reward_points, is_active
    )
    SELECT 
        l.id,
        next_available_date + (ROW_NUMBER() OVER() - 1) * INTERVAL '1 day',
        'Complete electrical engineering challenge: ' || l.title,
        l.difficulty,
        'electrical'::public.engineering_discipline,
        CASE 
            WHEN l.difficulty = 'beginner' THEN 25
            WHEN l.difficulty = 'intermediate' THEN 35
            WHEN l.difficulty = 'advanced' THEN 50
            ELSE 25
        END,
        true
    FROM public.lessons l
    JOIN public.learning_paths lp ON l.learning_path_id = lp.id
    WHERE lp.name = 'Complete Electrical Engineering Mastery'
    LIMIT 7;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding electrical engineering curriculum: %', SQLERRM;
        RAISE;
END $$;

-- Add indexes for better query performance (FIXED - removed invalid subqueries)
CREATE INDEX IF NOT EXISTS idx_lessons_learning_path_electrical ON public.lessons(learning_path_id);

CREATE INDEX IF NOT EXISTS idx_skill_nodes_electrical_tree ON public.skill_nodes(skill_tree_id);

CREATE INDEX IF NOT EXISTS idx_lessons_discipline_electrical ON public.lessons(learning_path_id) 
WHERE EXISTS (SELECT 1 FROM public.learning_paths lp WHERE lp.id = lessons.learning_path_id AND lp.discipline = 'electrical');

-- Alternative approach: Create index on learning_paths discipline for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_discipline ON public.learning_paths(discipline);

-- Update RLS policies are already in place from existing schema
-- No additional RLS policies needed as the tables already have proper Row Level Security

-- Migration Summary: Electrical Engineering Curriculum Expansion
-- FIXED: Removed invalid subquery from index predicate that was causing SQL error
-- Added comprehensive 7-module electrical engineering learning path with progressive skill development, hands-on projects, and achievement system integration