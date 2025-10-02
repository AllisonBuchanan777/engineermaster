import React from 'react';
import { Calendar, Clock, Star, Play, CheckCircle } from 'lucide-react';

const DailyChallenge = ({ challenge, onStartChallenge }) => {
  if (!challenge) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          Daily Challenge
        </h3>
        <div className="text-center py-4">
          <div className="text-gray-400 text-4xl mb-2">📝</div>
          <p className="text-gray-600 text-sm">
            No challenge available today. Check back tomorrow!
          </p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isCompleted = challenge?.isCompleted;
  const formattedDate = new Date(challenge?.challenge_date)?.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          Daily Challenge
        </h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>

      <div className={`p-4 rounded-lg border ${
        isCompleted ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
      }`}>
        {/* Challenge Status */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(challenge?.difficulty)}`}
          >
            {challenge?.difficulty}
          </span>
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Play className="w-5 h-5 text-orange-500" />
          )}
        </div>

        {/* Challenge Title */}
        <h4 className="font-semibold text-gray-900 mb-2">
          {challenge?.title}
        </h4>

        {/* Challenge Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {challenge?.description}
        </p>

        {/* Challenge Details */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>15-20 min</span>
          </div>
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1" />
            <span>{challenge?.points_reward} points</span>
          </div>
          <div className="capitalize">
            {challenge?.challenge_type?.replace('_', ' ')}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => !isCompleted && onStartChallenge?.()}
          disabled={isCompleted}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isCompleted
              ? 'bg-green-100 text-green-700 cursor-not-allowed' :'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isCompleted ? 'Challenge Completed' : 'Start Challenge'}
        </button>

        {/* Completion Info */}
        {isCompleted && challenge?.userCompletion?.completed_at && (
          <p className="text-xs text-green-600 text-center mt-2">
            Completed {new Date(challenge?.userCompletion?.completed_at)?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>

      {/* Challenge Tips */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-1">💡 Pro Tip</h5>
        <p className="text-xs text-gray-600">
          Review the related lesson material before attempting the challenge for better success rates.
        </p>
      </div>
    </div>
  );
};

export default DailyChallenge;