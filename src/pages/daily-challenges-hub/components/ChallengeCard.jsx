import React from 'react';
import { Play, CheckCircle, Star, Clock, ChevronRight } from 'lucide-react';

const ChallengeCard = ({ 
  challenge, 
  onStartChallenge, 
  isCompleted, 
  isToday = false,
  getDifficultyColor,
  getDisciplineIcon 
}) => {
  if (!challenge) return null;

  return (
    <div className={`relative ${isToday ? 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50' : 'border border-gray-200 bg-white'} rounded-lg p-6 hover:shadow-md transition-all duration-200`}>
      {/* Challenge Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getDisciplineIcon(challenge?.discipline)}</span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {challenge?.challenge_type?.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(challenge?.difficulty)}`}>
                {challenge?.difficulty}
              </span>
            </div>
            <div className="text-xs text-gray-400 capitalize mt-1">
              {challenge?.discipline} Engineering
            </div>
          </div>
        </div>
        
        {isCompleted && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>
      {/* Challenge Content */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
          {challenge?.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {challenge?.description}
        </p>
      </div>
      {/* Challenge Details */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-lg font-bold text-gray-900">{challenge?.xp_reward}</div>
          <div className="text-xs text-gray-500">XP Reward</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-gray-900">15</div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-sm">🎯</span>
          </div>
          <div className="text-lg font-bold text-gray-900">5</div>
          <div className="text-xs text-gray-500">Questions</div>
        </div>
      </div>
      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isToday ? 'Available Now' : `Available ${new Date(challenge?.challenge_date)?.toLocaleDateString()}`}
        </div>
        
        <button
          onClick={() => onStartChallenge(challenge)}
          disabled={isCompleted}
          className={`
            inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${isCompleted 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : isToday 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Challenge
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
      {/* Today's Challenge Glow Effect */}
      {isToday && !isCompleted && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 animate-pulse"></div>
      )}
    </div>
  );
};

export default ChallengeCard;