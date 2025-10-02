-- Location: supabase/migrations/20250930153400_optimize_lesson_discipline_filtering.sql
-- Schema Analysis: Lessons table already has discipline column and index
-- Integration Type: Enhancement - ensuring data consistency and adding optimized functions
-- Dependencies: lessons, learning_paths tables

-- Ensure all lessons have discipline values from their learning paths
-- Backfill any missing discipline data
DO $$
DECLARE
    lesson_record RECORD;
BEGIN
    -- Update lessons that have NULL discipline by copying from their learning path
    FOR lesson_record IN 
        SELECT l.id, lp.discipline 
        FROM public.lessons l
        JOIN public.learning_paths lp ON l.learning_path_id = lp.id
        WHERE l.discipline IS NULL AND lp.discipline IS NOT NULL
    LOOP
        UPDATE public.lessons 
        SET discipline = lesson_record.discipline,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = lesson_record.id;
    END LOOP;
    
    -- Log the backfill completion
    RAISE NOTICE 'Lesson discipline backfill completed successfully';
END $$;

-- Create optimized function for discipline-based lesson filtering
CREATE OR REPLACE FUNCTION public.get_lessons_by_discipline(
    target_discipline TEXT,
    user_id_param UUID DEFAULT NULL,
    published_only BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    title TEXT,
    description TEXT,
    difficulty public.difficulty_level,
    discipline TEXT,
    estimated_duration_minutes INTEGER,
    xp_reward INTEGER,
    access_level TEXT,
    is_published BOOLEAN,
    created_at TIMESTAMPTZ,
    learning_path_id UUID,
    learning_path_name TEXT,
    user_completion_percentage INTEGER,
    user_status TEXT
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
        l.discipline,
        l.estimated_duration_minutes,
        l.xp_reward,
        l.access_level,
        l.is_published,
        l.created_at,
        l.learning_path_id,
        lp.name as learning_path_name,
        COALESCE(ulp.completion_percentage, 0)::INTEGER as user_completion_percentage,
        COALESCE(ulp.status, 'not_started')::TEXT as user_status
    FROM public.lessons l
    JOIN public.learning_paths lp ON l.learning_path_id = lp.id
    LEFT JOIN public.user_lesson_progress ulp ON (
        l.id = ulp.lesson_id 
        AND ulp.user_id = user_id_param
    )
    WHERE l.discipline = target_discipline
    AND (NOT published_only OR l.is_published = true)
    ORDER BY l.order_index, l.created_at;
END;
$$;

-- Create function for advanced discipline-based filtering with progress stats
CREATE OR REPLACE FUNCTION public.get_discipline_lesson_stats(
    target_discipline TEXT,
    user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
    discipline TEXT,
    total_lessons INTEGER,
    published_lessons INTEGER,
    completed_lessons INTEGER,
    in_progress_lessons INTEGER,
    average_xp_reward INTEGER,
    total_estimated_hours DECIMAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.discipline,
        COUNT(*)::INTEGER as total_lessons,
        COUNT(CASE WHEN l.is_published THEN 1 END)::INTEGER as published_lessons,
        COUNT(CASE WHEN ulp.completion_percentage = 100 THEN 1 END)::INTEGER as completed_lessons,
        COUNT(CASE WHEN ulp.completion_percentage > 0 AND ulp.completion_percentage < 100 THEN 1 END)::INTEGER as in_progress_lessons,
        COALESCE(AVG(l.xp_reward), 0)::INTEGER as average_xp_reward,
        COALESCE(SUM(l.estimated_duration_minutes), 0)::DECIMAL / 60 as total_estimated_hours
    FROM public.lessons l
    LEFT JOIN public.user_lesson_progress ulp ON (
        l.id = ulp.lesson_id 
        AND ulp.user_id = user_id_param
    )
    WHERE l.discipline = target_discipline
    GROUP BY l.discipline;
END;
$$;

-- Create function to get lessons by multiple disciplines (for mixed curricula)
CREATE OR REPLACE FUNCTION public.get_lessons_by_disciplines(
    target_disciplines TEXT[],
    user_id_param UUID DEFAULT NULL,
    limit_param INTEGER DEFAULT 50,
    offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    title TEXT,
    discipline TEXT,
    difficulty public.difficulty_level,
    xp_reward INTEGER,
    learning_path_name TEXT,
    user_completion_percentage INTEGER
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
        l.discipline,
        l.difficulty,
        l.xp_reward,
        lp.name as learning_path_name,
        COALESCE(ulp.completion_percentage, 0)::INTEGER as user_completion_percentage
    FROM public.lessons l
    JOIN public.learning_paths lp ON l.learning_path_id = lp.id
    LEFT JOIN public.user_lesson_progress ulp ON (
        l.id = ulp.lesson_id 
        AND ulp.user_id = user_id_param
    )
    WHERE l.discipline = ANY(target_disciplines)
    AND l.is_published = true
    ORDER BY l.discipline, l.order_index, l.created_at
    LIMIT limit_param OFFSET offset_param;
END;
$$;

-- Create trigger to auto-set discipline on new lesson creation
CREATE OR REPLACE FUNCTION public.auto_set_lesson_discipline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If discipline is not provided, get it from the learning path
    IF NEW.discipline IS NULL AND NEW.learning_path_id IS NOT NULL THEN
        SELECT discipline INTO NEW.discipline
        FROM public.learning_paths
        WHERE id = NEW.learning_path_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS set_lesson_discipline ON public.lessons;
CREATE TRIGGER set_lesson_discipline
    BEFORE INSERT OR UPDATE OF learning_path_id ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_lesson_discipline();

-- Add comment for documentation
COMMENT ON FUNCTION public.get_lessons_by_discipline IS 'Optimized function to get lessons filtered by discipline directly, eliminating subqueries on learning_paths';
COMMENT ON FUNCTION public.get_discipline_lesson_stats IS 'Get comprehensive statistics for lessons in a specific discipline';
COMMENT ON FUNCTION public.get_lessons_by_disciplines IS 'Get lessons from multiple disciplines with pagination support';