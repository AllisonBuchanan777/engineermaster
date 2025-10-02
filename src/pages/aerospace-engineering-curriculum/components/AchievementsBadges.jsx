import React from 'react';
import { Trophy, Award, Medal, Star, Zap, Rocket, Navigation, Globe } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const AchievementsBadges = ({ achievements, onAchievementClick }) => {
  const getAchievementIcon = (iconName) => {
    const icons = {
      'trophy': Trophy,
      'award': Award,
      'medal': Medal,
      'star': Star,
      'rocket': Rocket,
      'plane': Navigation,
      'zap': Zap,
      'satellite': Globe
    };
    return icons?.[iconName] || Award;
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'from-amber-400 to-orange-500',
      silver: 'from-gray-300 to-gray-500', 
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600',
      diamond: 'from-blue-400 to-blue-600'
    };
    return colors?.[tier] || colors?.bronze;
  };

  const getTierBorder = (tier) => {
    const borders = {
      bronze: 'border-amber-400',
      silver: 'border-gray-400',
      gold: 'border-yellow-400', 
      platinum: 'border-purple-400',
      diamond: 'border-blue-400'
    };
    return borders?.[tier] || borders?.bronze;
  };

  const groupAchievementsByTier = (achievements) => {
    const groups = {
      bronze: [],
      silver: [],
      gold: [],
      platinum: [],
      diamond: []
    };
    
    achievements?.forEach(achievement => {
      const tier = achievement?.tier || 'bronze';
      groups?.[tier]?.push(achievement);
    });
    
    return groups;
  };

  const achievementGroups = groupAchievementsByTier(achievements || []);
  const tierOrder = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

  if (!achievements || achievements?.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Trophy className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Achievements Yet</h3>
        <p className="text-gray-500">Start completing lessons to earn your first achievements!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Aerospace Engineering Achievements</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {tierOrder?.map(tier => {
            const tierAchievements = achievementGroups?.[tier] || [];
            const earnedCount = tierAchievements?.filter(a => a?.isEarned)?.length || 0;
            
            return (
              <div key={tier} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${getTierColor(tier)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">
                    {earnedCount}/{tierAchievements?.length}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-600 capitalize">{tier}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center text-sm text-gray-600">
          <span className="font-medium">
            {achievements?.filter(a => a?.isEarned)?.length}/{achievements?.length}
          </span> achievements unlocked
        </div>
      </div>
      {/* Achievement Tiers */}
      {tierOrder?.map(tier => {
        const tierAchievements = achievementGroups?.[tier];
        if (!tierAchievements || tierAchievements?.length === 0) return null;

        return (
          <div key={tier} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTierColor(tier)} flex items-center justify-center mr-3`}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{tier} Achievements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierAchievements?.map(achievement => {
                const Icon = getAchievementIcon(achievement?.icon_name);
                
                return (
                  <div
                    key={achievement?.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      achievement?.isEarned 
                        ? `${getTierBorder(achievement?.tier)} bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transform hover:-translate-y-1`
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                    onClick={() => onAchievementClick?.(achievement)}
                  >
                    {/* Achievement Icon */}
                    <div className="flex items-start space-x-3">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement?.isEarned 
                            ? `bg-gradient-to-r ${getTierColor(achievement?.tier)} text-white`
                            : 'bg-gray-300 text-gray-500'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {achievement?.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {achievement?.description}
                        </p>

                        {/* Progress Bar for incomplete achievements */}
                        {!achievement?.isEarned && achievement?.progress > 0 && (
                          <div className="mb-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getTierColor(achievement?.tier)} transition-all duration-300`}
                                style={{ width: `${achievement?.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{achievement?.progress}% complete</p>
                          </div>
                        )}

                        {/* XP Reward */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            +{achievement?.xp_reward} XP
                          </span>
                          
                          {achievement?.isEarned && (
                            <span className="text-xs text-green-600 font-medium">
                              ✓ Earned
                            </span>
                          )}
                        </div>

                        {/* Earned Date */}
                        {achievement?.isEarned && achievement?.earnedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Earned {new Date(achievement.earnedAt)?.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Achievement Glow Effect */}
                    {achievement?.isEarned && (
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getTierColor(achievement?.tier)} opacity-10 pointer-events-none`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Achievement Tips */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Achievement Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p>Complete lessons consistently to unlock Bronze achievements</p>
          </div>
          <div className="flex items-start space-x-2">
            <Rocket className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>Master entire learning paths for Silver and Gold rewards</p>
          </div>
          <div className="flex items-start space-x-2">
            <Trophy className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <p>Platinum achievements require advanced skill demonstration</p>
          </div>
          <div className="flex items-start space-x-2">
            <Medal className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p>Diamond achievements are for true aerospace experts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsBadges;