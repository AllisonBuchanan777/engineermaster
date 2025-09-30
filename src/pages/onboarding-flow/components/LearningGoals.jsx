import React, { useState } from 'react';
import { Target, Clock, Calendar, TrendingUp, Award, BookOpen } from 'lucide-react';

const LearningGoals = ({ data, onNext, onBack }) => {
  const [selectedGoals, setSelectedGoals] = useState(data?.learningGoals || []);
  const [dailyTime, setDailyTime] = useState(data?.dailyTimeCommitment || 30);
  const [timeframe, setTimeframe] = useState(data?.timeframe || '3-months');
  const [motivations, setMotivations] = useState(data?.motivations || []);

  const goalOptions = [
    {
      id: 'career-advancement',
      name: 'Career Advancement',
      icon: TrendingUp,
      description: 'Improve skills for promotion or new opportunities'
    },
    {
      id: 'certification-prep',
      name: 'Certification Preparation',
      icon: Award,
      description: 'Prepare for professional engineering certifications'
    },
    {
      id: 'academic-support',
      name: 'Academic Support',
      icon: BookOpen,
      description: 'Supplement coursework and improve grades'
    },
    {
      id: 'project-skills',
      name: 'Project-Specific Skills',
      icon: Target,
      description: 'Learn skills for current or upcoming projects'
    },
    {
      id: 'knowledge-refresh',
      name: 'Knowledge Refresh',
      icon: Calendar,
      description: 'Update and refresh existing engineering knowledge'
    },
    {
      id: 'career-change',
      name: 'Career Change',
      icon: Clock,
      description: 'Transition into engineering from another field'
    }
  ];

  const timeCommitments = [
    { value: 15, label: '15 min/day', description: 'Quick daily learning' },
    { value: 30, label: '30 min/day', description: 'Balanced approach' },
    { value: 60, label: '1 hour/day', description: 'Intensive learning' },
    { value: 120, label: '2+ hours/day', description: 'Accelerated progress' }
  ];

  const timeframes = [
    { value: '1-month', label: '1 Month', description: 'Intensive short-term goals' },
    { value: '3-months', label: '3 Months', description: 'Balanced learning timeline' },
    { value: '6-months', label: '6 Months', description: 'Comprehensive skill building' },
    { value: '1-year', label: '1 Year+', description: 'Long-term mastery' }
  ];

  const motivationOptions = [
    'Increase earning potential',
    'Change career paths',
    'Improve job performance',
    'Pass certification exams',
    'Understand concepts better',
    'Build confidence',
    'Stay current with technology',
    'Personal interest and growth'
  ];

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev?.includes(goalId) 
        ? prev?.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleMotivation = (motivation) => {
    setMotivations(prev => 
      prev?.includes(motivation) 
        ? prev?.filter(m => m !== motivation)
        : [...prev, motivation]
    );
  };

  const handleContinue = () => {
    onNext({ 
      learningGoals: selectedGoals,
      dailyTimeCommitment: dailyTime,
      timeframe: timeframe,
      motivations: motivations
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Set Your Learning Goals</h2>
        <p className="text-gray-600">
          Define your objectives to create a personalized learning experience
        </p>
      </div>
      {/* Learning Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What do you want to achieve?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalOptions?.map((goal) => {
            const GoalIcon = goal?.icon;
            const isSelected = selectedGoals?.includes(goal?.id);

            return (
              <div
                key={goal?.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' :'border-gray-200 hover:border-gray-300'}
                `}
                onClick={() => toggleGoal(goal?.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg
                    ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <GoalIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal?.name}</h4>
                    <p className="text-sm text-gray-600">{goal?.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Time Commitment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">How much time can you commit daily?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {timeCommitments?.map((commitment) => (
            <div
              key={commitment?.value}
              className={`
                p-4 text-center rounded-lg border-2 cursor-pointer transition-all
                ${dailyTime === commitment?.value 
                  ? 'border-blue-500 bg-blue-50' :'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setDailyTime(commitment?.value)}
            >
              <div className={`
                w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center
                ${dailyTime === commitment?.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <Clock className="w-6 h-6" />
              </div>
              <div className="font-medium text-gray-900">{commitment?.label}</div>
              <div className="text-xs text-gray-600">{commitment?.description}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Timeframe */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What's your target timeframe?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {timeframes?.map((frame) => (
            <div
              key={frame?.value}
              className={`
                p-4 text-center rounded-lg border-2 cursor-pointer transition-all
                ${timeframe === frame?.value 
                  ? 'border-blue-500 bg-blue-50' :'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setTimeframe(frame?.value)}
            >
              <div className={`
                w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center
                ${timeframe === frame?.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <Calendar className="w-6 h-6" />
              </div>
              <div className="font-medium text-gray-900">{frame?.label}</div>
              <div className="text-xs text-gray-600">{frame?.description}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Motivations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What motivates you to learn?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {motivationOptions?.map((motivation) => (
            <label
              key={motivation}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={motivations?.includes(motivation)}
                onChange={() => toggleMotivation(motivation)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">{motivation}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Summary */}
      {selectedGoals?.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Your Learning Plan</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div>📋 {selectedGoals?.length} primary goal{selectedGoals?.length > 1 ? 's' : ''} selected</div>
            <div>⏰ {dailyTime} minutes daily commitment</div>
            <div>🎯 Target timeline: {timeframes?.find(f => f?.value === timeframe)?.label}</div>
            {motivations?.length > 0 && (
              <div>💪 {motivations?.length} motivation factor{motivations?.length > 1 ? 's' : ''} identified</div>
            )}
          </div>
        </div>
      )}
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={selectedGoals?.length === 0}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${selectedGoals?.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white' :'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LearningGoals;