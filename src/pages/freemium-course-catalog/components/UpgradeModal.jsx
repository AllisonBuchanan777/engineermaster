import React from 'react';
import { X, Lock, Check, Crown, Zap } from 'lucide-react';

const UpgradeModal = ({ course, userSubscription, onClose, onUpgrade }) => {
  const getRequiredTier = () => {
    if (course?.access_level === 'premium') return 'Premium';
    if (course?.access_level === 'professional') return 'Professional';
    return 'Premium';
  };

  const getPlanFeatures = (tier) => {
    const features = {
      Premium: [
        'Unlimited access to premium courses',
        'Advanced simulations and labs',
        'Progress tracking and analytics',
        'Certificate of completion',
        'Priority customer support'
      ],
      Professional: [
        'Everything in Premium',
        'Professional-grade simulations',
        'Industry case studies',
        'Mentorship program access',
        'Career placement assistance'
      ]
    };
    return features?.[tier] || features?.Premium;
  };

  const getPlanIcon = (tier) => {
    return tier === 'Professional' ? Crown : Zap;
  };

  const requiredTier = getRequiredTier();
  const PlanIcon = getPlanIcon(requiredTier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Upgrade Required</h3>
              <p className="text-sm text-gray-500">Unlock premium content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Course Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{course?.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{course?.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Duration: {course?.estimated_duration_minutes || 30} minutes</span>
                <span className="capitalize">Level: {course?.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Information */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlanIcon className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {requiredTier} Plan Required
            </h4>
            <p className="text-gray-600 text-sm">
              This course is part of our {requiredTier?.toLowerCase()} content library. 
              Upgrade to access this and hundreds of other premium courses.
            </p>
          </div>

          {/* Plan Features */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">What you'll get:</h5>
            <ul className="space-y-2">
              {getPlanFeatures(requiredTier)?.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current Plan Info */}
          {userSubscription && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Current Plan:</strong> {userSubscription?.tier?.charAt(0)?.toUpperCase() + userSubscription?.tier?.slice(1)}
                {userSubscription?.tier === 'free' && (
                  <span className="ml-2 text-xs">
                    ({userSubscription?.features_access?.lessons_limit || 3} free courses remaining)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
            >
              Upgrade to {requiredTier}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Signals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">500+</div>
                <div className="text-xs text-gray-500">Premium Courses</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">95%</div>
                <div className="text-xs text-gray-500">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">10K+</div>
                <div className="text-xs text-gray-500">Active Learners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;