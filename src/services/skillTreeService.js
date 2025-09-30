import { supabase } from '../lib/supabase';

export const skillTreeService = {
  // Get all skill trees for a discipline or all disciplines
  async getSkillTrees(discipline = null) {
    try {
      let query = supabase
        ?.from('skill_trees')
        ?.select(`
          *,
          skill_nodes (
            id,
            name,
            description,
            node_type,
            position_x,
            position_y,
            required_xp,
            xp_reward,
            icon_name,
            prerequisites,
            unlocks,
            associated_lessons,
            achievement_id,
            is_active
          )
        `)
        ?.eq('is_active', true)
        ?.order('created_at');

      if (discipline) {
        query = query?.eq('discipline', discipline);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data?.map(tree => ({
        ...tree,
        nodes: tree?.skill_nodes?.filter(node => node?.is_active) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching skill trees:', error);
      throw error;
    }
  },

  // Get a specific skill tree with detailed node information
  async getSkillTree(skillTreeId) {
    try {
      const { data, error } = await supabase
        ?.from('skill_trees')
        ?.select(`
          *,
          skill_nodes (
            *,
            achievement_types (
              name,
              description,
              icon_name,
              badge_color,
              xp_reward
            )
          )
        `)
        ?.eq('id', skillTreeId)
        ?.eq('is_active', true)
        ?.single();

      if (error) throw error;

      return {
        ...data,
        nodes: data?.skill_nodes?.filter(node => node?.is_active) || []
      };
    } catch (error) {
      console.error('Error fetching skill tree:', error);
      throw error;
    }
  },

  // Get user's progress across all skill trees
  async getUserSkillProgress(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_skill_progress')
        ?.select(`
          *,
          skill_trees (
            id,
            name,
            discipline,
            total_nodes
          ),
          skill_nodes (
            id,
            name,
            node_type,
            required_xp,
            xp_reward
          )
        `)
        ?.eq('user_id', userId)
        ?.order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user skill progress:', error);
      throw error;
    }
  },

  // Get user progress for a specific skill tree
  async getUserSkillTreeProgress(userId, skillTreeId) {
    try {
      const { data, error } = await supabase
        ?.from('user_skill_progress')
        ?.select(`
          *,
          skill_nodes (
            id,
            name,
            node_type,
            position_x,
            position_y,
            required_xp,
            xp_reward,
            prerequisites,
            unlocks
          )
        `)
        ?.eq('user_id', userId)
        ?.eq('skill_tree_id', skillTreeId)
        ?.order('updated_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user skill tree progress:', error);
      throw error;
    }
  },

  // Update user progress on a skill node
  async updateSkillNodeProgress(userId, skillNodeId, progressData) {
    try {
      const { data, error } = await supabase
        ?.from('user_skill_progress')
        ?.upsert({
          user_id: userId,
          skill_node_id: skillNodeId,
          ...progressData,
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,skill_node_id'
        })
        ?.select()
        ?.single();

      if (error) throw error;

      // If node is completed, handle unlocking next nodes and awarding XP
      if (progressData?.status === 'completed') {
        await this.handleNodeCompletion(userId, skillNodeId);
      }

      return data;
    } catch (error) {
      console.error('Error updating skill node progress:', error);
      throw error;
    }
  },

  // Handle node completion - unlock dependent nodes and award XP
  async handleNodeCompletion(userId, skillNodeId) {
    try {
      // Get node details
      const { data: node } = await supabase
        ?.from('skill_nodes')
        ?.select('*, skill_trees(id, name)')
        ?.eq('id', skillNodeId)
        ?.single();

      if (!node) return;

      // Award XP
      await supabase
        ?.from('xp_transactions')
        ?.insert({
          user_id: userId,
          amount: node?.xp_reward || 50,
          source: 'skill_node_completion',
          reference_id: skillNodeId,
          description: `Completed skill node: ${node?.name}`
        });

      // Check and unlock dependent nodes
      await this.checkAndUnlockNodes(userId, node?.skill_tree_id);

      // Check for skill tree completion
      await this.checkSkillTreeCompletion(userId, node?.skill_tree_id);

      // Award achievement if associated
      if (node?.achievement_id) {
        await this.awardNodeAchievement(userId, node?.achievement_id);
      }

    } catch (error) {
      console.error('Error handling node completion:', error);
    }
  },

  // Check and unlock nodes that have all prerequisites completed
  async checkAndUnlockNodes(userId, skillTreeId) {
    try {
      // Get all nodes in the skill tree
      const { data: nodes } = await supabase
        ?.from('skill_nodes')
        ?.select('*')
        ?.eq('skill_tree_id', skillTreeId)
        ?.eq('is_active', true);

      if (!nodes?.length) return;

      // Get user's current progress
      const { data: userProgress } = await supabase
        ?.from('user_skill_progress')
        ?.select('skill_node_id, status')
        ?.eq('user_id', userId)
        ?.eq('skill_tree_id', skillTreeId);

      const completedNodeIds = userProgress
        ?.filter(p => p?.status === 'completed')
        ?.map(p => p?.skill_node_id) || [];

      // Check each node for unlocking
      for (const node of nodes) {
        const existingProgress = userProgress?.find(p => p?.skill_node_id === node?.id);
        
        // Skip if already unlocked or completed
        if (existingProgress?.status === 'available' || existingProgress?.status === 'completed') {
          continue;
        }

        // Check if all prerequisites are met
        const prerequisites = node?.prerequisites || [];
        const allPrereqsCompleted = prerequisites?.every(prereqId => 
          completedNodeIds?.includes(prereqId)
        );

        // If no prerequisites or all completed, unlock the node
        if (prerequisites?.length === 0 || allPrereqsCompleted) {
          await supabase
            ?.from('user_skill_progress')
            ?.upsert({
              user_id: userId,
              skill_tree_id: skillTreeId,
              skill_node_id: node?.id,
              status: 'available',
              unlocked_at: new Date()?.toISOString()
            }, {
              onConflict: 'user_id,skill_node_id'
            });
        }
      }
    } catch (error) {
      console.error('Error checking and unlocking nodes:', error);
    }
  },

  // Check if skill tree is completed
  async checkSkillTreeCompletion(userId, skillTreeId) {
    try {
      // Get total nodes in tree
      const { data: totalNodes } = await supabase
        ?.from('skill_nodes')
        ?.select('id')
        ?.eq('skill_tree_id', skillTreeId)
        ?.eq('is_active', true);

      // Get completed nodes for user
      const { data: completedNodes } = await supabase
        ?.from('user_skill_progress')
        ?.select('id')
        ?.eq('user_id', userId)
        ?.eq('skill_tree_id', skillTreeId)
        ?.eq('status', 'completed');

      // If all nodes completed, award tree completion bonus
      if (totalNodes?.length > 0 && completedNodes?.length === totalNodes?.length) {
        await supabase
          ?.from('xp_transactions')
          ?.insert({
            user_id: userId,
            amount: 1000, // Bonus XP for tree completion
            source: 'skill_tree_completion',
            reference_id: skillTreeId,
            description: 'Completed entire skill tree'
          });

        // Award skill tree mastery achievement
        await this.awardSkillTreeMastery(userId, skillTreeId);
      }
    } catch (error) {
      console.error('Error checking skill tree completion:', error);
    }
  },

  // Award achievement for node completion
  async awardNodeAchievement(userId, achievementId) {
    try {
      // Check if user already has this achievement
      const { data: existing } = await supabase
        ?.from('user_achievements')
        ?.select('id')
        ?.eq('user_id', userId)
        ?.eq('achievement_id', achievementId)
        ?.single();

      if (existing) return;

      // Get achievement details
      const { data: achievement } = await supabase
        ?.from('achievement_types')
        ?.select('*')
        ?.eq('id', achievementId)
        ?.single();

      if (!achievement) return;

      // Award achievement
      await supabase
        ?.from('user_achievements')
        ?.insert({
          user_id: userId,
          achievement_id: achievementId,
          progress_data: { earned_for: 'skill_node_completion' }
        });

      // Award achievement XP
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
    } catch (error) {
      console.error('Error awarding node achievement:', error);
    }
  },

  // Award skill tree mastery achievement
  async awardSkillTreeMastery(userId, skillTreeId) {
    try {
      // Get skill tree info
      const { data: skillTree } = await supabase
        ?.from('skill_trees')
        ?.select('discipline, name')
        ?.eq('id', skillTreeId)
        ?.single();

      if (!skillTree) return;

      // Find appropriate mastery achievement
      const { data: achievement } = await supabase
        ?.from('achievement_types')
        ?.select('*')
        ?.eq('tier', 'platinum')
        ?.or(`name.ilike.%${skillTree?.discipline}%,name.ilike.%mastery%`)
        ?.limit(1)
        ?.single();

      if (achievement) {
        await this.awardNodeAchievement(userId, achievement?.id);
      }
    } catch (error) {
      console.error('Error awarding skill tree mastery:', error);
    }
  },

  // Get skill tree statistics for a user
  async getUserSkillTreeStats(userId) {
    try {
      // Get overall progress
      const { data: progress } = await supabase
        ?.from('user_skill_progress')
        ?.select(`
          skill_tree_id,
          status,
          skill_trees (
            discipline,
            name
          )
        `)
        ?.eq('user_id', userId);

      // Calculate stats
      const stats = {
        totalNodes: progress?.length || 0,
        completedNodes: progress?.filter(p => p?.status === 'completed')?.length || 0,
        availableNodes: progress?.filter(p => p?.status === 'available')?.length || 0,
        lockedNodes: progress?.filter(p => p?.status === 'locked')?.length || 0,
        disciplineProgress: {}
      };

      // Calculate progress by discipline
      progress?.forEach(p => {
        const discipline = p?.skill_trees?.discipline;
        if (!discipline) return;

        if (!stats?.disciplineProgress?.[discipline]) {
          stats.disciplineProgress[discipline] = {
            total: 0,
            completed: 0,
            available: 0,
            locked: 0
          };
        }

        stats.disciplineProgress[discipline].total++;
        if (p?.status === 'completed') stats.disciplineProgress[discipline].completed++;
        if (p?.status === 'available') stats.disciplineProgress[discipline].available++;
        if (p?.status === 'locked') stats.disciplineProgress[discipline].locked++;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching user skill tree stats:', error);
      return null;
    }
  },

  // Initialize user skill tree progress for a new tree
  async initializeUserSkillTree(userId, skillTreeId) {
    try {
      // Get all nodes for the tree
      const { data: nodes } = await supabase
        ?.from('skill_nodes')
        ?.select('id, prerequisites')
        ?.eq('skill_tree_id', skillTreeId)
        ?.eq('is_active', true);

      if (!nodes?.length) return;

      // Create initial progress records
      const progressRecords = nodes?.map(node => ({
        user_id: userId,
        skill_tree_id: skillTreeId,
        skill_node_id: node?.id,
        status: (node?.prerequisites?.length === 0) ? 'available' : 'locked',
        unlocked_at: (node?.prerequisites?.length === 0) ? new Date()?.toISOString() : null
      }));

      await supabase
        ?.from('user_skill_progress')
        ?.upsert(progressRecords, {
          onConflict: 'user_id,skill_node_id'
        });

      return true;
    } catch (error) {
      console.error('Error initializing user skill tree:', error);
      return false;
    }
  }
};