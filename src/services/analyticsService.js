import { supabase } from '../lib/supabase';

export const analyticsService = {
  // Track analytics event
  async trackEvent(eventType, eventName, properties = {}, userId = null) {
    try {
      let sessionId = this?.getOrCreateSessionId();
      
      const { data, error } = await supabase
        ?.from('analytics_events')
        ?.insert({
          user_id: userId,
          event_type: eventType,
          event_name: eventName,
          properties,
          session_id: sessionId,
          page_url: window?.location?.href,
          referrer_url: document?.referrer,
          user_agent: navigator?.userAgent
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Track event error:', error);
      return { data: null, error };
    }
  },

  // Track page view
  async trackPageView(pageName, userId = null, additionalProperties = {}) {
    return await this?.trackEvent(
      'page_viewed',
      'Page Viewed',
      {
        page_name: pageName,
        url: window?.location?.href,
        path: window?.location?.pathname,
        ...additionalProperties
      },
      userId
    );
  },

  // Track lesson events
  async trackLessonEvent(eventType, lessonId, lessonTitle, userId, additionalData = {}) {
    const eventNames = {
      'lesson_started': 'Lesson Started',
      'lesson_completed': 'Lesson Completed',
      'lesson_failed': 'Lesson Failed'
    };

    return await this?.trackEvent(
      eventType,
      eventNames?.[eventType] || eventType,
      {
        lesson_id: lessonId,
        lesson_title: lessonTitle,
        ...additionalData
      },
      userId
    );
  },

  // Track user engagement
  async trackEngagement(action, target, userId, metadata = {}) {
    return await this?.trackEvent(
      'feature_accessed',
      'Feature Accessed',
      {
        action,
        target,
        timestamp: new Date()?.toISOString(),
        ...metadata
      },
      userId
    );
  },

  // Track search
  async trackSearch(query, resultsCount, userId, filters = {}) {
    return await this?.trackEvent(
      'search_performed',
      'Search Performed',
      {
        query,
        results_count: resultsCount,
        filters,
        search_timestamp: new Date()?.toISOString()
      },
      userId
    );
  },

  // Track subscription events
  async trackSubscriptionEvent(eventType, subscriptionData, userId) {
    return await this?.trackEvent(
      'subscription_purchased',
      'Subscription Event',
      {
        subscription_event_type: eventType,
        subscription_tier: subscriptionData?.tier,
        subscription_status: subscriptionData?.status,
        ...subscriptionData
      },
      userId
    );
  },

  // Track achievement earned
  async trackAchievementEarned(achievementId, achievementName, userId, metadata = {}) {
    return await this?.trackEvent(
      'achievement_earned',
      'Achievement Earned',
      {
        achievement_id: achievementId,
        achievement_name: achievementName,
        earned_at: new Date()?.toISOString(),
        ...metadata
      },
      userId
    );
  },

  // Track daily login
  async trackDailyLogin(userId, streakData = {}) {
    return await this?.trackEvent(
      'daily_login',
      'Daily Login',
      {
        login_time: this?.getTimeOfDay(),
        date: new Date()?.toISOString()?.split('T')?.[0],
        ...streakData
      },
      userId
    );
  },

  // Get or create session ID
  getOrCreateSessionId() {
    let sessionId = sessionStorage?.getItem('analytics_session_id');
    
    if (!sessionId) {
      sessionId = 'sess_' + Date?.now() + '_' + Math?.random()?.toString(36)?.substr(2, 9);
      sessionStorage?.setItem('analytics_session_id', sessionId);
      
      // Set session timeout (30 minutes of inactivity)
      setTimeout(() => {
        sessionStorage?.removeItem('analytics_session_id');
      }, 30 * 60 * 1000);
    }
    
    return sessionId;
  },

  // Get time of day category
  getTimeOfDay() {
    const hour = new Date()?.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  },

  // Get user events
  async getUserEvents(userId, options = {}) {
    try {
      const { 
        limit = 100, 
        offset = 0, 
        eventType = null,
        startDate = null,
        endDate = null 
      } = options;

      let query = supabase
        ?.from('analytics_events')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false });

      if (eventType) {
        query = query?.eq('event_type', eventType);
      }

      if (startDate) {
        query = query?.gte('created_at', startDate);
      }

      if (endDate) {
        query = query?.lte('created_at', endDate);
      }

      if (limit) {
        query = query?.limit(limit);
      }

      if (offset) {
        query = query?.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get user events error:', error);
      return { data: [], error };
    }
  },

  // Get event summary
  async getEventSummary(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - days);

      const { data, error } = await supabase
        ?.from('analytics_events')
        ?.select('event_type, created_at')
        ?.eq('user_id', userId)
        ?.gte('created_at', startDate?.toISOString());

      if (error) throw error;

      // Process the data
      const summary = {};
      const dailyActivity = {};

      data?.forEach(event => {
        // Count by event type
        summary[event?.event_type] = (summary?.[event?.event_type] || 0) + 1;
        
        // Count daily activity
        const date = event?.created_at?.split('T')?.[0];
        dailyActivity[date] = (dailyActivity?.[date] || 0) + 1;
      });

      return {
        data: {
          summary,
          dailyActivity,
          totalEvents: data?.length || 0,
          period: days
        },
        error: null
      };
    } catch (error) {
      console.error('Get event summary error:', error);
      return { data: null, error };
    }
  },

  // Initialize analytics (call on app start)
  init(userId = null) {
    // Track initial page view
    this?.trackPageView(document?.title, userId);
    
    // Track session start
    if (userId) {
      this?.trackEvent('session_start', 'Session Started', {
        referrer: document?.referrer,
        user_agent: navigator?.userAgent
      }, userId);
    }
  },

  // Clean up analytics (call on app unmount)
  cleanup(userId = null) {
    if (userId) {
      this?.trackEvent('session_end', 'Session Ended', {
        session_duration: Date?.now() - parseInt(this?.getOrCreateSessionId()?.split('_')?.[1])
      }, userId);
    }
  }
};

// Auto-initialize analytics tracking
if (typeof window !== 'undefined') {
  // Track page navigation
  window?.addEventListener('popstate', () => {
    analyticsService?.trackPageView(document?.title);
  });

  // Track page unload
  window?.addEventListener('beforeunload', () => {
    const userId = JSON?.parse(localStorage?.getItem('auth-storage') || '{}')?.user?.id;
    if (userId) {
      analyticsService?.cleanup(userId);
    }
  });
}

export default analyticsService;