import React from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  CheckCircle,
  Lock,
  Zap,
  Target
} from 'lucide-react';

const AchievementsBadges = ({ achievements }) => {
  if (!achievements || achievements?.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No achievements available yet.</p>
        <p className="text-xs text-gray-400 mt-1">Complete lessons to earn badges!</p>
      </div>
    );
  }

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      case 'diamond':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return <Award className="w-4 h-4" />;
      case 'silver':
        return <Star className="w-4 h-4" />;
      case 'gold':
        return <Trophy className="w-4 h-4" />;
      case 'platinum':
        return <Zap className="w-4 h-4" />;
      case 'diamond':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements?.map((achievement) => {
          const isEarned = achievement?.isEarned;
          const tierGradient = getTierColor(achievement?.tier);
          
          return (
            <div 
              key={achievement?.id}
              className={`relative group cursor-pointer transition-all duration-200 ${
                isEarned 
                  ? 'transform hover:scale-105' 
                  : 'opacity-60 grayscale'
              }`}
            >
              {/* Achievement Badge */}
              <div className={`relative w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                isEarned 
                  ? `bg-gradient-to-br ${tierGradient} text-white shadow-lg` 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {isEarned ? (
                  getTierIcon(achievement?.tier)
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                
                {/* Shine Effect for Earned Achievements */}
                {isEarned && (
                  <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse"></div>
                )}
              </div>
              
              {/* Achievement Info */}
              <div className="text-center">
                <h5 className={`font-medium text-xs ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement?.name}
                </h5>
                <p className={`text-xs mt-1 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                  {achievement?.tier} • {achievement?.xp_reward || achievement?.mechatronicBonus || 0} XP
                </p>
              </div>
              
              {/* Earned Date */}
              {isEarned && achievement?.userAchievement?.earned_at && (
                <div className="text-center mt-1">
                  <span className="text-xs text-green-600 font-medium">
                    Earned
                  </span>
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <p className="font-medium mb-1">{achievement?.name}</p>
                <p className="text-gray-300">{achievement?.description}</p>
                {achievement?.mechatronicBonus && (
                  <p className="text-yellow-300 mt-1">
                    Mechatronic Bonus: +{Math.floor((achievement?.mechatronicBonus - achievement?.xp_reward) || 0)} XP
                  </p>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Achievement Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 text-sm">Achievement Progress</h4>
          <span className="text-sm text-gray-600">
            {achievements?.filter(a => a?.isEarned)?.length || 0}/{achievements?.length || 0}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${achievements?.length > 0 ? ((achievements?.filter(a => a?.isEarned)?.length / achievements?.length) * 100) : 0}%` 
            }}
          />
        </div>
        
        {/* Tier Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {['bronze', 'silver', 'gold']?.map(tier => {
            const tierAchievements = achievements?.filter(a => a?.tier?.toLowerCase() === tier) || [];
            const earnedTierAchievements = tierAchievements?.filter(a => a?.isEarned) || [];
            
            return (
              <div key={tier} className="bg-white rounded p-2">
                <div className={`w-4 h-4 mx-auto mb-1 rounded-full bg-gradient-to-br ${getTierColor(tier)}`}></div>
                <div className="font-medium text-gray-700 capitalize">{tier}</div>
                <div className="text-gray-500">
                  {earnedTierAchievements?.length}/{tierAchievements?.length}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Next Achievement */}
      {achievements?.some(a => !a?.isEarned) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h5 className="font-medium text-blue-900 text-sm">Next Achievement</h5>
              <p className="text-blue-700 text-xs">
                Complete more mechatronic lessons to unlock {achievements?.filter(a => !a?.isEarned)?.[0]?.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsBadges;