import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';

import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';

// Components
import PlanCard from './components/PlanCard';
import BillingToggle from './components/BillingToggle';
import SubscriptionFAQ from './components/SubscriptionFAQ';
import TestimonialsSection from './components/TestimonialsSection';

const SubscriptionPlansPage = () => {
  const { user, userProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [upgradeLoading, setUpgradeLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubscriptionData();
  }, [user?.id]);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      // Load subscription plans
      const { data: plansData, error: plansError } = await subscriptionService?.getSubscriptionPlans();
      if (plansError) throw new Error(plansError);
      setPlans(plansData || []);

      // Load current subscription if user is authenticated
      if (user?.id) {
        const { data: subscriptionData, error: subError } = await subscriptionService?.getUserSubscription(user?.id);
        if (subError && !subError?.includes('No rows returned')) {
          console.error('Subscription load error:', subError);
        }
        setCurrentSubscription(subscriptionData);
      }
    } catch (error) {
      setError(`Failed to load subscription data: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier) => {
    if (!user?.id) {
      window.location.href = '/login';
      return;
    }

    setUpgradeLoading(tier);
    setError('');

    try {
      const returnUrl = `${window.location?.origin}/subscription/success`;
      const { data, error: upgradeError } = await subscriptionService?.createSubscription(
        user?.id,
        tier,
        returnUrl
      );

      if (upgradeError) throw new Error(upgradeError);

      if (data?.checkout_url) {
        window.location.href = data?.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      setError(`Upgrade failed: ${error?.message}`);
    } finally {
      setUpgradeLoading('');
    }
  };

  const getCurrentTier = () => {
    return currentSubscription?.tier || 'free';
  };

  const isCurrentPlan = (tier) => {
    return getCurrentTier() === tier;
  };

  const getButtonText = (tier, price) => {
    if (!user) return 'Sign up to get started';
    if (isCurrentPlan(tier)) return 'Current Plan';
    if (tier === 'free') return 'Downgrade to Free';
    return `Upgrade to ${subscriptionService?.getTierDisplay(tier)}`;
  };

  const getButtonVariant = (tier) => {
    if (isCurrentPlan(tier)) return 'secondary';
    if (tier === 'premium' || tier === 'professional') return 'default';
    if (tier === 'enterprise') return 'success';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Engineering Journey
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Unlock advanced lessons, simulations, and personalized learning paths. 
              Start your 14-day free trial today.
            </p>
            
            {currentSubscription && (
              <div className="bg-blue-800/50 rounded-lg p-4 max-w-md mx-auto mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Crown" className="text-yellow-400" size={20} />
                  <span className="font-medium">
                    Current Plan: {subscriptionService?.getTierDisplay(getCurrentTier())}
                  </span>
                </div>
                {currentSubscription?.status === 'trial' && (
                  <p className="text-blue-200 text-sm mt-2">
                    Trial ends in {subscriptionService?.getTrialRemainingDays(currentSubscription)} days
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center">
              <Icon name="AlertCircle" className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <BillingToggle
          billingCycle={billingCycle}
          onToggle={setBillingCycle}
          className="mb-12"
        />

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans?.map((plan) => (
            <PlanCard
              key={plan?.tier}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={isCurrentPlan(plan?.tier)}
              isPopular={plan?.tier === 'premium'}
              onSelect={() => handleUpgrade(plan?.tier)}
              loading={upgradeLoading === plan?.tier}
              buttonText={getButtonText(plan?.tier, billingCycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly)}
              buttonVariant={getButtonVariant(plan?.tier)}
              disabled={isCurrentPlan(plan?.tier)}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
          <div className="px-6 py-8">
            <h3 className="text-2xl font-bold text-center mb-8">Compare Features</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-gray-900">Features</th>
                    {plans?.map((plan) => (
                      <th key={plan?.tier} className="text-center py-4 px-4 font-medium text-gray-900">
                        {plan?.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <FeatureRow
                    feature="Engineering Lessons"
                    plans={plans}
                    featureKey="lessons_limit"
                    formatValue={(value) => value === -1 ? 'Unlimited' : value}
                  />
                  <FeatureRow
                    feature="Advanced Simulations"
                    plans={plans}
                    featureKey="advanced_simulations"
                    formatValue={undefined}
                  />
                  <FeatureRow
                    feature="Certification Exams"
                    plans={plans}
                    featureKey="certification_exams"
                    formatValue={undefined}
                  />
                  <FeatureRow
                    feature="1-on-1 Mentorship"
                    plans={plans}
                    featureKey="mentorship"
                    formatValue={undefined}
                  />
                  <FeatureRow
                    feature="Download Materials"
                    plans={plans}
                    featureKey="download_materials"
                    formatValue={undefined}
                  />
                  <FeatureRow
                    feature="Priority Support"
                    plans={plans}
                    featureKey="priority_support"
                    formatValue={undefined}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* FAQ */}
        <SubscriptionFAQ />
      </div>
    </div>
  );
};

// Helper component for feature comparison rows
const FeatureRow = ({ feature, plans, featureKey, formatValue }) => (
  <tr>
    <td className="py-4 px-4 font-medium text-gray-900">{feature}</td>
    {plans?.map((plan) => {
      const value = plan?.features?.[featureKey];
      let displayValue;

      if (formatValue) {
        displayValue = formatValue(value);
      } else if (typeof value === 'boolean') {
        displayValue = value ? (
          <Icon name="Check" className="text-green-500 mx-auto" size={20} />
        ) : (
          <Icon name="X" className="text-gray-300 mx-auto" size={20} />
        );
      } else {
        displayValue = value || '-';
      }

      return (
        <td key={plan?.tier} className="py-4 px-4 text-center text-gray-700">
          {displayValue}
        </td>
      );
    })}
  </tr>
);

export default SubscriptionPlansPage;