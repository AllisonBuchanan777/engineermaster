import { supabase } from '../lib/supabase';

export const learningService = {
  // Get learning paths
  async getLearningPaths(filters = {}) {
    try {
      let query = supabase?.from('learning_paths')?.select(`
          *,
          created_by_profile:user_profiles!learning_paths_created_by_fkey (
            full_name,
            username
          )
        `)?.eq('is_published', true);

      if (filters?.discipline) {
        query = query?.eq('discipline', filters?.discipline);
      }
      if (filters?.difficulty) {
        query = query?.eq('difficulty', filters?.difficulty);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get learning paths error:', error);
      return { data: [], error };
    }
  },

  // Get lessons for a learning path
  async getLessons(pathId, userId = null) {
    try {
      let query = supabase?.from('lessons')?.select(`
          *,
          learning_path:learning_paths (
            name,
            discipline
          )
        `)?.eq('learning_path_id', pathId)?.eq('is_published', true)?.order('order_index');

      const { data: lessons, error } = await query;
      if (error) throw error;

      // If user is provided, get their progress
      if (userId && lessons?.length > 0) {
        const lessonIds = lessons?.map(lesson => lesson?.id);
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('*')?.eq('user_id', userId)?.in('lesson_id', lessonIds);

        // Merge progress data with lessons
        const lessonsWithProgress = lessons?.map(lesson => ({
          ...lesson,
          progress: progress?.find(p => p?.lesson_id === lesson?.id) || null
        }));

        return { data: lessonsWithProgress, error: null };
      }

      return { data: lessons || [], error: null };
    } catch (error) {
      console.error('Get lessons error:', error);
      return { data: [], error };
    }
  },

  // Get single lesson
  async getLesson(lessonId, userId = null) {
    try {
      const { data: lesson, error } = await supabase?.from('lessons')?.select(`
          *,
          learning_path:learning_paths (
            name,
            discipline,
            difficulty
          )
        `)?.eq('id', lessonId)?.eq('is_published', true)?.single();

      if (error) throw error;

      // Get user progress if user is provided
      if (userId) {
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('*')?.eq('user_id', userId)?.eq('lesson_id', lessonId)?.single();

        lesson.progress = progress;
      }

      return { data: lesson, error: null };
    } catch (error) {
      console.error('Get lesson error:', error);
      return { data: null, error };
    }
  },

  // Update lesson progress
  async updateLessonProgress(userId, lessonId, updates) {
    try {
      const { data, error } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          ...updates,
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update lesson progress error:', error);
      return { data: null, error };
    }
  },

  // Complete lesson and award XP
  async completeLesson(userId, lessonId) {
    try {
      // First, get the lesson details for XP reward
      const { data: lesson, error: lessonError } = await supabase?.from('lessons')?.select('xp_reward, title')?.eq('id', lessonId)?.single();

      if (lessonError) throw lessonError;

      // Update progress to completed
      const { data: progress, error: progressError } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'completed',
          completion_percentage: 100,
          completed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (progressError) throw progressError;

      // Award XP
      if (lesson?.xp_reward > 0) {
        const { error: xpError } = await supabase?.from('xp_transactions')?.insert({
            user_id: userId,
            amount: lesson?.xp_reward,
            source: 'lesson_completion',
            reference_id: lessonId,
            description: `Completed lesson: ${lesson?.title}`
          });

        if (xpError) console.error('XP award error:', xpError);
      }

      return { data: progress, error: null };
    } catch (error) {
      console.error('Complete lesson error:', error);
      return { data: null, error };
    }
  },

  // Get user's learning dashboard data
  async getUserDashboard(userId) {
    try {
      // Get user profile with XP and level
      const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (profileError) throw profileError;

      // Get recent progress
      const { data: recentProgress } = await supabase?.from('user_lesson_progress')?.select(`
          *,
          lesson:lessons (
            title,
            learning_path:learning_paths (
              name,
              discipline
            )
          )
        `)?.eq('user_id', userId)?.order('updated_at', { ascending: false })?.limit(5);

      // Get achievements
      const { data: achievements } = await supabase?.from('user_achievements')?.select(`
          *,
          achievement_types (
            name,
            description,
            icon_name,
            badge_color
          )
        `)?.eq('user_id', userId)?.order('earned_at', { ascending: false })?.limit(5);

      return { 
        data: {
          profile,
          recentProgress: recentProgress || [],
          achievements: achievements || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get user dashboard error:', error);
      return { data: null, error };
    }
  }
};