import { supabase } from '../lib/supabase';

// Discussion Forums
export const forumService = {
  async getForums() {
    try {
      const { data, error } = await supabase?.from('discussion_forums')?.select('*')?.eq('is_active', true)?.order('name');
      
      if (error) {
        console.error('Error fetching forums:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async getForumPosts(forumId, limit = 20) {
    try {
      const { data, error } = await supabase?.from('forum_posts')?.select(`
          *,
          author:user_profiles(id, full_name, avatar_url),
          _count:post_comments(count)
        `)?.eq('forum_id', forumId)?.eq('status', 'active')?.order('created_at', { ascending: false })?.limit(limit);
      
      if (error) {
        console.error('Error fetching forum posts:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async createPost(postData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('forum_posts')?.insert({
          ...postData,
          author_id: user?.user?.id
        })?.select()?.single();
      
      if (error) {
        console.error('Error creating post:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async getPostComments(postId) {
    try {
      const { data, error } = await supabase?.from('post_comments')?.select(`
          *,
          author:user_profiles(id, full_name, avatar_url)
        `)?.eq('post_id', postId)?.order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async createComment(commentData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('post_comments')?.insert({
          ...commentData,
          author_id: user?.user?.id
        })?.select()?.single();
      
      if (error) {
        console.error('Error creating comment:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  }
};

// Study Groups
export const studyGroupService = {
  async getStudyGroups(discipline = null) {
    try {
      let query = supabase?.from('study_groups')?.select(`
          *,
          created_by_user:user_profiles!created_by(id, full_name, avatar_url),
          members:study_group_members(count)
        `)?.in('status', ['open', 'full'])?.order('created_at', { ascending: false });

      if (discipline) {
        query = query?.eq('discipline', discipline);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching study groups:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async createStudyGroup(groupData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('study_groups')?.insert({
          ...groupData,
          created_by: user?.user?.id
        })?.select()?.single();
      
      if (error) {
        console.error('Error creating study group:', error);
        return { data: null, error };
      }
      
      // Add creator as admin member
      await supabase?.from('study_group_members')?.insert({
          group_id: data?.id,
          user_id: user?.user?.id,
          role: 'admin'
        });
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async joinStudyGroup(groupId) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('study_group_members')?.insert({
          group_id: groupId,
          user_id: user?.user?.id,
          role: 'member'
        })?.select()?.single();
      
      if (error) {
        console.error('Error joining study group:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  }
};

// Project Showcases
export const projectService = {
  async getProjects(discipline = null, featured = false) {
    try {
      let query = supabase?.from('project_showcases')?.select(`
          *,
          author:user_profiles(id, full_name, avatar_url),
          comments:project_comments(count)
        `)?.order('created_at', { ascending: false });

      if (discipline) {
        query = query?.eq('discipline', discipline);
      }

      if (featured) {
        query = query?.eq('is_featured', true);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching projects:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async createProject(projectData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('project_showcases')?.insert({
          ...projectData,
          author_id: user?.user?.id
        })?.select()?.single();
      
      if (error) {
        console.error('Error creating project:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async getProjectComments(projectId) {
    try {
      const { data, error } = await supabase?.from('project_comments')?.select(`
          *,
          author:user_profiles(id, full_name, avatar_url)
        `)?.eq('project_id', projectId)?.order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching project comments:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async voteOnProject(projectId, voteValue) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('user_votes')?.upsert({
          user_id: user?.user?.id,
          target_type: 'project',
          target_id: projectId,
          vote_value: voteValue
        })?.select()?.single();
      
      if (error) {
        console.error('Error voting on project:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  }
};

// Mentorship
export const mentorshipService = {
  async createMentorshipRequest(mentorId, discipline, message) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('mentorship_requests')?.insert({
          mentee_id: user?.user?.id,
          mentor_id: mentorId,
          discipline,
          message,
          status: 'pending'
        })?.select()?.single();
      
      if (error) {
        console.error('Error creating mentorship request:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  },

  async getMentorshipRequests() {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('mentorship_requests')?.select(`
          *,
          mentee:user_profiles!mentee_id(id, full_name, avatar_url),
          mentor:user_profiles!mentor_id(id, full_name, avatar_url)
        `)?.or(`mentee_id.eq.${user?.user?.id},mentor_id.eq.${user?.user?.id}`)?.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching mentorship requests:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, error };
    }
  }
};

// Real-time subscriptions
export const subscribeToForumUpdates = (forumId, callback) => {
  const channel = supabase?.channel(`forum-${forumId}`)?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'forum_posts',
        filter: `forum_id=eq.${forumId}`
      },
      callback
    )?.subscribe();

  return () => supabase?.removeChannel(channel);
};

export const subscribeToProjectUpdates = (callback) => {
  const channel = supabase?.channel('projects')?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_showcases'
      },
      callback
    )?.subscribe();

  return () => supabase?.removeChannel(channel);
};