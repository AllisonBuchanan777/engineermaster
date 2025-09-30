-- Location: supabase/migrations/20250930034517_community_hub_features.sql
-- Schema Analysis: Existing educational platform with user_profiles, lessons, achievements
-- Integration Type: New module - Community features don't exist
-- Dependencies: References existing user_profiles table

-- 1. Community-related types
CREATE TYPE public.discussion_category AS ENUM ('technical', 'career', 'projects', 'general', 'mechanical', 'electrical', 'civil', 'chemical', 'computer', 'aerospace', 'biomedical', 'environmental', 'materials', 'industrial');
CREATE TYPE public.post_status AS ENUM ('active', 'closed', 'archived');
CREATE TYPE public.study_group_status AS ENUM ('open', 'closed', 'full');

-- 2. Discussion forums
CREATE TABLE public.discussion_forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category public.discussion_category NOT NULL,
    icon_name TEXT DEFAULT 'MessageSquare',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Forum posts/topics
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID REFERENCES public.discussion_forums(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status public.post_status DEFAULT 'active',
    is_pinned BOOLEAN DEFAULT false,
    is_solved BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    vote_score INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Post comments/replies
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    is_solution BOOLEAN DEFAULT false,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Study groups
CREATE TABLE public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discipline public.engineering_discipline,
    max_members INTEGER DEFAULT 10,
    current_members INTEGER DEFAULT 1,
    status public.study_group_status DEFAULT 'open',
    meeting_schedule JSONB,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Study group memberships
CREATE TABLE public.study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- 7. Project showcases
CREATE TABLE public.project_showcases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    discipline public.engineering_discipline,
    technologies TEXT[],
    images_urls TEXT[],
    demo_url TEXT,
    source_code_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    vote_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Project comments
CREATE TABLE public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.project_showcases(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Mentorship connections
CREATE TABLE public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    discipline public.engineering_discipline,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentee_id, mentor_id)
);

-- 10. User votes/reactions
CREATE TABLE public.user_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'forum_post', 'comment', 'project'
    target_id UUID NOT NULL,
    vote_value INTEGER NOT NULL, -- -1, 0, 1
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id)
);

-- 11. Essential Indexes
CREATE INDEX idx_discussion_forums_category ON public.discussion_forums(category);
CREATE INDEX idx_forum_posts_forum_id ON public.forum_posts(forum_id);
CREATE INDEX idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX idx_forum_posts_status ON public.forum_posts(status);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_author_id ON public.post_comments(author_id);
CREATE INDEX idx_study_groups_discipline ON public.study_groups(discipline);
CREATE INDEX idx_study_groups_status ON public.study_groups(status);
CREATE INDEX idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX idx_project_showcases_author_id ON public.project_showcases(author_id);
CREATE INDEX idx_project_showcases_discipline ON public.project_showcases(discipline);
CREATE INDEX idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX idx_mentorship_requests_mentee_id ON public.mentorship_requests(mentee_id);
CREATE INDEX idx_mentorship_requests_mentor_id ON public.mentorship_requests(mentor_id);
CREATE INDEX idx_user_votes_user_id ON public.user_votes(user_id);
CREATE INDEX idx_user_votes_target ON public.user_votes(target_type, target_id);

-- 12. RLS Setup
ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies - Following Pattern 4 (Public Read, Private Write) and Pattern 2 (Simple User Ownership)

-- Forums - public readable, admin manageable
CREATE POLICY "public_can_read_discussion_forums"
ON public.discussion_forums
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_manage_discussion_forums"
ON public.discussion_forums
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
));

-- Forum posts - public read, user ownership
CREATE POLICY "public_can_read_forum_posts"
ON public.forum_posts
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "users_manage_own_forum_posts"
ON public.forum_posts
FOR ALL
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Post comments - public read, user ownership
CREATE POLICY "public_can_read_post_comments"
ON public.post_comments
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_post_comments"
ON public.post_comments
FOR ALL
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Study groups - public read, user ownership
CREATE POLICY "public_can_read_study_groups"
ON public.study_groups
FOR SELECT
TO public
USING (status IN ('open', 'full'));

CREATE POLICY "users_manage_own_study_groups"
ON public.study_groups
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Study group members - public read, user ownership
CREATE POLICY "public_can_read_study_group_members"
ON public.study_group_members
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_study_group_members"
ON public.study_group_members
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Project showcases - public read, user ownership
CREATE POLICY "public_can_read_project_showcases"
ON public.project_showcases
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_project_showcases"
ON public.project_showcases
FOR ALL
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Project comments - public read, user ownership
CREATE POLICY "public_can_read_project_comments"
ON public.project_comments
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_project_comments"
ON public.project_comments
FOR ALL
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Mentorship requests - users see own requests only
CREATE POLICY "users_manage_own_mentorship_requests"
ON public.mentorship_requests
FOR ALL
TO authenticated
USING (mentee_id = auth.uid() OR mentor_id = auth.uid())
WITH CHECK (mentee_id = auth.uid() OR mentor_id = auth.uid());

-- User votes - user ownership
CREATE POLICY "users_manage_own_user_votes"
ON public.user_votes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 14. Mock Data - Using existing users
DO $$
DECLARE
    existing_user_id UUID;
    instructor_id UUID;
    forum_id UUID := gen_random_uuid();
    post_id UUID := gen_random_uuid();
    group_id UUID := gen_random_uuid();
    project_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user IDs
    SELECT id INTO existing_user_id FROM public.user_profiles WHERE role = 'student' LIMIT 1;
    SELECT id INTO instructor_id FROM public.user_profiles WHERE role = 'instructor' LIMIT 1;
    
    -- Only proceed if users exist
    IF existing_user_id IS NOT NULL AND instructor_id IS NOT NULL THEN
        -- Insert forums
        INSERT INTO public.discussion_forums (id, name, description, category) VALUES
            (forum_id, 'Mechanical Engineering Discussion', 'Discuss mechanical engineering topics, projects, and career advice', 'mechanical'),
            (gen_random_uuid(), 'Electrical Engineering Forum', 'Share knowledge about circuits, power systems, and electronics', 'electrical'),
            (gen_random_uuid(), 'Career Guidance', 'Get advice on engineering careers, interviews, and professional development', 'career'),
            (gen_random_uuid(), 'Project Collaboration', 'Find teammates and collaborate on engineering projects', 'projects');

        -- Insert sample posts
        INSERT INTO public.forum_posts (id, forum_id, author_id, title, content, tags) VALUES
            (post_id, forum_id, existing_user_id, 'Best practices for CAD design?', 'Looking for tips on improving my CAD workflow and design efficiency. What software and techniques do you recommend?', ARRAY['CAD', 'design', 'software']),
            (gen_random_uuid(), forum_id, instructor_id, 'Thermodynamics study materials', 'Sharing some excellent resources for understanding thermodynamics principles. Links and books inside!', ARRAY['thermodynamics', 'study', 'resources']);

        -- Insert comments
        INSERT INTO public.post_comments (post_id, author_id, content) VALUES
            (post_id, instructor_id, 'I recommend starting with SolidWorks for beginners. Great tutorials available online!'),
            (post_id, existing_user_id, 'Thanks! Any specific tutorial series you would recommend?');

        -- Insert study group
        INSERT INTO public.study_groups (id, name, description, discipline, created_by, meeting_schedule) VALUES
            (group_id, 'Fluid Mechanics Study Group', 'Weekly study sessions covering fluid mechanics concepts and problem solving', 'mechanical', existing_user_id, '{"day": "Wednesday", "time": "7:00 PM", "duration": "2 hours"}');

        -- Insert group membership
        INSERT INTO public.study_group_members (group_id, user_id, role) VALUES
            (group_id, existing_user_id, 'admin'),
            (group_id, instructor_id, 'member');

        -- Insert project showcase
        INSERT INTO public.project_showcases (id, title, description, author_id, discipline, technologies, tags) VALUES
            (project_id, 'Smart Home Automation System', 'IoT-based home automation using Arduino and React web interface. Features include lighting control, temperature monitoring, and security alerts.', existing_user_id, 'electrical', ARRAY['Arduino', 'React', 'IoT', 'JavaScript'], ARRAY['IoT', 'automation', 'electronics']);

        -- Insert project comment
        INSERT INTO public.project_comments (project_id, author_id, content) VALUES
            (project_id, instructor_id, 'Impressive work! The integration between hardware and software is well executed.');

    END IF;
END $$;