import React from 'react';
import { Award, Lock, Star, Zap } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const AchievementsBadges = ({ achievements, onAchievementClick }) => {
  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0'; 
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#CD7F32';
    }
  };

  const getTierGradient = (tier) => {
    switch (tier) {
      case 'bronze': return 'from-yellow-800 to-yellow-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-gray-300 to-gray-500';
      case 'diamond': return 'from-cyan-400 to-blue-600';
      default: return 'from-yellow-800 to-yellow-600';
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      'Zap': Zap,
      'Award': Award,
      'Star': Star
    };
    return icons?.[iconName] || Award;
  };

  // Group achievements by tier
  const achievementsByTier = achievements?.reduce((acc, achievement) => {
    const tier = achievement?.tier || 'bronze';
    if (!acc?.[tier]) acc[tier] = [];
    acc?.[tier]?.push(achievement);
    return acc;
  }, {});

  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const earnedCount = achievements?.filter(a => a?.isEarned)?.length || 0;

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievements</h2>
            <p className="text-gray-600">
              Unlock badges as you master electrical engineering concepts
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{earnedCount}</div>
            <div className="text-sm text-gray-500">of {achievements?.length} earned</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / (achievements?.length || 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {Math.round((earnedCount / (achievements?.length || 1)) * 100)}% Complete
        </div>
      </div>
      {/* Achievement Tiers */}
      {tiers?.map((tier) => {
        const tierAchievements = achievementsByTier?.[tier] || [];
        if (tierAchievements?.length === 0) return null;

        const earnedInTier = tierAchievements?.filter(a => a?.isEarned)?.length;

        return (
          <div key={tier} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTierGradient(tier)} mr-3`}
                ></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">{tier} Tier</h3>
                  <p className="text-sm text-gray-600">
                    {earnedInTier}/{tierAchievements?.length} achievements earned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {Math.round((earnedInTier / tierAchievements?.length) * 100)}% complete
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierAchievements?.map((achievement) => {
                const Icon = getIcon(achievement?.icon_name);
                const isEarned = achievement?.isEarned;
                
                return (
                  <div
                    key={achievement?.id}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isEarned 
                        ? `border-opacity-50 bg-gradient-to-br ${getTierGradient(tier)} text-white shadow-lg hover:shadow-xl transform hover:scale-105` 
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => onAchievementClick?.(achievement)}
                  >
                    {/* Achievement Icon */}
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isEarned 
                            ? 'bg-white bg-opacity-20' :'bg-gray-200'
                        }`}
                      >
                        {isEarned ? (
                          <Icon className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isEarned ? 'text-white' : 'text-gray-900'}`}>
                          +{achievement?.xp_reward}
                        </div>
                        <div className={`text-xs ${isEarned ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                          XP
                        </div>
                      </div>
                    </div>
                    {/* Achievement Details */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isEarned ? 'text-white' : 'text-gray-900'}`}>
                        {achievement?.name}
                      </h4>
                      <p className={`text-sm mb-3 ${isEarned ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                        {achievement?.description}
                      </p>
                    </div>
                    {/* Earned Date */}
                    {isEarned && achievement?.userAchievement?.earned_at && (
                      <div className="absolute bottom-2 right-2">
                        <div className="text-xs text-white text-opacity-75">
                          {new Date(achievement.userAchievement.earned_at)?.toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {/* Lock overlay for unearned achievements */}
                    {!isEarned && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    {/* Shine effect for earned achievements */}
                    {isEarned && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-20 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Achievement Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2 text-blue-600" />
          Tips for Earning Achievements
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Complete lessons to unlock module-specific achievements</p>
          <p>• Maintain learning streaks for consistency badges</p>
          <p>• Excel in quizzes and projects for performance awards</p>
          <p>• Finish entire modules to earn mastery achievements</p>
          <p>• Complete the full curriculum for the ultimate diamond achievement</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementsBadges;