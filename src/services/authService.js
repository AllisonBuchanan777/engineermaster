import { supabase } from '../lib/supabase';

export const authService = {
  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase?.auth?.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  },

  // Update user activity
  async updateLastActivity(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update({ 
          last_activity_date: new Date()?.toISOString()?.split('T')?.[0],
          updated_at: new Date()?.toISOString()
        })?.eq('id', userId)?.select()?.single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update activity error:', error);
      return { data: null, error };
    }
  },

  // Add XP transaction
  async addXP(userId, amount, source, referenceId = null, description = '') {
    try {
      const { data, error } = await supabase?.from('xp_transactions')?.insert({
          user_id: userId,
          amount,
          source,
          reference_id: referenceId,
          description
        })?.select()?.single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add XP error:', error);
      return { data: null, error };
    }
  },

  // Get user achievements
  async getUserAchievements(userId) {
    try {
      const { data, error } = await supabase?.from('user_achievements')?.select(`
          *,
          achievement_types (
            name,
            description,
            icon_name,
            badge_color,
            xp_reward
          )
        `)?.eq('user_id', userId)?.order('earned_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get achievements error:', error);
      return { data: [], error };
    }
  },

  // Award achievement
  async awardAchievement(userId, achievementId, progressData = {}) {
    try {
      const { data, error } = await supabase?.from('user_achievements')?.insert({
          user_id: userId,
          achievement_id: achievementId,
          progress_data: progressData
        })?.select()?.single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Award achievement error:', error);
      return { data: null, error };
    }
  }
};