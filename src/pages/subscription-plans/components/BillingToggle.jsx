import React from 'react';

const BillingToggle = ({ billingCycle, onToggle, className = '' }) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="bg-gray-100 p-1 rounded-lg inline-flex">
        <button
          onClick={() => onToggle('monthly')}
          className={`
            px-6 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${billingCycle === 'monthly' ?'bg-white text-gray-900 shadow-sm' :'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Monthly
        </button>
        <button
          onClick={() => onToggle('yearly')}
          className={`
            px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative
            ${billingCycle === 'yearly' ?'bg-white text-gray-900 shadow-sm' :'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Yearly
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
};

export default BillingToggle;