import React, { useState } from 'react';
import { GraduationCap, BookOpen, Trophy, Star } from 'lucide-react';

const SkillAssessment = ({ data, onNext, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState(data?.skillLevel || 'beginner');
  const [experience, setExperience] = useState(data?.experience || '');

  const skillLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      icon: BookOpen,
      description: 'New to engineering or just starting out',
      details: 'Perfect for students or career changers',
      color: 'from-green-500 to-emerald-500',
      timeEstimate: '3-6 months to intermediate'
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      icon: GraduationCap,
      description: 'Some engineering background or coursework',
      details: 'Ideal for current students or professionals with basic knowledge',
      color: 'from-blue-500 to-cyan-500',
      timeEstimate: '2-4 months to advanced'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: Trophy,
      description: 'Solid engineering foundation and experience',
      details: 'Great for experienced professionals seeking specialization',
      color: 'from-purple-500 to-violet-500',
      timeEstimate: '1-3 months to expert'
    },
    {
      id: 'expert',
      name: 'Expert',
      icon: Star,
      description: 'Extensive experience and deep knowledge',
      details: 'Perfect for senior engineers and specialists',
      color: 'from-orange-500 to-red-500',
      timeEstimate: 'Continuous learning and refinement'
    }
  ];

  const experienceOptions = [
    'Student (Currently enrolled)',
    'Recent graduate (0-2 years)',
    'Professional (2-5 years)',
    'Senior professional (5+ years)',
    'Academic/Researcher',
    'Career changer (from other field)',
    'Hobbyist/Self-taught'
  ];

  const handleContinue = () => {
    onNext({ 
      skillLevel: selectedLevel,
      experience: experience
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Assess Your Current Level</h2>
        <p className="text-gray-600">
          Help us understand your engineering background to personalize your learning path
        </p>
      </div>
      {/* Skill Level Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What's your engineering skill level?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillLevels?.map((level) => {
            const LevelIcon = level?.icon;
            const isSelected = selectedLevel === level?.id;

            return (
              <div
                key={level?.id}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                `}
                onClick={() => setSelectedLevel(level?.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${level?.color}
                  `}>
                    <LevelIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{level?.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{level?.description}</p>
                    <p className="text-xs text-gray-500 mb-2">{level?.details}</p>
                    <div className="text-xs text-blue-600 font-medium">
                      ⏱️ {level?.timeEstimate}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Experience Background */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What's your professional background?</h3>
        <select
          value={experience}
          onChange={(e) => setExperience(e?.target?.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select your background...</option>
          {experienceOptions?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      {/* Assessment Summary */}
      {selectedLevel && experience && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Your Learning Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Skill Level:</span>
              <span className="ml-2 text-gray-600">
                {skillLevels?.find(level => level?.id === selectedLevel)?.name}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Background:</span>
              <span className="ml-2 text-gray-600">{experience}</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                We'll start with {selectedLevel} level content and adjust as you progress
              </span>
            </div>
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
          disabled={!selectedLevel || !experience}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${selectedLevel && experience
              ? 'bg-blue-600 hover:bg-blue-700 text-white' :'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SkillAssessment;