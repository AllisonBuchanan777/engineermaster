import React from 'react';
import { Rocket, Target, Trophy, Users } from 'lucide-react';

const WelcomeStep = ({ data, onNext, user }) => {
  const features = [
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'Tailored curriculum based on your engineering discipline and skill level'
    },
    {
      icon: Trophy,
      title: 'Gamified Progress',
      description: 'Earn XP, unlock achievements, and climb leaderboards as you learn'
    },
    {
      icon: Users,
      title: 'Interactive Community',
      description: 'Connect with fellow engineers and participate in collaborative challenges'
    }
  ];

  const handleGetStarted = () => {
    onNext({ hasSeenWelcome: true });
  };

  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to EngineerMaster, {user?.email?.split('@')?.[0] || 'Engineer'}!
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your engineering knowledge with our interactive, gamified learning platform. 
          Let's set up your personalized learning journey.
        </p>
      </div>
      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 my-12">
        {features?.map((feature, index) => {
          const FeatureIcon = feature?.icon;
          return (
            <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4">
                <FeatureIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature?.title}</h3>
              <p className="text-gray-600">{feature?.description}</p>
            </div>
          );
        })}
      </div>
      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Join Thousands of Engineers</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">10K+</div>
            <div className="text-blue-100 text-sm">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-blue-100 text-sm">Interactive Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">50+</div>
            <div className="text-blue-100 text-sm">Engineering Topics</div>
          </div>
        </div>
      </div>
      {/* Call to Action */}
      <div className="space-y-4">
        <button
          onClick={handleGetStarted}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          Let's Get Started
        </button>
        <p className="text-sm text-gray-500">
          This setup will take about 2-3 minutes and can be skipped at any time
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;