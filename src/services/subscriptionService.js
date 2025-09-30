import { supabase } from '../lib/supabase';

export const subscriptionService = {
  // Get all subscription plans
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase?.from('subscription_plans')?.select('*')?.eq('is_active', true)?.order('sort_order');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase?.from('user_subscriptions')?.select(`
          *,
          subscription_plans(*)
        `)?.eq('user_id', userId)?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Create subscription via Stripe
  async createSubscription(userId, tier, returnUrl) {
    try {
      const { data, error } = await supabase?.functions?.invoke('create-subscription', {
        body: {
          user_id: userId,
          tier: tier,
          return_url: returnUrl || `${window.location?.origin}/subscription/success`
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Check if user has access to a feature
  hasFeatureAccess(subscription, featureName) {
    if (!subscription?.features_access) return false;
    
    const features = subscription?.features_access;
    return features?.[featureName] === true || features?.[featureName] === -1;
  },

  // Get feature usage limits
  getFeatureLimit(subscription, featureName) {
    if (!subscription?.features_access) return 0;
    
    const limit = subscription?.features_access?.[featureName];
    return typeof limit === 'number' ? limit : 0;
  },

  // Format subscription status
  getStatusDisplay(status) {
    const statusMap = {
      trial: 'Free Trial',
      active: 'Active',
      cancelled: 'Cancelled',
      expired: 'Expired',
      past_due: 'Payment Due'
    };
    return statusMap?.[status] || 'Unknown';
  },

  // Format tier display
  getTierDisplay(tier) {
    const tierMap = {
      free: 'Free',
      premium: 'Pro',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return tierMap?.[tier] || 'Unknown';
  },

  // Calculate savings for yearly plans
  calculateYearlySavings(monthlyPrice, yearlyPrice) {
    const yearlyMonthlyEquivalent = yearlyPrice / 12;
    const savings = monthlyPrice - yearlyMonthlyEquivalent;
    const percentage = Math.round((savings / monthlyPrice) * 100);
    return {
      monthlySavings: savings,
      percentage,
      totalYearlySavings: savings * 12
    };
  },

  // Check if subscription is active
  isSubscriptionActive(subscription) {
    return subscription?.status === 'active' || subscription?.status === 'trial';
  },

  // Get trial remaining days
  getTrialRemainingDays(subscription) {
    if (!subscription?.trial_ends_at) return 0;
    
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd?.getTime() - now?.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  // Get user's current subscription
  async getCurrentSubscription(userId) {
    try {
      const { data, error } = await supabase?.from('user_subscriptions')?.select('*')?.eq('user_id', userId)?.single();
      
      if (error && error?.code !== 'PGRST116') { // Not found is OK
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  // Check if user has access to premium content
  async checkContentAccess(userId, requiredLevel = 'free') {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      
      if (requiredLevel === 'free') return true;
      
      if (!subscription || subscription?.status !== 'active') {
        // Check if still in trial
        if (subscription?.trial_ends_at && new Date() < new Date(subscription.trial_ends_at)) {
          return this.tierHasAccess(subscription?.tier, requiredLevel);
        }
        return false;
      }
      
      return this.tierHasAccess(subscription?.tier, requiredLevel);
    } catch (error) {
      console.error('Error checking content access:', error);
      return false;
    }
  },

  // Helper to check if tier has required access level
  tierHasAccess(userTier, requiredLevel) {
    const tierHierarchy = {
      'free': 0,'premium': 1,'professional': 2,'enterprise': 3
    };
    
    return tierHierarchy?.[userTier] >= tierHierarchy?.[requiredLevel];
  },

  // Get subscription features
  getSubscriptionFeatures(tier) {
    const features = {
      free: {
        lessons_limit: 5,
        advanced_simulations: false,
        certification_exams: false,
        mentorship: false,
        download_materials: false
      },
      premium: {
        lessons_limit: -1, // Unlimited
        advanced_simulations: true,
        certification_exams: false,
        mentorship: false,
        download_materials: true
      },
      professional: {
        lessons_limit: -1,
        advanced_simulations: true,
        certification_exams: true,
        mentorship: true,
        download_materials: true
      },
      enterprise: {
        lessons_limit: -1,
        advanced_simulations: true,
        certification_exams: true,
        mentorship: true,
        download_materials: true
      }
    };
    
    return features?.[tier] || features?.free;
  },

  // Format subscription status for display
  formatSubscriptionStatus(subscription) {
    if (!subscription) {
      return { status: 'Free', color: 'gray', description: 'Limited access' };
    }
    
    const now = new Date();
    const trialEnd = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
    
    if (subscription?.status === 'trial' && trialEnd && now < trialEnd) {
      const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      return {
        status: `${subscription?.tier?.charAt(0)?.toUpperCase() + subscription?.tier?.slice(1)} Trial`,
        color: 'blue',
        description: `${daysLeft} days left`
      };
    }
    
    if (subscription?.status === 'active') {
      return {
        status: subscription?.tier?.charAt(0)?.toUpperCase() + subscription?.tier?.slice(1),
        color: 'green',
        description: periodEnd ? `Renews ${periodEnd?.toLocaleDateString()}` : 'Active'
      };
    }
    
    return {
      status: subscription?.status?.charAt(0)?.toUpperCase() + subscription?.status?.slice(1),
      color: 'red',
      description: 'Update required'
    };
  }
};