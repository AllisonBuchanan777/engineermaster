import { supabase } from '../lib/supabase';

class AerospaceCurriculumService {
  // Get all aerospace modules (learning paths) with user progress
  async getAerospaceModules(userId) {
    try {
      const { data: learningPaths, error: pathsError } = await supabase?.from('learning_paths')?.select(`
          id,
          name,
          description,
          difficulty,
          estimated_duration_hours,
          learning_objectives,
          prerequisites,
          is_published,
          created_at
        `)?.eq('discipline', 'aerospace')?.eq('is_published', true)?.order('created_at');

      if (pathsError) throw pathsError;

      if (!learningPaths || learningPaths?.length === 0) {
        return [];
      }

      // Get lessons for each learning path with user progress
      const modulesWithProgress = await Promise.all(
        learningPaths?.map(async (path) => {
          const { data: lessons, error: lessonsError } = await supabase?.from('lessons')?.select(`
              id,
              title,
              description,
              difficulty,
              estimated_duration_minutes,
              xp_reward,
              order_index,
              learning_objectives
            `)?.eq('learning_path_id', path?.id)?.eq('is_published', true)?.order('order_index');

          if (lessonsError) {
            console.error('Error fetching lessons:', lessonsError);
            return {
              ...path,
              lessons: [],
              progress: 0,
              isLocked: false,
              totalLessons: 0,
              completedLessons: 0
            };
          }

          let userProgress = [];
          if (userId && lessons?.length > 0) {
            const { data: progressData, error: progressError } = await supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status')?.eq('user_id', userId)?.in('lesson_id', lessons?.map(l => l?.id));

            if (!progressError) {
              userProgress = progressData || [];
            }
          }

          const lessonsWithProgress = lessons?.map(lesson => {
            const progress = userProgress?.find(p => p?.lesson_id === lesson?.id);
            return {
              ...lesson,
              progress: progress?.completion_percentage || 0,
              status: progress?.status || 'not_started',
              isCompleted: progress?.completion_percentage === 100
            };
          }) || [];

          const completedLessons = lessonsWithProgress?.filter(l => l?.isCompleted)?.length || 0;
          const totalLessons = lessonsWithProgress?.length || 0;
          const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          // Determine if module is locked (for now, all are unlocked)
          const isLocked = false;

          return {
            ...path,
            lessons: lessonsWithProgress,
            progress: overallProgress,
            isLocked,
            totalLessons,
            completedLessons,
            icon: this.getModuleIcon(path?.name),
            estimatedHours: path?.estimated_duration_hours || 0
          };
        })
      );

      return modulesWithProgress || [];
    } catch (error) {
      console.error('Error fetching aerospace modules:', error);
      throw new Error('Failed to load aerospace modules');
    }
  }

  // Get aerospace skill tree with user progress
  async getAerospaceSkillTree(userId) {
    try {
      const { data: skillTree, error: treeError } = await supabase?.from('skill_trees')?.select(`
          id,
          name,
          description,
          icon_name,
          order_index
        `)?.eq('discipline', 'aerospace')?.eq('is_active', true)?.single();

      if (treeError || !skillTree) {
        return null;
      }

      const { data: skillNodes, error: nodesError } = await supabase?.from('skill_nodes')?.select(`
          id,
          name,
          description,
          tier,
          xp_required,
          position_x,
          position_y,
          is_milestone,
          prerequisites,
          lesson_id
        `)?.eq('skill_tree_id', skillTree?.id)?.order('tier, position_y, position_x');

      if (nodesError) {
        console.error('Error fetching skill nodes:', nodesError);
        return { ...skillTree, nodes: [] };
      }

      let userSkillProgress = [];
      if (userId && skillNodes?.length > 0) {
        const { data: progressData, error: progressError } = await supabase?.from('user_skill_progress')?.select('skill_node_id, status, earned_at')?.eq('user_id', userId)?.in('skill_node_id', skillNodes?.map(n => n?.id));

        if (!progressError) {
          userSkillProgress = progressData || [];
        }
      }

      const nodesWithProgress = skillNodes?.map(node => {
        const progress = userSkillProgress?.find(p => p?.skill_node_id === node?.id);
        return {
          ...node,
          status: progress?.status || 'locked',
          earnedAt: progress?.earned_at,
          isUnlocked: progress?.status !== 'locked',
          isCompleted: progress?.status === 'completed'
        };
      }) || [];

      return {
        ...skillTree,
        nodes: nodesWithProgress
      };
    } catch (error) {
      console.error('Error fetching aerospace skill tree:', error);
      return null;
    }
  }

  // Get aerospace achievements with user progress
  async getAerospaceAchievements(userId) {
    try {
      const { data: achievements, error: achievementsError } = await supabase?.from('achievement_types')?.select(`
          id,
          name,
          description,
          tier,
          xp_reward,
          icon_name,
          badge_color,
          unlock_criteria,
          sort_order
        `)?.eq('category', 'aerospace')?.eq('is_active', true)?.order('sort_order');

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        return [];
      }

      if (!achievements || achievements?.length === 0) {
        return [];
      }

      let userAchievements = [];
      if (userId) {
        const { data: userAchievementData, error: userError } = await supabase?.from('user_achievements')?.select('achievement_id, earned_at, progress_data')?.eq('user_id', userId)?.in('achievement_id', achievements?.map(a => a?.id));

        if (!userError) {
          userAchievements = userAchievementData || [];
        }
      }

      return achievements?.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua?.achievement_id === achievement?.id);
        return {
          ...achievement,
          isEarned: !!userAchievement,
          earnedAt: userAchievement?.earned_at,
          progressData: userAchievement?.progress_data || {},
          progress: this.calculateAchievementProgress(achievement, userAchievement?.progress_data)
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching aerospace achievements:', error);
      throw new Error('Failed to load aerospace achievements');
    }
  }

  // Get today's aerospace challenge
  async getTodayAerospaceChallenge(userId) {
    try {
      const { data: challenge, error: challengeError } = await supabase?.from('daily_challenges')?.select(`
          id,
          description,
          difficulty,
          reward_points,
          challenge_date,
          lesson_id,
          lessons(title, slug)
        `)?.eq('discipline', 'aerospace')?.eq('is_active', true)?.eq('challenge_date', new Date()?.toISOString()?.split('T')?.[0])?.single();

      if (challengeError && challengeError?.code !== 'PGRST116') {
        throw challengeError;
      }

      if (!challenge) {
        return null;
      }

      let userProgress = null;
      if (userId) {
        const { data: progressData, error: progressError } = await supabase?.from('user_daily_challenges')?.select('completed_at, score, attempts')?.eq('user_id', userId)?.eq('challenge_id', challenge?.id)?.single();

        if (!progressError) {
          userProgress = progressData;
        }
      }

      return {
        ...challenge,
        isCompleted: !!userProgress?.completed_at,
        completedAt: userProgress?.completed_at,
        score: userProgress?.score || 0,
        attempts: userProgress?.attempts || 0
      };
    } catch (error) {
      console.error('Error fetching aerospace challenge:', error);
      return null;
    }
  }

  // Start a lesson
  async startLesson(userId, lessonId) {
    try {
      const { data, error } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'in_progress',
          last_accessed_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting lesson:', error);
      throw new Error('Failed to start lesson');
    }
  }

  // Helper method to get module icon
  getModuleIcon(moduleName) {
    const iconMap = {
      'Aerodynamics': 'Wind',
      'Propulsion': 'Zap', 
      'Flight Mechanics': 'Navigation',
      'Avionics': 'Cpu',
      'Structural Analysis': 'Layers',
      'Space Systems': 'Globe'
    };
    
    // Find matching key (partial match)
    const matchedKey = Object.keys(iconMap)?.find(key => 
      moduleName?.toLowerCase()?.includes(key?.toLowerCase())
    );
    
    return iconMap?.[matchedKey] || 'BookOpen';
  }

  // Helper method to calculate achievement progress
  calculateAchievementProgress(achievement, progressData) {
    if (!achievement?.unlock_criteria || !progressData) return 0;

    try {
      const criteria = typeof achievement?.unlock_criteria === 'string' 
        ? JSON.parse(achievement?.unlock_criteria) 
        : achievement?.unlock_criteria;

      switch (criteria?.type) {
        case 'lesson_completion_count':
          const completed = progressData?.lessons_completed || 0;
          const required = criteria?.count || 1;
          return Math.min((completed / required) * 100, 100);
          
        case 'learning_path_completion':
          return progressData?.path_completed ? 100 : 0;
          
        case 'discipline_progress':
          const progress = progressData?.discipline_progress || 0;
          const target = criteria?.percentage || 100;
          return Math.min((progress / target) * 100, 100);
          
        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      return 0;
    }
  }
}

export const aerospaceCurriculumService = new AerospaceCurriculumService();
export default aerospaceCurriculumService;