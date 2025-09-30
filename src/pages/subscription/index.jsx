import React, { useState, useEffect } from 'react';
import { Crown, Download, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import SubscriptionPlan from '../../components/subscription/SubscriptionPlan';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const subscriptionPlans = [
    {
      tier: 'free',
      name: 'Free Plan',
      price: 0,
      billing: 'forever',
      description: 'Perfect for getting started with basic engineering concepts',
      features: [
        { name: 'Access to 5 lessons per month', included: true, limit: '5 lessons' },
        { name: 'Basic theory content', included: true },
        { name: 'Community support', included: true },
        { name: 'Progress tracking', included: true },
        { name: 'Advanced simulations', included: false },
        { name: 'Certification exams', included: false },
        { name: 'Download materials', included: false },
        { name: 'Priority support', included: false }
      ]
    },
    {
      tier: 'premium',
      name: 'Premium Plan',
      price: 19,
      billing: 'month',
      description: 'Unlimited learning with interactive content and simulations',
      popular: true,
      features: [
        { name: 'Unlimited lesson access', included: true },
        { name: 'Interactive simulations', included: true },
        { name: 'Video lectures', included: true },
        { name: 'Downloadable resources', included: true },
        { name: 'Advanced theory content', included: true },
        { name: 'Email support', included: true },
        { name: 'Certification exams', included: false },
        { name: 'Personal mentorship', included: false }
      ]
    },
    {
      tier: 'professional',
      name: 'Professional Plan',
      price: 49,
      billing: 'month',
      description: 'For serious learners seeking professional certifications',
      features: [
        { name: 'Everything in Premium', included: true },
        { name: 'Professional certifications', included: true },
        { name: 'Advanced simulations & labs', included: true },
        { name: 'Real engineering projects', included: true },
        { name: 'Priority support', included: true },
        { name: 'Industry case studies', included: true },
        { name: 'Personal learning path', included: true },
        { name: 'Group mentorship', included: false }
      ]
    },
    {
      tier: 'enterprise',
      name: 'Enterprise Plan',
      price: 99,
      billing: 'month',
      description: 'Complete engineering education with personal mentorship',
      features: [
        { name: 'Everything in Professional', included: true },
        { name: '1-on-1 mentorship sessions', included: true },
        { name: 'Custom learning paths', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'White-label options', included: true },
        { name: 'API access', included: true },
        { name: 'Dedicated support', included: true }
      ]
    }
  ];

  useEffect(() => {
    loadCurrentSubscription();
  }, [user]);

  const loadCurrentSubscription = async () => {
    if (!user) return;

    try {
      const subscription = await subscriptionService?.getCurrentSubscription(user?.id);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier) => {
    if (!user) return;

    setUpgrading(true);
    try {
      const result = await subscriptionService?.createSubscription(
        user?.id,
        tier,
        window.location?.origin + '/dashboard'
      );

      // Redirect to Stripe checkout
      if (result?.checkout_url) {
        window.location.href = result?.checkout_url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // Show error message to user
    } finally {
      setUpgrading(false);
    }
  };

  const getCurrentTier = () => {
    return currentSubscription?.tier || 'free';
  };

  const formatSubscriptionStatus = () => {
    if (!currentSubscription) {
      return { status: 'Free', color: 'gray', description: 'Limited access' };
    }
    return subscriptionService?.formatSubscriptionStatus(currentSubscription);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Choose Your Plan
                </h1>
                <p className="text-gray-600">
                  Unlock your engineering potential with the right subscription
                </p>
              </div>
            </div>
            
            {currentSubscription && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Plan</div>
                <div className={`font-medium ${
                  formatSubscriptionStatus()?.color === 'green' ? 'text-green-600' : 
                  formatSubscriptionStatus()?.color === 'blue'? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {formatSubscriptionStatus()?.status}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Subscription Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trial Banner */}
        {currentSubscription?.status === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-blue-800 font-medium">
                  You're currently on a free trial of {currentSubscription?.tier} plan
                </p>
                <p className="text-blue-600 text-sm">
                  {currentSubscription?.trial_ends_at && 
                    `Trial ends on ${new Date(currentSubscription.trial_ends_at)?.toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {subscriptionPlans?.map((plan) => (
            <SubscriptionPlan
              key={plan?.tier}
              plan={plan}
              isCurrentPlan={getCurrentTier() === plan?.tier}
              isPopular={plan?.popular}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>

        {/* Features Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Compare All Features
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample features for comparison */}
                {[
                  { name: 'Monthly Lessons', free: '5', premium: 'Unlimited', professional: 'Unlimited', enterprise: 'Unlimited' },
                  { name: 'Interactive Simulations', free: '✗', premium: '✓', professional: '✓', enterprise: '✓' },
                  { name: 'Video Lectures', free: '✗', premium: '✓', professional: '✓', enterprise: '✓' },
                  { name: 'Certification Exams', free: '✗', premium: '✗', professional: '✓', enterprise: '✓' },
                  { name: 'Personal Mentorship', free: '✗', premium: '✗', professional: '✗', enterprise: '✓' },
                  { name: 'Support Level', free: 'Community', premium: 'Email', professional: 'Priority', enterprise: 'Dedicated' }
                ]?.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {feature?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {feature?.free}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {feature?.premium}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {feature?.professional}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {feature?.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Is there a free trial?
                </h4>
                <p className="text-gray-600 text-sm">
                  All paid plans come with a 14-day free trial. No credit card required to start your trial.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What's included in certifications?
                </h4>
                <p className="text-gray-600 text-sm">
                  Professional certifications include comprehensive exams, practical projects, and industry-recognized certificates upon completion.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How does mentorship work?
                </h4>
                <p className="text-gray-600 text-sm">
                  Enterprise plan includes 1-on-1 sessions with professional engineers who provide personalized guidance and career advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;