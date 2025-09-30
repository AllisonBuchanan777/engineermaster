-- Location: supabase/migrations/20250930112912_admin_cms_notifications.sql
-- Schema Analysis: Engineering learning platform with user management, lessons, achievements
-- Integration Type: NEW_MODULE - Admin CMS and Notifications functionality
-- Dependencies: user_profiles, lessons, achievement_types, subscriptions

-- 1. Custom Types
CREATE TYPE public.notification_type AS ENUM (
  'achievement_earned', 'lesson_completed', 'streak_milestone', 
  'daily_challenge', 'subscription_update', 'community_activity',
  'system_announcement', 'lesson_reminder', 'achievement_progress'
);

CREATE TYPE public.notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE public.admin_action_type AS ENUM (
  'user_management', 'lesson_management', 'achievement_management',
  'subscription_management', 'content_moderation', 'system_settings',
  'analytics_export', 'bulk_operations'
);

CREATE TYPE public.analytics_event_type AS ENUM (
  'lesson_started', 'lesson_completed', 'lesson_failed', 'subscription_purchased',
  'daily_login', 'achievement_earned', 'challenge_completed', 'profile_updated',
  'search_performed', 'page_viewed', 'feature_accessed'
);

-- 2. Core Tables

-- User Notifications
CREATE TABLE public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL DEFAULT 'system_announcement',
    priority public.notification_priority NOT NULL DEFAULT 'normal',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_label TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ
);

-- Admin Audit Logs
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action_type public.admin_action_type NOT NULL,
    action_description TEXT NOT NULL,
    target_resource_type TEXT,
    target_resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    event_type public.analytics_event_type NOT NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notification Templates (for system-wide notifications)
CREATE TABLE public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type public.notification_type NOT NULL,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    default_priority public.notification_priority DEFAULT 'normal',
    action_url_template TEXT,
    action_label TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Notification Preferences
CREATE TABLE public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    daily_reminders BOOLEAN DEFAULT true,
    achievement_alerts BOOLEAN DEFAULT true,
    community_updates BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    notification_types JSONB DEFAULT '{}',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX idx_user_notifications_type ON public.user_notifications(type);
CREATE INDEX idx_user_notifications_priority ON public.user_notifications(priority);

CREATE INDEX idx_admin_audit_logs_admin_user_id ON public.admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_action_type ON public.admin_audit_logs(action_type);
CREATE INDEX idx_admin_audit_logs_target_resource ON public.admin_audit_logs(target_resource_type, target_resource_id);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

CREATE INDEX idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);
CREATE INDEX idx_notification_templates_type ON public.notification_templates(type);
CREATE INDEX idx_notification_templates_name ON public.notification_templates(name);

-- 4. Functions
CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    notification_type public.notification_type,
    notification_title TEXT,
    notification_message TEXT,
    notification_priority public.notification_priority DEFAULT 'normal',
    action_url TEXT DEFAULT NULL,
    action_label TEXT DEFAULT NULL,
    notification_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.user_notifications (
        user_id, type, priority, title, message, 
        action_url, action_label, metadata
    ) VALUES (
        target_user_id, notification_type, notification_priority,
        notification_title, notification_message, action_url, 
        action_label, notification_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
    admin_id UUID,
    action_type public.admin_action_type,
    description TEXT,
    resource_type TEXT DEFAULT NULL,
    resource_id UUID DEFAULT NULL,
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    ip_addr TEXT DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_logs (
        admin_user_id, action_type, action_description,
        target_resource_type, target_resource_id, old_values, 
        new_values, ip_address, user_agent
    ) VALUES (
        admin_id, action_type, description, resource_type,
        resource_id, old_values, new_values, ip_addr::INET, user_agent_string
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_analytics_event(
    event_user_id UUID,
    event_type public.analytics_event_type,
    event_name TEXT,
    event_properties JSONB DEFAULT '{}',
    session_id TEXT DEFAULT NULL,
    page_url TEXT DEFAULT NULL,
    referrer_url TEXT DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL,
    ip_addr TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.analytics_events (
        user_id, event_type, event_name, properties,
        session_id, page_url, referrer_url, user_agent, ip_address
    ) VALUES (
        event_user_id, event_type, event_name, event_properties,
        session_id, page_url, referrer_url, user_agent_string, ip_addr::INET
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- 5. RLS Setup
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- User Notifications - Pattern 2: Simple User Ownership
CREATE POLICY "users_manage_own_notifications"
ON public.user_notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin Audit Logs - Pattern 6A: Role-based using auth metadata
CREATE POLICY "admin_full_access_audit_logs"
ON public.admin_audit_logs
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Analytics Events - Pattern 2: Simple User Ownership + Pattern 6A: Admin access
CREATE POLICY "users_view_own_analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_from_auth());

CREATE POLICY "system_can_create_analytics"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Notification Templates - Pattern 4: Public read, admin manage
CREATE POLICY "public_can_read_notification_templates"
ON public.notification_templates
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_notification_templates"
ON public.notification_templates
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- User Notification Preferences - Pattern 2: Simple User Ownership
CREATE POLICY "users_manage_own_notification_preferences"
ON public.user_notification_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Mock Data
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
    template_id UUID;
    notification_id UUID;
BEGIN
    -- Get existing users
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO regular_user_id FROM public.user_profiles WHERE role = 'student' LIMIT 1;
    
    IF admin_user_id IS NOT NULL AND regular_user_id IS NOT NULL THEN
        -- Create notification templates
        INSERT INTO public.notification_templates (name, type, title_template, message_template, default_priority, action_label)
        VALUES 
            ('achievement_earned', 'achievement_earned', 'Achievement Unlocked!', 'Congratulations! You have earned the {{achievement_name}} achievement.', 'high', 'View Achievement'),
            ('lesson_completed', 'lesson_completed', 'Lesson Complete', 'Great job completing {{lesson_title}}! You earned {{xp_earned}} XP.', 'normal', 'Next Lesson'),
            ('daily_challenge', 'daily_challenge', 'Daily Challenge Available', 'A new daily challenge is available. Complete it to earn bonus XP!', 'normal', 'Start Challenge'),
            ('streak_milestone', 'streak_milestone', 'Streak Milestone', 'Amazing! You have maintained a {{streak_days}} day learning streak!', 'high', 'Keep Going'),
            ('subscription_update', 'subscription_update', 'Subscription Updated', 'Your subscription status has been updated to {{subscription_tier}}.', 'normal', 'View Details');

        -- Create user notification preferences for existing users
        INSERT INTO public.user_notification_preferences (user_id, email_notifications, push_notifications, daily_reminders)
        VALUES 
            (admin_user_id, true, true, false),
            (regular_user_id, true, true, true);

        -- Create sample notifications
        INSERT INTO public.user_notifications (user_id, type, priority, title, message, action_label, metadata)
        VALUES 
            (regular_user_id, 'achievement_earned', 'high', 'Achievement Unlocked!', 'Congratulations! You have earned the First Steps achievement.', 'View Achievement', '{"achievement_id": "00d0aaca-55bd-4d16-ae48-4c846c676cc9"}'),
            (regular_user_id, 'daily_challenge', 'normal', 'Daily Challenge Available', 'Complete today''s challenge to earn 50 bonus XP!', 'Start Challenge', '{"challenge_type": "quiz", "xp_reward": 50}'),
            (regular_user_id, 'lesson_completed', 'normal', 'Lesson Complete', 'Great job completing Introduction to Statics! You earned 50 XP.', 'Next Lesson', '{"lesson_id": "fa790a74-95fb-4ff4-96c8-df1a9decceb6", "xp_earned": 50}');

        -- Create sample admin audit logs
        INSERT INTO public.admin_audit_logs (admin_user_id, action_type, action_description, target_resource_type, target_resource_id, new_values)
        VALUES 
            (admin_user_id, 'lesson_management', 'Published new lesson: Introduction to Statics', 'lessons', 'fa790a74-95fb-4ff4-96c8-df1a9decceb6', '{"is_published": true}'),
            (admin_user_id, 'user_management', 'Updated user profile permissions', 'user_profiles', regular_user_id, '{"role": "student"}'),
            (admin_user_id, 'achievement_management', 'Created new achievement type: First Steps', 'achievement_types', '00d0aaca-55bd-4d16-ae48-4c846c676cc9', '{"name": "First Steps", "tier": "bronze"}');

        -- Create sample analytics events
        INSERT INTO public.analytics_events (user_id, event_type, event_name, properties, page_url)
        VALUES 
            (regular_user_id, 'lesson_started', 'Lesson Started', '{"lesson_id": "fa790a74-95fb-4ff4-96c8-df1a9decceb6", "lesson_title": "Introduction to Statics"}', '/lesson/fa790a74-95fb-4ff4-96c8-df1a9decceb6'),
            (regular_user_id, 'lesson_completed', 'Lesson Completed', '{"lesson_id": "fa790a74-95fb-4ff4-96c8-df1a9decceb6", "completion_time": 1800, "score": 85}', '/lesson/fa790a74-95fb-4ff4-96c8-df1a9decceb6'),
            (regular_user_id, 'daily_login', 'Daily Login', '{"login_time": "morning", "streak_days": 3}', '/dashboard'),
            (regular_user_id, 'achievement_earned', 'Achievement Earned', '{"achievement_id": "00d0aaca-55bd-4d16-ae48-4c846c676cc9", "achievement_name": "First Steps"}', '/dashboard'),
            (regular_user_id, 'page_viewed', 'Page Viewed', '{"page_name": "Dashboard", "session_duration": 300}', '/dashboard');
    END IF;
END $$;