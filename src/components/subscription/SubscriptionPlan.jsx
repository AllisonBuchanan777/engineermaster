import React, { useState } from 'react';
import { Check, Crown, Zap, Award, Star } from 'lucide-react';
import Button from '../ui/Button';

import { useAuth } from '../../contexts/AuthContext';

const SubscriptionPlan = ({ 
  plan, 
  isCurrentPlan = false, 
  isPopular = false,
  onUpgrade,
  className = '' 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      await onUpgrade?.(plan?.tier);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier) => {
    const icons = {
      free: Star,
      premium: Crown,
      professional: Zap,
      enterprise: Award
    };
    return icons?.[tier] || Star;
  };

  const PlanIcon = getPlanIcon(plan?.tier);

  return (
    <div className={`
      relative bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg
      ${isCurrentPlan ? 'border-green-500 bg-green-50' : 'border-gray-200'}
      ${isPopular ? 'border-blue-500 ring-2 ring-blue-200' : ''}
      ${className}
    `}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </span>
        </div>
      )}
      {/* Plan Header */}
      <div className="text-center mb-6">
        <div className={`
          w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
          ${plan?.tier === 'free' ? 'bg-gray-100 text-gray-600' : ''}
          ${plan?.tier === 'premium' ? 'bg-blue-100 text-blue-600' : ''}
          ${plan?.tier === 'professional' ? 'bg-purple-100 text-purple-600' : ''}
          ${plan?.tier === 'enterprise' ? 'bg-yellow-100 text-yellow-600' : ''}
        `}>
          <PlanIcon size={24} />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {plan?.name}
        </h3>
        
        <div className="mb-3">
          <span className="text-3xl font-bold text-gray-900">
            ${plan?.price}
          </span>
          {plan?.tier !== 'free' && (
            <span className="text-gray-500 ml-1">
              /{plan?.billing}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm">
          {plan?.description}
        </p>
      </div>
      {/* Features List */}
      <ul className="space-y-3 mb-6">
        {plan?.features?.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check 
              size={16} 
              className={`
                mt-0.5 mr-3 flex-shrink-0
                ${feature?.included ? 'text-green-500' : 'text-gray-300'}
              `} 
            />
            <span className={`
              text-sm
              ${feature?.included ? 'text-gray-700' : 'text-gray-400'}
            `}>
              {feature?.name}
              {feature?.limit && (
                <span className="text-gray-500 ml-1">
                  ({feature?.limit})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {/* Action Button */}
      <Button
        onClick={handleUpgrade}
        disabled={loading || isCurrentPlan}
        className={`
          w-full py-3 font-medium
          ${isCurrentPlan ? 'bg-green-100 text-green-700 cursor-not-allowed' : ''}
          ${plan?.tier === 'premium' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          ${plan?.tier === 'professional' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          ${plan?.tier === 'enterprise' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        `}
        variant={isCurrentPlan ? 'secondary' : 'primary'}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Processing...
          </div>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : plan?.tier === 'free' ? (
          'Current Plan'
        ) : (
          `Upgrade to ${plan?.name}`
        )}
      </Button>
      {/* Trial Info */}
      {plan?.tier !== 'free' && !isCurrentPlan && (
        <p className="text-center text-xs text-gray-500 mt-3">
          Includes 14-day free trial
        </p>
      )}
    </div>
  );
};

export default SubscriptionPlan;