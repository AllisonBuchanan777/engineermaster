-- Location: supabase/migrations/20251001194300_fix_analytics_events_rls_policies_v2.sql  
-- Schema Analysis: analytics_events table exists with user_id FK to user_profiles
-- Integration Type: modificative - fixing existing RLS policies that are causing violations
-- Dependencies: analytics_events table, user_profiles table

-- Fix RLS policies for analytics_events to resolve policy violations
-- First drop all existing policies to start clean
DROP POLICY IF EXISTS "users_view_own_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "service_role_full_access_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "admins_view_all_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "anonymous_users_create_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "authenticated_users_create_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "system_can_create_analytics" ON public.analytics_events;

-- Ensure the admin function exists with proper implementation
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Pattern 3: Operation-specific policies for analytics tracking
-- Allow anonymous users to INSERT analytics events (for tracking purposes)
CREATE POLICY "anon_can_create_analytics"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to INSERT their own analytics events or anonymous events
CREATE POLICY "authenticated_can_create_analytics"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow authenticated users to SELECT their own analytics events
CREATE POLICY "authenticated_can_view_own_analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to SELECT all analytics events using auth metadata (no circular dependency)
CREATE POLICY "admins_can_view_all_analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.is_admin_from_auth());

-- Allow service role full access for backend operations
CREATE POLICY "service_role_full_access_analytics"
ON public.analytics_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a helper function for analytics tracking that works with current policies
CREATE OR REPLACE FUNCTION public.track_analytics_event(
    p_event_name text,
    p_event_type public.analytics_event_type,
    p_page_url text DEFAULT NULL,
    p_properties jsonb DEFAULT '{}'::jsonb,
    p_referrer_url text DEFAULT NULL,
    p_session_id text DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
INSERT INTO public.analytics_events (
    event_name,
    event_type,
    page_url,
    properties,
    referrer_url,
    session_id,
    user_agent,
    user_id
) VALUES (
    p_event_name,
    p_event_type,
    p_page_url,
    p_properties,
    p_referrer_url,
    p_session_id,
    p_user_agent,
    COALESCE(p_user_id, auth.uid())
) RETURNING id;
$$;