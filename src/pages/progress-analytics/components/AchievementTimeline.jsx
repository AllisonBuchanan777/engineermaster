import React from 'react';
import Icon from '../../../components/AppIcon';

const AchievementTimeline = ({ achievements }) => {
  if (!achievements || achievements?.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Icon name="Award" size={32} className="mx-auto mb-2 text-gray-300" />
        <div className="text-sm">No achievements yet</div>
        <div className="text-xs text-gray-400 mt-1">Complete lessons to earn achievements</div>
      </div>
    );
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-4">
      {achievements?.map((achievement, index) => {
        const achievementType = achievement?.achievement_types;
        
        return (
          <div key={achievement?.id || index} className="flex items-start space-x-3">
            {/* Achievement Icon */}
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ 
                backgroundColor: achievementType?.badge_color || '#3b82f6' 
              }}
            >
              {achievementType?.icon_name ? (
                <Icon 
                  name={achievementType?.icon_name} 
                  size={20} 
                  className="text-white" 
                />
              ) : (
                <Icon name="Award" size={20} className="text-white" />
              )}
            </div>
            {/* Achievement Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {achievementType?.name || 'Unknown Achievement'}
                </h4>
                <div className="flex items-center text-xs text-yellow-600">
                  <Icon name="Star" size={12} className="mr-1" />
                  {achievementType?.xp_reward || 0} XP
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {achievementType?.description || 'Achievement earned'}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(achievement?.earned_at)}
                </span>
                
                {achievement?.progress_data && (
                  <div className="text-xs text-gray-500">
                    {Object.entries(achievement?.progress_data)?.map(([key, value]) => (
                      <span key={key} className="ml-2">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {/* View All Link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all achievements
        </button>
      </div>
    </div>
  );
};

export default AchievementTimeline;