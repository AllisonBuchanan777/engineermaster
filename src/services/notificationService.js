import { supabase } from '../lib/supabase';

export const notificationService = {
  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        unreadOnly = false, 
        type = null,
        priority = null 
      } = options;

      let query = supabase
        ?.from('user_notifications')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query?.eq('is_read', false);
      }

      if (type) {
        query = query?.eq('type', type);
      }

      if (priority) {
        query = query?.eq('priority', priority);
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
      console.error('Get notifications error:', error);
      return { data: [], error };
    }
  },

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        ?.from('user_notifications')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('user_id', userId)
        ?.eq('is_read', false)
        ?.eq('is_dismissed', false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { count: 0, error };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_notifications')
        ?.update({ 
          is_read: true, 
          read_at: new Date()?.toISOString() 
        })
        ?.eq('id', notificationId)
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { data: null, error };
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_notifications')
        ?.update({ 
          is_read: true, 
          read_at: new Date()?.toISOString() 
        })
        ?.eq('user_id', userId)
        ?.eq('is_read', false)
        ?.select();

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { data: [], error };
    }
  },

  // Dismiss notification
  async dismissNotification(notificationId, userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_notifications')
        ?.update({ 
          is_dismissed: true, 
          dismissed_at: new Date()?.toISOString() 
        })
        ?.eq('id', notificationId)
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Dismiss notification error:', error);
      return { data: null, error };
    }
  },

  // Create notification
  async createNotification(notification) {
    try {
      const { data, error } = await supabase
        ?.from('user_notifications')
        ?.insert({
          user_id: notification?.userId,
          type: notification?.type || 'system_announcement',
          priority: notification?.priority || 'normal',
          title: notification?.title,
          message: notification?.message,
          action_url: notification?.actionUrl,
          action_label: notification?.actionLabel,
          metadata: notification?.metadata || {},
          expires_at: notification?.expiresAt
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create notification error:', error);
      return { data: null, error };
    }
  },

  // Get user notification preferences
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_notification_preferences')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error) {
        // If no preferences exist, create default ones
        if (error?.code === 'PGRST116') {
          const { data: newPrefs, error: createError } = await supabase
            ?.from('user_notification_preferences')
            ?.insert({
              user_id: userId,
              email_notifications: true,
              push_notifications: true,
              daily_reminders: true,
              achievement_alerts: true,
              community_updates: true,
              marketing_emails: false
            })
            ?.select()
            ?.single();

          if (createError) throw createError;
          return { data: newPrefs, error: null };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get user preferences error:', error);
      return { data: null, error };
    }
  },

  // Update user notification preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        ?.from('user_notification_preferences')
        ?.update({
          ...preferences,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { data: null, error };
    }
  },

  // Get notification by category
  async getNotificationsByCategory(userId, category) {
    try {
      const { data, error } = await supabase
        ?.from('user_notifications')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('type', category)
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get notifications by category error:', error);
      return { data: [], error };
    }
  },

  // Delete old notifications (cleanup)
  async deleteOldNotifications(userId, daysBefore = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate?.setDate(cutoffDate?.getDate() - daysBefore);

      const { data, error } = await supabase
        ?.from('user_notifications')
        ?.delete()
        ?.eq('user_id', userId)
        ?.eq('is_read', true)
        ?.lt('created_at', cutoffDate?.toISOString())
        ?.select();

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Delete old notifications error:', error);
      return { data: [], error };
    }
  }
};