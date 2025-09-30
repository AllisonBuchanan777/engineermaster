import React, { useState, useEffect } from 'react';
import { Trophy, Award, Crown, Medal, Zap, CheckCircle, Lock, Calendar } from 'lucide-react';
import { skillTreeService } from '../../../services/skillTreeService';

const TIER_CONFIG = {
  bronze: {
    bg: 'bg-gradient-to-r from-amber-100 to-amber-200',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: Medal,
    color: '#d97706'
  },
  silver: {
    bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
    border: 'border-gray-300',
    text: 'text-gray-800',
    icon: Award,
    color: '#6b7280'
  },
  gold: {
    bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: Trophy,
    color: '#ca8a04'
  },
  platinum: {
    bg: 'bg-gradient-to-r from-purple-100 to-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-800',
    icon: Crown,
    color: '#7c3aed'
  }
};

const AchievementUnlocks = ({ achievements, masteryStats, onBack }) => {
  const [allAchievements, setAllAchievements] = useState([]);
  const [selectedTier, setSelectedTier] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllAchievements();
  }, []);

  const loadAllAchievements = async () => {
    setLoading(true);
    try {
      const { data, error } = await skillTreeService?.getAchievementsByTier();
      if (error) throw new Error(error);
      
      setAllAchievements(data || []);
    } catch (err) {
      setError(`Failed to load achievements: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievementId) => {
    return achievements?.some(a => a?.achievement_types?.id === achievementId);
  };

  const getAchievementProgress = (achievement) => {
    const criteria = achievement?.unlock_criteria || {};
    
    if (criteria?.type === 'lesson_completion') {
      const completedLessons = masteryStats?.mastered_nodes || 0;
      const required = criteria?.count || 1;
      return Math.min(100, (completedLessons / required) * 100);
    }
    
    if (criteria?.type === 'skill_mastery') {
      const disciplineStats = masteryStats?.by_discipline?.[criteria?.discipline];
      const mastered = disciplineStats?.mastered || 0;
      const required = criteria?.nodes_required || 1;
      return Math.min(100, (mastered / required) * 100);
    }
    
    if (criteria?.type === 'tier_achievement') {
      const tierMastery = masteryStats?.by_tier?.[criteria?.tier] || 0;
      const required = criteria?.count || 1;
      return Math.min(100, (tierMastery / required) * 100);
    }
    
    return 0;
  };

  const filteredAchievements = allAchievements?.filter(achievement => {
    if (selectedTier === 'all') return true;
    return achievement?.tier === selectedTier;
  });

  const groupedAchievements = filteredAchievements?.reduce((acc, achievement) => {
    const tier = achievement?.tier || 'bronze';
    if (!acc?.[tier]) acc[tier] = [];
    acc?.[tier]?.push(achievement);
    return acc;
  }, {});

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="font-semibold text-red-900">Error Loading Achievements</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={loadAllAchievements}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Achievement Levels</h2>
            <p className="text-gray-600 mt-1">Bronze, Silver, Gold, and Platinum tiers showcase your engineering mastery</p>
          </div>
          
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Skill Trees
            </button>
          )}
        </div>
      </div>
      {/* Achievement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tierOrder?.map(tier => {
          const tierConfig = TIER_CONFIG?.[tier];
          const tierAchievements = groupedAchievements?.[tier] || [];
          const earnedCount = tierAchievements?.filter(achievement => isAchievementEarned(achievement?.id))?.length;
          const TierIcon = tierConfig?.icon;

          return (
            <div key={tier} className={`${tierConfig?.bg} ${tierConfig?.border} border-2 p-6 rounded-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${tierConfig?.bg} rounded-lg flex items-center justify-center`}>
                  <TierIcon className={`w-6 h-6 ${tierConfig?.text}`} />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${tierConfig?.text}`}>{earnedCount}</div>
                  <div className={`text-sm ${tierConfig?.text} opacity-75`}>of {tierAchievements?.length}</div>
                </div>
              </div>
              <h3 className={`font-semibold ${tierConfig?.text} capitalize`}>{tier} Tier</h3>
              <div className="mt-2 w-full bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${tierAchievements?.length > 0 ? (earnedCount / tierAchievements?.length) * 100 : 0}%`,
                    backgroundColor: tierConfig?.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Tier Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by tier:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedTier === 'all' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {tierOrder?.map(tier => {
              const tierConfig = TIER_CONFIG?.[tier];
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize ${
                    selectedTier === tier
                      ? `${tierConfig?.bg} ${tierConfig?.text} ${tierConfig?.border} border`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Achievements Grid */}
      <div className="space-y-8">
        {tierOrder?.map(tier => {
          const tierAchievements = groupedAchievements?.[tier] || [];
          if (selectedTier !== 'all' && selectedTier !== tier) return null;
          if (tierAchievements?.length === 0) return null;

          const tierConfig = TIER_CONFIG?.[tier];
          const TierIcon = tierConfig?.icon;

          return (
            <div key={tier} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${tierConfig?.bg} ${tierConfig?.border} border rounded-lg flex items-center justify-center`}>
                  <TierIcon className={`w-5 h-5 ${tierConfig?.text}`} />
                </div>
                <h3 className={`text-xl font-bold ${tierConfig?.text} capitalize`}>{tier} Achievements</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tierAchievements?.map(achievement => {
                  const isEarned = isAchievementEarned(achievement?.id);
                  const progress = getAchievementProgress(achievement);
                  const earnedAchievement = achievements?.find(a => a?.achievement_types?.id === achievement?.id);

                  return (
                    <div
                      key={achievement?.id}
                      className={`relative bg-white p-6 rounded-lg shadow-sm border-2 transition-all ${
                        isEarned 
                          ? `${tierConfig?.border} ${tierConfig?.bg}` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Achievement Status */}
                      <div className="absolute top-4 right-4">
                        {isEarned ? (
                          <div className={`w-8 h-8 ${tierConfig?.bg} rounded-full flex items-center justify-center`}>
                            <CheckCircle className={`w-5 h-5 ${tierConfig?.text}`} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* Achievement Icon */}
                      <div className={`w-16 h-16 ${isEarned ? tierConfig?.bg : 'bg-gray-100'} rounded-lg flex items-center justify-center mb-4`}>
                        <Trophy className={`w-8 h-8 ${isEarned ? tierConfig?.text : 'text-gray-400'}`} />
                      </div>
                      {/* Achievement Info */}
                      <h4 className={`font-bold text-lg mb-2 ${isEarned ? tierConfig?.text : 'text-gray-900'}`}>
                        {achievement?.name}
                      </h4>
                      <p className={`text-sm mb-4 ${isEarned ? `${tierConfig?.text} opacity-80` : 'text-gray-600'}`}>
                        {achievement?.description}
                      </p>
                      {/* XP Reward */}
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className={`w-4 h-4 ${isEarned ? tierConfig?.text : 'text-indigo-600'}`} />
                        <span className={`text-sm font-medium ${isEarned ? tierConfig?.text : 'text-indigo-600'}`}>
                          {achievement?.xp_reward} XP
                        </span>
                      </div>
                      {/* Progress Bar */}
                      {!isEarned && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {/* Earned Date */}
                      {isEarned && earnedAchievement?.earned_at && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-current border-opacity-20">
                          <Calendar className={`w-4 h-4 ${tierConfig?.text}`} />
                          <span className={`text-sm ${tierConfig?.text}`}>
                            Earned {new Date(earnedAchievement.earned_at)?.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {Object.keys(groupedAchievements)?.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements available</h3>
          <p className="text-gray-600">Achievements will appear as you progress through your engineering journey</p>
        </div>
      )}
    </div>
  );
};

export default AchievementUnlocks;