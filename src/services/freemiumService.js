import { supabase } from '../lib/supabase';

export const freemiumService = {
  // Get all courses with freemium filtering
  async getCourses(userId = null, filters = {}) {
    try {
      let query = supabase?.from('lessons')?.select(`
          *,
          skill_trees!inner (
            id,
            name,
            discipline,
            icon_name,
            description,
            order_index
          )
        `)?.eq('is_published', true)?.order('order_index');

      // Apply filters
      if (filters?.discipline) {
        query = query?.eq('skill_trees.discipline', filters?.discipline);
      }

      if (filters?.difficulty) {
        query = query?.eq('difficulty', filters?.difficulty);
      }

      if (filters?.accessLevel) {
        query = query?.eq('access_level', filters?.accessLevel);
      }

      const { data: courses, error } = await query;
      if (error) throw error;

      // Get user progress and subscription if userId provided
      if (userId) {
        const [progressData, subscriptionData] = await Promise.all([
          supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status, completed_at')?.eq('user_id', userId),
          supabase?.from('user_subscriptions')?.select('tier, status, features_access')?.eq('user_id', userId)?.single()
        ]);

        const userProgress = progressData?.data || [];
        const userSubscription = subscriptionData?.data || { tier: 'free', status: 'trial', features_access: {} };

        // Add progress and access info to courses
        return courses?.map(course => {
          const progress = userProgress?.find(p => p?.lesson_id === course?.id);
          const isAccessible = this.checkCourseAccess(course, userSubscription);
          
          return {
            ...course,
            userProgress: progress,
            isAccessible,
            userSubscription
          };
        });
      }

      return courses?.map(course => ({
        ...course,
        userProgress: null,
        isAccessible: course?.access_level === 'free',
        userSubscription: { tier: 'free', status: 'trial' }
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course enrollment statistics
  async getCourseStats(courseId) {
    try {
      const { data: stats, error } = await supabase
        ?.from('user_lesson_progress')
        ?.select('user_id, completion_percentage, status')
        ?.eq('lesson_id', courseId);

      if (error) throw error;

      const totalEnrollments = stats?.length || 0;
      const completedCount = stats?.filter(s => s?.completion_percentage === 100)?.length || 0;
      const avgCompletion = totalEnrollments > 0 
        ? Math.round(stats?.reduce((sum, s) => sum + s?.completion_percentage, 0) / totalEnrollments)
        : 0;

      return {
        totalEnrollments,
        completedCount,
        avgCompletion,
        completionRate: totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return { totalEnrollments: 0, completedCount: 0, avgCompletion: 0, completionRate: 0 };
    }
  },

  // Get user's subscription status
  async getUserSubscription(userId) {
    try {
      const { data: subscription, error } = await supabase
        ?.from('user_subscriptions')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error;

      // Return default free subscription if none found
      return subscription || {
        tier: 'free',
        status: 'trial',
        features_access: {
          lessons_limit: 3,
          advanced_features: false,
          unlimited_access: false
        }
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return {
        tier: 'free',
        status: 'trial',
        features_access: {
          lessons_limit: 3,
          advanced_features: false,
          unlimited_access: false
        }
      };
    }
  },

  // Check if user can access a course
  checkCourseAccess(course, subscription) {
    // Free courses are always accessible
    if (course?.access_level === 'free') {
      return true;
    }

    // Premium courses require subscription
    if (course?.access_level === 'premium') {
      return subscription?.tier !== 'free' && subscription?.status === 'active';
    }

    // Professional courses require professional tier
    if (course?.access_level === 'professional') {
      return ['professional', 'enterprise']?.includes(subscription?.tier) && subscription?.status === 'active';
    }

    return false;
  },

  // Get available subscription plans
  async getSubscriptionPlans() {
    try {
      const { data: plans, error } = await supabase
        ?.from('subscription_plans')
        ?.select('*')
        ?.eq('is_active', true)
        ?.order('sort_order');

      if (error) throw error;
      return plans || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  // Start lesson (with access check)
  async startLesson(userId, lessonId) {
    try {
      // Get lesson and subscription
      const [lessonData, subscriptionData] = await Promise.all([
        supabase?.from('lessons')?.select('*')?.eq('id', lessonId)?.single(),
        this.getUserSubscription(userId)
      ]);

      const lesson = lessonData?.data;
      const subscription = subscriptionData;

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Check access
      if (!this.checkCourseAccess(lesson, subscription)) {
        throw new Error('Upgrade required to access this lesson');
      }

      // Create or update progress
      const { data, error } = await supabase
        ?.from('user_lesson_progress')
        ?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'in_progress',
          last_accessed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting lesson:', error);
      throw error;
    }
  },

  // Get course preview content (limited for premium courses)
  async getCoursePreview(courseId, userId = null) {
    try {
      const { data: course, error } = await supabase
        ?.from('lessons')
        ?.select(`
          *,
          skill_trees!inner (name, discipline)
        `)
        ?.eq('id', courseId)
        ?.single();

      if (error) throw error;

      // For premium courses, return limited preview
      if (course?.access_level !== 'free' && (!userId || !this.checkCourseAccess(course, await this.getUserSubscription(userId)))) {
        return {
          ...course,
          content: {
            preview: true,
            sections: course?.content?.sections?.slice(0, 1) || [],
            description: course?.description
          },
          isPreview: true
        };
      }

      return {
        ...course,
        isPreview: false
      };
    } catch (error) {
      console.error('Error fetching course preview:', error);
      throw error;
    }
  }
};