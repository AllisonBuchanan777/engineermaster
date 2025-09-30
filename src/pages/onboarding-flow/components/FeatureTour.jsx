import React, { useState } from 'react';
import { PlayCircle, Trophy, Target, Users, BookOpen, BarChart3, Star } from 'lucide-react';

const FeatureTour = ({ data, onNext, onBack }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      id: 'interactive-lessons',
      title: 'Interactive Lessons',
      icon: PlayCircle,
      description: 'Engage with dynamic content including videos, simulations, and hands-on exercises',
      highlight: 'Learn by doing, not just reading',
      color: 'from-blue-500 to-cyan-500',
      benefits: ['Interactive simulations', 'Step-by-step guidance', 'Real-world applications']
    },
    {
      id: 'gamification',
      title: 'XP & Achievement System',
      icon: Trophy,
      description: 'Earn experience points, unlock achievements, and track your progress',
      highlight: 'Make learning addictive and rewarding',
      color: 'from-yellow-500 to-orange-500',
      benefits: ['Experience points (XP)', 'Achievement badges', 'Leaderboards']
    },
    {
      id: 'skill-trees',
      title: 'Visual Skill Trees',
      icon: Target,
      description: 'See your learning path visually with prerequisite tracking and milestone goals',
      highlight: 'Clear roadmap to expertise',
      color: 'from-purple-500 to-violet-500',
      benefits: ['Visual progress tracking', 'Prerequisite mapping', 'Milestone rewards']
    },
    {
      id: 'community',
      title: 'Engineering Community',
      icon: Users,
      description: 'Connect with fellow engineers, join study groups, and participate in challenges',
      highlight: 'Learn together, achieve more',
      color: 'from-green-500 to-emerald-500',
      benefits: ['Discussion forums', 'Study groups', 'Collaborative projects']
    },
    {
      id: 'personalized',
      title: 'Personalized Learning',
      icon: BookOpen,
      description: 'AI-powered recommendations based on your progress, goals, and learning style',
      highlight: 'Tailored just for you',
      color: 'from-indigo-500 to-blue-600',
      benefits: ['Custom learning paths', 'Adaptive difficulty', 'Personal recommendations']
    },
    {
      id: 'analytics',
      title: 'Progress Analytics',
      icon: BarChart3,
      description: 'Detailed insights into your learning patterns, strengths, and areas for improvement',
      highlight: 'Data-driven learning optimization',
      color: 'from-red-500 to-pink-500',
      benefits: ['Performance tracking', 'Learning analytics', 'Goal monitoring']
    }
  ];

  const handleComplete = () => {
    onNext({ hasCompletedTour: true });
  };

  const nextFeature = () => {
    if (currentFeature < features?.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      handleComplete();
    }
  };

  const prevFeature = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  const feature = features?.[currentFeature];
  const FeatureIcon = feature?.icon;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Discover EngineerMaster Features</h2>
        <p className="text-gray-600">
          Let's explore the tools that will accelerate your engineering journey
        </p>
      </div>
      {/* Progress Indicators */}
      <div className="flex items-center justify-center space-x-2">
        {features?.map((_, index) => (
          <div
            key={index}
            className={`
              h-2 rounded-full transition-all duration-300
              ${index === currentFeature ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'}
            `}
          />
        ))}
      </div>
      {/* Feature Showcase */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
        <div className="text-center space-y-6">
          {/* Feature Icon */}
          <div className={`
            inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${feature?.color}
          `}>
            <FeatureIcon className="w-10 h-10 text-white" />
          </div>

          {/* Feature Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">{feature?.title}</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{feature?.description}</p>
            <div className={`
              inline-block px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${feature?.color} text-white
            `}>
              {feature?.highlight}
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {feature?.benefits?.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-900">{benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Feature Navigation */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Feature {currentFeature + 1} of {features?.length}
          </div>
          
          <div className="flex items-center space-x-2">
            {features?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`
                  w-8 h-8 rounded-full text-xs font-medium transition-colors
                  ${index === currentFeature 
                    ? 'bg-blue-500 text-white' :'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            {currentFeature === features?.length - 1 ? 'Ready to start!' : 'More to explore'}
          </div>
        </div>
      </div>
      {/* Call to Action */}
      {currentFeature === features?.length - 1 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <h4 className="text-lg font-semibold mb-2">Ready to Begin Your Journey?</h4>
          <p className="text-blue-100 mb-4">
            You're all set! Your personalized learning experience awaits.
          </p>
          <button
            onClick={handleComplete}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Learning Now
          </button>
        </div>
      )}
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={currentFeature > 0 ? prevFeature : onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          {currentFeature > 0 ? 'Previous' : 'Back'}
        </button>
        
        <button
          onClick={nextFeature}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {currentFeature === features?.length - 1 ? 'Complete Setup' : 'Next Feature'}
        </button>
      </div>
    </div>
  );
};

export default FeatureTour;