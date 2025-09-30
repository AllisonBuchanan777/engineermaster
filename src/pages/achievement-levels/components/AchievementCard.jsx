import React, { useState } from 'react';
import { Trophy, CheckCircle, Lock, Calendar, Zap, Star, Clock, ArrowRight } from 'lucide-react';

const AchievementCard = ({ achievement, isEarned, progress, earnedData, tierConfig }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCriteriaDescription = (criteria) => {
    if (!criteria) return 'Complete specific requirements to earn this achievement';

    switch (criteria?.type) {
      case 'lesson_completion':
        return `Complete ${criteria?.count || 1} lessons in any discipline`;
      case 'skill_mastery':
        return `Master ${criteria?.nodes_required || 1} skills in ${criteria?.discipline || 'any'} engineering`;
      case 'tier_achievement':
        return `Achieve ${criteria?.tier} tier in ${criteria?.count || 1} skill${criteria?.count > 1 ? 's' : ''}`;
      case 'tree_completion':
        return `Complete ${criteria?.trees_required || 1} skill tree${criteria?.trees_required > 1 ? 's' : ''}`;
      default:
        return 'Meet the specified requirements to unlock this achievement';
    }
  };

  return (
    <>
      <div
        className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${
          isEarned 
            ? `${tierConfig?.border} ${tierConfig?.bg} bg-opacity-20` 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setShowDetails(true)}
      >
        {/* Achievement Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {isEarned ? (
            <div className={`w-8 h-8 ${tierConfig?.bg} ${tierConfig?.border} border rounded-full flex items-center justify-center shadow-sm`}>
              <CheckCircle className={`w-5 h-5 ${tierConfig?.text}`} />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Achievement Icon */}
          <div className={`w-16 h-16 ${isEarned ? tierConfig?.bg : 'bg-gray-100'} ${isEarned ? tierConfig?.border : 'border-gray-200'} border-2 rounded-lg flex items-center justify-center mb-4`}>
            <Trophy className={`w-8 h-8 ${isEarned ? tierConfig?.text : 'text-gray-400'}`} />
          </div>

          {/* Achievement Info */}
          <h3 className={`font-bold text-lg mb-2 ${isEarned ? tierConfig?.text : 'text-gray-900'}`}>
            {achievement?.name}
          </h3>
          <p className={`text-sm mb-4 line-clamp-2 ${isEarned ? `${tierConfig?.text} opacity-80` : 'text-gray-600'}`}>
            {achievement?.description}
          </p>

          {/* XP Reward and Tier */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${isEarned ? tierConfig?.text : 'text-indigo-600'}`} />
              <span className={`text-sm font-medium ${isEarned ? tierConfig?.text : 'text-indigo-600'}`}>
                {achievement?.xp_reward} XP
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className={`w-4 h-4 ${tierConfig?.text}`} />
              <span className={`text-xs font-medium ${tierConfig?.text} capitalize`}>
                {achievement?.tier}
              </span>
            </div>
          </div>

          {/* Progress Bar or Earned Status */}
          {isEarned ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className={`w-4 h-4 ${tierConfig?.text}`} />
                <span className={tierConfig?.text}>
                  Earned {earnedData?.earned_at ? formatDate(earnedData?.earned_at) : 'Recently'}
                </span>
              </div>
              {/* Completion Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 ${tierConfig?.bg} ${tierConfig?.border} border rounded-full`}>
                <CheckCircle className={`w-3 h-3 ${tierConfig?.text}`} />
                <span className={`text-xs font-medium ${tierConfig?.text}`}>Completed</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300`}
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: tierConfig?.color
                  }}
                />
              </div>
            </div>
          )}

          {/* View Details Link */}
          <div className="flex items-center gap-1 mt-4 text-sm text-indigo-600 hover:text-indigo-700">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
      {/* Achievement Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className={`p-6 ${isEarned ? tierConfig?.bg : 'bg-gray-50'} ${isEarned ? tierConfig?.border : 'border-gray-200'} border-b`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${isEarned ? tierConfig?.bg : 'bg-white'} ${tierConfig?.border} border-2 rounded-lg flex items-center justify-center`}>
                    <Trophy className={`w-8 h-8 ${tierConfig?.text}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isEarned ? tierConfig?.text : 'text-gray-900'}`}>
                      {achievement?.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className={`w-4 h-4 ${tierConfig?.text}`} />
                      <span className={`text-sm font-medium ${tierConfig?.text} capitalize`}>
                        {achievement?.tier} Tier
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{achievement?.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-600">{getCriteriaDescription(achievement?.unlock_criteria)}</p>
              </div>

              {/* Reward */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Reward</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">{achievement?.xp_reward} XP</span>
                  </div>
                </div>
              </div>

              {/* Progress or Completion */}
              {isEarned ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Achievement Status</h3>
                  <div className={`p-4 ${tierConfig?.bg} ${tierConfig?.border} border rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-6 h-6 ${tierConfig?.text}`} />
                      <div>
                        <div className={`font-medium ${tierConfig?.text}`}>Completed</div>
                        {earnedData?.earned_at && (
                          <div className={`text-sm ${tierConfig?.text} opacity-80`}>
                            Earned on {formatDate(earnedData?.earned_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completion</span>
                      <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: tierConfig?.color
                        }}
                      />
                    </div>
                    {progress > 0 && progress < 100 && (
                      <div className="flex items-center gap-2 text-sm text-indigo-600">
                        <Clock className="w-4 h-4" />
                        <span>Keep going! You're making great progress.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className={`flex-1 px-4 py-2 ${tierConfig?.bg} ${tierConfig?.text} ${tierConfig?.border} border rounded-lg hover:bg-opacity-80 transition-colors font-medium`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementCard;