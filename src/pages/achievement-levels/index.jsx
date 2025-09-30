import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Crown, Medal, Target, TrendingUp, Users, Filter, Search, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { skillTreeService } from '../../services/skillTreeService';
import AchievementCard from './components/AchievementCard';
import LeaderboardPanel from './components/LeaderboardPanel';
import ProgressOverview from './components/ProgressOverview';

const TIER_CONFIG = {
  bronze: {
    bg: 'bg-gradient-to-r from-amber-100 to-amber-200',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: Medal,
    color: '#d97706',
    name: 'Bronze',
    description: 'Foundation achievements for starting your engineering journey'
  },
  silver: {
    bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
    border: 'border-gray-300',
    text: 'text-gray-800',
    icon: Award,
    color: '#6b7280',
    name: 'Silver',
    description: 'Intermediate achievements for developing core competencies'
  },
  gold: {
    bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: Trophy,
    color: '#ca8a04',
    name: 'Gold',
    description: 'Advanced achievements demonstrating specialized expertise'
  },
  platinum: {
    bg: 'bg-gradient-to-r from-purple-100 to-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-800',
    icon: Crown,
    color: '#7c3aed',
    name: 'Platinum',
    description: 'Elite achievements for engineering mastery and innovation'
  }
};

const CATEGORY_ICONS = {
  skill_mastery: Target,
  lesson_completion: Award,
  tier_achievement: Star,
  tree_completion: Trophy,
  streak: TrendingUp,
  collaboration: Users,
  innovation: Sparkles,
  certification: Shield,
  leadership: Crown
};

const AchievementLevels = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [masteryStats, setMasteryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tier: 'all',
    status: 'all',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('gallery'); // gallery, progress, leaderboard

  useEffect(() => {
    loadAchievementsData();
  }, [user]);

  const loadAchievementsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user achievements
      const { data: userAchievements, error: achievementsError } = await skillTreeService?.getUserSkillAchievements(user?.id);
      if (achievementsError) throw new Error(achievementsError);

      // Load all available achievements
      const { data: allAchievementsData, error: allError } = await skillTreeService?.getAchievementsByTier();
      if (allError) throw new Error(allError);

      // Load mastery statistics
      const { data: statsData, error: statsError } = await skillTreeService?.getUserMasteryStats(user?.id);
      if (statsError) throw new Error(statsError);

      setAchievements(userAchievements || []);
      setAllAchievements(allAchievementsData || []);
      setMasteryStats(statsData);
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
    // Tier filter
    const matchesTier = filters?.tier === 'all' || achievement?.tier === filters?.tier;
    
    // Status filter
    const isEarned = isAchievementEarned(achievement?.id);
    const matchesStatus = filters?.status === 'all' || 
      (filters?.status === 'earned' && isEarned) ||
      (filters?.status === 'available' && !isEarned);
    
    // Category filter
    const criteria = achievement?.unlock_criteria || {};
    const category = criteria?.type || 'general';
    const matchesCategory = filters?.category === 'all' || category === filters?.category;
    
    // Search filter
    const matchesSearch = !searchTerm || 
      achievement?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      achievement?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    return matchesTier && matchesStatus && matchesCategory && matchesSearch;
  }) || [];

  const groupedAchievements = filteredAchievements?.reduce((acc, achievement) => {
    const tier = achievement?.tier || 'bronze';
    if (!acc?.[tier]) acc[tier] = [];
    acc?.[tier]?.push(achievement);
    return acc;
  }, {});

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];

  // Calculate achievement statistics
  const achievementStats = {
    total: allAchievements?.length || 0,
    earned: achievements?.length || 0,
    byTier: tierOrder?.reduce((acc, tier) => {
      const tierAchievements = allAchievements?.filter(a => a?.tier === tier) || [];
      const earnedInTier = tierAchievements?.filter(a => isAchievementEarned(a?.id))?.length;
      acc[tier] = { total: tierAchievements?.length, earned: earnedInTier };
      return acc;
    }, {})
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievement levels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-semibold text-red-900">Error Loading Achievements</h3>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadAchievementsData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Achievement Levels</h1>
              <p className="text-gray-600 mt-1">
                Bronze, Silver, Gold, and Platinum tiers showcase comprehensive engineering mastery progression
              </p>
            </div>
            
            {/* View Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('gallery')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'gallery' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setView('progress')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'progress' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setView('leaderboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'leaderboard' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'gallery' && (
          <>
            {/* Achievement Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Achievements</p>
                    <p className="text-2xl font-bold text-gray-900">{achievementStats?.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              {tierOrder?.map(tier => {
                const tierConfig = TIER_CONFIG?.[tier];
                const tierStats = achievementStats?.byTier?.[tier] || { total: 0, earned: 0 };
                const TierIcon = tierConfig?.icon;

                return (
                  <div key={tier} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 capitalize">{tier}</p>
                        <p className={`text-2xl font-bold ${tierConfig?.text}`}>
                          {tierStats?.earned}/{tierStats?.total}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${tierConfig?.bg} rounded-lg flex items-center justify-center`}>
                        <TierIcon className={`w-6 h-6 ${tierConfig?.text}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="border-0 bg-transparent text-sm focus:ring-0 focus:outline-none min-w-[200px]"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filters?.tier}
                    onChange={(e) => setFilters(prev => ({ ...prev, tier: e?.target?.value }))}
                    className="border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                  >
                    <option value="all">All Tiers</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filters?.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e?.target?.value }))}
                    className="border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="earned">Earned</option>
                    <option value="available">Available</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filters?.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e?.target?.value }))}
                    className="border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="skill_mastery">Skill Mastery</option>
                    <option value="lesson_completion">Lesson Completion</option>
                    <option value="tier_achievement">Tier Achievement</option>
                    <option value="tree_completion">Tree Completion</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Achievement Gallery */}
            <div className="space-y-8">
              {tierOrder?.map(tier => {
                const tierAchievements = groupedAchievements?.[tier] || [];
                if (tierAchievements?.length === 0) return null;

                const tierConfig = TIER_CONFIG?.[tier];

                return (
                  <div key={tier} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${tierConfig?.bg} ${tierConfig?.border} border-2 rounded-lg flex items-center justify-center`}>
                        <tierConfig.icon className={`w-6 h-6 ${tierConfig?.text}`} />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold ${tierConfig?.text}`}>{tierConfig?.name} Tier</h2>
                        <p className="text-gray-600 text-sm">{tierConfig?.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tierAchievements?.map(achievement => (
                        <AchievementCard
                          key={achievement?.id}
                          achievement={achievement}
                          isEarned={isAchievementEarned(achievement?.id)}
                          progress={getAchievementProgress(achievement)}
                          earnedData={achievements?.find(a => a?.achievement_types?.id === achievement?.id)}
                          tierConfig={tierConfig}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAchievements?.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}

        {view === 'progress' && (
          <ProgressOverview
            achievements={achievements}
            allAchievements={allAchievements}
            masteryStats={masteryStats}
            achievementStats={achievementStats}
          />
        )}

        {view === 'leaderboard' && (
          <LeaderboardPanel
            userAchievements={achievements}
            masteryStats={masteryStats}
          />
        )}
      </div>
    </div>
  );
};

export default AchievementLevels;