import { supabase } from '../lib/supabase';

export const electricalCurriculumService = {
  // Get electrical engineering curriculum with user progress
  async getElectricalCurriculum(userId = null) {
    try {
      // FIXED: Specify the exact relationship to resolve PostgreSQL ambiguity
      // Using the one-to-many relationship via lessons.learning_path_id
      const { data: curriculum, error } = await supabase?.from('learning_paths')?.select(`
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
        ?.eq('name', 'Complete Electrical Engineering Mastery')
        ?.eq('discipline', 'electrical')
        ?.eq('is_published', true)
        ?.single();

      // Handle case where no curriculum is found
      if (error && error?.code === 'PGRST116') {
        console.warn('Electrical curriculum not found in database');
        return {
          id: 'fallback-electrical-curriculum',
          name: 'Complete Electrical Engineering Mastery',
          description: 'Master electrical engineering from circuit fundamentals to advanced signal processing',
          discipline: 'electrical',
          lessons: [],
          overallProgress: 0
        };
      }

      if (error) throw error;

      // Get user progress if userId provided and is valid UUID
      if (userId && this.isValidUUID(userId) && curriculum?.lessons?.length > 0) {
        const lessonIds = curriculum?.lessons?.map(lesson => lesson?.id);
        
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status, completed_at, time_spent_minutes')?.eq('user_id', userId)?.in('lesson_id', lessonIds);

        const { data: skillProgress } = await supabase?.from('user_skill_progress')?.select(`
            *,
            skill_nodes (
              name,
              tier,
              lesson_id
            )
          `)?.eq('user_id', userId);

        // Add progress to lessons
        curriculum.lessons = curriculum?.lessons?.map(lesson => ({
          ...lesson,
          userProgress: progress?.find(p => p?.lesson_id === lesson?.id),
          skillProgress: skillProgress?.find(sp => sp?.skill_nodes?.lesson_id === lesson?.id)
        }));

        // Calculate overall curriculum progress
        const completedLessons = progress?.filter(p => p?.completion_percentage === 100)?.length || 0;
        curriculum.overallProgress = Math.round((completedLessons / curriculum?.lessons?.length) * 100);
      } else {
        curriculum.overallProgress = 0;
      }

      return curriculum;
    } catch (error) {
      console.error('Error fetching electrical curriculum:', error);
      // Return fallback structure instead of throwing
      return {
        id: 'fallback-electrical-curriculum',
        name: 'Complete Electrical Engineering Mastery',
        description: 'Master electrical engineering from circuit fundamentals to advanced signal processing',
        discipline: 'electrical',
        lessons: [],
        overallProgress: 0
      };
    }
  },

  // Get electrical engineering modules organized by category
  async getElectricalModules(userId = null) {
    try {
      const curriculum = await this.getElectricalCurriculum(userId);
      
      if (!curriculum?.lessons || curriculum?.lessons?.length === 0) {
        // Return fallback module structure
        return this.getFallbackElectricalModules();
      }

      // Organize lessons into modules based on content
      const modules = [
        {
          id: 'circuit-analysis',
          name: 'Circuit Analysis',
          description: 'Master Ohm\'s Law, Kirchhoff\'s Laws, and circuit analysis fundamentals',
          icon: 'Zap',
          difficulty: 'beginner',
          estimatedHours: 1.5,
          color: '#10B981',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('circuit-analysis') || 
            lesson?.title?.toLowerCase()?.includes('circuit')
          ),
          prerequisites: [],
          projects: ['Build a simple LED circuit']
        },
        {
          id: 'electronics',
          name: 'Electronics',
          description: 'Semiconductor devices: diodes, transistors, operational amplifiers',
          icon: 'Cpu',
          difficulty: 'intermediate', 
          estimatedHours: 1.8,
          color: '#3B82F6',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('electronics') || 
            lesson?.title?.toLowerCase()?.includes('diode') ||
            lesson?.title?.toLowerCase()?.includes('transistor')
          ),
          prerequisites: ['circuit-analysis'],
          projects: ['Audio amplifier circuit design']
        },
        {
          id: 'digital-systems',
          name: 'Digital Systems',
          description: 'Logic gates, flip-flops, combinational and sequential circuits',
          icon: 'Binary',
          difficulty: 'intermediate',
          estimatedHours: 2.0,
          color: '#8B5CF6',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('digital') ||
            lesson?.title?.toLowerCase()?.includes('logic')
          ),
          prerequisites: ['circuit-analysis'],
          projects: ['Create a digital counter with flip-flops']
        },
        {
          id: 'microcontrollers',
          name: 'Microcontrollers & Embedded Systems',
          description: 'Arduino/Raspberry Pi programming, sensors, actuators',
          icon: 'Microchip',
          difficulty: 'intermediate',
          estimatedHours: 2.5,
          color: '#F59E0B',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('microcontroller') ||
            lesson?.title?.toLowerCase()?.includes('embedded')
          ),
          prerequisites: ['digital-systems'],
          projects: ['Program a microcontroller to control a motor']
        },
        {
          id: 'power-systems',
          name: 'Power Systems',
          description: 'AC/DC circuits, transformers, motors, generators',
          icon: 'Zap',
          difficulty: 'advanced',
          estimatedHours: 2.3,
          color: '#EF4444',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('power') ||
            lesson?.title?.toLowerCase()?.includes('motor')
          ),
          prerequisites: ['electronics'],
          projects: ['Variable speed motor drive system']
        },
        {
          id: 'control-systems',
          name: 'Control Systems',
          description: 'Feedback loops, PID controllers, stability analysis',
          icon: 'Settings',
          difficulty: 'advanced',
          estimatedHours: 2.3,
          color: '#6366F1',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('control') ||
            lesson?.title?.toLowerCase()?.includes('pid')
          ),
          prerequisites: ['power-systems'],
          projects: ['Temperature control system with PID']
        },
        {
          id: 'signal-processing',
          name: 'Signal Processing',
          description: 'Filters, Fourier transforms, basic DSP applications',
          icon: 'Waveform',
          difficulty: 'advanced',
          estimatedHours: 2.7,
          color: '#EC4899',
          lessons: curriculum?.lessons?.filter(lesson => 
            lesson?.slug?.includes('signal') ||
            lesson?.title?.toLowerCase()?.includes('filter')
          ),
          prerequisites: ['control-systems'],
          projects: ['Digital audio filter implementation']
        }
      ];

      // Calculate progress for each module
      return modules?.map(module => ({
        ...module,
        progress: this.calculateModuleProgress(module?.lessons || []),
        isLocked: userId ? !this.checkModuleUnlocked(module, modules, userId) : false,
        lessonsCount: module?.lessons?.length || 0,
        completedLessons: module?.lessons?.filter(lesson => 
          lesson?.userProgress?.completion_percentage === 100
        )?.length || 0
      }));

    } catch (error) {
      console.error('Error fetching electrical modules:', error);
      return this.getFallbackElectricalModules();
    }
  },

  // Get electrical engineering skill tree
  async getElectricalSkillTree(userId = null) {
    try {
      const { data: skillTree, error } = await supabase?.from('skill_trees')?.select(`
          *,
          skill_nodes (
            *,
            lessons!skill_nodes_lesson_id_fkey (
              id,
              title,
              slug,
              difficulty
            )
          )
        `)
        ?.eq('name', 'Electrical Engineering Mastery Path')
        ?.eq('is_active', true)
        ?.single();

      // Handle case where no skill tree is found
      if (error && error?.code === 'PGRST116') {
        console.warn('Electrical skill tree not found in database');
        return this.getFallbackSkillTree();
      }

      if (error) {
        console.error('Error fetching skill tree:', error);
        return this.getFallbackSkillTree();
      }

      if (userId && this.isValidUUID(userId) && skillTree?.skill_nodes?.length > 0) {
        // Get user skill progress
        const { data: userProgress } = await supabase?.from('user_skill_progress')?.select('*')?.eq('user_id', userId)?.in('skill_node_id', skillTree?.skill_nodes?.map(node => node?.id) || []);

        // Add progress to skill nodes
        skillTree.skill_nodes = skillTree?.skill_nodes?.map(node => ({
          ...node,
          userProgress: userProgress?.find(up => up?.skill_node_id === node?.id),
          isUnlocked: this.checkSkillNodeUnlocked(node, skillTree?.skill_nodes, userProgress)
        }));
      }

      return skillTree;
    } catch (error) {
      console.error('Error fetching electrical skill tree:', error);
      return this.getFallbackSkillTree();
    }
  },

  // Get electrical engineering achievements
  async getElectricalAchievements(userId = null) {
    try {
      const { data: achievements, error } = await supabase?.from('achievement_types')?.select('*')?.eq('category', 'electrical')?.eq('is_active', true)?.order('sort_order');

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      const achievementsData = achievements || [];

      if (userId && this.isValidUUID(userId) && achievementsData?.length > 0) {
        // Get user earned achievements
        const { data: userAchievements } = await supabase?.from('user_achievements')?.select('achievement_id, earned_at, progress_data')?.eq('user_id', userId)?.in('achievement_id', achievementsData?.map(a => a?.id) || []);

        // Add user progress to achievements
        return achievementsData?.map(achievement => ({
          ...achievement,
          userAchievement: userAchievements?.find(ua => ua?.achievement_id === achievement?.id),
          isEarned: userAchievements?.some(ua => ua?.achievement_id === achievement?.id)
        }));
      }

      return achievementsData;
    } catch (error) {
      console.error('Error fetching electrical achievements:', error);
      return [];
    }
  },

  // FIXED: Fixed the subquery pattern in daily challenge method
  async getTodayElectricalChallenge(userId = null) {
    try {
      const today = new Date()?.toISOString()?.split('T')?.[0];
      
      // FIXED: Use the specific foreign key relationship to avoid ambiguity
      const { data: challenge, error } = await supabase?.from('daily_challenges')?.select(`
          *,
          lessons!daily_challenges_lesson_id_fkey (
            id,
            title,
            difficulty,
            discipline
          )
        `)
        ?.eq('challenge_date', today)
        ?.eq('is_active', true)
        ?.eq('lessons.discipline', 'electrical')  // Direct filtering instead of subquery
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      if (!challenge) return null;

      if (userId && this.isValidUUID(userId)) {
        // Check if user completed today's challenge
        const { data: userChallenge } = await supabase?.from('user_daily_challenges')?.select('*')?.eq('user_id', userId)?.eq('challenge_id', challenge?.id)?.single();

        challenge.userCompletion = userChallenge;
        challenge.isCompleted = !!userChallenge;
      }

      return challenge;
    } catch (error) {
      console.error('Error fetching electrical daily challenge:', error);
      return null;
    }
  },

  // Start a lesson and track analytics
  async startLesson(userId, lessonId) {
    try {
      if (!userId || !this.isValidUUID(userId) || !lessonId) {
        throw new Error('Valid user ID and lesson ID are required');
      }

      const { data, error } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'in_progress',
          last_accessed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (error) throw error;

      // Track analytics event
      await this.trackEvent(userId, 'lesson_started', lessonId);

      return data;
    } catch (error) {
      console.error('Error starting lesson:', error);
      throw error;
    }
  },

  // Complete lesson and award achievements
  async completeLesson(userId, lessonId, completionData) {
    try {
      if (!userId || !this.isValidUUID(userId) || !lessonId) {
        throw new Error('Valid user ID and lesson ID are required');
      }

      const { data: progressData, error: progressError } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
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
            user_id: userId,
            amount: lesson?.xp_reward || 50,
            source: 'lesson_completion',
            reference_id: lessonId,
            description: `Completed ${lesson?.title}`
          });
      }

      // Check for new achievements
      await this.checkElectricalAchievements(userId, lessonId);

      // Track analytics event
      await this.trackEvent(userId, 'lesson_completed', lessonId);

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
    // First module (Circuit Analysis) is always unlocked
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

  async checkElectricalAchievements(userId, lessonId) {
    try {
      if (!userId || !this.isValidUUID(userId)) return;

      // Get achievements related to this lesson
      const { data: achievements } = await supabase?.from('achievement_types')?.select('*')?.eq('category', 'electrical')?.eq('is_active', true);

      for (const achievement of achievements || []) {
        const criteria = achievement?.unlock_criteria;
        
        if (criteria?.type === 'lesson_completion' && 
            criteria?.criteria?.lesson_id === lessonId) {
          
          // Check if user already has this achievement
          const { data: existing } = await supabase?.from('user_achievements')?.select('id')?.eq('user_id', userId)?.eq('achievement_id', achievement?.id)?.single();

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
      if (!userId || !this.isValidUUID(userId)) return;

      await supabase?.from('analytics_events')?.insert({
          user_id: userId,
          event_type: eventType,
          event_data: { reference_id: referenceId },
          created_at: new Date()?.toISOString()
        });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  // Utility function to validate UUID
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex?.test(uuid);
  },

  // Fallback data structures
  getFallbackElectricalModules() {
    return [
      {
        id: 'circuit-analysis',
        name: 'Circuit Analysis',
        description: 'Master Ohm\'s Law, Kirchhoff\'s Laws, and circuit analysis fundamentals',
        icon: 'Zap',
        difficulty: 'beginner',
        estimatedHours: 1.5,
        color: '#10B981',
        lessons: [],
        prerequisites: [],
        projects: ['Build a simple LED circuit'],
        progress: 0,
        isLocked: false,
        lessonsCount: 0,
        completedLessons: 0
      },
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Semiconductor devices: diodes, transistors, operational amplifiers',
        icon: 'Cpu',
        difficulty: 'intermediate',
        estimatedHours: 1.8,
        color: '#3B82F6',
        lessons: [],
        prerequisites: ['circuit-analysis'],
        projects: ['Audio amplifier circuit design'],
        progress: 0,
        isLocked: true,
        lessonsCount: 0,
        completedLessons: 0
      }
    ];
  },

  getFallbackSkillTree() {
    return {
      id: 'fallback-electrical-skill-tree',
      name: 'Electrical Engineering Skill Tree',
      description: 'Progressive skill development path for electrical engineering expertise',
      discipline: 'electrical',
      is_active: true,
      skill_nodes: []
    };
  }
};