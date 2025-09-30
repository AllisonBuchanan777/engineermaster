import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  Medal, 
  Crown,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const AchievementNotifications = ({ achievements, recentXP }) => {
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  useEffect(() => {
    if (achievements?.length > 0) {
      // Get achievements from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);
      
      const recent = achievements?.filter(achievement => {
        const earnedDate = new Date(achievement.earned_at);
        return earnedDate >= sevenDaysAgo;
      })?.slice(0, 5); // Show max 5 recent achievements
      
      setRecentAchievements(recent);
    }
  }, [achievements]);

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'bronze': return Medal;
      case 'silver': return Award;
      case 'gold': return Star;
      case 'platinum': return Trophy;
      case 'diamond': return Crown;
      default: return Trophy;
    }
  };

  const getTierColors = (tier) => {
    switch (tier) {
      case 'bronze':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600 dark:text-amber-400',
          gradient: 'from-amber-400 to-amber-600'
        };
      case 'silver':
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          gradient: 'from-gray-400 to-gray-600'
        };
      case 'gold':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          gradient: 'from-yellow-400 to-yellow-600'
        };
      case 'platinum':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600 dark:text-purple-400',
          gradient: 'from-purple-400 to-purple-600'
        };
      case 'diamond':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          gradient: 'from-blue-400 to-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          gradient: 'from-gray-400 to-gray-600'
        };
    }
  };

  const dismissNotification = (achievementId) => {
    setDismissedNotifications(prev => new Set([...prev, achievementId]));
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Filter out dismissed notifications
  const visibleAchievements = recentAchievements?.filter(
    achievement => !dismissedNotifications?.has(achievement?.id)
  );

  if (visibleAchievements?.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-foreground">Recent Achievements</h3>
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <p className="text-muted-foreground mb-1">No recent achievements</p>
          <p className="text-sm text-muted-foreground">
            Complete lessons and challenges to earn badges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-foreground">Recent Achievements</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {visibleAchievements?.length} new
          </div>
        </div>
      </div>
      <div className="space-y-1 pb-6">
        {visibleAchievements?.map((achievement) => {
          const achievementType = achievement?.achievement_types;
          const colors = getTierColors(achievementType?.tier);
          const TierIcon = getTierIcon(achievementType?.tier);
          
          return (
            <div
              key={achievement?.id}
              className={`mx-6 ${colors?.bg} ${colors?.border} border rounded-lg p-4 group hover:shadow-md transition-all duration-200 relative`}
            >
              {/* Dismiss button */}
              <button
                onClick={() => dismissNotification(achievement?.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
              <div className="flex items-start gap-3">
                {/* Achievement Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${colors?.gradient} rounded-lg flex items-center justify-center relative`}>
                  <TierIcon className="w-6 h-6 text-white" />
                  
                  {/* Sparkle animation for new achievements */}
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                </div>

                {/* Achievement Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {achievementType?.name || 'Achievement Unlocked'}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {achievementType?.description || 'Great job on your learning progress!'}
                      </p>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                  </div>

                  {/* Achievement Details */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs">
                      {/* Tier Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors?.bg} ${colors?.icon}`}>
                        {achievementType?.tier || 'bronze'}
                      </span>
                      
                      {/* XP Reward */}
                      {achievementType?.xp_reward > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-muted-foreground">
                            +{achievementType?.xp_reward} XP
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Time ago */}
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(achievement?.earned_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* View All Achievements */}
      <div className="px-6 pb-6">
        <button className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors border border-border rounded-md hover:bg-muted/50">
          View All Achievements
        </button>
      </div>
    </div>
  );
};

export default AchievementNotifications;