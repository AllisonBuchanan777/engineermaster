import { supabase } from '../lib/supabase';

export const curriculumService = {
  // Get all learning paths with progress
  async getLearningPaths(userId = null) {
    try {
      let query = supabase?.from('learning_paths')?.select(`
          *,
          lessons!learning_paths_lessons (
            id,
            title,
            difficulty,
            lesson_type,
            access_level,
            estimated_duration_minutes,
            order_index
          )
        `)?.eq('is_published', true)?.order('discipline');

      const { data: paths, error } = await query;
      if (error) throw error;

      // Get user progress if userId provided
      if (userId) {
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('lesson_id, completion_percentage, status')?.eq('user_id', userId);

        // Add progress to paths
        return paths?.map(path => ({
          ...path,
          progress: this.calculatePathProgress(path?.lessons, progress || []),
          lessons: path?.lessons?.map(lesson => ({
            ...lesson,
            userProgress: progress?.find(p => p?.lesson_id === lesson?.id)
          }))
        }));
      }

      return paths;
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      throw error;
    }
  },

  // Get single lesson with modules and quiz
  async getLesson(lessonId, userId = null) {
    try {
      const { data: lesson, error } = await supabase?.from('lessons')?.select(`
          *,
          learning_paths!inner (
            name,
            discipline
          ),
          lesson_modules (
            id,
            module_name,
            module_type,
            content,
            order_index,
            estimated_duration_minutes,
            access_level
          ),
          lesson_quizzes (
            id,
            title,
            description,
            questions,
            passing_score,
            max_attempts,
            time_limit_minutes,
            is_required
          )
        `)?.eq('id', lessonId)?.eq('is_published', true)?.single();

      if (error) throw error;

      // Get user progress if userId provided
      if (userId) {
        const { data: progress } = await supabase?.from('user_lesson_progress')?.select('*')?.eq('user_id', userId)?.eq('lesson_id', lessonId)?.single();

        // Get quiz attempts
        const { data: quizAttempts } = await supabase?.from('user_quiz_attempts')?.select('*')?.eq('user_id', userId)?.in('quiz_id', lesson?.lesson_quizzes?.map(q => q?.id) || []);

        return {
          ...lesson,
          userProgress: progress,
          quizAttempts: quizAttempts || []
        };
      }

      return lesson;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  },

  // Update lesson progress
  async updateLessonProgress(userId, lessonId, progressData) {
    try {
      const { data, error } = await supabase?.from('user_lesson_progress')?.upsert({
          user_id: userId,
          lesson_id: lessonId,
          ...progressData,
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })?.select()?.single();

      if (error) throw error;

      // Award XP if lesson completed
      if (progressData?.completion_percentage === 100 && !data?.completed_at) {
        await this.awardLessonXP(userId, lessonId);
      }

      return data;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  },

  // Submit quiz attempt
  async submitQuizAttempt(userId, quizId, answers) {
    try {
      // Get quiz details
      const { data: quiz, error: quizError } = await supabase?.from('lesson_quizzes')?.select('*')?.eq('id', quizId)?.single();

      if (quizError) throw quizError;

      // Check attempt limit
      const { data: previousAttempts } = await supabase?.from('user_quiz_attempts')?.select('attempt_number')?.eq('user_id', userId)?.eq('quiz_id', quizId);

      const attemptNumber = (previousAttempts?.length || 0) + 1;
      
      if (attemptNumber > quiz?.max_attempts) {
        throw new Error('Maximum attempts exceeded');
      }

      // Calculate score
      const score = this.calculateQuizScore(quiz?.questions, answers);
      const passed = score >= quiz?.passing_score;

      // Save attempt
      const { data, error } = await supabase?.from('user_quiz_attempts')?.insert({
          user_id: userId,
          quiz_id: quizId,
          attempt_number: attemptNumber,
          answers: answers,
          score: score,
          passed: passed,
          time_spent_minutes: answers?.timeSpent || 0
        })?.select()?.single();

      if (error) throw error;

      // Award XP if passed
      if (passed) {
        await this.awardQuizXP(userId, quizId, score);
      }

      return { ...data, quiz };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get daily challenge
  async getDailyChallenge(date = new Date()) {
    try {
      const challengeDate = date?.toISOString()?.split('T')?.[0];
      
      const { data, error } = await supabase?.from('daily_challenges')?.select('*')?.eq('challenge_date', challengeDate)?.single();

      if (error && error?.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      return null;
    }
  },

  // Complete daily challenge
  async completeDailyChallenge(userId, challengeId, score) {
    try {
      // Check if already completed
      const { data: existing } = await supabase?.from('user_daily_challenges')?.select('id')?.eq('user_id', userId)?.eq('challenge_id', challengeId)?.single();

      if (existing) {
        throw new Error('Challenge already completed today');
      }

      // Get challenge details
      const { data: challenge } = await supabase?.from('daily_challenges')?.select('xp_reward')?.eq('id', challengeId)?.single();

      const xpEarned = Math.round((challenge?.xp_reward || 25) * (score / 100));

      // Record completion
      const { data, error } = await supabase?.from('user_daily_challenges')?.insert({
          user_id: userId,
          challenge_id: challengeId,
          score: score,
          xp_earned: xpEarned
        })?.select()?.single();

      if (error) throw error;

      // Award XP
      await this.awardXP(userId, xpEarned, 'daily_challenge', challengeId);

      return data;
    } catch (error) {
      console.error('Error completing daily challenge:', error);
      throw error;
    }
  },

  // Get simulation templates
  async getSimulationTemplates(discipline = null, difficulty = null) {
    try {
      let query = supabase?.from('simulation_templates')?.select('*')?.order('name');

      if (discipline) {
        query = query?.eq('discipline', discipline);
      }

      if (difficulty) {
        query = query?.eq('difficulty', difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching simulation templates:', error);
      throw error;
    }
  },

  // Save simulation session
  async saveSimulationSession(userId, templateId, sessionData, lessonId = null) {
    try {
      const { data, error } = await supabase?.from('simulation_sessions')?.insert({
          user_id: userId,
          template_id: templateId,
          lesson_id: lessonId,
          session_data: sessionData,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving simulation session:', error);
      throw error;
    }
  },

  // Get user analytics and recommendations
  async getUserAnalytics(userId) {
    try {
      // Get or create analytics record
      let { data: analytics, error } = await supabase?.from('user_learning_analytics')?.select('*')?.eq('user_id', userId)?.single();

      if (error && error?.code === 'PGRST116') {
        // Create new analytics record
        const { data: newAnalytics, error: createError } = await supabase?.from('user_learning_analytics')?.insert({
            user_id: userId,
            discipline_preferences: ['mechanical', 'electrical'],
            learning_pace_minutes_per_day: 30,
            preferred_difficulty: 'intermediate'
          })?.select()?.single();

        if (createError) throw createError;
        analytics = newAnalytics;
      } else if (error) {
        throw error;
      }

      // Get recommended lessons
      const recommendations = await this.generateRecommendations(userId, analytics);

      return {
        ...analytics,
        recommendations
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  // Helper methods
  calculatePathProgress(lessons, userProgress) {
    if (!lessons?.length) return 0;
    
    const completedLessons = lessons?.filter(lesson => 
      userProgress?.some(p => p?.lesson_id === lesson?.id && p?.completion_percentage === 100)
    );
    
    return Math.round((completedLessons?.length / lessons?.length) * 100);
  },

  calculateQuizScore(questions, answers) {
    if (!questions?.length || !answers) return 0;
    
    let correct = 0;
    questions?.forEach((question, index) => {
      const userAnswer = answers?.[`question_${index}`];
      
      switch (question?.type) {
        case 'multiple_choice':
          if (userAnswer === question?.correct) correct++;
          break;
        case 'numerical':
          const tolerance = question?.tolerance || 0.1;
          if (Math.abs(userAnswer - question?.answer) <= tolerance) correct++;
          break;
        case 'essay':
          // Essay questions need manual grading, assume partial credit
          correct += 0.8;
          break;
      }
    });
    
    return Math.round((correct / questions?.length) * 100);
  },

  async awardLessonXP(userId, lessonId) {
    const { data: lesson } = await supabase?.from('lessons')?.select('xp_reward, title')?.eq('id', lessonId)?.single();

    if (lesson) {
      await this.awardXP(userId, lesson?.xp_reward, 'lesson_completion', lessonId, `Completed ${lesson?.title}`);
    }
  },

  async awardQuizXP(userId, quizId, score) {
    const xpReward = Math.round(score / 2); // 50 XP for perfect score
    await this.awardXP(userId, xpReward, 'quiz_completion', quizId, `Quiz scored ${score}%`);
  },

  async awardXP(userId, amount, source, referenceId, description) {
    try {
      await supabase?.from('xp_transactions')?.insert({
          user_id: userId,
          amount: amount,
          source: source,
          reference_id: referenceId,
          description: description
        });
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  },

  async generateRecommendations(userId, analytics) {
    // Simple recommendation logic - in production, this could be more sophisticated
    const { data: lessons } = await supabase?.from('lessons')?.select(`
        id, title, difficulty, discipline, estimated_duration_minutes,
        learning_paths!inner (name)
      `)?.in('discipline', analytics?.discipline_preferences || ['mechanical'])?.eq('difficulty', analytics?.preferred_difficulty || 'intermediate')?.eq('is_published', true)?.limit(5);

    return lessons || [];
  }
};