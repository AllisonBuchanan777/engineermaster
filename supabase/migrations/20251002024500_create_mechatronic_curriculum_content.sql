-- Create comprehensive mechatronic engineering curriculum data
-- This migration adds actual learning paths and lessons for mechatronic engineering

BEGIN;

-- Insert mechatronic engineering learning paths
INSERT INTO public.learning_paths (
    id,
    name,
    description,
    discipline,
    difficulty,
    estimated_duration_hours,
    is_published,
    learning_objectives,
    prerequisites,
    created_at,
    updated_at
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Mechatronic Systems Integration',
    'Master the fundamentals of integrating mechanical, electrical, and computer systems into unified mechatronic solutions. Learn system architecture, component interfaces, and control principles.',
    'mechatronic'::engineering_discipline,
    'beginner'::difficulty_level,
    45,
    true,
    ARRAY[
        'Understand mechatronic system architecture',
        'Design mechanical-electrical interfaces',
        'Apply systems thinking approach',
        'Select appropriate components',
        'Implement basic control systems'
    ],
    ARRAY['Basic calculus', 'Physics fundamentals', 'Basic programming concepts'],
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Sensors and Actuators in Mechatronics',
    'Comprehensive study of sensors, actuators, and their interfacing in mechatronic systems. Cover signal conditioning, data acquisition, and control system integration.',
    'mechatronic'::engineering_discipline,
    'intermediate'::difficulty_level,
    38,
    true,
    ARRAY[
        'Identify sensor types and characteristics',
        'Design signal conditioning circuits',
        'Interface sensors with microcontrollers',
        'Control various actuator types',
        'Implement feedback systems'
    ],
    ARRAY['Electronics basics', 'Circuit analysis', 'Programming fundamentals'],
    NOW(),
    NOW()
),
(
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'Embedded Programming for Mechatronics',
    'Learn microcontroller programming for mechatronic applications including real-time control, communication protocols, and embedded system design.',
    'mechatronic'::engineering_discipline,
    'intermediate'::difficulty_level,
    42,
    true,
    ARRAY[
        'Program microcontrollers for control applications',
        'Implement real-time control algorithms',
        'Use communication protocols (I2C, SPI, UART)',
        'Handle interrupts and timing',
        'Debug embedded systems'
    ],
    ARRAY['C programming', 'Digital electronics', 'Microprocessor concepts'],
    NOW(),
    NOW()
),
(
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'Advanced Robotics and Automation',
    'Advanced topics in robotics including kinematics, path planning, machine vision, and industrial automation for mechatronic engineers.',
    'mechatronic'::engineering_discipline,
    'advanced'::difficulty_level,
    50,
    true,
    ARRAY[
        'Apply forward and inverse kinematics',
        'Implement path planning algorithms',
        'Design robotic control systems',
        'Integrate machine vision systems',
        'Develop automation solutions'
    ],
    ARRAY['Linear algebra', 'Control systems', 'Advanced programming'],
    NOW(),
    NOW()
);

-- Insert lessons for Mechatronic Systems Integration path
INSERT INTO public.lessons (
    id,
    slug,
    title,
    description,
    content,
    lesson_type,
    discipline,
    difficulty,
    estimated_duration_minutes,
    xp_reward,
    access_level,
    order_index,
    learning_objectives,
    is_published,
    learning_path_id,
    created_at,
    updated_at
) VALUES 
(
    'a1234567-1234-4321-8765-123456789011',
    'intro-mechatronic-systems',
    'Introduction to Mechatronic Systems',
    'Overview of mechatronics as an interdisciplinary field combining mechanical, electrical, and computer engineering.',
    '{
        "sections": [
            {
                "title": "What is Mechatronics?",
                "content": "Mechatronics is the integration of mechanical, electrical, and computer systems to create intelligent products and processes.",
                "video_url": "/videos/mechatronics-intro.mp4"
            },
            {
                "title": "Key Components",
                "content": "Mechanical systems, sensors, actuators, controllers, and software working together.",
                "examples": ["Automotive systems", "Robotics", "Manufacturing automation"]
            }
        ]
    }',
    'theory',
    'mechatronic'::engineering_discipline,
    'beginner'::difficulty_level,
    45,
    75,
    'free',
    1,
    ARRAY['Define mechatronics', 'Identify system components', 'Recognize applications'],
    true,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW(),
    NOW()
),
(
    'a1234567-1234-4321-8765-123456789012',
    'system-architecture-design',
    'System Architecture Design',
    'Learn how to design the overall architecture of mechatronic systems including component selection and integration.',
    '{
        "sections": [
            {
                "title": "Architecture Principles",
                "content": "Hierarchical control, modular design, and interface standardization in mechatronic systems."
            },
            {
                "title": "Design Process",
                "content": "Requirements analysis, system specification, component selection, and integration planning."
            },
            {
                "title": "Case Studies",
                "content": "Real-world examples of mechatronic system architectures in automotive and manufacturing."
            }
        ]
    }',
    'theory',
    'mechatronic'::engineering_discipline,
    'beginner'::difficulty_level,
    60,
    100,
    'free',
    2,
    ARRAY['Design system architecture', 'Select components', 'Plan integration'],
    true,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW(),
    NOW()
),
(
    'a1234567-1234-4321-8765-123456789013',
    'mechanical-electrical-interfaces',
    'Mechanical-Electrical Interfaces',
    'Understanding how mechanical and electrical systems interface in mechatronic applications.',
    '{
        "sections": [
            {
                "title": "Interface Types",
                "content": "Physical, electrical, and communication interfaces between mechanical and electrical components."
            },
            {
                "title": "Power Transmission",
                "content": "Converting electrical power to mechanical motion through motors, solenoids, and actuators."
            },
            {
                "title": "Feedback Systems",
                "content": "Using sensors to monitor mechanical parameters and provide electrical feedback."
            }
        ]
    }',
    'practical',
    'mechatronic'::engineering_discipline,
    'intermediate'::difficulty_level,
    55,
    90,
    'premium',
    3,
    ARRAY['Design interfaces', 'Select actuators', 'Implement feedback'],
    true,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW(),
    NOW()
);

-- Insert lessons for Sensors and Actuators path
INSERT INTO public.lessons (
    id,
    slug,
    title,
    description,
    content,
    lesson_type,
    discipline,
    difficulty,
    estimated_duration_minutes,
    xp_reward,
    access_level,
    order_index,
    learning_objectives,
    is_published,
    learning_path_id,
    created_at,
    updated_at
) VALUES 
(
    'b1234567-1234-4321-8765-123456789011',
    'sensor-types-characteristics',
    'Sensor Types and Characteristics',
    'Comprehensive overview of sensors used in mechatronic systems including selection criteria and characteristics.',
    '{
        "sections": [
            {
                "title": "Position Sensors",
                "content": "Encoders, potentiometers, LVDTs, and their applications in mechatronic systems."
            },
            {
                "title": "Force and Pressure Sensors",
                "content": "Load cells, strain gauges, and pressure transducers for mechanical measurements."
            },
            {
                "title": "Environmental Sensors",
                "content": "Temperature, humidity, and gas sensors for environmental monitoring."
            }
        ]
    }',
    'theory',
    'mechatronic'::engineering_discipline,
    'intermediate'::difficulty_level,
    50,
    85,
    'free',
    1,
    ARRAY['Classify sensor types', 'Select appropriate sensors', 'Understand characteristics'],
    true,
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
),
(
    'b1234567-1234-4321-8765-123456789012',
    'actuator-systems',
    'Actuator Systems',
    'Study of actuators including motors, pneumatics, hydraulics, and their control in mechatronic systems.',
    '{
        "sections": [
            {
                "title": "Electric Motors",
                "content": "DC motors, stepper motors, servo motors, and brushless DC motors for mechatronic applications."
            },
            {
                "title": "Pneumatic Systems",
                "content": "Pneumatic cylinders, valves, and control systems for automation applications."
            },
            {
                "title": "Hydraulic Systems",
                "content": "Hydraulic actuators for high-force applications in mechatronic systems."
            }
        ]
    }',
    'practical',
    'mechatronic'::engineering_discipline,
    'intermediate'::difficulty_level,
    65,
    110,
    'premium',
    2,
    ARRAY['Select actuators', 'Design control circuits', 'Calculate performance'],
    true,
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
);

-- Insert lessons for Embedded Programming path
INSERT INTO public.lessons (
    id,
    slug,
    title,
    description,
    content,
    lesson_type,
    discipline,
    difficulty,
    estimated_duration_minutes,
    xp_reward,
    access_level,
    order_index,
    learning_objectives,
    is_published,
    learning_path_id,
    created_at,
    updated_at
) VALUES 
(
    'c1234567-1234-4321-8765-123456789011',
    'microcontroller-basics',
    'Microcontroller Basics for Mechatronics',
    'Introduction to microcontrollers and their role in mechatronic systems including architecture and programming.',
    '{
        "sections": [
            {
                "title": "Microcontroller Architecture",
                "content": "CPU, memory, I/O ports, timers, and peripherals in microcontrollers used for mechatronics."
            },
            {
                "title": "Programming Fundamentals",
                "content": "C programming for embedded systems, register manipulation, and hardware abstraction."
            },
            {
                "title": "Development Tools",
                "content": "IDEs, compilers, debuggers, and programming tools for embedded development."
            }
        ]
    }',
    'practical',
    'mechatronic'::engineering_discipline,
    'intermediate'::difficulty_level,
    70,
    120,
    'premium',
    1,
    ARRAY['Program microcontrollers', 'Use development tools', 'Interface hardware'],
    true,
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    NOW(),
    NOW()
),
(
    'c1234567-1234-4321-8765-123456789012',
    'real-time-control-systems',
    'Real-Time Control Systems',
    'Implementation of real-time control algorithms on microcontrollers for mechatronic applications.',
    '{
        "sections": [
            {
                "title": "Real-Time Concepts",
                "content": "Real-time constraints, scheduling, and timing requirements in control systems."
            },
            {
                "title": "Control Algorithms",
                "content": "PID control, state feedback, and adaptive control implementation on microcontrollers."
            },
            {
                "title": "System Performance",
                "content": "Optimization techniques for real-time performance and system stability."
            }
        ]
    }',
    'advanced',
    'mechatronic'::engineering_discipline,
    'advanced'::difficulty_level,
    80,
    150,
    'premium',
    2,
    ARRAY['Implement PID control', 'Design real-time systems', 'Optimize performance'],
    true,
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    NOW(),
    NOW()
);

-- Insert lessons for Advanced Robotics path
INSERT INTO public.lessons (
    id,
    slug,
    title,
    description,
    content,
    lesson_type,
    discipline,
    difficulty,
    estimated_duration_minutes,
    xp_reward,
    access_level,
    order_index,
    learning_objectives,
    is_published,
    learning_path_id,
    created_at,
    updated_at
) VALUES 
(
    'd1234567-1234-4321-8765-123456789011',
    'robot-kinematics',
    'Robot Kinematics and Dynamics',
    'Mathematical modeling of robot motion including forward and inverse kinematics for mechatronic systems.',
    '{
        "sections": [
            {
                "title": "Forward Kinematics",
                "content": "Mathematical models to determine end-effector position from joint angles."
            },
            {
                "title": "Inverse Kinematics",
                "content": "Calculating joint angles required to achieve desired end-effector position."
            },
            {
                "title": "Dynamics",
                "content": "Forces and torques in robotic systems and their impact on motion control."
            }
        ]
    }',
    'advanced',
    'mechatronic'::engineering_discipline,
    'advanced'::difficulty_level,
    90,
    180,
    'premium',
    1,
    ARRAY['Calculate kinematics', 'Solve inverse problems', 'Model dynamics'],
    true,
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    NOW(),
    NOW()
),
(
    'd1234567-1234-4321-8765-123456789012',
    'path-planning-algorithms',
    'Path Planning and Motion Control',
    'Advanced algorithms for robot path planning and trajectory generation in mechatronic systems.',
    '{
        "sections": [
            {
                "title": "Path Planning Basics",
                "content": "Configuration space, obstacle avoidance, and optimal path generation."
            },
            {
                "title": "Motion Planning Algorithms",
                "content": "A*, RRT, and other algorithms for automated path planning."
            },
            {
                "title": "Trajectory Control",
                "content": "Smooth trajectory generation and real-time motion control implementation."
            }
        ]
    }',
    'advanced',
    'mechatronic'::engineering_discipline,
    'advanced'::difficulty_level,
    85,
    170,
    'premium',
    2,
    ARRAY['Plan robot paths', 'Implement algorithms', 'Control trajectories'],
    true,
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    NOW(),
    NOW()
);

-- Create achievement types for mechatronic engineering
INSERT INTO public.achievement_types (
    id,
    name,
    description,
    category,
    tier,
    xp_reward,
    icon_name,
    unlock_criteria,
    is_active,
    sort_order,
    created_at
) VALUES
(
    'ach-mech-001',
    'Systems Integrator',
    'Complete the Mechatronic Systems Integration learning path',
    'mechatronic',
    'bronze'::achievement_tier,
    200,
    'cpu',
    '{"learning_path_completed": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}',
    true,
    1,
    NOW()
),
(
    'ach-mech-002',
    'Sensor Master',
    'Complete all sensor and actuator lessons with 90%+ score',
    'mechatronic',
    'silver'::achievement_tier,
    300,
    'radio',
    '{"lessons_completed_with_score": {"path_id": "550e8400-e29b-41d4-a716-446655440001", "min_score": 90}}',
    true,
    2,
    NOW()
),
(
    'ach-mech-003',
    'Embedded Expert',
    'Master embedded programming for mechatronic applications',
    'mechatronic',
    'gold'::achievement_tier,
    500,
    'code',
    '{"learning_path_completed": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"}',
    true,
    3,
    NOW()
),
(
    'ach-mech-004',
    'Robotics Engineer',
    'Complete advanced robotics and automation curriculum',
    'mechatronic',
    'platinum'::achievement_tier,
    750,
    'bot',
    '{"learning_path_completed": "6ba7b811-9dad-11d1-80b4-00c04fd430c8"}',
    true,
    4,
    NOW()
),
(
    'ach-mech-005',
    'Mechatronic Master',
    'Complete all mechatronic engineering learning paths with distinction',
    'mechatronic',
    'diamond'::achievement_tier,
    1000,
    'award',
    '{"all_paths_completed": ["f47ac10b-58cc-4372-a567-0e02b2c3d479", "550e8400-e29b-41d4-a716-446655440001", "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "6ba7b811-9dad-11d1-80b4-00c04fd430c8"], "min_average_score": 85}',
    true,
    5,
    NOW()
);

-- Create skill trees for mechatronic engineering
INSERT INTO public.skill_trees (
    id,
    name,
    description,
    discipline,
    is_active,
    created_at,
    updated_at
) VALUES
(
    'st-mechatronic-001',
    'Mechatronic Systems Mastery',
    'Complete skill tree covering all aspects of mechatronic engineering from basics to advanced robotics',
    'mechatronic',
    true,
    NOW(),
    NOW()
);

-- Create skill nodes for the mechatronic skill tree
INSERT INTO public.skill_nodes (
    id,
    skill_tree_id,
    name,
    description,
    lesson_id,
    prerequisites,
    xp_requirement,
    level_requirement,
    unlock_criteria,
    node_position_x,
    node_position_y,
    created_at,
    updated_at
) VALUES
(
    'sn-mech-001',
    'st-mechatronic-001',
    'System Integration Basics',
    'Foundation skills in mechatronic system integration',
    'a1234567-1234-4321-8765-123456789011',
    '[]',
    0,
    1,
    '{"lesson_completed": "a1234567-1234-4321-8765-123456789011"}',
    100,
    100,
    NOW(),
    NOW()
),
(
    'sn-mech-002',
    'st-mechatronic-001',
    'System Architecture',
    'Advanced system design and architecture skills',
    'a1234567-1234-4321-8765-123456789012',
    '["sn-mech-001"]',
    100,
    2,
    '{"lesson_completed": "a1234567-1234-4321-8765-123456789012"}',
    200,
    100,
    NOW(),
    NOW()
),
(
    'sn-mech-003',
    'st-mechatronic-001',
    'Sensor Technologies',
    'Master various sensor types and applications',
    'b1234567-1234-4321-8765-123456789011',
    '["sn-mech-001"]',
    150,
    3,
    '{"lesson_completed": "b1234567-1234-4321-8765-123456789011"}',
    100,
    200,
    NOW(),
    NOW()
),
(
    'sn-mech-004',
    'st-mechatronic-001',
    'Actuator Control',
    'Advanced actuator selection and control techniques',
    'b1234567-1234-4321-8765-123456789012',
    '["sn-mech-003"]',
    200,
    4,
    '{"lesson_completed": "b1234567-1234-4321-8765-123456789012"}',
    200,
    200,
    NOW(),
    NOW()
),
(
    'sn-mech-005',
    'st-mechatronic-001',
    'Embedded Programming',
    'Microcontroller programming for mechatronic systems',
    'c1234567-1234-4321-8765-123456789011',
    '["sn-mech-002"]',
    250,
    5,
    '{"lesson_completed": "c1234567-1234-4321-8765-123456789011"}',
    300,
    100,
    NOW(),
    NOW()
),
(
    'sn-mech-006',
    'st-mechatronic-001',
    'Real-Time Control',
    'Advanced real-time control system implementation',
    'c1234567-1234-4321-8765-123456789012',
    '["sn-mech-005"]',
    300,
    6,
    '{"lesson_completed": "c1234567-1234-4321-8765-123456789012"}',
    400,
    100,
    NOW(),
    NOW()
),
(
    'sn-mech-007',
    'st-mechatronic-001',
    'Robot Kinematics',
    'Mathematical modeling of robot motion',
    'd1234567-1234-4321-8765-123456789011',
    '["sn-mech-004", "sn-mech-006"]',
    400,
    7,
    '{"lesson_completed": "d1234567-1234-4321-8765-123456789011"}',
    300,
    300,
    NOW(),
    NOW()
),
(
    'sn-mech-008',
    'st-mechatronic-001',
    'Advanced Robotics',
    'Master-level robotics and automation skills',
    'd1234567-1234-4321-8765-123456789012',
    '["sn-mech-007"]',
    500,
    8,
    '{"lesson_completed": "d1234567-1234-4321-8765-123456789012"}',
    400,
    300,
    NOW(),
    NOW()
);

COMMIT;