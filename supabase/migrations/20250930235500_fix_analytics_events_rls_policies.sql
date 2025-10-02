-- Location: supabase/migrations/20250930235500_fix_analytics_events_rls_policies.sql
-- Schema Analysis: analytics_events table exists with user_id FK to user_profiles
-- Integration Type: modificative - fixing existing RLS policies
-- Dependencies: analytics_events table, user_profiles table

-- Fix RLS policies for analytics_events to allow proper tracking
-- Drop existing problematic policies
DROP POLICY IF EXISTS "system_can_create_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "users_view_own_analytics" ON public.analytics_events;

-- Pattern 3: Operation-specific policies for analytics tracking
-- Allow authenticated users to create their own analytics events
CREATE POLICY "authenticated_users_create_analytics"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow anonymous users to create analytics events (for tracking purposes)
CREATE POLICY "anonymous_users_create_analytics" 
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to view their own analytics events
CREATE POLICY "users_view_own_analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all analytics events using auth metadata
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

CREATE POLICY "admins_view_all_analytics"
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