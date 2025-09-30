import { supabase } from '../lib/supabase';

export const achievementService = {
  // Get all achievement types with tier information
  async getAchievementTypes(tier = null) {
    try {
      let query = supabase
        ?.from('achievement_types')
        ?.select('*')
        ?.eq('is_active', true)
        ?.order('tier', { ascending: true })
        ?.order('created_at', { ascending: true });

      if (tier) {
        query = query?.eq('tier', tier);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievement types:', error);
      throw error;
    }
  },

  // Get user's earned achievements with achievement details
  async getUserAchievements(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_achievements')?.select(`*,achievement_types (name,description,tier,icon_name,badge_color,xp_reward,unlock_criteria)`)?.eq('user_id', userId)?.order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  },

  // Get achievement progress for all achievements
  async getAchievementProgress(userId) {
    try {
      // Get all achievements
      const achievementTypes = await this.getAchievementTypes();
      
      // Get user's earned achievements
      const userAchievements = await this.getUserAchievements(userId);
      const earnedIds = new Set(userAchievements?.map(ua => ua?.achievement_id));

      // Get user statistics for progress calculation
      const userStats = await this.getUserStatistics(userId);

      // Calculate progress for each achievement
      const achievementProgress = achievementTypes?.map(achievement => {
        const isEarned = earnedIds?.has(achievement?.id);
        const userAchievement = userAchievements?.find(ua => ua?.achievement_id === achievement?.id);
        
        return {
          ...achievement,
          earned: isEarned,
          earnedAt: userAchievement?.earned_at || null,
          progress: isEarned ? 100 : this.calculateAchievementProgress(achievement, userStats),
          progressData: userAchievement?.progress_data || null
        };
      });

      return achievementProgress || [];
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
      throw error;
    }
  },

  // Calculate progress towards a specific achievement
  calculateAchievementProgress(achievement, userStats) {
    try {
      const criteria = achievement?.unlock_criteria || {};
      const criteriaType = criteria?.type;

      switch (criteriaType) {
        case 'lesson_completion':
          const required = criteria?.count || 1;
          const completed = userStats?.lessonsCompleted || 0;
          return Math.min(Math.round((completed / required) * 100), 100);

        case 'skill_node_completion':
          const nodeType = criteria?.node_type;
          const requiredNodes = criteria?.count || 1;
          const completedNodes = nodeType 
            ? userStats?.skillNodesByType?.[nodeType] || 0
            : userStats?.totalSkillNodesCompleted || 0;
          return Math.min(Math.round((completedNodes / requiredNodes) * 100), 100);

        case 'xp_earned':
          const requiredXP = criteria?.amount || 1000;
          const currentXP = userStats?.totalXP || 0;
          return Math.min(Math.round((currentXP / requiredXP) * 100), 100);

        case 'skill_tree_unlock':
          const requiredTrees = criteria?.count || 1;
          const unlockedTrees = userStats?.skillTreesUnlocked || 0;
          return Math.min(Math.round((unlockedTrees / requiredTrees) * 100), 100);

        case 'skill_tree_mastery':
          const requiredMastery = criteria?.disciplines || 1;
          const masteredDisciplines = userStats?.masteredDisciplines || 0;
          return Math.min(Math.round((masteredDisciplines / requiredMastery) * 100), 100);

        case 'foundation_mastery':
          const requiredFoundations = criteria?.disciplines || 3;
          const foundationDisciplines = userStats?.foundationDisciplines || 0;
          return Math.min(Math.round((foundationDisciplines / requiredFoundations) * 100), 100);

        case 'combined':
          // Handle complex achievements with multiple requirements
          const requirements = criteria?.requirements || [];
          const progressValues = requirements?.map(req => 
            this.calculateAchievementProgress({ unlock_criteria: req }, userStats)
          );
          return progressValues?.length > 0 ? Math.min(...progressValues) : 0;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      return 0;
    }
  },

  // Get comprehensive user statistics for achievement calculations
  async getUserStatistics(userId) {
    try {
      const [
        lessonsData,
        skillProgressData,
        xpData,
        pathsData
      ] = await Promise.all([
        // Lesson completion stats
        supabase
          ?.from('user_lesson_progress')
          ?.select('completion_percentage, lesson_id')
          ?.eq('user_id', userId),
        
        // Skill node progress
        supabase
          ?.from('user_skill_progress')
          ?.select(`
            status,
            skill_nodes (
              node_type,
              skill_trees (
                discipline
              )
            )
          `)
          ?.eq('user_id', userId),

        // XP transactions
        supabase
          ?.from('xp_transactions')
          ?.select('amount')
          ?.eq('user_id', userId),

        // Learning paths progress
        supabase
          ?.from('learning_paths')
          ?.select('discipline')
          ?.eq('is_published', true)
      ]);

      // Calculate lesson statistics
      const lessons = lessonsData?.data || [];
      const lessonsCompleted = lessons?.filter(l => l?.completion_percentage === 100)?.length || 0;

      // Calculate skill node statistics
      const skillProgress = skillProgressData?.data || [];
      const completedSkillNodes = skillProgress?.filter(sp => sp?.status === 'completed') || [];
      const totalSkillNodesCompleted = completedSkillNodes?.length || 0;
      
      // Group by node type
      const skillNodesByType = completedSkillNodes?.reduce((acc, node) => {
        const nodeType = node?.skill_nodes?.node_type;
        if (nodeType) {
          acc[nodeType] = (acc?.[nodeType] || 0) + 1;
        }
        return acc;
      }, {});

      // Calculate discipline mastery
      const disciplineProgress = completedSkillNodes?.reduce((acc, node) => {
        const discipline = node?.skill_nodes?.skill_trees?.discipline;
        if (discipline) {
          acc[discipline] = (acc?.[discipline] || 0) + 1;
        }
        return acc;
      }, {});

      // Calculate XP
      const xpTransactions = xpData?.data || [];
      const totalXP = xpTransactions?.reduce((sum, tx) => sum + (tx?.amount || 0), 0) || 0;

      // Calculate skill trees and mastery
      const uniqueDisciplines = new Set(
        skillProgress?.map(sp => sp?.skill_nodes?.skill_trees?.discipline)?.filter(Boolean)
      );
      const skillTreesUnlocked = uniqueDisciplines?.size || 0;

      // Estimate mastery (placeholder logic - would need more sophisticated calculation)
      const masteredDisciplines = Object.entries(disciplineProgress)
        ?.filter(([discipline, count]) => count >= 5) // 5+ nodes per discipline = mastery
        ?.length || 0;

      const foundationDisciplines = Object.entries(skillNodesByType)
        ?.filter(([type, count]) => type === 'foundation' && count >= 1)
        ?.length || 0;

      return {
        lessonsCompleted,
        totalSkillNodesCompleted,
        skillNodesByType,
        disciplineProgress,
        totalXP,
        skillTreesUnlocked,
        masteredDisciplines,
        foundationDisciplines
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return {};
    }
  },

  // Award achievement to user
  async awardAchievement(userId, achievementId, progressData = {}) {
    try {
      // Check if user already has this achievement
      const { data: existing } = await supabase
        ?.from('user_achievements')
        ?.select('id')
        ?.eq('user_id', userId)
        ?.eq('achievement_id', achievementId)
        ?.single();

      if (existing) {
        console.log('User already has this achievement');
        return existing;
      }

      // Get achievement details for XP reward
      const { data: achievement } = await supabase
        ?.from('achievement_types')
        ?.select('name, xp_reward')
        ?.eq('id', achievementId)
        ?.single();

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Award achievement
      const { data: userAchievement, error: achievementError } = await supabase
        ?.from('user_achievements')
        ?.insert({
          user_id: userId,
          achievement_id: achievementId,
          progress_data: progressData
        })
        ?.select()
        ?.single();

      if (achievementError) throw achievementError;

      // Award XP bonus
      if (achievement?.xp_reward > 0) {
        await supabase
          ?.from('xp_transactions')
          ?.insert({
            user_id: userId,
            amount: achievement?.xp_reward,
            source: 'achievement_earned',
            reference_id: achievementId,
            description: `Achievement: ${achievement?.name}`
          });
      }

      return userAchievement;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  },

  // Check and award eligible achievements based on user progress
  async checkAndAwardAchievements(userId) {
    try {
      const userStats = await this.getUserStatistics(userId);
      const achievementProgress = await this.getAchievementProgress(userId);
      
      const eligibleAchievements = achievementProgress?.filter(achievement => 
        !achievement?.earned && achievement?.progress >= 100
      );

      const awardedAchievements = [];

      for (const achievement of eligibleAchievements) {
        try {
          const awarded = await this.awardAchievement(
            userId, 
            achievement?.id, 
            { auto_awarded: true, stats_at_time: userStats }
          );
          awardedAchievements?.push(awarded);
        } catch (error) {
          console.error(`Error awarding achievement ${achievement?.id}:`, error);
        }
      }

      return awardedAchievements;
    } catch (error) {
      console.error('Error checking and awarding achievements:', error);
      return [];
    }
  },

  // Get achievement leaderboard for a specific tier
  async getAchievementLeaderboard(tier = null, limit = 10) {
    try {
      let query = supabase
        ?.from('user_achievements')
        ?.select(`
          user_id,
          earned_at,
          user_profiles (
            full_name,
            username,
            avatar_url
          ),
          achievement_types!inner (
            name,
            tier,
            xp_reward
          )
        `)
        ?.order('earned_at', { ascending: false })
        ?.limit(limit);

      if (tier) {
        query = query?.eq('achievement_types.tier', tier);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by user and calculate stats
      const userStats = {};
      
      data?.forEach(achievement => {
        const userId = achievement?.user_id;
        if (!userStats?.[userId]) {
          userStats[userId] = {
            user: achievement?.user_profiles,
            achievements: [],
            totalXP: 0,
            tierCounts: { bronze: 0, silver: 0, gold: 0, platinum: 0 }
          };
        }
        
        userStats?.[userId]?.achievements?.push(achievement);
        userStats[userId].totalXP += achievement?.achievement_types?.xp_reward || 0;
        const achievementTier = achievement?.achievement_types?.tier;
        if (achievementTier && userStats?.[userId]?.tierCounts?.[achievementTier] !== undefined) {
          userStats[userId].tierCounts[achievementTier]++;
        }
      });

      // Convert to array and sort
      const leaderboard = Object.values(userStats)
        ?.sort((a, b) => b?.totalXP - a?.totalXP)
        ?.slice(0, limit);

      return leaderboard;
    } catch (error) {
      console.error('Error fetching achievement leaderboard:', error);
      return [];
    }
  },

  // Get achievement statistics
  async getAchievementStatistics() {
    try {
      const [typesData, userAchievementsData] = await Promise.all([
        supabase?.from('achievement_types')?.select('tier'),
        supabase?.from('user_achievements')?.select(`
          achievement_id,
          achievement_types (tier)
        `)
      ]);

      const types = typesData?.data || [];
      const userAchievements = userAchievementsData?.data || [];

      // Calculate stats by tier
      const tierStats = {
        bronze: { total: 0, earned: 0 },
        silver: { total: 0, earned: 0 },
        gold: { total: 0, earned: 0 },
        platinum: { total: 0, earned: 0 }
      };

      types?.forEach(type => {
        if (tierStats?.[type?.tier]) {
          tierStats[type.tier].total++;
        }
      });

      userAchievements?.forEach(ua => {
        const tier = ua?.achievement_types?.tier;
        if (tierStats?.[tier]) {
          tierStats[tier].earned++;
        }
      });

      return {
        tierStats,
        totalAchievements: types?.length || 0,
        totalEarned: userAchievements?.length || 0,
        completionRate: types?.length > 0 
          ? Math.round((userAchievements?.length / types?.length) * 100) 
          : 0
      };
    } catch (error) {
      console.error('Error fetching achievement statistics:', error);
      return null;
    }
  }
};