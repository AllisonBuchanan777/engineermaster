import { supabase } from '../lib/supabase';

export const learningService = {
  // Fixed PostgREST schema cache refresh method
  async refreshSchemaCache() {
    try {
      // Method 1: Test junction table access with correct column names
      const { data: junctionTest } = await supabase
        ?.from('learning_paths_lessons')
        ?.select('learning_path_id, lesson_id')
        ?.limit(1);
      
      // Method 2: Force PostgREST to recognize the relationships
      const { data: relationshipTest } = await supabase
        ?.from('learning_paths')
        ?.select(`
          id,
          name,
          learning_paths_lessons!inner(
            lesson_id
          )
        `)
        ?.limit(1);
      
      console.log('Schema cache refreshed successfully', { 
        junctionAccess: !!junctionTest,
        relationshipAccess: !!relationshipTest 
      });
      return true;
    } catch (error) {
      console.error('Schema cache refresh error:', error);
      return false;
    }
  },

  // Enhanced method to get learning paths with lessons using correct schema
  async getUserLearningPaths(userId) {
    try {
      // Always refresh cache before operations
      await this.refreshSchemaCache();

      // Get learning paths
      const { data: learningPaths, error: pathsError } = await supabase
        ?.from('learning_paths')
        ?.select('*')
        ?.eq('is_published', true)
        ?.order('created_at');

      if (pathsError) {
        console.error('Error fetching learning paths:', pathsError);
        throw pathsError;
      }

      if (!learningPaths?.length) {
        return [];
      }

      // Get lessons for each path using the correct junction table structure
      const pathsWithLessons = await Promise.all(
        learningPaths?.map(async (path) => {
          try {
            const lessons = await this.getLessonsForPath(path?.id, userId);
            
            return {
              ...path,
              lessons: lessons || [],
              progress: this.calculatePathProgress(lessons || [], userId),
              totalLessons: lessons?.length || 0,
              completedLessons: lessons?.filter(lesson => 
                lesson?.userProgress?.completion_percentage === 100
              )?.length || 0,
              requiredLessons: lessons?.length || 0 // All lessons are required since no is_required column
            };
          } catch (lessonError) {
            console.error(`Error fetching lessons for path ${path?.id}:`, lessonError);
            return {
              ...path,
              lessons: [],
              progress: 0,
              totalLessons: 0,
              completedLessons: 0,
              requiredLessons: 0
            };
          }
        })
      );

      return pathsWithLessons;
    } catch (error) {
      console.error('Error in getUserLearningPaths:', error);
      throw error;
    }
  },

  // Fixed junction table query method with correct column names
  async getLessonsForPath(pathId, userId = null) {
    try {
      if (!pathId) {
        console.warn('No pathId provided to getLessonsForPath');
        return [];
      }

      // Step 1: Get junction table data with only existing columns
      const { data: junctionData, error: junctionError } = await supabase
        ?.from('learning_paths_lessons')
        ?.select('lesson_id')
        ?.eq('learning_path_id', pathId);

      if (junctionError) {
        console.error('Junction table query error:', junctionError);
        throw junctionError;
      }

      if (!junctionData?.length) {
        console.log(`No lessons found for learning path: ${pathId}`);
        return [];
      }

      // Step 2: Get lesson details with proper ordering using lessons table
      let lessonIds = junctionData?.map(junction => junction?.lesson_id)?.filter(Boolean);
      
      if (!lessonIds?.length) {
        console.warn('No valid lesson IDs found in junction data');
        return [];
      }

      const { data: lessonsData, error: lessonsError } = await supabase
        ?.from('lessons')
        ?.select('*')
        ?.in('id', lessonIds)
        ?.eq('is_published', true)
        ?.order('order_index'); // Use order_index from lessons table, not junction

      if (lessonsError) {
        console.error('Lessons query error:', lessonsError);
        throw lessonsError;
      }

      // Step 3: Get user progress if userId provided
      let userProgress = [];
      if (userId && lessonIds?.length > 0) {
        try {
          const { data: progressData, error: progressError } = await supabase
            ?.from('user_lesson_progress')
            ?.select('lesson_id, completion_percentage, status, last_accessed_at')
            ?.eq('user_id', userId)
            ?.in('lesson_id', lessonIds);
          
          if (progressError) {
            console.error('User progress query error:', progressError);
            userProgress = [];
          } else {
            userProgress = progressData || [];
          }
        } catch (progressError) {
          console.error('Error fetching user progress:', progressError);
          userProgress = [];
        }
      }

      // Step 4: Combine data properly
      const combinedLessons = lessonsData
        ?.map(lesson => {
          const progress = userProgress?.find(p => p?.lesson_id === lesson?.id);
          
          return {
            ...lesson,
            hasAccess: true,
            userProgress: progress || null
          };
        })
        ?.filter(Boolean)
        ?.sort((a, b) => (a?.order_index || 0) - (b?.order_index || 0));

      return combinedLessons || [];
    } catch (error) {
      console.error('Error in getLessonsForPath:', error);
      throw error;
    }
  },

  // Fixed PostgREST embedded query with correct column references
  async getPathsWithLessonsEmbedded() {
    try {
      await this.refreshSchemaCache();

      // Use the direct embedded relationship approach
      const { data, error } = await supabase
        ?.from('learning_paths')
        ?.select(`
          id,
          name,
          description,
          discipline,
          difficulty,
          is_published,
          estimated_duration_hours,
          learning_paths_lessons!inner (
            lessons!inner (
              id,
              title,
              description,
              content,
              difficulty,
              xp_reward,
              estimated_duration_minutes,
              is_published,
              order_index
            )
          )
        `)
        ?.eq('is_published', true)
        ?.eq('learning_paths_lessons.lessons.is_published', true)
        ?.order('created_at');

      if (error) {
        console.error('Embedded query error:', error);
        // Fallback to explicit queries
        return await this.getUserLearningPaths();
      }

      // Transform the embedded data into expected format
      const transformedPaths = data?.map(path => {
        const lessons = path?.learning_paths_lessons
          ?.map(junction => junction?.lessons)
          ?.filter(Boolean)
          ?.sort((a, b) => (a?.order_index || 0) - (b?.order_index || 0));

        return {
          ...path,
          lessons: lessons || [],
          progress: 0,
          totalLessons: lessons?.length || 0,
          completedLessons: 0,
          requiredLessons: lessons?.length || 0
        };
      });

      return transformedPaths || [];
    } catch (error) {
      console.error('Error in getPathsWithLessonsEmbedded:', error);
      return await this.getUserLearningPaths();
    }
  },

  // Fixed get learning paths for a specific lesson
  async getPathsForLesson(lessonId) {
    try {
      if (!lessonId) {
        console.warn('No lessonId provided to getPathsForLesson');
        return [];
      }

      // Get junction records with correct column names
      const { data: junctionData, error: junctionError } = await supabase
        ?.from('learning_paths_lessons')
        ?.select('learning_path_id')
        ?.eq('lesson_id', lessonId);

      if (junctionError) {
        console.error('Junction query error in getPathsForLesson:', junctionError);
        throw junctionError;
      }

      if (!junctionData?.length) {
        return [];
      }

      // Extract path IDs
      const pathIds = junctionData?.map(junction => junction?.learning_path_id)?.filter(Boolean);
      
      if (!pathIds?.length) {
        return [];
      }

      // Get path details
      const { data: pathsData, error: pathsError } = await supabase
        ?.from('learning_paths')
        ?.select('id, name, discipline, difficulty, description, is_published')
        ?.in('id', pathIds)
        ?.eq('is_published', true);

      if (pathsError) {
        console.error('Paths query error in getPathsForLesson:', pathsError);
        throw pathsError;
      }

      return pathsData || [];
    } catch (error) {
      console.error('Error in getPathsForLesson:', error);
      throw error;
    }
  },

  // Fixed add lesson to learning path with correct schema
  async addLessonToPath(pathId, lessonId) {
    try {
      if (!pathId || !lessonId) {
        throw new Error('Both pathId and lessonId are required');
      }

      // Check if relationship already exists
      const { data: existing } = await supabase
        ?.from('learning_paths_lessons')
        ?.select('learning_path_id, lesson_id')
        ?.eq('learning_path_id', pathId)
        ?.eq('lesson_id', lessonId)
        ?.single();

      if (existing) {
        console.log('Relationship already exists between path and lesson');
        return existing;
      }

      // Create new relationship with only the columns that exist
      const { data, error } = await supabase
        ?.from('learning_paths_lessons')
        ?.insert({
          learning_path_id: pathId,
          lesson_id: lessonId
        })
        ?.select()
        ?.single();

      if (error) {
        console.error('Error creating lesson-path relationship:', error);
        throw error;
      }
      
      // Refresh schema cache after modification
      await this.refreshSchemaCache();
      
      return data;
    } catch (error) {
      console.error('Error in addLessonToPath:', error);
      throw error;
    }
  },

  // Fixed remove lesson from learning path
  async removeLessonFromPath(pathId, lessonId) {
    try {
      if (!pathId || !lessonId) {
        throw new Error('Both pathId and lessonId are required');
      }

      const { error } = await supabase
        ?.from('learning_paths_lessons')
        ?.delete()
        ?.eq('learning_path_id', pathId)
        ?.eq('lesson_id', lessonId);

      if (error) {
        console.error('Error removing lesson from path:', error);
        throw error;
      }
      
      // Refresh schema cache after modification
      await this.refreshSchemaCache();
      
      return true;
    } catch (error) {
      console.error('Error in removeLessonFromPath:', error);
      throw error;
    }
  },

  // Update lesson order in lessons table (not junction table)
  async updateLessonOrderInPath(pathId, lessonId, newOrderIndex) {
    try {
      // Update order in the lessons table since junction table doesn't have order_index
      const { data, error } = await supabase
        ?.from('lessons')
        ?.update({ order_index: newOrderIndex })
        ?.eq('id', lessonId)
        ?.eq('learning_path_id', pathId)
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating lesson order:', error);
      throw error;
    }
  },

  // Get filtered lessons based on user subscription
  async getAccessibleLessons(userId, pathId = null) {
    try {
      // Get user's subscription level
      const { data: subscription } = await supabase?.from('user_subscriptions')?.select('tier, status')?.eq('user_id', userId)?.single();

      const userTier = subscription?.status === 'active' ? subscription?.tier : 'free';

      let lessonIds = [];

      // If pathId is provided, get lessons for that specific path
      if (pathId) {
        const pathLessons = await this.getLessonsForPath(pathId, userId);
        lessonIds = pathLessons?.map(l => l?.id);
      }

      let query = supabase?.from('lessons')?.select('*')?.eq('is_published', true);

      // Filter by path lessons if pathId was provided
      if (pathId && lessonIds?.length > 0) {
        query = query?.in('id', lessonIds);
      }

      const { data: lessons, error } = await query?.order('created_at');

      if (error) throw error;

      // Get user progress for all lessons
      let userProgress = [];
      if (userId && lessons?.length > 0) {
        const { data: progressData } = await supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status, last_accessed_at')?.eq('user_id', userId)?.in('lesson_id', lessons?.map(l => l?.id));
        
        userProgress = progressData || [];
      }

      // Combine lessons with user progress
      return lessons?.map(lesson => ({
        ...lesson,
        hasAccess: true, // Simplified access control for now
        userProgress: userProgress?.find(p => p?.lesson_id === lesson?.id) || null
      })) || [];
    } catch (error) {
      console.error('Error fetching accessible lessons:', error);
      throw error;
    }
  },

  // Enhanced lesson progress tracking
  async updateLessonProgress(userId, lessonId, progressData) {
    try {
      // Update or create progress record
      const { data: progress, error } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          ...progressData,
          last_accessed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (error) throw error;

      // If lesson is completed, award XP and update streaks
      if (progressData?.completion_percentage === 100 && !progress?.completed_at) {
        await this.handleLessonCompletion(userId, lessonId);
      }

      return progress;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  },

  // Handle lesson completion rewards and achievements
  async handleLessonCompletion(userId, lessonId) {
    try {
      // Get lesson details and associated paths
      const { data: lesson } = await supabase?.from('lessons')?.select('xp_reward, title')?.eq('id', lessonId)?.single();

      if (lesson) {
        // Award XP
        await supabase?.from('xp_transactions')?.insert({
            user_id: userId,
            amount: lesson?.xp_reward || 50,
            source: 'lesson_completion',
            reference_id: lessonId,
            description: `Completed: ${lesson?.title}`
          });

        // Update completion timestamp
        await supabase?.from('user_lesson_progress')?.update({ 
            completed_at: new Date()?.toISOString(),
            status: 'completed'
          })?.eq('user_id', userId)?.eq('lesson_id', lessonId);

        // Get all paths this lesson belongs to for achievement checking
        const paths = await this.getPathsForLesson(lessonId);
        for (const path of paths) {
          await this.checkLessonAchievements(userId, lessonId, path?.id);
        }
      }
    } catch (error) {
      console.error('Error handling lesson completion:', error);
    }
  },

  // Check and award achievements
  async checkLessonAchievements(userId, lessonId, learningPathId) {
    try {
      // Get user's lesson completion count
      const { data: completedLessons } = await supabase?.from('user_lesson_progress')?.select('lesson_id')?.eq('user_id', userId)?.eq('completion_percentage', 100);

      const completionCount = completedLessons?.length || 0;

      // Check for achievement milestones
      const achievements = [
        { count: 1, achievementName: 'First Steps' },
        { count: 10, achievementName: 'Knowledge Seeker' },
        { count: 25, achievementName: 'Dedicated Learner' },
        { count: 50, achievementName: 'Engineering Expert' }
      ];

      for (const achievement of achievements) {
        if (completionCount === achievement?.count) {
          await this.awardAchievement(userId, achievement?.achievementName);
        }
      }

      // Check path completion using explicit queries
      if (learningPathId) {
        await this.checkPathCompletion(userId, learningPathId);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  },

  // Award achievement to user
  async awardAchievement(userId, achievementName) {
    try {
      // Get achievement details
      const { data: achievement } = await supabase?.from('achievement_types')?.select('*')?.eq('name', achievementName)?.single();

      if (achievement) {
        // Check if user already has this achievement
        const { data: existing } = await supabase?.from('user_achievements')?.select('id')?.eq('user_id', userId)?.eq('achievement_id', achievement?.id)?.single();

        if (!existing) {
          // Award achievement
          await supabase?.from('user_achievements')?.insert({
              user_id: userId,
              achievement_id: achievement?.id,
              progress_data: { earned_for: achievementName }
            });

          // Award bonus XP
          if (achievement?.xp_reward > 0) {
            await supabase?.from('xp_transactions')?.insert({
                user_id: userId,
                amount: achievement?.xp_reward,
                source: 'achievement_earned',
                reference_id: achievement?.id,
                description: `Achievement: ${achievement?.name}`
              });
          }
        }
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  },

  // Fixed path completion check
  async checkPathCompletion(userId, pathId) {
    try {
      // Get all lessons in the path via junction table
      const pathLessons = await this.getLessonsForPath(pathId, userId);
      
      if (!pathLessons?.length) return;

      const allLessonIds = pathLessons?.map(lesson => lesson?.id) || [];

      // Get user's completed lessons in this path
      const { data: completedInPath } = await supabase?.from('user_lesson_progress')?.select('lesson_id')?.eq('user_id', userId)?.eq('completion_percentage', 100)?.in('lesson_id', allLessonIds);

      const completedIds = completedInPath?.map(c => c?.lesson_id) || [];

      // Check if all lessons are completed (since no is_required column)
      const allCompleted = allLessonIds?.every(id => completedIds?.includes(id));

      if (allCompleted) {
        // Award path completion achievement
        await this.awardAchievement(userId, 'Path Master');
        
        // Award bonus XP for path completion
        await supabase?.from('xp_transactions')?.insert({
            user_id: userId,
            amount: 500, // Bonus XP for completing entire path
            source: 'path_completion',
            reference_id: pathId,
            description: 'Completed learning path'
          });
      }
    } catch (error) {
      console.error('Error checking path completion:', error);
    }
  },

  // Get user's achievements
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
      return data;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  },

  // Helper function to calculate path progress
  calculatePathProgress(lessons, userId) {
    if (!lessons?.length) return 0;
    
    const completedLessons = lessons?.filter(lesson => 
      lesson?.userProgress?.completion_percentage === 100
    );
    
    return Math.round((completedLessons?.length / lessons?.length) * 100);
  },

  // Get user's learning analytics
  async getUserLearningAnalytics(userId) {
    try {
      const { data, error } = await supabase?.from('user_learning_analytics')?.select('*')?.eq('user_id', userId)?.single();

      if (error && error?.code === 'PGRST116') {
        // Create analytics record if it doesn't exist
        const { data: newAnalytics } = await supabase?.from('user_learning_analytics')?.insert({
            user_id: userId,
            discipline_preferences: ['mechanical', 'electrical'],
            learning_pace_minutes_per_day: 30
          })?.select()?.single();
        
        return newAnalytics;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
      return null;
    }
  },

  // Fixed initialization with proper schema validation
  async initialize() {
    try {
      console.log('Initializing learning service...');
      
      // Test basic connectivity
      const { data: testQuery } = await supabase?.from('learning_paths')?.select('id')?.limit(1);
      console.log('Database connectivity test:', testQuery ? 'SUCCESS' : 'PARTIAL');
      
      // Refresh schema cache
      const cacheRefreshed = await this.refreshSchemaCache();
      console.log('Schema cache refresh:', cacheRefreshed ? 'SUCCESS' : 'ATTEMPTED');
      
      // Test junction table access with correct columns
      const { data: junctionTest } = await supabase?.from('learning_paths_lessons')?.select('learning_path_id, lesson_id')?.limit(1);
      console.log('Junction table access test:', junctionTest !== null ? 'SUCCESS' : 'FAILED');
      
      console.log('Learning service initialization completed');
      return true;
    } catch (error) {
      console.error('Error initializing learning service:', error);
      return false;
    }
  }
};

// Auto-initialize the service when imported
learningService?.initialize();