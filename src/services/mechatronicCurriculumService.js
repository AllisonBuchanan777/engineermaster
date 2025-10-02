import { supabase } from '../lib/supabase';

export const mechatronicCurriculumService = {
  // Helper method to validate and get current user ID
  async validateUserId(userId) {
    if (userId && typeof userId === 'string' && userId !== 'current-user-id' && userId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return userId;
    }

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

  // Get mechatronic modules organized by category with progressive unlocking
  async getMechatronicModules(userId = null) {
    try {
      const validUserId = await this.validateUserId(userId);
      
      // Get mechatronic engineering lessons (changed from mechanical to mechatronic)
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
        ?.eq('discipline', 'mechatronic')  // Changed from 'mechanical' to 'mechatronic'
        ?.eq('is_published', true)
        ?.order('created_at', { ascending: true });

      if (error) {
        console.error('Curriculum query error:', error);
      }

      // Aggregate lessons from mechatronic curriculum
      let allLessons = [];
      if (curriculumArray && curriculumArray?.length > 0) {
        curriculumArray?.forEach(path => {
          if (path?.lessons) {
            allLessons?.push(...path?.lessons);
          }
        });
        
        allLessons = allLessons
          ?.filter((lesson, index, self) => 
            index === self?.findIndex(l => l?.id === lesson?.id)
          )
          ?.sort((a, b) => (a?.order_index || 0) - (b?.order_index || 0));
      }

      // Get user progress if available
      let userProgress = [];
      if (validUserId && allLessons?.length > 0) {
        const lessonIds = allLessons?.map(lesson => lesson?.id);
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status, completed_at, time_spent_minutes')?.eq('user_id', validUserId)?.in('lesson_id', lessonIds);
        userProgress = progress || [];
        
        // Add progress to lessons
        allLessons = allLessons?.map(lesson => ({
          ...lesson,
          userProgress: userProgress?.find(p => p?.lesson_id === lesson?.id)
        }));
      }

      // Define mechatronic-specific modules with prerequisite system
      const mechatronicModules = [
        {
          id: 'integrated-systems',
          name: 'Integrated Systems',
          description: 'Combining mechanical, electrical, and computer systems into unified mechatronic solutions',
          icon: 'Cpu',
          difficulty: 'beginner',
          estimatedHours: 3.0,
          color: '#10B981',
          lessons: this.filterRelevantLessons(allLessons, ['systems', 'integration', 'mechatronic']),
          prerequisites: [],
          unlockRequirement: 0,
          projects: [
            'Build a line-following robot',
            'Design a simple automated door system',
            'Create a temperature monitoring system'
          ],
          keyTopics: [
            'System architecture design',
            'Mechanical-electrical interfaces',
            'Control system basics',
            'Component selection principles'
          ]
        },
        {
          id: 'sensors-actuators',
          name: 'Sensors & Actuators',
          description: 'Types, applications, and interfacing of sensors and actuators in mechatronic systems',
          icon: 'Radio',
          difficulty: 'beginner',
          estimatedHours: 2.8,
          color: '#3B82F6',
          lessons: this.filterRelevantLessons(allLessons, ['sensors', 'actuators', 'measurement']),
          prerequisites: ['integrated-systems'],
          unlockRequirement: 80,
          projects: [
            'Build a digital thermometer with display',
            'Create a servo motor positioning system',
            'Design an ultrasonic distance sensor array'
          ],
          keyTopics: [
            'Sensor types and characteristics',
            'Signal conditioning circuits',
            'Actuator selection and control',
            'Interfacing techniques'
          ]
        },
        {
          id: 'embedded-programming',
          name: 'Embedded Programming',
          description: 'Microcontroller-based system control and real-time programming for mechatronic applications',
          icon: 'Code',
          difficulty: 'intermediate',
          estimatedHours: 3.5,
          color: '#8B5CF6',
          lessons: this.filterRelevantLessons(allLessons, ['programming', 'microcontroller', 'embedded']),
          prerequisites: ['sensors-actuators'],
          unlockRequirement: 70,
          projects: [
            'Program a microcontroller for motor speed control',
            'Develop sensor data acquisition system',
            'Create real-time control algorithms'
          ],
          keyTopics: [
            'Microcontroller architectures',
            'Real-time programming concepts',
            'Interrupt handling',
            'Communication protocols (I2C, SPI, UART)'
          ]
        },
        {
          id: 'control-automation',
          name: 'Control & Automation',
          description: 'PID controllers, PLC basics, and automated system design for industrial applications',
          icon: 'Settings',
          difficulty: 'intermediate',
          estimatedHours: 3.2,
          color: '#EF4444',
          lessons: this.filterRelevantLessons(allLessons, ['control', 'automation', 'pid']),
          prerequisites: ['embedded-programming'],
          unlockRequirement: 75,
          projects: [
            'Design a temperature-controlled fan system',
            'Implement PID control for robot positioning',
            'Create automated conveyor belt system'
          ],
          keyTopics: [
            'Feedback control theory',
            'PID controller tuning',
            'PLC programming basics',
            'Industrial automation standards'
          ]
        },
        {
          id: 'signal-processing',
          name: 'Signal Acquisition & Processing',
          description: 'Analog-to-digital conversion, filtering, and signal processing for mechatronic systems',
          icon: 'BarChart3',
          difficulty: 'advanced',
          estimatedHours: 2.9,
          color: '#F59E0B',
          lessons: this.filterRelevantLessons(allLessons, ['signal', 'processing', 'digital']),
          prerequisites: ['control-automation'],
          unlockRequirement: 80,
          projects: [
            'Build a data acquisition system with filtering',
            'Design noise reduction circuits',
            'Implement digital signal processing algorithms'
          ],
          keyTopics: [
            'ADC/DAC principles',
            'Digital filtering techniques',
            'Signal conditioning',
            'Frequency domain analysis'
          ]
        },
        {
          id: 'robotics-systems',
          name: 'Robotics Systems',
          description: 'Kinematics, sensors, and motion planning for robotic mechatronic systems',
          icon: 'Bot',
          difficulty: 'advanced',
          estimatedHours: 4.0,
          color: '#EC4899',
          lessons: this.filterRelevantLessons(allLessons, ['robotics', 'kinematics', 'motion']),
          prerequisites: ['signal-processing'],
          unlockRequirement: 85,
          projects: [
            'Simulate a robotic arm in software',
            'Build a mobile robot with navigation',
            'Design pick-and-place automation system'
          ],
          keyTopics: [
            'Forward and inverse kinematics',
            'Path planning algorithms',
            'Robot sensing and perception',
            'Multi-axis control systems'
          ]
        }
      ];

      // Calculate progress and unlock status for each module
      return mechatronicModules?.map(module => {
        const moduleProgress = this.calculateModuleProgress(module?.lessons || []);
        const isUnlocked = this.checkModuleUnlocked(module, mechatronicModules, validUserId, userProgress);
        
        return {
          ...module,
          progress: moduleProgress,
          isLocked: !isUnlocked,
          lessonsCount: module?.lessons?.length || 0,
          completedLessons: module?.lessons?.filter(lesson => 
            lesson?.userProgress?.completion_percentage === 100
          )?.length || 0,
          totalTopics: module?.keyTopics?.length || 0,
          totalProjects: module?.projects?.length || 0
        };
      });

    } catch (error) {
      console.error('Error fetching mechatronic modules:', error);
      // Return default structure even on error
      return this.getDefaultMechatronicModules();
    }
  },

  // Filter lessons relevant to specific mechatronic topics
  filterRelevantLessons(lessons, keywords) {
    if (!lessons || !Array.isArray(lessons)) return [];
    
    return lessons?.filter(lesson => {
      const searchText = `${lesson?.title || ''} ${lesson?.description || ''} ${lesson?.slug || ''}`?.toLowerCase();
      return keywords?.some(keyword => searchText?.includes(keyword?.toLowerCase()));
    });
  },

  // Calculate overall module progress based on lesson completion
  calculateModuleProgress(lessons) {
    if (!lessons?.length) return 0;
    
    const completedLessons = lessons?.filter(lesson => 
      lesson?.userProgress?.completion_percentage === 100
    );
    
    return Math.round((completedLessons?.length / lessons?.length) * 100);
  },

  // Check if a module is unlocked based on prerequisites
  checkModuleUnlocked(module, allModules, userId, userProgress) {
    // First module (Integrated Systems) is always unlocked
    if (!module?.prerequisites || module?.prerequisites?.length === 0) return true;
    
    // Check if all prerequisite modules meet unlock requirement
    return module?.prerequisites?.every(prereqId => {
      const prereqModule = allModules?.find(m => m?.id === prereqId);
      if (!prereqModule) return false;
      
      const prereqProgress = this.calculateModuleProgress(prereqModule?.lessons || []);
      return prereqProgress >= (prereqModule?.unlockRequirement || 0);
    });
  },

  // Get current user's overall mechatronic progress
  async getMechatronicProgress(userId = null) {
    try {
      const validUserId = await this.validateUserId(userId);
      if (!validUserId) {
        return {
          overallProgress: 0,
          completedModules: 0,
          totalModules: 6,
          totalLessons: 0,
          completedLessons: 0,
          totalXP: 0,
          currentLevel: 1
        };
      }

      const modules = await this.getMechatronicModules(validUserId);
      
      const completedModules = modules?.filter(module => module?.progress === 100)?.length || 0;
      const totalLessons = modules?.reduce((sum, module) => sum + (module?.lessonsCount || 0), 0);
      const completedLessons = modules?.reduce((sum, module) => sum + (module?.completedLessons || 0), 0);
      
      // Get user's total XP from mechatronic-related activities
      const { data: xpData } = await supabase?.from('xp_transactions')?.select('amount')?.eq('user_id', validUserId)?.eq('source', 'lesson_completion');
      
      const totalXP = xpData?.reduce((sum, transaction) => sum + (transaction?.amount || 0), 0) || 0;
      const currentLevel = Math.floor(totalXP / 100) + 1; // 100 XP per level
      
      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        overallProgress,
        completedModules,
        totalModules: 6,
        totalLessons,
        completedLessons,
        totalXP,
        currentLevel
      };
    } catch (error) {
      console.error('Error calculating mechatronic progress:', error);
      return {
        overallProgress: 0,
        completedModules: 0,
        totalModules: 6,
        totalLessons: 0,
        completedLessons: 0,
        totalXP: 0,
        currentLevel: 1
      };
    }
  },

  // Get today's mechatronic challenge
  async getTodayMechatronicChallenge(userId = null) {
    try {
      const validUserId = await this.validateUserId(userId);
      const today = new Date()?.toISOString()?.split('T')?.[0];
      
      // Look for mechatronic engineering challenges (changed from mechanical)
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
        ?.eq('lessons.discipline', 'mechatronic')  // Changed from 'mechanical' to 'mechatronic'
        ?.maybeSingle();

      if (error && error?.code !== 'PGRST116') {
        console.error('Daily challenge query error:', error);
        return null;
      }
      
      if (!challenge) return null;

      // Add mechatronic context to the challenge
      const mechatronicChallenge = {
        ...challenge,
        title: `Mechatronic ${challenge?.description?.split(' ')?.slice(0, 3)?.join(' ')}`,
        mechatronicFocus: this.getMechatronicFocusForChallenge(challenge),
        bonusPoints: Math.floor(challenge?.reward_points * 1.2) // 20% bonus for mechatronic focus
      };

      if (validUserId) {
        const { data: userChallenge } = await supabase?.from('user_daily_challenges')?.select('*')?.eq('user_id', validUserId)?.eq('challenge_id', challenge?.id)?.maybeSingle();
        
        mechatronicChallenge.userCompletion = userChallenge;
        mechatronicChallenge.isCompleted = !!userChallenge;
      }

      return mechatronicChallenge;
    } catch (error) {
      console.error('Error fetching mechatronic daily challenge:', error);
      return null;
    }
  },

  // Add mechatronic context to challenges
  getMechatronicFocusForChallenge(challenge) {
    const focusAreas = [
      'Apply systems thinking to integrate mechanical and electrical components',
      'Consider sensor-actuator interfaces in your solution',
      'Think about real-time control requirements',
      'Design for automation and smart functionality',
      'Incorporate feedback control principles',
      'Consider signal processing and data acquisition needs'
    ];
    
    return focusAreas?.[Math.floor(Math.random() * focusAreas?.length)];
  },

  // Get mechatronic achievements
  async getMechatronicAchievements(userId = null) {
    try {
      const validUserId = await this.validateUserId(userId);

      // Get mechatronic achievements (changed from mechanical to mechatronic)
      const { data: achievements, error } = await supabase?.from('achievement_types')?.select('*')?.eq('category', 'mechatronic')?.eq('is_active', true)?.order('sort_order');

      if (error) {
        console.error('Achievements query error:', error);
        return [];
      }

      // Add mechatronic-specific context to achievements
      const mechatronicAchievements = achievements?.map(achievement => ({
        ...achievement,
        name: achievement?.name, // Remove the "Mechatronic" prefix since these are already mechatronic achievements
        description: achievement?.description,
        mechatronicBonus: Math.floor(achievement?.xp_reward * 1.15) // 15% XP bonus for mechatronic achievements
      })) || [];

      if (validUserId && mechatronicAchievements?.length > 0) {
        const { data: userAchievements } = await supabase?.from('user_achievements')?.select('achievement_id, earned_at, progress_data')?.eq('user_id', validUserId)?.in('achievement_id', achievements?.map(a => a?.id) || []);

        return mechatronicAchievements?.map(achievement => ({
          ...achievement,
          userAchievement: userAchievements?.find(ua => ua?.achievement_id === achievement?.id),
          isEarned: userAchievements?.some(ua => ua?.achievement_id === achievement?.id)
        }));
      }

      return mechatronicAchievements;
    } catch (error) {
      console.error('Error fetching mechatronic achievements:', error);
      return [];
    }
  },

  // Get default modules structure for fallback
  getDefaultMechatronicModules() {
    return [
      {
        id: 'integrated-systems',
        name: 'Integrated Systems',
        description: 'Combining mechanical, electrical, and computer systems',
        icon: 'Cpu',
        difficulty: 'beginner',
        estimatedHours: 3.0,
        color: '#10B981',
        lessons: [],
        prerequisites: [],
        progress: 0,
        isLocked: false,
        lessonsCount: 0,
        completedLessons: 0,
        projects: ['Build a line-following robot']
      },
      {
        id: 'sensors-actuators',
        name: 'Sensors & Actuators',
        description: 'Types, applications, and interfacing',
        icon: 'Radio',
        difficulty: 'beginner',
        estimatedHours: 2.8,
        color: '#3B82F6',
        lessons: [],
        prerequisites: ['integrated-systems'],
        progress: 0,
        isLocked: true,
        lessonsCount: 0,
        completedLessons: 0,
        projects: ['Design a temperature-controlled fan system']
      },
      {
        id: 'embedded-programming',
        name: 'Embedded Programming',
        description: 'Microcontroller-based system control',
        icon: 'Code',
        difficulty: 'intermediate',
        estimatedHours: 3.5,
        color: '#8B5CF6',
        lessons: [],
        prerequisites: ['sensors-actuators'],
        progress: 0,
        isLocked: true,
        lessonsCount: 0,
        completedLessons: 0,
        projects: ['Program sensor data acquisition']
      },
      {
        id: 'control-automation',
        name: 'Control & Automation',
        description: 'PID controllers and automation systems',
        icon: 'Settings',
        difficulty: 'intermediate',
        estimatedHours: 3.2,
        color: '#EF4444',
        lessons: [],
        prerequisites: ['embedded-programming'],
        progress: 0,
        isLocked: true,
        lessonsCount: 0,
        completedLessons: 0,
        projects: ['Implement PID control system']
      },
      {
        id: 'signal-processing',
        name: 'Signal Acquisition & Processing',
        description: 'ADC, filtering, and signal processing',
        icon: 'BarChart3',
        difficulty: 'advanced',
        estimatedHours: 2.9,
        color: '#F59E0B',
        lessons: [],
        prerequisites: ['control-automation'],
        progress: 0,
        isLocked: true,
        lessonsCount: 0,
        completedLessons: 0,
        projects: ['Build data acquisition system']
      },
      {
        id: 'robotics-systems',
        name: 'Robotics Systems',
        description: 'Kinematics, sensors, and motion planning',
        icon: 'Bot',
        difficulty: 'advanced',
        estimatedHours: 4.0,
        color: '#EC4899',
        lessons: [],
        prerequisites: ['signal-processing'],
        progress: 0,
        isLocked: true,
        lessonsCount: 0,
        completedLessons: 0,
        projects: ['Simulate a robotic arm in software']
      }
    ];
  },

  // Start a lesson (delegate to mechanical service for actual implementation)
  async startLesson(userId, lessonId) {
    try {
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

      // Track mechatronic-specific analytics
      await this.trackEvent(validUserId, 'lesson_started', lessonId, { context: 'mechatronic' });

      return data;
    } catch (error) {
      console.error('Error starting mechatronic lesson:', error);
      throw error;
    }
  },

  // Complete lesson with mechatronic context
  async completeLesson(userId, lessonId, completionData) {
    try {
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
        // Award bonus XP for mechatronic context (15% bonus)
        const mechatronicBonus = Math.floor((lesson?.xp_reward || 50) * 0.15);
        const totalXP = (lesson?.xp_reward || 50) + mechatronicBonus;
        
        await supabase?.from('xp_transactions')?.insert({
            user_id: validUserId,
            amount: totalXP,
            source: 'lesson_completion',
            reference_id: lessonId,
            description: `Completed ${lesson?.title} (Mechatronic Focus)`
          });
      }

      // Track mechatronic completion
      await this.trackEvent(validUserId, 'lesson_completed', lessonId, { context: 'mechatronic', bonus_applied: true });

      return progressData;
    } catch (error) {
      console.error('Error completing mechatronic lesson:', error);
      throw error;
    }
  },

  // Track analytics with mechatronic context
  async trackEvent(userId, eventType, referenceId, additionalData = {}) {
    try {
      if (!userId || !eventType) return;

      await supabase?.from('analytics_events')?.insert({
          user_id: userId,
          event_type: eventType,
          event_data: { 
            reference_id: referenceId, 
            context: 'mechatronic_curriculum',
            ...additionalData 
          },
          created_at: new Date()?.toISOString()
        });
    } catch (error) {
      console.error('Error tracking mechatronic event:', error);
    }
  }
};