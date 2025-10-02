import React from 'react';
import { Calendar, Clock, Award, Play, CheckCircle } from 'lucide-react';

const DailyChallenge = ({ challenge, onStartChallenge }) => {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-orange-100 text-orange-800 border-orange-200',
      expert: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors?.[difficulty] || colors?.beginner;
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '⚡';
      case 'advanced': return '🔥';
      case 'expert': return '💎';
      default: return '⭐';
    }
  };

  if (!challenge) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Daily Challenge</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2">📅</div>
          <p className="text-sm text-gray-500">No challenge available today</p>
          <p className="text-xs text-gray-400 mt-1">Check back tomorrow!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-sky-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-sky-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Challenge</h3>
        </div>
        
        {challenge?.isCompleted ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <div className="text-sky-600">
            <Clock className="w-5 h-5" />
          </div>
        )}
      </div>
      {/* Challenge Content */}
      <div className="space-y-4">
        {/* Difficulty and Reward */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getDifficultyColor(challenge?.difficulty)}`}>
            <span className="mr-1">{getDifficultyIcon(challenge?.difficulty)}</span>
            <span className="capitalize">{challenge?.difficulty}</span>
          </div>
          
          <div className="flex items-center text-amber-600">
            <Award className="w-4 h-4 mr-1" />
            <span className="text-sm font-bold">+{challenge?.reward_points} pts</span>
          </div>
        </div>

        {/* Challenge Description */}
        <div className="bg-white rounded-lg p-4 border border-sky-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            {challenge?.description}
          </p>
          
          {/* Related Lesson */}
          {challenge?.lessons && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Related lesson:</p>
              <p className="text-sm font-medium text-sky-600">{challenge?.lessons?.title}</p>
            </div>
          )}
        </div>

        {/* Progress and Stats */}
        {challenge?.isCompleted ? (
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Challenge Completed!</p>
                <p className="text-xs text-green-600">
                  Completed on {new Date(challenge?.completedAt)?.toLocaleDateString()}
                </p>
              </div>
              {challenge?.score > 0 && (
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">{challenge?.score}%</p>
                  <p className="text-xs text-green-600">Score</p>
                </div>
              )}
            </div>
            
            {challenge?.attempts > 1 && (
              <p className="text-xs text-green-600 mt-2">
                Completed in {challenge?.attempts} attempts
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => onStartChallenge?.(challenge)}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Start Challenge</span>
          </button>
        )}
      </div>
      {/* Challenge Date */}
      <div className="mt-4 pt-4 border-t border-sky-100">
        <p className="text-xs text-gray-500 text-center">
          {new Date(challenge?.challenge_date)?.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
};

export default DailyChallenge;