import { supabase } from '../lib/supabase';

export const mechanicalCurriculumService = {
  // Helper method to validate and get current user ID
  async validateUserId(userId) {
    // If userId is provided and looks like a UUID, use it
    if (userId && typeof userId === 'string' && userId !== 'current-user-id' && userId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return userId;
    }

    // If userId is invalid or not provided, get from session
    try {
      const { data: { session }, error } = await supabase?.auth?.getSession();
      if (error || !session?.user?.id) {
        console.warn('No valid user session found');
        return null;
      }
      return session?.user?.id;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  },

  // Get mechanical engineering curriculum with user progress
  async getMechanicalCurriculum(userId = null) {
    try {
      // Validate user ID
      const validUserId = await this.validateUserId(userId);

      // Fix: Use array response instead of single object to handle multiple learning paths
      const { data: curriculumArray, error } = await supabase?.from('learning_paths')?.select(`
          *,
          lessons!lessons_learning_path_id_fkey (
            id,
            slug,
            title,
            description,
            difficulty,
            lesson_type,
            estimated_duration_minutes,
            xp_reward,
            access_level,
            order_index,
            learning_objectives,
            content
          )
        `)
        ?.eq('discipline', 'mechanical')
        ?.eq('is_published', true)
        ?.order('created_at', { ascending: true });

      if (error) {
        console.error('Curriculum query error:', error);
        throw error;
      }

      // Aggregate all lessons from multiple learning paths or use the first one
      let curriculum = null;
      if (curriculumArray && curriculumArray?.length > 0) {
        // Use the first learning path as primary curriculum
        curriculum = curriculumArray?.[0];
        
        // If there are multiple paths, combine their lessons
        if (curriculumArray?.length > 1) {
          const allLessons = [];
          curriculumArray?.forEach(path => {
            if (path?.lessons) {
              allLessons?.push(...path?.lessons);
            }
          });
          
          // Sort lessons by order_index and remove duplicates
          curriculum.lessons = allLessons
            ?.filter((lesson, index, self) => 
              index === self?.findIndex(l => l?.id === lesson?.id)
            )
            ?.sort((a, b) => (a?.order_index || 0) - (b?.order_index || 0));
        }
      }

      // Return empty curriculum structure if none found
      if (!curriculum) {
        return {
          id: null,
          name: 'Mechanical Engineering Curriculum',
          discipline: 'mechanical',
          lessons: [],
          overallProgress: 0
        };
      }

      // Get user progress if valid userId provided
      if (validUserId && curriculum?.lessons?.length > 0) {
        const lessonIds = curriculum?.lessons?.map(lesson => lesson?.id);
        
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status, completed_at, time_spent_minutes')?.eq('user_id', validUserId)?.in('lesson_id', lessonIds);

        const { data: skillProgress } = await supabase?.from('user_skill_progress')?.select(`
            *,
            skill_nodes (
              name,
              tier,
              lesson_id
            )
          `)?.eq('user_id', validUserId);

        // Add progress to lessons
        curriculum.lessons = curriculum?.lessons?.map(lesson => ({
          ...lesson,
          userProgress: progress?.find(p => p?.lesson_id === lesson?.id),
          skillProgress: skillProgress?.find(sp => sp?.skill_nodes?.lesson_id === lesson?.id)
        }));

        // Calculate overall curriculum progress
        const completedLessons = progress?.filter(p => p?.completion_percentage === 100)?.length || 0;
        curriculum.overallProgress = Math.round((completedLessons / curriculum?.lessons?.length) * 100);
      } else if (!validUserId && userId) {
        console.warn('Invalid user ID provided, skipping user-specific progress');
      }

      return curriculum;
    } catch (error) {
      console.error('Error fetching mechanical curriculum:', error);
      throw error;
    }
  },

  // Get mechanical engineering modules organized by category
  async getMechanicalModules(userId = null) {
    try {
      // Validate user ID first
      const validUserId = await this.validateUserId(userId);
      
      let curriculum = await this.getMechanicalCurriculum(validUserId);
      
      // Create default modules even if no curriculum exists
      const modules = [
        {
          id: 'statics-dynamics',
          name: 'Statics & Dynamics',
          description: 'Forces, moments, kinematics, and energy methods for analyzing mechanical systems',
          icon: 'Zap',
          difficulty: 'beginner',
          estimatedHours: 2.5,
          color: '#10B981',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('statics') || 
            lesson?.slug?.includes('dynamics') ||
            lesson?.title?.toLowerCase()?.includes('force')
          ) || [],
          prerequisites: [],
          projects: ['Design a simple lever-based mechanism', 'Analyze forces in a truss structure']
        },
        {
          id: 'materials-science',
          name: 'Materials Science',
          description: 'Stress/strain analysis, elasticity, fatigue, and material properties',
          icon: 'Layers',
          difficulty: 'beginner', 
          estimatedHours: 2.7,
          color: '#3B82F6',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('materials') || 
            lesson?.title?.toLowerCase()?.includes('stress') ||
            lesson?.title?.toLowerCase()?.includes('strain')
          ) || [],
          prerequisites: ['statics-dynamics'],
          projects: ['Calculate stress on a beam under load', 'Material selection for engineering applications']
        },
        {
          id: 'thermodynamics',
          name: 'Thermodynamics',
          description: 'Laws of thermodynamics, cycles, and heat transfer principles',
          icon: 'Flame',
          difficulty: 'intermediate',
          estimatedHours: 2.8,
          color: '#EF4444',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('thermodynamics') ||
            lesson?.slug?.includes('heat-transfer') ||
            lesson?.title?.toLowerCase()?.includes('thermal')
          ) || [],
          prerequisites: ['statics-dynamics'],
          projects: ['Analyze efficiency of heat engine cycles', 'Design heat exchanger system']
        },
        {
          id: 'fluid-mechanics',
          name: 'Fluid Mechanics',
          description: 'Bernoulli principle, laminar/turbulent flow, and pump systems',
          icon: 'Waves',
          difficulty: 'intermediate',
          estimatedHours: 2.5,
          color: '#06B6D4',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('fluid') ||
            lesson?.slug?.includes('pumps') ||
            lesson?.title?.toLowerCase()?.includes('flow')
          ) || [],
          prerequisites: ['materials-science'],
          projects: ['Build a small pneumatic or hydraulic system', 'Design fluid transport system']
        },
        {
          id: 'mechanical-design',
          name: 'Mechanical Design',
          description: 'Gears, bearings, linkages, and mechanical drawings with CAD',
          icon: 'Cog',
          difficulty: 'intermediate',
          estimatedHours: 3.1,
          color: '#8B5CF6',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('design') ||
            lesson?.slug?.includes('gears') ||
            lesson?.slug?.includes('bearings') ||
            lesson?.slug?.includes('drawings')
          ) || [],
          prerequisites: ['materials-science', 'thermodynamics'],
          projects: ['Design gear transmission system', 'Create detailed mechanical drawings']
        },
        {
          id: 'manufacturing-processes',
          name: 'Manufacturing Processes',
          description: 'Machining, welding, additive manufacturing, and production methods',
          icon: 'Tool',
          difficulty: 'advanced',
          estimatedHours: 2.8,
          color: '#F59E0B',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('manufacturing') ||
            lesson?.slug?.includes('machining') ||
            lesson?.slug?.includes('welding') ||
            lesson?.slug?.includes('additive')
          ) || [],
          prerequisites: ['mechanical-design'],
          projects: ['Plan CNC machining operations', 'Design parts for 3D printing']
        },
        {
          id: 'robotics-fundamentals',
          name: 'Robotics Fundamentals',
          description: 'Actuators, sensors, and basic robot mechanics for automation',
          icon: 'Cpu',
          difficulty: 'advanced',
          estimatedHours: 2.9,
          color: '#EC4899',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('robotics') ||
            lesson?.slug?.includes('actuators') ||
            lesson?.slug?.includes('sensors') ||
            lesson?.title?.toLowerCase()?.includes('robot')
          ) || [],
          prerequisites: ['mechanical-design', 'fluid-mechanics'],
          projects: ['Build simple robotic arm', 'Program sensor-based control system']
        }
      ];

      // Calculate progress for each module
      return modules?.map(module => ({
        ...module,
        progress: this.calculateModuleProgress(module?.lessons || []),
        isLocked: validUserId ? !this.checkModuleUnlocked(module, modules, validUserId) : false,
        lessonsCount: module?.lessons?.length || 0,
        completedLessons: module?.lessons?.filter(lesson => 
          lesson?.userProgress?.completion_percentage === 100
        )?.length || 0
      }));

    } catch (error) {
      console.error('Error fetching mechanical modules:', error);
      // Return default modules even on error
      return [];
    }
  },

  // Get mechanical engineering skill tree
  async getMechanicalSkillTree(userId = null) {
    try {
      // Validate user ID first
      const validUserId = await this.validateUserId(userId);

      // Fix: Use array response and take the first active skill tree to handle multiple rows
      const { data: skillTreeArray, error } = await supabase?.from('skill_trees')?.select(`
          *,
          skill_nodes (
            *,
            lessons (
              id,
              title,
              slug,
              difficulty
            )
          )
        `)
        ?.eq('discipline', 'mechanical')
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: true })
        ?.limit(3); // Limit to prevent excessive data

      if (error) {
        console.error('Skill tree query error:', error);
        throw error;
      }

      // Take the first skill tree if multiple exist, or return empty if none
      let skillTree = null;
      if (skillTreeArray && skillTreeArray?.length > 0) {
        skillTree = skillTreeArray?.[0];
        
        // If multiple skill trees exist, log a warning
        if (skillTreeArray?.length > 1) {
          console.warn(`Found ${skillTreeArray?.length} mechanical skill trees, using the first one`);
        }
      }

      // Return empty skill tree if none found
      if (!skillTree) {
        return {
          id: null,
          name: 'Mechanical Engineering Skill Tree',
          discipline: 'mechanical',
          description: 'Master core mechanical engineering concepts',
          skill_nodes: [],
          is_active: true
        };
      }

      if (validUserId) {
        // Get user skill progress only with valid user ID
        const { data: userProgress } = await supabase?.from('user_skill_progress')?.select('*')?.eq('user_id', validUserId)?.in('skill_node_id', skillTree?.skill_nodes?.map(node => node?.id) || []);

        // Add progress to skill nodes
        skillTree.skill_nodes = skillTree?.skill_nodes?.map(node => ({
          ...node,
          userProgress: userProgress?.find(up => up?.skill_node_id === node?.id),
          isUnlocked: this.checkSkillNodeUnlocked(node, skillTree?.skill_nodes, userProgress)
        }));
      } else if (!validUserId && userId) {
        console.warn('Invalid user ID provided for skill tree, skipping user progress');
      }

      return skillTree;
    } catch (error) {
      console.error('Error fetching mechanical skill tree:', error);
      // Return empty skill tree on error
      return {
        id: null,
        name: 'Mechanical Engineering Skill Tree',
        discipline: 'mechanical',
        description: 'Master core mechanical engineering concepts',
        skill_nodes: [],
        is_active: true
      };
    }
  },

  // Get mechanical engineering achievements
  async getMechanicalAchievements(userId = null) {
    try {
      // Validate user ID first
      const validUserId = await this.validateUserId(userId);

      const { data: achievements, error } = await supabase?.from('achievement_types')?.select('*')?.eq('category', 'mechanical')?.eq('is_active', true)?.order('sort_order');

      if (error) {
        console.error('Achievements query error:', error);
        throw error;
      }

      if (validUserId && achievements?.length > 0) {
        // Get user earned achievements only with valid user ID
        const { data: userAchievements } = await supabase?.from('user_achievements')?.select('achievement_id, earned_at, progress_data')?.eq('user_id', validUserId)?.in('achievement_id', achievements?.map(a => a?.id) || []);

        // Add user progress to achievements
        return achievements?.map(achievement => ({
          ...achievement,
          userAchievement: userAchievements?.find(ua => ua?.achievement_id === achievement?.id),
          isEarned: userAchievements?.some(ua => ua?.achievement_id === achievement?.id)
        }));
      } else if (!validUserId && userId) {
        console.warn('Invalid user ID provided for achievements, skipping user progress');
      }

      return achievements || [];
    } catch (error) {
      console.error('Error fetching mechanical achievements:', error);
      return [];
    }
  },

  // Get today's mechanical engineering challenge
  async getTodayMechanicalChallenge(userId = null) {
    try {
      // Validate user ID first
      const validUserId = await this.validateUserId(userId);

      const today = new Date()?.toISOString()?.split('T')?.[0];
      
      // Use direct discipline filtering instead of subqueries
      const { data: challenge, error } = await supabase?.from('daily_challenges')?.select(`
          *,
          lessons!inner (
            id,
            title,
            difficulty,
            discipline
          )
        `)
        ?.eq('challenge_date', today)
        ?.eq('is_active', true)
        ?.eq('lessons.discipline', 'mechanical')
        ?.maybeSingle();

      if (error && error?.code !== 'PGRST116') {
        console.error('Daily challenge query error:', error);
        throw error;
      }
      
      if (!challenge) return null;

      if (validUserId) {
        // Check if user completed today's challenge only with valid user ID
        const { data: userChallenge } = await supabase?.from('user_daily_challenges')?.select('*')?.eq('user_id', validUserId)?.eq('challenge_id', challenge?.id)?.maybeSingle();

        challenge.userCompletion = userChallenge;
        challenge.isCompleted = !!userChallenge;
      } else if (!validUserId && userId) {
        console.warn('Invalid user ID provided for daily challenge, skipping user progress');
      }

      return challenge;
    } catch (error) {
      console.error('Error fetching mechanical daily challenge:', error);
      return null;
    }
  },

  // Start a lesson and track analytics
  async startLesson(userId, lessonId) {
    try {
      // Validate inputs and user ID
      const validUserId = await this.validateUserId(userId);
      if (!validUserId || !lessonId) {
        throw new Error('Valid User ID and Lesson ID are required');
      }

      const { data, error } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: validUserId,
          lesson_id: lessonId,
          status: 'in_progress',
          last_accessed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (error) throw error;

      // Track analytics event
      await this.trackEvent(validUserId, 'lesson_started', lessonId);

      return data;
    } catch (error) {
      console.error('Error starting lesson:', error);
      throw error;
    }
  },

  // Complete lesson and award achievements
  async completeLesson(userId, lessonId, completionData) {
    try {
      // Validate inputs and user ID
      const validUserId = await this.validateUserId(userId);
      if (!validUserId || !lessonId) {
        throw new Error('Valid User ID and Lesson ID are required');
      }

      const { data: progressData, error: progressError } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: validUserId,
          lesson_id: lessonId,
          ...completionData,
          status: 'completed',
          completed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (progressError) throw progressError;

      // Get lesson details for XP award
      const { data: lesson } = await supabase?.from('lessons')?.select('xp_reward, title')?.eq('id', lessonId)?.single();

      if (lesson) {
        // Award XP
        await supabase?.from('xp_transactions')?.insert({
            user_id: validUserId,
            amount: lesson?.xp_reward || 50,
            source: 'lesson_completion',
            reference_id: lessonId,
            description: `Completed ${lesson?.title}`
          });
      }

      // Check for new achievements
      await this.checkMechanicalAchievements(validUserId, lessonId);

      // Track analytics event
      await this.trackEvent(validUserId, 'lesson_completed', lessonId);

      return progressData;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  // Helper methods
  calculateModuleProgress(lessons) {
    if (!lessons?.length) return 0;
    
    const completedLessons = lessons?.filter(lesson => 
      lesson?.userProgress?.completion_percentage === 100
    );
    
    return Math.round((completedLessons?.length / lessons?.length) * 100);
  },

  checkModuleUnlocked(module, allModules, userId) {
    // First module (Statics & Dynamics) is always unlocked
    if (module?.prerequisites?.length === 0) return true;
    
    // Check if all prerequisite modules are completed
    return module?.prerequisites?.every(prereqId => {
      const prereqModule = allModules?.find(m => m?.id === prereqId);
      return prereqModule && prereqModule?.progress === 100;
    });
  },

  checkSkillNodeUnlocked(node, allNodes, userProgress) {
    // Check if prerequisites are met
    if (!node?.prerequisites || node?.prerequisites?.length === 0) return true;
    
    return node?.prerequisites?.every(prereqId => {
      const userNodeProgress = userProgress?.find(up => up?.skill_node_id === prereqId);
      return userNodeProgress && userNodeProgress?.status === 'completed';
    });
  },

  async checkMechanicalAchievements(userId, lessonId) {
    try {
      // Validate inputs
      if (!userId || !lessonId) return;

      // Get achievements related to this lesson
      const { data: achievements } = await supabase?.from('achievement_types')?.select('*')?.eq('category', 'mechanical')?.eq('is_active', true);

      for (const achievement of achievements || []) {
        const criteria = achievement?.unlock_criteria;
        
        if (criteria?.type === 'lesson_completion' && 
            criteria?.criteria?.lesson_id === lessonId) {
          
          // Check if user already has this achievement
          const { data: existing } = await supabase?.from('user_achievements')?.select('id')?.eq('user_id', userId)?.eq('achievement_id', achievement?.id)?.maybeSingle();

          if (!existing) {
            // Award achievement
            await supabase?.from('user_achievements')?.insert({
                user_id: userId,
                achievement_id: achievement?.id,
                progress_data: { lesson_id: lessonId }
              });

            // Track achievement earned event
            await this.trackEvent(userId, 'achievement_earned', achievement?.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  },

  async trackEvent(userId, eventType, referenceId) {
    try {
      // Validate inputs
      if (!userId || !eventType) return;

      await supabase?.from('analytics_events')?.insert({
          user_id: userId,
          event_type: eventType,
          event_data: { reference_id: referenceId },
          created_at: new Date()?.toISOString()
        });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
};