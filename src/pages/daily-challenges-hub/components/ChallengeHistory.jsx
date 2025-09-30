import React from 'react';
import { Calendar, Star, Trophy, Target, Clock } from 'lucide-react';

const ChallengeHistory = ({ 
  userChallengeAttempts, 
  getDifficultyColor, 
  getDisciplineIcon 
}) => {
  const getPerformanceBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 75) return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 60) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Needs Work', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            Challenge History
          </h2>
          <span className="text-sm text-gray-500">Recent attempts</span>
        </div>
      </div>
      <div className="p-6">
        {userChallengeAttempts?.length > 0 ? (
          <div className="space-y-4">
            {userChallengeAttempts?.map((attempt) => {
              const challenge = attempt?.daily_challenges;
              const performance = getPerformanceBadge(attempt?.score || 0);
              
              return (
                <div
                  key={attempt?.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getDisciplineIcon(challenge?.discipline)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {challenge?.title || 'Challenge'}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(challenge?.difficulty)}`}>
                            {challenge?.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {challenge?.challenge_type?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {attempt?.xp_earned || 0} XP
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(attempt?.completed_at)}
                      </div>
                    </div>
                  </div>
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{attempt?.score || 0}%</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {Math.floor(Math.random() * 10) + 5}m
                      </div>
                      <div className="text-xs text-gray-500">Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {Math.floor((attempt?.score || 0) / 20)}
                      </div>
                      <div className="text-xs text-gray-500">Correct</div>
                    </div>
                  </div>
                  {/* Performance Badge and Date */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${performance?.color}`}>
                      {performance?.label}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(attempt?.completed_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Challenges Completed Yet</h3>
            <p className="text-gray-500 mb-6">Start your first challenge to see your progress here!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Ready to Get Started?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Daily challenges are designed to test and improve your engineering knowledge across all disciplines.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Trophy className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Earn XP & badges</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Build streaks</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeHistory;