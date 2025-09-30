import React from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp } from 'lucide-react';

const LeaderboardPanel = ({ leaderboardData, currentUserId }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getDisciplineColor = (specialization) => {
    const colors = {
      mechanical: 'text-blue-600',
      electrical: 'text-yellow-600',
      civil: 'text-green-600',
      computer: 'text-purple-600',
      aerospace: 'text-red-600',
      chemical: 'text-orange-600'
    };
    return colors?.[specialization] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            Monthly Leaderboard
          </h3>
          <div className="text-xs text-gray-500 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live Rankings
          </div>
        </div>
      </div>
      <div className="p-6">
        {leaderboardData?.length > 0 ? (
          <div className="space-y-3">
            {leaderboardData?.map((user) => {
              const isCurrentUser = user?.user_id === currentUserId;
              
              return (
                <div
                  key={user?.user_id}
                  className={`
                    relative p-4 rounded-lg border transition-all duration-200
                    ${getRankBgColor(user?.rank)}
                    ${isCurrentUser ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center">
                        {getRankIcon(user?.rank)}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {user?.avatar_url ? (
                            <img
                              src={user?.avatar_url}
                              alt={user?.full_name || user?.username || 'User'}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {(user?.full_name || user?.username || 'U')?.[0]?.toUpperCase()}
                            </div>
                          )}
                          {user?.current_level && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {user?.current_level}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {user?.full_name || user?.username || 'Anonymous User'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${getDisciplineColor(user?.specialization)} font-medium`}>
                            {user?.specialization ? `${user?.specialization} Engineering` : 'Student'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {user?.totalXP?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.challengesCompleted || 0} challenges
                      </div>
                    </div>
                  </div>
                  {/* Performance indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Avg Score: {Math.round(user?.averageScore || 0)}%
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5]?.map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.floor((user?.averageScore || 0) / 20)
                              ? 'text-yellow-400 fill-current' :'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">No Rankings Yet</h4>
            <p className="text-xs text-gray-500">Complete challenges to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPanel;