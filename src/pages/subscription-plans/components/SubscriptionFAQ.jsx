import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SubscriptionFAQ = () => {
  const [openItems, setOpenItems] = useState(new Set(['trial']));

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems?.has(id)) {
      newOpenItems?.delete(id);
    } else {
      newOpenItems?.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqItems = [
    {
      id: 'trial',
      question: 'How does the 14-day free trial work?',
      answer: 'Start with any paid plan and get full access for 14 days at no cost. Your subscription begins after the trial ends. Cancel anytime during the trial with no charges.'
    },
    {
      id: 'upgrade',
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! You can change your plan anytime from your account settings. Upgrades take effect immediately, while downgrades take effect at your next billing cycle.'
    },
    {
      id: 'cancel',
      question: 'What happens if I cancel my subscription?',
      answer: 'You can cancel anytime. You\'ll keep access to premium features until your current billing period ends, then your account will revert to the free plan.'
    },
    {
      id: 'features',
      question: 'What\'s included in advanced simulations?',
      answer: 'Advanced simulations include interactive 3D models, real-time physics calculations, collaborative design tools, and the ability to export your work for portfolio use.'
    },
    {
      id: 'mentorship',
      question: 'How does the mentorship program work?',
      answer: 'Professional and Enterprise plans include monthly 1-on-1 video calls with industry experts, personalized learning path recommendations, and career guidance.'
    },
    {
      id: 'certification',
      question: 'Are the certification exams industry-recognized?',
      answer: 'Yes! Our certification exams are developed in partnership with engineering institutions and are recognized by many employers in the engineering industry.'
    },
    {
      id: 'team',
      question: 'Do you offer team or educational discounts?',
      answer: 'Yes! We offer special pricing for educational institutions, teams of 5+, and bulk licenses. Contact our sales team for custom pricing.'
    },
    {
      id: 'refund',
      question: 'What\'s your refund policy?',
      answer: 'We offer a 30-day money-back guarantee for all paid subscriptions. If you\'re not satisfied, contact support for a full refund within 30 days of your purchase.'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {faqItems?.map((item) => {
          const isOpen = openItems?.has(item?.id);
          
          return (
            <div key={item?.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleItem(item?.id)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{item?.question}</span>
                <Icon 
                  name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
                  size={20} 
                  className="text-gray-500 transition-transform duration-200"
                />
              </button>
              {isOpen && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-700">{item?.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Still have questions?</h4>
        <p className="text-gray-600 mb-4">
          Our support team is here to help you choose the right plan for your learning goals.
        </p>
        <a 
          href="mailto:support@engineermaster.com"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <Icon name="Mail" size={16} className="mr-2" />
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default SubscriptionFAQ;