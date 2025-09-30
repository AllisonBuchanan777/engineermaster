import { supabase } from '../lib/supabase';

export const analyticsService = {
  // Get user's learning progress analytics
  async getUserProgressAnalytics(userId) {
    try {
      // Get overall progress stats
      const { data: progressStats, error: progressError } = await supabase?.rpc('get_user_progress_stats', { user_uuid: userId });

      if (progressError) throw progressError;

      // Get XP progression over time
      const { data: xpHistory, error: xpError } = await supabase?.from('xp_transactions')?.select('amount, created_at, source, description')?.eq('user_id', userId)?.order('created_at', { ascending: true })?.limit(100);

      if (xpError) throw xpError;

      // Get lesson completion progress by discipline
      const { data: disciplineProgress, error: disciplineError } = await supabase?.from('user_lesson_progress')?.select(`
          completion_percentage,
          status,
          time_spent_minutes,
          lessons(discipline, difficulty, title, xp_reward)
        `)?.eq('user_id', userId);

      if (disciplineError) throw disciplineError;

      // Get achievements progress
      const { data: achievements, error: achievementError } = await supabase?.from('user_achievements')?.select(`earned_at,progress_data,achievement_types(name, description, xp_reward, badge_color, icon_name)`)?.eq('user_id', userId)?.order('earned_at', { ascending: false });

      if (achievementError) throw achievementError;

      return {
        data: {
          progressStats: progressStats?.[0] || {},
          xpHistory: xpHistory || [],
          disciplineProgress: disciplineProgress || [],
          achievements: achievements || []
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get streak analytics
  async getStreakAnalytics(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('streak_days, last_activity_date')?.eq('id', userId)?.single();

      if (error) throw error;

      // Get daily activity for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);

      const { data: activityData, error: activityError } = await supabase?.from('xp_transactions')?.select('created_at, amount')?.eq('user_id', userId)?.gte('created_at', thirtyDaysAgo?.toISOString())?.order('created_at', { ascending: true });

      if (activityError) throw activityError;

      return {
        data: {
          currentStreak: data?.streak_days || 0,
          lastActivity: data?.last_activity_date,
          dailyActivity: activityData || []
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get learning velocity (lessons per week)
  async getLearningVelocity(userId, weeks = 12) {
    try {
      const weeksAgo = new Date();
      weeksAgo?.setDate(weeksAgo?.getDate() - (weeks * 7));

      const { data, error } = await supabase?.from('user_lesson_progress')?.select('completed_at, lessons(title, difficulty, discipline)')?.eq('user_id', userId)?.eq('status', 'completed')?.gte('completed_at', weeksAgo?.toISOString())?.order('completed_at', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get discipline competency radar data
  async getDisciplineCompetency(userId) {
    try {
      const { data, error } = await supabase?.from('user_lesson_progress')?.select(`
          completion_percentage,
          status,
          quiz_scores,
          lessons(discipline, difficulty, xp_reward)
        `)?.eq('user_id', userId)?.eq('status', 'completed');

      if (error) throw error;

      // Process data to calculate competency by discipline
      const competencyData = {};
      
      data?.forEach(progress => {
        const discipline = progress?.lessons?.discipline;
        if (!discipline) return;

        if (!competencyData?.[discipline]) {
          competencyData[discipline] = {
            totalLessons: 0,
            completedLessons: 0,
            averageScore: 0,
            totalXP: 0,
            difficultyBreakdown: {
              beginner: 0,
              intermediate: 0,
              advanced: 0,
              expert: 0
            }
          };
        }

        const comp = competencyData?.[discipline];
        comp.totalLessons++;
        comp.completedLessons++;
        comp.totalXP += progress?.lessons?.xp_reward || 0;
        comp.difficultyBreakdown[progress.lessons.difficulty]++;

        // Calculate average quiz score
        if (progress?.quiz_scores && Array.isArray(progress?.quiz_scores)) {
          const avgQuizScore = progress?.quiz_scores?.reduce((sum, score) => sum + score, 0) / progress?.quiz_scores?.length;
          comp.averageScore = (comp?.averageScore + avgQuizScore) / 2;
        }
      });

      return { data: competencyData, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get daily challenges analytics
  async getDailyChallengesAnalytics(userId) {
    try {
      const { data, error } = await supabase?.from('user_daily_challenges')?.select(`
          completed_at,
          score,
          time_taken_minutes,
          daily_challenges(challenge_date, description, reward_points, difficulty, discipline)
        `)?.eq('user_id', userId)?.order('completed_at', { ascending: false })?.limit(30);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Process XP history for charts
  processXPHistory(xpHistory) {
    const processedData = [];
    let cumulativeXP = 0;

    xpHistory?.forEach(transaction => {
      cumulativeXP += transaction?.amount;
      processedData?.push({
        date: new Date(transaction.created_at)?.toLocaleDateString(),
        xp: cumulativeXP,
        dailyXP: transaction?.amount,
        source: transaction?.source,
        description: transaction?.description
      });
    });

    return processedData;
  },

  // Process discipline progress for radar chart
  processDisciplineRadarData(competencyData) {
    return Object.entries(competencyData)?.map(([discipline, data]) => ({
      discipline: discipline?.charAt(0)?.toUpperCase() + discipline?.slice(1),
      competency: Math.min(100, (data?.totalXP / 1000) * 100), // Normalize to 100
      lessonsCompleted: data?.completedLessons,
      averageScore: Math.round(data?.averageScore),
      difficultyDistribution: data?.difficultyBreakdown
    }));
  },

  // Calculate learning streaks from activity data
  calculateStreakData(dailyActivity) {
    const streakData = [];
    const activityByDate = {};

    // Group activity by date
    dailyActivity?.forEach(activity => {
      const date = new Date(activity.created_at)?.toDateString();
      if (!activityByDate?.[date]) {
        activityByDate[date] = 0;
      }
      activityByDate[date] += activity?.amount;
    });

    // Generate last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date?.setDate(date?.getDate() - i);
      const dateString = date?.toDateString();
      
      streakData?.push({
        date: date?.toLocaleDateString(),
        xp: activityByDate?.[dateString] || 0,
        hasActivity: (activityByDate?.[dateString] || 0) > 0
      });
    }

    return streakData;
  },

  // Format analytics data for export
  formatAnalyticsExport(analyticsData) {
    const { progressStats, xpHistory, disciplineProgress, achievements } = analyticsData;
    
    return {
      summary: {
        totalXP: progressStats?.total_xp || 0,
        currentLevel: progressStats?.current_level || 1,
        lessonsCompleted: progressStats?.lessons_completed || 0,
        currentStreak: progressStats?.streak_days || 0,
        totalAchievements: achievements?.length || 0
      },
      xpProgression: this.processXPHistory(xpHistory),
      disciplineBreakdown: disciplineProgress?.reduce((acc, lesson) => {
        const discipline = lesson?.lessons?.discipline || 'unknown';
        if (!acc?.[discipline]) acc[discipline] = 0;
        acc[discipline]++;
        return acc;
      }, {}),
      recentAchievements: achievements?.slice(0, 5)?.map(ach => ({
        name: ach?.achievement_types?.name,
        earnedAt: ach?.earned_at,
        xpReward: ach?.achievement_types?.xp_reward
      })),
      exportedAt: new Date()?.toISOString()
    };
  }
};