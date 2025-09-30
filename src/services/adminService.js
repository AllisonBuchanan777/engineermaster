import { supabase } from '../lib/supabase';

export const adminService = {
  // Get admin audit logs
  async getAuditLogs(options = {}) {
    try {
      const { 
        limit = 100, 
        offset = 0, 
        actionType = null,
        adminUserId = null,
        startDate = null,
        endDate = null 
      } = options;

      let query = supabase
        ?.from('admin_audit_logs')
        ?.select(`
          *,
          admin_user:user_profiles!admin_user_id (
            full_name,
            email,
            role
          )
        `)
        ?.order('created_at', { ascending: false });

      if (actionType) {
        query = query?.eq('action_type', actionType);
      }

      if (adminUserId) {
        query = query?.eq('admin_user_id', adminUserId);
      }

      if (startDate) {
        query = query?.gte('created_at', startDate);
      }

      if (endDate) {
        query = query?.lte('created_at', endDate);
      }

      if (limit) {
        query = query?.limit(limit);
      }

      if (offset) {
        query = query?.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get audit logs error:', error);
      return { data: [], error };
    }
  },

  // Log admin action
  async logAction(adminUserId, actionType, description, options = {}) {
    try {
      const { data, error } = await supabase
        ?.from('admin_audit_logs')
        ?.insert({
          admin_user_id: adminUserId,
          action_type: actionType,
          action_description: description,
          target_resource_type: options?.resourceType,
          target_resource_id: options?.resourceId,
          old_values: options?.oldValues || {},
          new_values: options?.newValues || {},
          ip_address: options?.ipAddress,
          user_agent: options?.userAgent,
          session_id: options?.sessionId
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Log admin action error:', error);
      return { data: null, error };
    }
  },

  // Get system statistics
  async getSystemStats() {
    try {
      // Get user counts
      const { count: totalUsers, error: userError } = await supabase
        ?.from('user_profiles')
        ?.select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Get active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);

      const { count: activeUsers, error: activeError } = await supabase
        ?.from('user_profiles')
        ?.select('*', { count: 'exact', head: true })
        ?.gte('last_activity_date', thirtyDaysAgo?.toISOString()?.split('T')?.[0]);

      if (activeError) throw activeError;

      // Get lesson counts
      const { count: totalLessons, error: lessonError } = await supabase
        ?.from('lessons')
        ?.select('*', { count: 'exact', head: true });

      if (lessonError) throw lessonError;

      // Get published lessons
      const { count: publishedLessons, error: publishedError } = await supabase
        ?.from('lessons')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('is_published', true);

      if (publishedError) throw publishedError;

      // Get subscription counts
      const { count: totalSubscriptions, error: subError } = await supabase
        ?.from('user_subscriptions')
        ?.select('*', { count: 'exact', head: true });

      if (subError) throw subError;

      return {
        data: {
          users: {
            total: totalUsers || 0,
            active: activeUsers || 0,
            inactive: (totalUsers || 0) - (activeUsers || 0)
          },
          lessons: {
            total: totalLessons || 0,
            published: publishedLessons || 0,
            draft: (totalLessons || 0) - (publishedLessons || 0)
          },
          subscriptions: {
            total: totalSubscriptions || 0
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Get system stats error:', error);
      return { data: null, error };
    }
  },

  // Get user management data
  async getUsers(options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        role = null,
        search = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      let query = supabase
        ?.from('user_profiles')
        ?.select(`
          *,
          user_subscriptions (
            tier,
            status,
            created_at
          )
        `)
        ?.order(sortBy, { ascending: sortOrder === 'asc' });

      if (role) {
        query = query?.eq('role', role);
      }

      if (search) {
        query = query?.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (limit) {
        query = query?.limit(limit);
      }

      if (offset) {
        query = query?.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get users error:', error);
      return { data: [], error };
    }
  },

  // Update user role/status
  async updateUser(userId, updates, adminUserId) {
    try {
      // Get current user data for audit log
      const { data: currentUser, error: getCurrentError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single();

      if (getCurrentError) throw getCurrentError;

      // Update user
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (error) throw error;

      // Log the action
      await this?.logAction(
        adminUserId,
        'user_management',
        `Updated user profile for ${currentUser?.full_name}`,
        {
          resourceType: 'user_profiles',
          resourceId: userId,
          oldValues: currentUser,
          newValues: data
        }
      );

      return { data, error: null };
    } catch (error) {
      console.error('Update user error:', error);
      return { data: null, error };
    }
  },

  // Get lesson management data
  async getLessonsForAdmin(options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        isPublished = null,
        difficulty = null,
        search = null
      } = options;

      let query = supabase
        ?.from('lessons')
        ?.select(`
          *,
          created_by_user:user_profiles!created_by (
            full_name,
            email
          ),
          learning_path:learning_paths (
            title
          )
        `)
        ?.order('updated_at', { ascending: false });

      if (isPublished !== null) {
        query = query?.eq('is_published', isPublished);
      }

      if (difficulty) {
        query = query?.eq('difficulty', difficulty);
      }

      if (search) {
        query = query?.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (limit) {
        query = query?.limit(limit);
      }

      if (offset) {
        query = query?.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get lessons for admin error:', error);
      return { data: [], error };
    }
  },

  // Update lesson
  async updateLesson(lessonId, updates, adminUserId) {
    try {
      // Get current lesson data for audit log
      const { data: currentLesson, error: getCurrentError } = await supabase
        ?.from('lessons')
        ?.select('*')
        ?.eq('id', lessonId)
        ?.single();

      if (getCurrentError) throw getCurrentError;

      // Update lesson
      const { data, error } = await supabase
        ?.from('lessons')
        ?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', lessonId)
        ?.select()
        ?.single();

      if (error) throw error;

      // Log the action
      await this?.logAction(
        adminUserId,
        'lesson_management',
        `Updated lesson: ${currentLesson?.title}`,
        {
          resourceType: 'lessons',
          resourceId: lessonId,
          oldValues: { title: currentLesson?.title, is_published: currentLesson?.is_published },
          newValues: { title: data?.title, is_published: data?.is_published }
        }
      );

      return { data, error: null };
    } catch (error) {
      console.error('Update lesson error:', error);
      return { data: null, error };
    }
  },

  // Get analytics overview
  async getAnalyticsOverview(days = 30) {
    try {
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - days);

      // Get analytics events for the period
      const { data: events, error: eventsError } = await supabase
        ?.from('analytics_events')
        ?.select('event_type, created_at, user_id')
        ?.gte('created_at', startDate?.toISOString())
        ?.order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Process events data
      const eventsByType = {};
      const dailyActivity = {};
      const uniqueUsers = new Set();

      events?.forEach(event => {
        // Count by event type
        eventsByType[event?.event_type] = (eventsByType?.[event?.event_type] || 0) + 1;
        
        // Count daily activity
        const date = event?.created_at?.split('T')?.[0];
        dailyActivity[date] = (dailyActivity?.[date] || 0) + 1;
        
        // Track unique users
        if (event?.user_id) {
          uniqueUsers?.add(event?.user_id);
        }
      });

      return {
        data: {
          totalEvents: events?.length || 0,
          uniqueUsers: uniqueUsers?.size || 0,
          eventsByType,
          dailyActivity,
          period: days
        },
        error: null
      };
    } catch (error) {
      console.error('Get analytics overview error:', error);
      return { data: null, error };
    }
  }
};