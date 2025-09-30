-- Location: supabase/migrations/20250930112912_offline_learning_system.sql
-- Schema Analysis: Existing learning system with lessons, user_profiles, learning_paths, user_lesson_progress
-- Integration Type: New module extending existing learning platform
-- Dependencies: lessons, user_profiles, learning_paths tables

-- 1. Create offline-related ENUMs
CREATE TYPE public.offline_content_status AS ENUM ('pending', 'downloading', 'downloaded', 'failed', 'expired');
CREATE TYPE public.sync_status AS ENUM ('synced', 'pending_sync', 'sync_failed', 'offline_only');

-- 2. Offline Content Downloads table
CREATE TABLE public.offline_content_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL DEFAULT 'lesson',
    download_size_mb DECIMAL(10,2),
    download_progress INTEGER DEFAULT 0,
    status public.offline_content_status DEFAULT 'pending',
    downloaded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    storage_path TEXT, -- Path to the stored offline content
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- 3. Offline Progress Tracking table (for when user is offline)
CREATE TABLE public.offline_progress_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    quiz_scores JSONB DEFAULT '[]',
    notes TEXT,
    status TEXT DEFAULT 'not_started',
    sync_status public.sync_status DEFAULT 'offline_only',
    offline_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_sync_attempt TIMESTAMPTZ,
    sync_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- 4. User Offline Settings table
CREATE TABLE public.user_offline_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    auto_download_enabled BOOLEAN DEFAULT false,
    max_storage_mb INTEGER DEFAULT 1024, -- 1GB default
    download_on_wifi_only BOOLEAN DEFAULT true,
    content_expiry_days INTEGER DEFAULT 30,
    preferred_quality TEXT DEFAULT 'standard', -- standard, high, low
    sync_frequency_hours INTEGER DEFAULT 24,
    last_cleanup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 5. Storage Usage Tracking table
CREATE TABLE public.offline_storage_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    total_used_mb DECIMAL(10,2) DEFAULT 0,
    lesson_content_mb DECIMAL(10,2) DEFAULT 0,
    simulation_files_mb DECIMAL(10,2) DEFAULT 0,
    reference_materials_mb DECIMAL(10,2) DEFAULT 0,
    last_calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 6. Create essential indexes
CREATE INDEX idx_offline_content_downloads_user_id ON public.offline_content_downloads(user_id);
CREATE INDEX idx_offline_content_downloads_lesson_id ON public.offline_content_downloads(lesson_id);
CREATE INDEX idx_offline_content_downloads_status ON public.offline_content_downloads(status);
CREATE INDEX idx_offline_content_downloads_expires_at ON public.offline_content_downloads(expires_at);

CREATE INDEX idx_offline_progress_cache_user_id ON public.offline_progress_cache(user_id);
CREATE INDEX idx_offline_progress_cache_lesson_id ON public.offline_progress_cache(lesson_id);
CREATE INDEX idx_offline_progress_cache_sync_status ON public.offline_progress_cache(sync_status);

CREATE INDEX idx_user_offline_settings_user_id ON public.user_offline_settings(user_id);
CREATE INDEX idx_offline_storage_usage_user_id ON public.offline_storage_usage(user_id);

-- 7. Create storage bucket for offline content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'offline-content',
    'offline-content', 
    false,
    104857600, -- 100MB per file limit
    ARRAY[
        'application/json',
        'text/html',
        'text/plain',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/zip'
    ]
);

-- 8. Enable RLS on all tables
ALTER TABLE public.offline_content_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_progress_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_offline_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_storage_usage ENABLE ROW LEVEL SECURITY;

-- 9. Create functions (must be before RLS policies)
CREATE OR REPLACE FUNCTION public.calculate_storage_usage(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    INSERT INTO public.offline_storage_usage (
        user_id,
        total_used_mb,
        lesson_content_mb,
        last_calculated_at
    )
    SELECT 
        target_user_id,
        COALESCE(SUM(ocd.download_size_mb), 0) as total_used_mb,
        COALESCE(SUM(CASE WHEN ocd.content_type = 'lesson' THEN ocd.download_size_mb ELSE 0 END), 0) as lesson_content_mb,
        CURRENT_TIMESTAMP
    FROM public.offline_content_downloads ocd
    WHERE ocd.user_id = target_user_id
      AND ocd.status = 'downloaded'
    ON CONFLICT (user_id) DO UPDATE SET
        total_used_mb = EXCLUDED.total_used_mb,
        lesson_content_mb = EXCLUDED.lesson_content_mb,
        last_calculated_at = EXCLUDED.last_calculated_at;
END;
$func$;

CREATE OR REPLACE FUNCTION public.sync_offline_progress_to_main(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    synced_count INTEGER := 0;
    progress_record RECORD;
BEGIN
    -- Sync offline progress cache to main user_lesson_progress table
    FOR progress_record IN 
        SELECT * FROM public.offline_progress_cache 
        WHERE user_id = target_user_id AND sync_status = 'offline_only'
    LOOP
        -- Upsert to main progress table
        INSERT INTO public.user_lesson_progress (
            user_id,
            lesson_id,
            completion_percentage,
            time_spent_minutes,
            quiz_scores,
            notes,
            status,
            last_accessed_at,
            updated_at
        )
        VALUES (
            progress_record.user_id,
            progress_record.lesson_id,
            progress_record.completion_percentage,
            progress_record.time_spent_minutes,
            progress_record.quiz_scores,
            progress_record.notes,
            progress_record.status,
            progress_record.offline_timestamp,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completion_percentage = GREATEST(user_lesson_progress.completion_percentage, EXCLUDED.completion_percentage),
            time_spent_minutes = user_lesson_progress.time_spent_minutes + EXCLUDED.time_spent_minutes,
            quiz_scores = EXCLUDED.quiz_scores,
            notes = COALESCE(EXCLUDED.notes, user_lesson_progress.notes),
            status = CASE 
                WHEN EXCLUDED.completion_percentage > user_lesson_progress.completion_percentage 
                THEN EXCLUDED.status 
                ELSE user_lesson_progress.status 
            END,
            last_accessed_at = GREATEST(user_lesson_progress.last_accessed_at, EXCLUDED.last_accessed_at),
            updated_at = CURRENT_TIMESTAMP;

        -- Mark as synced
        UPDATE public.offline_progress_cache 
        SET sync_status = 'synced', last_sync_attempt = CURRENT_TIMESTAMP
        WHERE id = progress_record.id;
        
        synced_count := synced_count + 1;
    END LOOP;

    RETURN synced_count;
END;
$func$;

-- 10. RLS Policies - Using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_offline_downloads"
ON public.offline_content_downloads
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_offline_progress_cache"
ON public.offline_progress_cache
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_offline_settings"
ON public.user_offline_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_storage_usage"
ON public.offline_storage_usage
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Storage bucket RLS policies - Private user storage pattern
CREATE POLICY "users_view_own_offline_content"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'offline-content' 
    AND owner = auth.uid()
);

CREATE POLICY "users_upload_offline_content"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'offline-content'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_update_offline_content"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'offline-content' AND owner = auth.uid())
WITH CHECK (bucket_id = 'offline-content' AND owner = auth.uid());

CREATE POLICY "users_delete_offline_content"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'offline-content' AND owner = auth.uid());

-- 12. Create cleanup trigger function
CREATE OR REPLACE FUNCTION public.cleanup_expired_offline_content()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    -- Mark expired downloads
    UPDATE public.offline_content_downloads 
    SET status = 'expired'
    WHERE expires_at < CURRENT_TIMESTAMP 
      AND status = 'downloaded';
      
    -- Clean old sync attempts
    DELETE FROM public.offline_progress_cache 
    WHERE sync_status = 'synced' 
      AND last_sync_attempt < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$func$;

-- 13. Mock data for testing
DO $$
DECLARE
    existing_user_id UUID;
    existing_lesson_id UUID;
    existing_path_id UUID;
BEGIN
    -- Get existing user and lesson for testing (use existing data)
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_lesson_id FROM public.lessons LIMIT 1;
    SELECT id INTO existing_path_id FROM public.learning_paths LIMIT 1;
    
    IF existing_user_id IS NOT NULL AND existing_lesson_id IS NOT NULL THEN
        -- Create default offline settings for test user
        INSERT INTO public.user_offline_settings (
            user_id,
            auto_download_enabled,
            max_storage_mb,
            download_on_wifi_only,
            content_expiry_days
        ) VALUES (
            existing_user_id,
            true,
            2048, -- 2GB
            true,
            30
        ) ON CONFLICT (user_id) DO NOTHING;

        -- Create sample offline download entry
        INSERT INTO public.offline_content_downloads (
            user_id,
            lesson_id,
            learning_path_id,
            content_type,
            download_size_mb,
            download_progress,
            status,
            downloaded_at,
            expires_at,
            storage_path
        ) VALUES (
            existing_user_id,
            existing_lesson_id,
            existing_path_id,
            'lesson',
            25.5,
            100,
            'downloaded',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + INTERVAL '30 days',
            existing_user_id::text || '/lessons/' || existing_lesson_id::text || '.zip'
        ) ON CONFLICT (user_id, lesson_id) DO NOTHING;

        -- Initialize storage usage
        PERFORM public.calculate_storage_usage(existing_user_id);
        
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation skipped: %', SQLERRM;
END $$;