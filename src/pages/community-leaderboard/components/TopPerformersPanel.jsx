import React from 'react';
import { TrendingUp, Zap, Star } from 'lucide-react';

const TopPerformersPanel = ({ performers, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          {[...Array(5)]?.map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Most active learners this week</p>

      <div className="space-y-3">
        {performers?.slice(0, 10)?.map((performer, index) => (
          <div key={performer?.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="flex-shrink-0 relative">
              {performer?.avatar_url ? (
                <img
                  src={performer?.avatar_url}
                  alt={performer?.username || performer?.full_name}
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {(performer?.username || performer?.full_name || 'U')?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{index + 1}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {performer?.full_name || performer?.username}
                </p>
                {performer?.specialization && (
                  <span className="text-xs text-gray-500">
                    ({performer?.specialization?.charAt(0)?.toUpperCase() + performer?.specialization?.slice(1)})
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-green-500" />
                  <span>+{performer?.recentXP || 0} XP</span>
                </div>
                
                {performer?.recentActivities?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{performer?.recentActivities?.length} activities</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-semibold text-green-600">
                #{performer?.rank}
              </div>
            </div>
          </div>
        ))}
      </div>

      {performers?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No recent activity to show</p>
        </div>
      )}

      {performers?.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All ({performers?.length}) →
          </button>
        </div>
      )}
    </div>
  );
};

export default TopPerformersPanel;