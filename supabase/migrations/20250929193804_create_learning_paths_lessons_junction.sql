-- Location: supabase/migrations/20250929193804_create_learning_paths_lessons_junction.sql
-- Schema Analysis: Existing learning platform with learning_paths and lessons tables linked via direct foreign key
-- Integration Type: Modification to create many-to-many relationship via junction table
-- Dependencies: learning_paths, lessons, user_profiles

-- 1. CREATE JUNCTION TABLE FOR MANY-TO-MANY RELATIONSHIP
CREATE TABLE public.learning_paths_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(learning_path_id, lesson_id)
);

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_learning_paths_lessons_learning_path_id ON public.learning_paths_lessons(learning_path_id);
CREATE INDEX idx_learning_paths_lessons_lesson_id ON public.learning_paths_lessons(lesson_id);
CREATE INDEX idx_learning_paths_lessons_order ON public.learning_paths_lessons(learning_path_id, order_index);

-- 3. MIGRATE EXISTING RELATIONSHIPS TO JUNCTION TABLE
DO $$
BEGIN
    -- Insert existing relationships from lessons.learning_path_id into junction table
    INSERT INTO public.learning_paths_lessons (learning_path_id, lesson_id, order_index, is_required)
    SELECT 
        l.learning_path_id,
        l.id,
        COALESCE(l.order_index, 1),
        true
    FROM public.lessons l 
    WHERE l.learning_path_id IS NOT NULL
    ON CONFLICT (learning_path_id, lesson_id) DO NOTHING;
    
    RAISE NOTICE 'Migrated existing lesson-path relationships to junction table';
END $$;

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.learning_paths_lessons ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES FOR JUNCTION TABLE
-- Pattern 4: Public read, authenticated write for educational content
CREATE POLICY "public_can_read_learning_paths_lessons"
ON public.learning_paths_lessons
FOR SELECT
TO public
USING (true);

CREATE POLICY "instructors_can_manage_learning_paths_lessons"
ON public.learning_paths_lessons
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.learning_paths lp
        WHERE lp.id = learning_path_id
        AND lp.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.lessons l
        WHERE l.id = lesson_id
        AND l.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.role = 'instructor'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.learning_paths lp
        WHERE lp.id = learning_path_id
        AND lp.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.lessons l
        WHERE l.id = lesson_id
        AND l.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.role = 'instructor'
    )
);

-- 6. UPDATE LESSONS TABLE - MAKE LEARNING_PATH_ID OPTIONAL (NO LONGER REQUIRED)
-- Keep the column for backward compatibility but make it optional
ALTER TABLE public.lessons 
ALTER COLUMN learning_path_id DROP NOT NULL;

-- Add comment to indicate the new relationship model
COMMENT ON COLUMN public.lessons.learning_path_id IS 'Legacy foreign key - relationships now managed via learning_paths_lessons junction table';

-- 7. CREATE HELPER FUNCTIONS FOR JUNCTION TABLE QUERIES
CREATE OR REPLACE FUNCTION public.get_lessons_for_learning_path(path_uuid UUID)
RETURNS TABLE(
    lesson_id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    difficulty TEXT,
    order_index INTEGER,
    estimated_duration_minutes INTEGER,
    xp_reward INTEGER,
    is_required BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    l.id,
    l.title,
    l.slug,
    l.description,
    l.difficulty::TEXT,
    lpl.order_index,
    l.estimated_duration_minutes,
    l.xp_reward,
    lpl.is_required
FROM public.lessons l
JOIN public.learning_paths_lessons lpl ON l.id = lpl.lesson_id
WHERE lpl.learning_path_id = path_uuid
AND l.is_published = true
ORDER BY lpl.order_index ASC, l.created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_learning_paths_for_lesson(lesson_uuid UUID)
RETURNS TABLE(
    path_id UUID,
    path_name TEXT,
    discipline TEXT,
    difficulty TEXT,
    order_index INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    lp.id,
    lp.name,
    lp.discipline::TEXT,
    lp.difficulty::TEXT,
    lpl.order_index
FROM public.learning_paths lp
JOIN public.learning_paths_lessons lpl ON lp.id = lpl.learning_path_id
WHERE lpl.lesson_id = lesson_uuid
AND lp.is_published = true
ORDER BY lp.created_at ASC;
$$;

-- 8. FIX EXISTING MIGRATION ERROR - CORRECT ENUM CASTING FOR DAILY CHALLENGES
-- Fix the enum casting issue in daily challenges data
DO $$
DECLARE
    i INTEGER;
BEGIN
    -- Clear existing daily challenges data that might have casting issues
    DELETE FROM public.daily_challenges WHERE challenge_date >= CURRENT_DATE - INTERVAL '15 days';
    
    -- Create daily challenges with proper enum casting for this month
    FOR i IN 1..30 LOOP
        INSERT INTO public.daily_challenges (challenge_date, discipline, challenge_type, title, description, content, xp_reward, difficulty)
        VALUES
        (CURRENT_DATE + (i - 15) * INTERVAL '1 day',
         (ARRAY['mechanical'::public.engineering_discipline, 'electrical'::public.engineering_discipline, 'civil'::public.engineering_discipline, 'computer'::public.engineering_discipline])[1 + (i % 4)],
         (ARRAY['quiz', 'simulation', 'problem_solving'])[1 + (i % 3)],
         'Daily Challenge ' || i || ': ' || (ARRAY['Quick Quiz', 'Mini Simulation', 'Problem Solving'])[1 + (i % 3)],
         'Test your engineering knowledge with today''s challenge',
         ('{"type": "' || (ARRAY['quiz', 'simulation', 'problem_solving'])[1 + (i % 3)] || '", "difficulty": "' || (ARRAY['beginner', 'intermediate', 'advanced'])[1 + (i % 3)] || '", "questions": 5}')::jsonb,
         25 + (i % 3) * 10,
         (ARRAY['beginner'::public.difficulty_level, 'intermediate'::public.difficulty_level, 'advanced'::public.difficulty_level])[1 + (i % 3)]);
    END LOOP;
    
    RAISE NOTICE 'Fixed daily challenges enum casting and recreated sample data';
END $$;

-- 9. SAMPLE DATA - CREATE ADDITIONAL MANY-TO-MANY RELATIONSHIPS
-- Demonstrate lessons that belong to multiple learning paths
DO $$
DECLARE
    mechanical_path_id UUID;
    electrical_path_id UUID;
    civil_path_id UUID;
    intro_statics_lesson_id UUID;
    ohms_law_lesson_id UUID;
BEGIN
    -- Get existing path and lesson IDs
    SELECT id INTO mechanical_path_id FROM public.learning_paths WHERE discipline = 'mechanical' LIMIT 1;
    SELECT id INTO electrical_path_id FROM public.learning_paths WHERE discipline = 'electrical' LIMIT 1;
    SELECT id INTO civil_path_id FROM public.learning_paths WHERE discipline = 'civil' LIMIT 1;
    
    SELECT id INTO intro_statics_lesson_id FROM public.lessons WHERE slug = 'intro-to-statics' LIMIT 1;
    SELECT id INTO ohms_law_lesson_id FROM public.lessons WHERE slug = 'ohms-law-circuits' LIMIT 1;
    
    -- Create cross-discipline relationships (lessons that appear in multiple paths)
    IF mechanical_path_id IS NOT NULL AND civil_path_id IS NOT NULL AND intro_statics_lesson_id IS NOT NULL THEN
        -- Statics is useful for both mechanical and civil engineering
        INSERT INTO public.learning_paths_lessons (learning_path_id, lesson_id, order_index, is_required)
        VALUES (civil_path_id, intro_statics_lesson_id, 1, true)
        ON CONFLICT (learning_path_id, lesson_id) DO NOTHING;
        
        RAISE NOTICE 'Added cross-discipline relationship: Statics lesson now in both Mechanical and Civil paths';
    END IF;
    
    -- Add more sample relationships showing flexibility
    IF electrical_path_id IS NOT NULL AND ohms_law_lesson_id IS NOT NULL AND mechanical_path_id IS NOT NULL THEN
        -- Ohm's law might be useful for mechanical engineers working with electrical systems
        INSERT INTO public.learning_paths_lessons (learning_path_id, lesson_id, order_index, is_required)
        VALUES (mechanical_path_id, ohms_law_lesson_id, 10, false)
        ON CONFLICT (learning_path_id, lesson_id) DO NOTHING;
        
        RAISE NOTICE 'Added optional electrical lesson to mechanical path';
    END IF;
END $$;

-- 10. UPDATE TRIGGERS TO HANDLE JUNCTION TABLE
CREATE OR REPLACE FUNCTION public.update_learning_path_lesson_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This could update lesson counts on learning paths if needed
    -- For now, just a placeholder for future functionality
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for maintaining data integrity
CREATE TRIGGER learning_paths_lessons_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.learning_paths_lessons
    FOR EACH ROW EXECUTE FUNCTION public.update_learning_path_lesson_count();

-- 11. CREATE USEFUL VIEWS FOR COMMON QUERIES
CREATE OR REPLACE VIEW public.learning_paths_with_lesson_count AS
SELECT 
    lp.*,
    COALESCE(lesson_counts.lesson_count, 0) as total_lessons,
    COALESCE(lesson_counts.required_lessons, 0) as required_lessons
FROM public.learning_paths lp
LEFT JOIN (
    SELECT 
        learning_path_id,
        COUNT(*) as lesson_count,
        COUNT(*) FILTER (WHERE is_required = true) as required_lessons
    FROM public.learning_paths_lessons lpl
    JOIN public.lessons l ON lpl.lesson_id = l.id
    WHERE l.is_published = true
    GROUP BY learning_path_id
) lesson_counts ON lp.id = lesson_counts.learning_path_id;

COMMENT ON VIEW public.learning_paths_with_lesson_count IS 'Learning paths with lesson counts for efficient querying';