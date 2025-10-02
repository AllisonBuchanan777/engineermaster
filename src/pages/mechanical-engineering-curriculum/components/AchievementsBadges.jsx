import React from 'react';
import { Trophy, Award, Star, Crown, Lock, CheckCircle } from 'lucide-react';

const AchievementsBadges = ({ achievements, onAchievementClick }) => {
  const getBadgeIcon = (iconName) => {
    const icons = {
      'trophy': Trophy,
      'award': Award,
      'star': Star,
      'crown': Crown,
      'atom': Star, // fallback for atom icon
      'flame': Trophy, // fallback for flame icon
      'waves': Award, // fallback for waves icon
      'cog': Star, // fallback for cog icon
      'tool': Trophy, // fallback for tool icon
      'cpu': Award // fallback for cpu icon
    };
    return icons?.[iconName] || Trophy;
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierTextColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'text-orange-700';
      case 'silver': return 'text-gray-700';
      case 'gold': return 'text-yellow-700';
      case 'platinum': return 'text-purple-700';
      default: return 'text-gray-700';
    }
  };

  if (!achievements?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
        <p className="text-gray-600">
          Complete lessons and projects to start earning achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        <div className="text-sm text-gray-500">
          {achievements?.filter(a => a?.isEarned)?.length} / {achievements?.length} earned
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.map((achievement) => {
          const BadgeIcon = getBadgeIcon(achievement?.badge_icon);
          const isEarned = achievement?.isEarned;
          
          return (
            <div
              key={achievement?.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isEarned 
                  ? 'border-green-200 bg-green-50 hover:bg-green-100' :'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onAchievementClick?.(achievement)}
            >
              {/* Achievement Status */}
              <div className="absolute top-2 right-2">
                {isEarned ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Badge Icon */}
              <div className="flex items-center justify-center mb-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(achievement?.tier)} ${
                  !isEarned ? 'opacity-50 grayscale' : ''
                }`}>
                  <BadgeIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Achievement Info */}
              <div className="text-center">
                <h4 className={`font-semibold mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement?.name}
                </h4>
                <p className={`text-xs mb-2 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                  {achievement?.description}
                </p>
                
                {/* Tier Badge */}
                <div className="flex items-center justify-center mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTierTextColor(achievement?.tier)} ${
                    achievement?.tier === 'bronze' ? 'bg-orange-100' :
                    achievement?.tier === 'silver' ? 'bg-gray-100' :
                    achievement?.tier === 'gold'? 'bg-yellow-100' : 'bg-purple-100'
                  }`}>
                    {achievement?.tier} Tier
                  </span>
                </div>

                {/* Points Reward */}
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Star className="w-3 h-3 mr-1" />
                  <span>{achievement?.points_reward} points</span>
                </div>

                {/* Earned Date */}
                {isEarned && achievement?.userAchievement?.earned_at && (
                  <p className="text-xs text-green-600 mt-2">
                    Earned {new Date(achievement?.userAchievement?.earned_at)?.toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Progress Bar for Partially Completed */}
              {!isEarned && achievement?.progressPercentage > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{achievement?.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${achievement?.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Achievement Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Achievement Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {['bronze', 'silver', 'gold', 'platinum']?.map((tier) => {
            const tierAchievements = achievements?.filter(a => a?.tier === tier);
            const earnedCount = tierAchievements?.filter(a => a?.isEarned)?.length || 0;
            
            return (
              <div key={tier} className="text-center">
                <div className={`text-lg font-bold ${getTierTextColor(tier)}`}>
                  {earnedCount}/{tierAchievements?.length || 0}
                </div>
                <div className="text-xs text-gray-600 capitalize">{tier}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsBadges;