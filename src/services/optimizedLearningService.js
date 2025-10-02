import { supabase } from '../lib/supabase';

export const optimizedLearningService = {
  // Optimized method to get lessons by discipline using direct filtering
  async getLessonsByDiscipline(discipline, userId = null, options = {}) {
    try {
      const {
        publishedOnly = true,
        limit = 50,
        offset = 0,
        includeProgress = true
      } = options;

      // Use the optimized database function for direct discipline filtering
      const { data, error } = await supabase?.rpc('get_lessons_by_discipline', {
        target_discipline: discipline,
        user_id_param: userId,
        published_only: publishedOnly
      });

      if (error) throw error;

      // Apply client-side pagination if needed
      if (limit || offset) {
        const start = offset || 0;
        const end = start + (limit || 50);
        return data?.slice(start, end) || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching lessons by discipline:', error);
      throw error;
    }
  },

  // Get comprehensive stats for a discipline
  async getDisciplineStats(discipline, userId = null) {
    try {
      const { data, error } = await supabase?.rpc('get_discipline_lesson_stats', {
        target_discipline: discipline,
        user_id_param: userId
      });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching discipline stats:', error);
      throw error;
    }
  },

  // Get lessons from multiple disciplines (optimized for mixed curricula)
  async getLessonsByMultipleDisciplines(disciplines, userId = null, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase?.rpc('get_lessons_by_disciplines', {
        target_disciplines: disciplines,
        user_id_param: userId,
        limit_param: limit,
        offset_param: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lessons by multiple disciplines:', error);
      throw error;
    }
  },

  // Optimized search for lessons within specific disciplines
  async searchLessonsInDisciplines(searchQuery, disciplines, userId = null) {
    try {
      let query = supabase?.from('lessons')?.select(`
          id,
          slug,
          title,
          description,
          difficulty,
          discipline,
          estimated_duration_minutes,
          xp_reward,
          access_level,
          learning_paths!inner (name),
          ${userId ? 'user_lesson_progress!left (completion_percentage, status)' : ''}
        `)
        ?.in('discipline', disciplines)
        ?.eq('is_published', true)
        ?.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        ?.order('discipline')
        ?.order('order_index');

      // Add user-specific filtering if userId provided
      if (userId) {
        query = query?.or(`user_lesson_progress.user_id.eq.${userId},user_lesson_progress.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching lessons in disciplines:', error);
      throw error;
    }
  },

  // Get recommended lessons based on discipline preferences
  async getRecommendedLessonsByDiscipline(userId, disciplines, limit = 10) {
    try {
      // Get user's completed lessons to avoid recommending duplicates
      const { data: completedLessons } = await supabase?.from('user_lesson_progress')?.select('lesson_id')?.eq('user_id', userId)?.eq('completion_percentage', 100);

      const completedLessonIds = completedLessons?.map(cl => cl?.lesson_id) || [];

      let query = supabase?.from('lessons')?.select(`
          id,
          slug,
          title,
          discipline,
          difficulty,
          xp_reward,
          estimated_duration_minutes,
          learning_paths!inner (name, discipline)
        `)
        ?.in('discipline', disciplines)?.eq('is_published', true)?.order('xp_reward', { ascending: false })
        ?.limit(limit);

      // Exclude completed lessons
      if (completedLessonIds?.length > 0) {
        query = query?.not('id', 'in', `(${completedLessonIds?.join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting recommended lessons by discipline:', error);
      throw error;
    }
  },

  // Get all available disciplines with lesson counts
  async getAllDisciplinesWithCounts(userId = null) {
    try {
      const { data, error } = await supabase?.from('lessons')?.select(`
          discipline,
          learning_paths!inner (discipline),
          ${userId ? 'user_lesson_progress!left (completion_percentage)' : ''}
        `)
        ?.eq('is_published', true)?.not('discipline', 'is', null);

      if (error) throw error;

      // Group and count by discipline
      const disciplineStats = {};
      
      data?.forEach(lesson => {
        const discipline = lesson?.discipline;
        if (!disciplineStats?.[discipline]) {
          disciplineStats[discipline] = {
            name: discipline,
            totalLessons: 0,
            completedLessons: 0
          };
        }
        
        disciplineStats[discipline].totalLessons++;
        
        if (userId && lesson?.user_lesson_progress?.some(progress => progress?.completion_percentage === 100)) {
          disciplineStats[discipline].completedLessons++;
        }
      });

      return Object.values(disciplineStats)?.sort((a, b) => b?.totalLessons - a?.totalLessons);
    } catch (error) {
      console.error('Error getting disciplines with counts:', error);
      throw error;
    }
  },

  // Create new lesson with automatic discipline assignment
  async createLessonWithDiscipline(lessonData, learningPathId) {
    try {
      // The trigger will automatically set the discipline from learning_path
      const { data, error } = await supabase?.from('lessons')?.insert({
          ...lessonData,
          learning_path_id: learningPathId,
          created_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })?.select(`
          *,
          learning_paths!inner (name, discipline)
        `)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating lesson with discipline:', error);
      throw error;
    }
  },

  // Validate discipline filtering performance
  async validateOptimization() {
    try {
      console.log('🚀 Testing optimized discipline filtering...');
      
      // Test 1: Direct discipline filtering
      const start1 = performance.now();
      const electricalLessons = await this.getLessonsByDiscipline('electrical');
      const end1 = performance.now();
      
      // Test 2: Multiple disciplines
      const start2 = performance.now();
      const multiDisciplineLessons = await this.getLessonsByMultipleDisciplines(['electrical', 'mechanical']);
      const end2 = performance.now();
      
      // Test 3: Discipline stats
      const start3 = performance.now();
      const stats = await this.getDisciplineStats('electrical');
      const end3 = performance.now();
      
      const results = {
        directFilter: {
          time: `${(end1 - start1)?.toFixed(2)}ms`,
          count: electricalLessons?.length || 0
        },
        multiDiscipline: {
          time: `${(end2 - start2)?.toFixed(2)}ms`,
          count: multiDisciplineLessons?.length || 0
        },
        stats: {
          time: `${(end3 - start3)?.toFixed(2)}ms`,
          data: stats
        }
      };
      
      console.log('✅ Optimization test results:', results);
      return results;
    } catch (error) {
      console.error('❌ Optimization validation failed:', error);
      throw error;
    }
  }
};

// Auto-test the optimization on import (only in development)
if (process.env?.NODE_ENV === 'development') {
  setTimeout(() => {
    optimizedLearningService?.validateOptimization()?.catch(console.error);
  }, 2000);
}