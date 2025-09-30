import { supabase } from '../lib/supabase';

export const enhancedDashboardService = {
  // Get comprehensive user dashboard data
  async getUserDashboardData(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      // Get user profile with streak and XP data
      const { data: userProfile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single();

      if (profileError) throw profileError;

      // Get recent XP transactions for level-up tracking
      const { data: recentXP, error: xpError } = await supabase
        ?.from('xp_transactions')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false })
        ?.limit(10);

      if (xpError) throw xpError;

      // Get user achievements with types
      const { data: achievements, error: achievementsError } = await supabase
        ?.from('user_achievements')
        ?.select(`
          *,
          achievement_types (
            name,
            description,
            icon_name,
            badge_color,
            tier,
            xp_reward
          )
        `)
        ?.eq('user_id', userId)
        ?.order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Get active learning goals
      const { data: learningGoals, error: goalsError } = await supabase
        ?.from('user_learning_goals')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Get today's daily challenge
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const { data: dailyChallenge, error: challengeError } = await supabase
        ?.from('daily_challenges')?.select('*')?.eq('challenge_date', today)?.eq('is_active', true)
        ?.single();

      // Check if user completed today's challenge
      let challengeCompleted = false;
      if (dailyChallenge) {
        const { data: userChallenge } = await supabase
          ?.from('user_daily_challenges')
          ?.select('id')
          ?.eq('user_id', userId)
          ?.eq('challenge_id', dailyChallenge?.id)
          ?.single();
        
        challengeCompleted = !!userChallenge;
      }

      return {
        userProfile,
        recentXP,
        achievements: achievements || [],
        learningGoals: learningGoals || [],
        dailyChallenge: challengeError ? null : dailyChallenge,
        challengeCompleted,
        error: null
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { 
        userProfile: null, 
        recentXP: [], 
        achievements: [], 
        learningGoals: [], 
        dailyChallenge: null,
        challengeCompleted: false,
        error 
      };
    }
  },

  // Get skill progress by discipline with detailed metrics
  async getUserSkillProgress(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const { data: skillProgress, error } = await supabase
        ?.from('user_skill_progress')
        ?.select(`
          *,
          skill_nodes (
            id,
            name,
            description,
            tier,
            xp_required,
            is_milestone,
            skill_trees (
              id,
              name,
              discipline,
              icon_name,
              description
            )
          )
        `)
        ?.eq('user_id', userId)
        ?.order('updated_at', { ascending: false });

      if (error) throw error;

      // Group by discipline
      const progressByDiscipline = {};
      
      skillProgress?.forEach(progress => {
        const discipline = progress?.skill_nodes?.skill_trees?.discipline;
        if (!discipline) return;

        if (!progressByDiscipline?.[discipline]) {
          progressByDiscipline[discipline] = {
            discipline,
            skillTree: progress?.skill_nodes?.skill_trees,
            nodes: [],
            totalNodes: 0,
            completedNodes: 0,
            inProgressNodes: 0,
            totalXP: 0,
            earnedXP: 0
          };
        }

        progressByDiscipline?.[discipline]?.nodes?.push(progress);
        progressByDiscipline[discipline].totalNodes++;
        progressByDiscipline[discipline].totalXP += progress?.skill_nodes?.xp_required || 0;

        if (progress?.status === 'completed') {
          progressByDiscipline[discipline].completedNodes++;
          progressByDiscipline[discipline].earnedXP += progress?.skill_nodes?.xp_required || 0;
        } else if (progress?.status === 'in_progress') {
          progressByDiscipline[discipline].inProgressNodes++;
          progressByDiscipline[discipline].earnedXP += Math.round((progress?.progress_percentage / 100) * (progress?.skill_nodes?.xp_required || 0));
        }
      });

      // Calculate completion percentages
      Object.values(progressByDiscipline)?.forEach(discipline => {
        discipline.completionPercentage = discipline?.totalNodes > 0 
          ? Math.round((discipline?.completedNodes / discipline?.totalNodes) * 100)
          : 0;
        discipline.xpPercentage = discipline?.totalXP > 0
          ? Math.round((discipline?.earnedXP / discipline?.totalXP) * 100)
          : 0;
      });

      return { data: Object.values(progressByDiscipline), error: null };
    } catch (error) {
      console.error('Error fetching skill progress:', error);
      return { data: [], error };
    }
  },

  // Get lesson progress with recent activity
  async getUserLessonProgress(userId, limit = 10) {
    try {
      if (!userId) throw new Error('User ID is required');

      const { data: lessonProgress, error } = await supabase
        ?.from('user_lesson_progress')
        ?.select(`
          *,
          lessons (
            id,
            title,
            description,
            discipline,
            difficulty,
            estimated_duration_minutes,
            xp_reward
          )
        `)
        ?.eq('user_id', userId)
        ?.order('last_accessed_at', { ascending: false, nullsLast: true })
        ?.limit(limit);

      if (error) throw error;

      return { data: lessonProgress || [], error: null };
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return { data: [], error };
    }
  },

  // Get streak analytics and freeze data
  async getStreakAnalytics(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      // Get user profile for current streak
      const { data: profile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('streak_days, last_activity_date')
        ?.eq('id', userId)
        ?.single();

      if (profileError) throw profileError;

      // Get XP transactions for streak calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);

      const { data: xpTransactions, error: xpError } = await supabase
        ?.from('xp_transactions')
        ?.select('amount, created_at, source')
        ?.eq('user_id', userId)
        ?.gte('created_at', thirtyDaysAgo?.toISOString())
        ?.order('created_at', { ascending: true });

      if (xpError) throw xpError;

      // Calculate daily activity
      const dailyActivity = {};
      xpTransactions?.forEach(transaction => {
        const date = transaction?.created_at?.split('T')?.[0];
        if (!dailyActivity?.[date]) {
          dailyActivity[date] = {
            date,
            xp: 0,
            activities: 0,
            hasActivity: false
          };
        }
        dailyActivity[date].xp += transaction?.amount || 0;
        dailyActivity[date].activities++;
        dailyActivity[date].hasActivity = true;
      });

      // Calculate streak freeze status (simulated)
      const streakFreezes = {
        available: 2,
        used: 0,
        lastUsed: null
      };

      return { 
        data: {
          currentStreak: profile?.streak_days || 0,
          lastActivity: profile?.last_activity_date,
          dailyActivity: Object.values(dailyActivity),
          streakFreezes,
          longestStreak: profile?.streak_days || 0 // Simplified
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching streak analytics:', error);
      return { data: null, error };
    }
  },

  // Get personalized learning recommendations
  async getLearningRecommendations(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      // Get user's discipline preferences from profile
      const { data: profile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('specialization, preferences')
        ?.eq('id', userId)
        ?.single();

      if (profileError) throw profileError;

      // Get user's completed lessons to avoid recommending duplicates
      const { data: completedLessons, error: completedError } = await supabase
        ?.from('user_lesson_progress')
        ?.select('lesson_id')
        ?.eq('user_id', userId)
        ?.eq('completion_percentage', 100);

      if (completedError) throw completedError;

      const completedLessonIds = completedLessons?.map(progress => progress?.lesson_id) || [];

      // Get recommended lessons based on user's specialization
      let query = supabase
        ?.from('lessons')
        ?.select('*')
        ?.eq('is_active', true);

      // Filter out completed lessons
      if (completedLessonIds?.length > 0) {
        query = query?.not('id', 'in', `(${completedLessonIds?.join(',')})`);
      }

      // Filter by user's specialization if available
      if (profile?.specialization) {
        query = query?.eq('discipline', profile?.specialization);
      }

      const { data: recommendedLessons, error: lessonsError } = await query
        ?.order('difficulty', { ascending: true })
        ?.limit(5);

      if (lessonsError) throw lessonsError;

      // Get today's challenge recommendation
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const { data: dailyChallenge, error: challengeError } = await supabase
        ?.from('daily_challenges')
        ?.select('*')
        ?.eq('challenge_date', today)
        ?.eq('is_active', true)
        ?.single();

      // Get skill recommendations based on current progress
      const { data: skillRecommendations, error: skillError } = await supabase
        ?.from('skill_nodes')
        ?.select(`
          *,
          skill_trees (
            id,
            name,
            discipline,
            icon_name
          )
        `)
        ?.limit(3);

      return {
        data: {
          lessons: recommendedLessons || [],
          dailyChallenge: challengeError ? null : dailyChallenge,
          skills: skillError ? [] : skillRecommendations || [],
          personalizedTips: this.generatePersonalizedTips(profile, completedLessons?.length || 0)
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
      return { data: null, error };
    }
  },

  // Generate personalized learning tips
  generatePersonalizedTips(profile, completedLessonsCount) {
    const tips = [];
    
    if (completedLessonsCount === 0) {
      tips?.push({
        title: "Start Your Learning Journey",
        message: "Complete your first lesson to earn your first achievement badge!",
        type: "encouragement",
        priority: "high"
      });
    } else if (completedLessonsCount < 5) {
      tips?.push({
        title: "Build Your Streak",
        message: "Try to complete one lesson daily to build a learning streak.",
        type: "habit",
        priority: "medium"
      });
    } else {
      tips?.push({
        title: "Explore New Disciplines",
        message: "You're doing great! Consider exploring other engineering disciplines.",
        type: "expansion",
        priority: "low"
      });
    }

    // Add discipline-specific tips
    if (profile?.specialization === 'mechanical') {
      tips?.push({
        title: "Mechanical Engineering Focus",
        message: "Master statics and dynamics to unlock advanced topics like fluid mechanics.",
        type: "discipline",
        priority: "medium"
      });
    } else if (profile?.specialization === 'electrical') {
      tips?.push({
        title: "Electrical Engineering Path",
        message: "Understanding circuit analysis is key to advanced topics like power systems.",
        type: "discipline",
        priority: "medium"
      });
    }

    return tips;
  },

  // Complete daily challenge
  async completeDailyChallenge(userId, challengeId, score = 100, timeSpentMinutes = 15) {
    try {
      if (!userId || !challengeId) throw new Error('User ID and Challenge ID are required');

      // Check if already completed
      const { data: existing } = await supabase
        ?.from('user_daily_challenges')
        ?.select('id')
        ?.eq('user_id', userId)
        ?.eq('challenge_id', challengeId)
        ?.single();

      if (existing) {
        return { data: existing, error: null, message: 'Challenge already completed' };
      }

      // Complete the challenge
      const { data: completion, error: completionError } = await supabase
        ?.from('user_daily_challenges')
        ?.insert({
          user_id: userId,
          challenge_id: challengeId,
          score,
          time_taken_minutes: timeSpentMinutes,
          completed_at: new Date()?.toISOString()
        })
        ?.select()
        ?.single();

      if (completionError) throw completionError;

      // Get challenge details for XP reward
      const { data: challenge, error: challengeError } = await supabase
        ?.from('daily_challenges')
        ?.select('reward_points, description')
        ?.eq('id', challengeId)
        ?.single();

      if (!challengeError && challenge) {
        // Award XP for completing challenge
        await supabase
          ?.from('xp_transactions')
          ?.insert({
            user_id: userId,
            amount: challenge?.reward_points || 50,
            source: 'daily_challenge',
            reference_id: challengeId,
            description: `Daily Challenge: ${challenge?.description?.substring(0, 50)}...`
          });
      }

      return { data: completion, error: null };
    } catch (error) {
      console.error('Error completing daily challenge:', error);
      return { data: null, error };
    }
  },

  // Update user learning goal progress
  async updateGoalProgress(userId, goalType, incrementValue = 1) {
    try {
      if (!userId || !goalType) throw new Error('User ID and goal type are required');

      // Get active goal of this type
      const { data: goal, error: goalError } = await supabase
        ?.from('user_learning_goals')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('goal_type', goalType)
        ?.eq('is_active', true)
        ?.single();

      if (goalError || !goal) {
        return { data: null, error: goalError || new Error('No active goal found') };
      }

      // Update progress
      const newCurrentValue = Math.min((goal?.current_value || 0) + incrementValue, goal?.target_value || 0);
      
      const { data: updatedGoal, error: updateError } = await supabase
        ?.from('user_learning_goals')
        ?.update({
          current_value: newCurrentValue,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', goal?.id)
        ?.select()
        ?.single();

      if (updateError) throw updateError;

      // Check if goal is completed
      const isCompleted = newCurrentValue >= (goal?.target_value || 0);
      
      if (isCompleted) {
        // Award XP for goal completion
        await supabase
          ?.from('xp_transactions')
          ?.insert({
            user_id: userId,
            amount: 200, // Bonus XP for goal completion
            source: 'goal_completion',
            reference_id: goal?.id,
            description: `Completed learning goal: ${goalType}`
          });
      }

      return { data: updatedGoal, error: null, isCompleted };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return { data: null, error };
    }
  },

  // Get leaderboard data
  async getLeaderboardData(limit = 10) {
    try {
      // Get top users by total XP
      const { data: topXPUsers, error: xpError } = await supabase
        ?.from('user_profiles')
        ?.select('id, username, full_name, total_xp, current_level, avatar_url')
        ?.order('total_xp', { ascending: false })
        ?.limit(limit);

      if (xpError) throw xpError;

      // Get top users by streak
      const { data: topStreakUsers, error: streakError } = await supabase
        ?.from('user_profiles')
        ?.select('id, username, full_name, streak_days, avatar_url')
        ?.order('streak_days', { ascending: false })
        ?.limit(limit);

      if (streakError) throw streakError;

      return { 
        data: {
          byXP: topXPUsers || [],
          byStreak: topStreakUsers || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return { data: { byXP: [], byStreak: [] }, error };
    }
  },

  // Calculate level progress
  calculateLevelProgress(totalXP) {
    // Simple level calculation: Level = floor(sqrt(totalXP / 100))
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) || 1;
    const currentLevelXP = Math.pow(currentLevel, 2) * 100;
    const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;
    const progressXP = totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const progressPercentage = Math.round((progressXP / requiredXP) * 100);

    return {
      currentLevel,
      currentLevelXP,
      nextLevelXP,
      progressXP,
      requiredXP,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage))
    };
  }
};