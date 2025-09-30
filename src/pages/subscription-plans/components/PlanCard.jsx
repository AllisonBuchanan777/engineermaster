import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { subscriptionService } from '../../../services/subscriptionService';

const PlanCard = ({
  plan,
  billingCycle,
  isCurrentPlan,
  isPopular,
  onSelect,
  loading,
  buttonText,
  buttonVariant,
  disabled,
  className = ''
}) => {
  const price = billingCycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly;
  const originalMonthlyPrice = billingCycle === 'yearly' ? plan?.price_yearly / 12 : plan?.price_monthly;
  const savings = billingCycle === 'yearly' ? 
    subscriptionService?.calculateYearlySavings(plan?.price_monthly, plan?.price_yearly) : null;

  const getFeatureIcon = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Check' : 'X';
    }
    return 'Check';
  };

  const getFeatureIconColor = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'text-green-500' : 'text-gray-300';
    }
    return 'text-green-500';
  };

  const formatFeatureValue = (key, value) => {
    switch (key) {
      case 'lessons_limit':
        return value === -1 ? 'Unlimited lessons' : `Up to ${value} lessons`;
      case 'advanced_simulations':
        return value ? 'Advanced simulations' : 'Basic simulations only';
      case 'certification_exams':
        return value ? 'Certification exams' : 'No certification exams';
      case 'mentorship':
        return value ? '1-on-1 mentorship' : 'No mentorship';
      case 'download_materials':
        return value ? 'Download materials' : 'Online access only';
      case 'priority_support':
        return value ? 'Priority support' : 'Standard support';
      case 'team_management':
        return value ? 'Team management' : null;
      case 'custom_content':
        return value ? 'Custom content' : null;
      default:
        return null;
    }
  };

  const features = Object.entries(plan?.features || {})?.map(([key, value]) => ({
      key,
      value,
      display: formatFeatureValue(key, value),
      icon: getFeatureIcon(value),
      iconColor: getFeatureIconColor(value)
    }))?.filter(f => f?.display);

  return (
    <div className={`
      relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl
      ${isPopular ? 'ring-2 ring-blue-500 scale-105' : ''}
      ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
      ${className}
    `}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Icon name="Check" size={14} className="mr-1" />
            Current
          </div>
        </div>
      )}
      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan?.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{plan?.description}</p>
          
          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-baseline justify-center">
              <span className="text-4xl font-bold text-gray-900">
                ${originalMonthlyPrice?.toFixed(0)}
              </span>
              <span className="text-gray-500 ml-2">
                /{billingCycle === 'yearly' ? 'month' : 'month'}
              </span>
            </div>
            
            {billingCycle === 'yearly' && savings && (
              <div className="mt-2">
                <span className="text-sm text-gray-500 line-through">
                  ${plan?.price_monthly}/month
                </span>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium mt-1 inline-block">
                  Save {savings?.percentage}% annually
                </div>
              </div>
            )}
            
            {billingCycle === 'yearly' && price > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Billed ${price?.toFixed(0)} yearly
              </p>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-8">
          {features?.slice(0, 6)?.map((feature) => (
            <div key={feature?.key} className="flex items-center">
              <Icon 
                name={feature?.icon} 
                size={16} 
                className={`mr-3 flex-shrink-0 ${feature?.iconColor}`}
              />
              <span className="text-sm text-gray-700">{feature?.display}</span>
            </div>
          ))}
          
          {features?.length > 6 && (
            <div className="text-sm text-gray-500">
              + {features?.length - 6} more features
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={onSelect}
          variant={buttonVariant}
          loading={loading}
          disabled={disabled}
          fullWidth
          className="mb-4"
        >
          {buttonText}
        </Button>

        {/* Trial Info */}
        {plan?.tier !== 'free' && !isCurrentPlan && (
          <p className="text-xs text-gray-500 text-center">
            14-day free trial • Cancel anytime
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanCard;