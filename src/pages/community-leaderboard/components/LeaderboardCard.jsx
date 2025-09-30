import React from 'react';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';

const LeaderboardCard = ({ 
  user, 
  rank, 
  metric, 
  metricLabel, 
  rankIcon, 
  isCurrentUser, 
  category 
}) => {
  const getRankBackgroundColor = () => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    if (isCurrentUser) return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
    return 'bg-white border-gray-200';
  };

  const getSpecializationBadge = () => {
    if (!user?.specialization) return null;
    
    const colors = {
      mechanical: 'bg-orange-100 text-orange-800',
      electrical: 'bg-blue-100 text-blue-800',
      civil: 'bg-green-100 text-green-800',
      chemical: 'bg-purple-100 text-purple-800',
      computer: 'bg-indigo-100 text-indigo-800',
      aerospace: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors?.[user?.specialization] || 'bg-gray-100 text-gray-800'}`}>
        {user?.specialization?.charAt(0)?.toUpperCase() + user?.specialization?.slice(1)}
      </span>
    );
  };

  const getAdditionalMetrics = () => {
    switch (category) {
      case 'streaks':
        return user?.streakActive ? (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Zap className="w-3 h-3" />
            Active
          </div>
        ) : (
          <div className="text-xs text-gray-500">Inactive</div>
        );
      
      case 'achievements':
        return user?.tierBreakdown ? (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Trophy className="w-3 h-3" />
            {user?.achievementCount || 0} badges
          </div>
        ) : null;
      
      case 'overall':
        return (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Star className="w-3 h-3" />
            Level {user?.current_level || 1}
          </div>
        );
      
      default:
        return null;
    }
  };

  const getRecentActivity = () => {
    if (category !== 'overall' || !user?.recentActivity?.length) return null;
    
    const activity = user?.recentActivity?.[0];
    const activityLabels = {
      lesson_completion: 'Completed lesson',
      daily_challenge: 'Daily challenge',
      achievement_earned: 'New achievement',
      quiz_completion: 'Passed quiz'
    };
    
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <TrendingUp className="w-3 h-3" />
        {activityLabels?.[activity?.source] || 'Recent activity'}
      </div>
    );
  };

  return (
    <div className={`rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 p-4 ${getRankBackgroundColor()}`}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
          {rankIcon ? (
            <div className="flex flex-col items-center">
              {rankIcon}
              <span className="text-xs font-bold text-gray-700 mt-1">#{rank}</span>
            </div>
          ) : (
            <div className="text-center">
              <div className={`text-lg font-bold ${rank <= 3 ? 'text-blue-600' : 'text-gray-700'}`}>
                #{rank}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user?.avatar_url ? (
            <img
              src={user?.avatar_url}
              alt={user?.username || user?.full_name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
              {(user?.username || user?.full_name || 'U')?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user?.full_name || user?.username}
            </h3>
            {isCurrentUser && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                You
              </span>
            )}
            {getSpecializationBadge()}
          </div>
          
          {user?.username && user?.full_name && (
            <p className="text-xs text-gray-500 truncate mb-1">@{user?.username}</p>
          )}
          
          <div className="flex items-center gap-3">
            {getAdditionalMetrics()}
            {getRecentActivity()}
          </div>
        </div>

        {/* Metric */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {metric}
          </div>
          <div className="text-xs text-gray-500">
            {metricLabel}
          </div>
          
          {/* Rank Change Indicator */}
          {user?.rankChange && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${
              user?.rankChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-3 h-3 ${user?.rankChange < 0 ? 'rotate-180' : ''}`} />
              {Math?.abs(user?.rankChange)}
            </div>
          )}
        </div>
      </div>

      {/* Achievement Breakdown (for achievements category) */}
      {category === 'achievements' && user?.tierBreakdown && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Badges:</span>
            {Object?.entries(user?.tierBreakdown)?.map(([tier, count]) => (
              count > 0 && (
                <span key={tier} className={`px-2 py-1 rounded-full font-medium ${
                  tier === 'diamond' ? 'bg-purple-100 text-purple-800' :
                  tier === 'platinum' ? 'bg-gray-100 text-gray-800' :
                  tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                  tier === 'silver'? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-800'
                }`}>
                  {tier?.charAt(0)?.toUpperCase()}: {count}
                </span>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;