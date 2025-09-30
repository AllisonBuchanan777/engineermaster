import React from 'react';
import { Award, Star, Trophy, Crown, CheckCircle, Clock } from 'lucide-react';

const AchievementTierDisplay = ({ achievements = [], userAchievements = [] }) => {
  const tierConfig = {
    bronze: {
      label: 'Bronze',
      color: 'from-amber-600 to-orange-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      icon: Award,
      description: 'Starting your engineering journey'
    },
    silver: {
      label: 'Silver', 
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      icon: Star,
      description: 'Building solid foundations'
    },
    gold: {
      label: 'Gold',
      color: 'from-yellow-400 to-yellow-600', 
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: Trophy,
      description: 'Achieving engineering excellence'
    },
    platinum: {
      label: 'Platinum',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50', 
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      icon: Crown,
      description: 'Master engineer status'
    }
  };

  const getUserAchievementStatus = (achievementId) => {
    return userAchievements?.find(ua => ua?.achievement_id === achievementId);
  };

  const getAchievementsByTier = (tier) => {
    return achievements?.filter(achievement => achievement?.tier === tier) || [];
  };

  const getTierProgress = (tier) => {
    const tierAchievements = getAchievementsByTier(tier);
    const earnedCount = tierAchievements?.filter(achievement => 
      getUserAchievementStatus(achievement?.id)
    )?.length || 0;
    
    return {
      earned: earnedCount,
      total: tierAchievements?.length || 0,
      percentage: tierAchievements?.length > 0 ? Math.round((earnedCount / tierAchievements?.length) * 100) : 0
    };
  };

  const AchievementCard = ({ achievement, tierInfo }) => {
    const userAchievement = getUserAchievementStatus(achievement?.id);
    const isEarned = !!userAchievement;
    const IconComponent = tierInfo?.icon;

    return (
      <div className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
        ${isEarned 
          ? `${tierInfo?.bgColor} ${tierInfo?.borderColor} shadow-sm` 
          : 'bg-gray-50 border-gray-200 opacity-75'
        }
      `}>
        {/* Achievement Icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`
            p-2 rounded-lg bg-gradient-to-r ${tierInfo?.color} 
            ${isEarned ? 'shadow-md' : 'opacity-50'}
          `}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {achievement?.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {achievement?.description}
            </p>
          </div>
        </div>
        {/* Achievement Status */}
        {isEarned ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Earned</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              +{achievement?.xp_reward} XP
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>In Progress</span>
            </div>
            <div className="text-sm text-gray-600">
              +{achievement?.xp_reward} XP
            </div>
          </div>
        )}
        {/* Earned Date */}
        {isEarned && userAchievement?.earned_at && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Earned {new Date(userAchievement.earned_at)?.toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const TierSection = ({ tier }) => {
    const tierInfo = tierConfig?.[tier];
    const tierAchievements = getAchievementsByTier(tier);
    const progress = getTierProgress(tier);
    const IconComponent = tierInfo?.icon;

    if (tierAchievements?.length === 0) return null;

    return (
      <div className="space-y-4">
        {/* Tier Header */}
        <div className={`p-4 rounded-lg border-2 ${tierInfo?.bgColor} ${tierInfo?.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${tierInfo?.color} shadow-md`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {tierInfo?.label} Tier
                </h3>
                <p className="text-sm text-gray-600">
                  {tierInfo?.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${tierInfo?.textColor}`}>
                {progress?.earned}/{progress?.total}
              </div>
              <div className="text-sm text-gray-600">
                {progress?.percentage}% Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${tierInfo?.color}`}
              style={{ width: `${progress?.percentage}%` }}
            ></div>
          </div>
        </div>
        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tierAchievements?.map(achievement => (
            <AchievementCard 
              key={achievement?.id} 
              achievement={achievement} 
              tierInfo={tierInfo}
            />
          ))}
        </div>
      </div>
    );
  };

  const overallProgress = {
    totalAchievements: achievements?.length || 0,
    earnedAchievements: userAchievements?.length || 0,
    totalXP: userAchievements?.reduce((sum, ua) => {
      const achievement = achievements?.find(a => a?.id === ua?.achievement_id);
      return sum + (achievement?.xp_reward || 0);
    }, 0) || 0
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Achievement Progress</h2>
            <p className="text-blue-100">
              Track your engineering mastery through tiered achievements
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {overallProgress?.earnedAchievements}
            </div>
            <div className="text-blue-100">
              of {overallProgress?.totalAchievements} earned
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{overallProgress?.totalXP}</div>
            <div className="text-blue-100">XP from Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round((overallProgress?.earnedAchievements / overallProgress?.totalAchievements) * 100) || 0}%
            </div>
            <div className="text-blue-100">Overall Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Object.keys(tierConfig)?.filter(tier => getTierProgress(tier)?.earned > 0)?.length || 0}
            </div>
            <div className="text-blue-100">Tiers Unlocked</div>
          </div>
        </div>
      </div>
      {/* Tier Sections */}
      <div className="space-y-8">
        {['bronze', 'silver', 'gold', 'platinum']?.map(tier => (
          <TierSection key={tier} tier={tier} />
        ))}
      </div>
      {/* Achievement Statistics */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Achievement Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tierConfig)?.map(([tier, tierInfo]) => {
            const progress = getTierProgress(tier);
            const IconComponent = tierInfo?.icon;
            
            return (
              <div key={tier} className={`p-4 rounded-lg ${tierInfo?.bgColor} border ${tierInfo?.borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded bg-gradient-to-r ${tierInfo?.color}`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{tierInfo?.label}</span>
                </div>
                <div className={`text-2xl font-bold ${tierInfo?.textColor}`}>
                  {progress?.earned}
                </div>
                <div className="text-sm text-gray-600">
                  of {progress?.total} achievements
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementTierDisplay;