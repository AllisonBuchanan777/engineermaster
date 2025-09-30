import React from 'react';
import { Trophy, Star, Award, Crown, Medal, Target, Calendar, Zap, CheckCircle, Clock } from 'lucide-react';

const TIER_CONFIG = {
  bronze: {
    bg: 'bg-gradient-to-r from-amber-100 to-amber-200',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: Medal,
    color: '#d97706',
    name: 'Bronze'
  },
  silver: {
    bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
    border: 'border-gray-300',
    text: 'text-gray-800',
    icon: Award,
    color: '#6b7280',
    name: 'Silver'
  },
  gold: {
    bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: Trophy,
    color: '#ca8a04',
    name: 'Gold'
  },
  platinum: {
    bg: 'bg-gradient-to-r from-purple-100 to-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-800',
    icon: Crown,
    color: '#7c3aed',
    name: 'Platinum'
  }
};

const ProgressOverview = ({ achievements, allAchievements, masteryStats, achievementStats }) => {
  const totalXP = achievements?.reduce((sum, achievement) => {
    return sum + (achievement?.achievement_types?.xp_reward || 0);
  }, 0) || 0;

  const recentAchievements = achievements
    ?.sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
    ?.slice(0, 5) || [];

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];

  // Calculate completion rate
  const completionRate = achievementStats?.total > 0 
    ? Math.round((achievementStats?.earned / achievementStats?.total) * 100)
    : 0;

  // Get next milestone
  const getNextMilestone = () => {
    if (completionRate < 25) return { target: 25, description: 'Achievement Explorer' };
    if (completionRate < 50) return { target: 50, description: 'Achievement Seeker' };
    if (completionRate < 75) return { target: 75, description: 'Achievement Hunter' };
    if (completionRate < 100) return { target: 100, description: 'Achievement Master' };
    return { target: 100, description: 'Achievement Completionist' };
  };

  const nextMilestone = getNextMilestone();

  return (
    <div className="space-y-8">
      {/* Overall Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-indigo-600">{achievementStats?.earned}</p>
              <p className="text-xs text-gray-500">of {achievementStats?.total} achievements</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              <p className="text-xs text-gray-500">All achievements</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total XP</p>
              <p className="text-2xl font-bold text-yellow-600">{totalXP?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">From achievements</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Milestone</p>
              <p className="text-2xl font-bold text-purple-600">{nextMilestone?.target}%</p>
              <p className="text-xs text-gray-500">{nextMilestone?.description}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Tier Progress */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Progress by Tier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tierOrder?.map(tier => {
            const tierConfig = TIER_CONFIG?.[tier];
            const tierStats = achievementStats?.byTier?.[tier] || { total: 0, earned: 0 };
            const tierProgress = tierStats?.total > 0 ? (tierStats?.earned / tierStats?.total) * 100 : 0;
            const TierIcon = tierConfig?.icon;

            return (
              <div key={tier} className={`${tierConfig?.bg} ${tierConfig?.border} border-2 p-6 rounded-lg`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center`}>
                    <TierIcon className={`w-6 h-6 ${tierConfig?.text}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${tierConfig?.text}`}>{tierConfig?.name}</h3>
                    <p className={`text-sm ${tierConfig?.text} opacity-75`}>
                      {tierStats?.earned} of {tierStats?.total}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${tierConfig?.text} opacity-75`}>Progress</span>
                    <span className={`font-medium ${tierConfig?.text}`}>{Math.round(tierProgress)}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${tierProgress}%`,
                        backgroundColor: tierConfig?.color
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
        {recentAchievements?.length > 0 ? (
          <div className="space-y-4">
            {recentAchievements?.map(achievement => {
              const achievementData = achievement?.achievement_types;
              const tierConfig = TIER_CONFIG?.[achievementData?.tier || 'bronze'];
              const TierIcon = tierConfig?.icon;

              return (
                <div
                  key={achievement?.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className={`w-12 h-12 ${tierConfig?.bg} ${tierConfig?.border} border rounded-lg flex items-center justify-center`}>
                    <TierIcon className={`w-6 h-6 ${tierConfig?.text}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{achievementData?.name}</h3>
                    <p className="text-sm text-gray-600">{achievementData?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-indigo-600 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">{achievementData?.xp_reward} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(achievement.earned_at)?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
            <p className="text-gray-600">Start completing lessons and mastering skills to earn your first achievements!</p>
          </div>
        )}
      </div>
      {/* Skill Mastery Progress */}
      {masteryStats && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Mastery Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{masteryStats?.total_nodes}</div>
              <div className="text-sm text-blue-600">Total Skills</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{masteryStats?.mastered_nodes}</div>
              <div className="text-sm text-green-600">Mastered</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">{masteryStats?.in_progress_nodes}</div>
              <div className="text-sm text-yellow-600">In Progress</div>
            </div>
          </div>

          {/* Discipline Breakdown */}
          {masteryStats?.by_discipline && Object.keys(masteryStats?.by_discipline)?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Progress by Discipline</h3>
              <div className="space-y-3">
                {Object.entries(masteryStats?.by_discipline)?.map(([discipline, stats]) => {
                  const progress = stats?.total > 0 ? (stats?.mastered / stats?.total) * 100 : 0;
                  
                  return (
                    <div key={discipline} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 capitalize">{discipline}</span>
                        <span className="text-gray-600">{stats?.mastered} of {stats?.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;