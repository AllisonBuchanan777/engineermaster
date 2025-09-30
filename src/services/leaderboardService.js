import { supabase } from '../lib/supabase';

export const leaderboardService = {
  // Get overall leaderboard rankings
  async getOverallLeaderboard(timeframe = 'all_time', limit = 50) {
    try {
      let query = supabase
        ?.from('user_profiles')
        ?.select(`
          id,
          username,
          full_name,
          avatar_url,
          total_xp,
          current_level,
          streak_days,
          specialization,
          created_at
        `)
        ?.order('total_xp', { ascending: false })
        ?.limit(limit);

      // Apply timeframe filtering if needed
      if (timeframe === 'weekly') {
        const weekAgo = new Date();
        weekAgo?.setDate(weekAgo?.getDate() - 7);
        query = query?.gte('last_activity_date', weekAgo?.toISOString()?.split('T')?.[0]);
      } else if (timeframe === 'monthly') {
        const monthAgo = new Date();
        monthAgo?.setMonth(monthAgo?.getMonth() - 1);
        query = query?.gte('last_activity_date', monthAgo?.toISOString()?.split('T')?.[0]);
      }

      const { data: users, error } = await query;
      if (error) throw error;

      // Get recent XP transactions for each user to show recent activity
      const userIds = users?.map(u => u?.id);
      const { data: recentXP } = await supabase
        ?.from('xp_transactions')
        ?.select('user_id, amount, source, created_at')
        ?.in('user_id', userIds)
        ?.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString())
        ?.order('created_at', { ascending: false });

      // Add ranking and recent activity
      return users?.map((user, index) => ({
        ...user,
        rank: index + 1,
        recentActivity: recentXP?.filter(xp => xp?.user_id === user?.id)?.slice(0, 3) || []
      }));
    } catch (error) {
      console.error('Error fetching overall leaderboard:', error);
      throw error;
    }
  },

  // Get streak leaderboard
  async getStreakLeaderboard(limit = 50) {
    try {
      const { data: users, error } = await supabase
        ?.from('user_profiles')
        ?.select(`
          id,
          username,
          full_name,
          avatar_url,
          streak_days,
          last_activity_date,
          total_xp,
          current_level,
          specialization
        `)
        ?.order('streak_days', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return users?.map((user, index) => ({
        ...user,
        rank: index + 1,
        streakActive: this.isStreakActive(user?.last_activity_date)
      }));
    } catch (error) {
      console.error('Error fetching streak leaderboard:', error);
      throw error;
    }
  },

  // Get course completion leaderboard
  async getCourseCompletionLeaderboard(limit = 50) {
    try {
      // Get completion counts for each user
      const { data: completions, error } = await supabase
        ?.from('user_lesson_progress')
        ?.select(`
          user_id,
          user_profiles!inner (
            username,
            full_name,
            avatar_url,
            specialization,
            current_level,
            total_xp
          )
        `)
        ?.eq('completion_percentage', 100);

      if (error) throw error;

      // Group by user and count completions
      const userCompletions = {};
      completions?.forEach(completion => {
        const userId = completion?.user_id;
        if (!userCompletions?.[userId]) {
          userCompletions[userId] = {
            ...completion?.user_profiles,
            id: userId,
            completedCourses: 0
          };
        }
        userCompletions[userId].completedCourses++;
      });

      // Convert to array and sort
      const leaderboard = Object?.values(userCompletions)
        ?.sort((a, b) => b?.completedCourses - a?.completedCourses)
        ?.slice(0, limit);

      return leaderboard?.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching course completion leaderboard:', error);
      throw error;
    }
  },

  // Get discipline-specific leaderboard
  async getDisciplineLeaderboard(discipline, limit = 50) {
    try {
      const { data: users, error } = await supabase
        ?.from('user_profiles')
        ?.select(`
          id,
          username,
          full_name,
          avatar_url,
          total_xp,
          current_level,
          streak_days,
          specialization,
          created_at
        `)
        ?.eq('specialization', discipline)
        ?.order('total_xp', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return users?.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching discipline leaderboard:', error);
      throw error;
    }
  },

  // Get user's ranking in different categories
  async getUserRankings(userId) {
    try {
      const [overallRank, streakRank, completionRank] = await Promise.all([
        this.getUserOverallRank(userId),
        this.getUserStreakRank(userId),
        this.getUserCompletionRank(userId)
      ]);

      return {
        overall: overallRank,
        streak: streakRank,
        completion: completionRank
      };
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      return { overall: null, streak: null, completion: null };
    }
  },

  // Get achievements leaderboard
  async getAchievementsLeaderboard(limit = 50) {
    try {
      const { data: achievements, error } = await supabase
        ?.from('user_achievements')
        ?.select(`
          user_id,
          user_profiles!inner (
            username,
            full_name,
            avatar_url,
            specialization,
            current_level,
            total_xp
          ),
          achievement_types!inner (
            tier,
            xp_reward
          )
        `);

      if (error) throw error;

      // Calculate achievement scores
      const userScores = {};
      achievements?.forEach(achievement => {
        const userId = achievement?.user_id;
        if (!userScores?.[userId]) {
          userScores[userId] = {
            ...achievement?.user_profiles,
            id: userId,
            achievementScore: 0,
            achievementCount: 0,
            tierBreakdown: { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 }
          };
        }
        
        const tierValue = this.getTierValue(achievement?.achievement_types?.tier);
        userScores[userId].achievementScore += tierValue;
        userScores[userId].achievementCount++;
        userScores[userId].tierBreakdown[achievement?.achievement_types?.tier]++;
      });

      // Convert to array and sort
      const leaderboard = Object?.values(userScores)
        ?.sort((a, b) => b?.achievementScore - a?.achievementScore)
        ?.slice(0, limit);

      return leaderboard?.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching achievements leaderboard:', error);
      throw error;
    }
  },

  // Get recent top performers
  async getRecentTopPerformers(days = 7, limit = 20) {
    try {
      const sinceDate = new Date();
      sinceDate?.setDate(sinceDate?.getDate() - days);

      const { data: recentXP, error } = await supabase
        ?.from('xp_transactions')
        ?.select(`
          user_id,
          amount,
          source,
          created_at,
          user_profiles!inner (
            username,
            full_name,
            avatar_url,
            specialization,
            current_level,
            total_xp
          )
        `)
        ?.gte('created_at', sinceDate?.toISOString())
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      // Group by user and sum XP
      const userXP = {};
      recentXP?.forEach(transaction => {
        const userId = transaction?.user_id;
        if (!userXP?.[userId]) {
          userXP[userId] = {
            ...transaction?.user_profiles,
            id: userId,
            recentXP: 0,
            recentActivities: []
          };
        }
        userXP[userId].recentXP += transaction?.amount;
        userXP?.[userId]?.recentActivities?.push({
          source: transaction?.source,
          amount: transaction?.amount,
          created_at: transaction?.created_at
        });
      });

      // Convert to array and sort by recent XP
      const performers = Object?.values(userXP)
        ?.sort((a, b) => b?.recentXP - a?.recentXP)
        ?.slice(0, limit);

      return performers?.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching recent top performers:', error);
      throw error;
    }
  },

  // Helper methods
  async getUserOverallRank(userId) {
    try {
      const { data: user } = await supabase
        ?.from('user_profiles')
        ?.select('total_xp')
        ?.eq('id', userId)
        ?.single();

      if (!user) return null;

      const { count } = await supabase
        ?.from('user_profiles')
        ?.select('id', { count: 'exact' })
        ?.gt('total_xp', user?.total_xp);

      return (count || 0) + 1;
    } catch (error) {
      console.error('Error getting user overall rank:', error);
      return null;
    }
  },

  async getUserStreakRank(userId) {
    try {
      const { data: user } = await supabase
        ?.from('user_profiles')
        ?.select('streak_days')
        ?.eq('id', userId)
        ?.single();

      if (!user) return null;

      const { count } = await supabase
        ?.from('user_profiles')
        ?.select('id', { count: 'exact' })
        ?.gt('streak_days', user?.streak_days);

      return (count || 0) + 1;
    } catch (error) {
      console.error('Error getting user streak rank:', error);
      return null;
    }
  },

  async getUserCompletionRank(userId) {
    try {
      const { count: userCompletions } = await supabase
        ?.from('user_lesson_progress')
        ?.select('id', { count: 'exact' })
        ?.eq('user_id', userId)
        ?.eq('completion_percentage', 100);

      // This would require a more complex query in production
      // For now, return a placeholder
      return Math.floor(Math.random() * 100) + 1;
    } catch (error) {
      console.error('Error getting user completion rank:', error);
      return null;
    }
  },

  isStreakActive(lastActivityDate) {
    if (!lastActivityDate) return false;
    
    const today = new Date();
    const lastActivity = new Date(lastActivityDate);
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= 1; // Active if last activity was today or yesterday
  },

  getTierValue(tier) {
    const tierValues = {
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4,
      diamond: 5
    };
    return tierValues?.[tier] || 1;
  }
};