import React, { useState } from 'react';
import { Trophy, Star, Award, Medal, Share2, Download, Filter, Search } from 'lucide-react';

const AchievementShowcaseTab = ({ achievements, profile, showNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const tierColors = {
    bronze: 'from-amber-600 to-yellow-600',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
    diamond: 'from-cyan-400 to-blue-600'
  };

  const tierIcons = {
    bronze: Medal,
    silver: Award,
    gold: Trophy,
    platinum: Star,
    diamond: Star
  };

  // Filter achievements
  const filteredAchievements = achievements?.filter(achievement => {
    const matchesSearch = achievement?.achievement_types?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         achievement?.achievement_types?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesTier = filterTier === 'all' || achievement?.achievement_types?.tier === filterTier;
    const matchesCategory = filterCategory === 'all' || achievement?.achievement_types?.category === filterCategory;
    
    return matchesSearch && matchesTier && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = [...new Set(achievements?.map(a => a.achievement_types?.category).filter(Boolean))] || [];
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  const shareAchievement = async (achievement) => {
    const shareData = {
      title: `I earned the "${achievement?.achievement_types?.name}" achievement!`,
      text: `Check out my latest achievement in EngineerMaster: ${achievement?.achievement_types?.description}`,
      url: window.location?.origin
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard?.writeText(`${shareData?.title} ${shareData?.text} ${shareData?.url}`);
        showNotification('Achievement link copied to clipboard', 'success');
      }
    } catch (error) {
      console.error('Failed to share achievement:', error);
      showNotification('Failed to share achievement', 'error');
    }
  };

  const exportAchievements = () => {
    const achievementData = {
      exported_at: new Date()?.toISOString(),
      user_profile: {
        name: profile?.full_name,
        level: profile?.current_level,
        total_xp: profile?.total_xp
      },
      achievements: achievements?.map(achievement => ({
        name: achievement?.achievement_types?.name,
        description: achievement?.achievement_types?.description,
        tier: achievement?.achievement_types?.tier,
        category: achievement?.achievement_types?.category,
        earned_at: achievement?.earned_at,
        xp_reward: achievement?.achievement_types?.xp_reward
      }))
    };

    const blob = new Blob([JSON.stringify(achievementData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engineermaster-achievements-${Date.now()}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Achievements exported successfully', 'success');
  };

  const getAchievementStats = () => {
    const stats = {
      total: achievements?.length || 0,
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
      totalXP: 0
    };

    achievements?.forEach(achievement => {
      const tier = achievement?.achievement_types?.tier;
      if (tier && stats?.hasOwnProperty(tier)) {
        stats[tier]++;
      }
      stats.totalXP += achievement?.achievement_types?.xp_reward || 0;
    });

    return stats;
  };

  const stats = getAchievementStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Achievement Showcase</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportAchievements}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats?.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        {tiers?.map(tier => {
          const TierIcon = tierIcons?.[tier];
          return (
            <div key={tier} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${tierColors?.[tier]} flex items-center justify-center`}>
                  <TierIcon className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{stats?.[tier]}</div>
              <div className="text-xs text-gray-600 capitalize">{tier}</div>
            </div>
          );
        })}
      </div>
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e?.target?.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Tiers</option>
          {tiers?.map(tier => (
            <option key={tier} value={tier}>{tier?.charAt(0)?.toUpperCase() + tier?.slice(1)}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e?.target?.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories?.map(category => (
            <option key={category} value={category}>{category?.charAt(0)?.toUpperCase() + category?.slice(1)}</option>
          ))}
        </select>

        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} transition-colors`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} transition-colors`}
          >
            List
          </button>
        </div>
      </div>
      {/* Achievement Display */}
      {filteredAchievements?.length > 0 ? (
        <div className={`
          ${viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' :'space-y-4'}
        `}>
          {filteredAchievements?.map((achievement) => {
            const tier = achievement?.achievement_types?.tier || 'bronze';
            const TierIcon = tierIcons?.[tier];
            const earnedDate = new Date(achievement.earned_at)?.toLocaleDateString();

            return (
              <div
                key={achievement?.id}
                className={`
                  bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all
                  ${viewMode === 'list' ? 'flex items-center space-x-6' : 'text-center'}
                `}
              >
                <div className={`
                  ${viewMode === 'grid' ? 'mb-4' : ''}
                  flex items-center justify-center
                `}>
                  <div className={`
                    w-16 h-16 rounded-full bg-gradient-to-r ${tierColors?.[tier]} 
                    flex items-center justify-center shadow-lg
                  `}>
                    <TierIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {achievement?.achievement_types?.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {achievement?.achievement_types?.description}
                  </p>
                  
                  <div className={`
                    flex items-center space-x-4 text-xs text-gray-500
                    ${viewMode === 'grid' ? 'justify-center' : ''}
                  `}>
                    <span className={`
                      px-2 py-1 rounded-full text-white bg-gradient-to-r ${tierColors?.[tier]}
                    `}>
                      {tier?.charAt(0)?.toUpperCase() + tier?.slice(1)}
                    </span>
                    <span>{achievement?.achievement_types?.xp_reward || 0} XP</span>
                    <span>Earned {earnedDate}</span>
                  </div>
                </div>
                <div className={`
                  ${viewMode === 'grid' ? 'mt-4' : 'ml-4'}
                  flex items-center space-x-2
                `}>
                  <button
                    onClick={() => shareAchievement(achievement)}
                    className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Share achievement"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterTier !== 'all' || filterCategory !== 'all' ?'No achievements match your filters' :'No achievements earned yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterTier !== 'all' || filterCategory !== 'all' ?'Try adjusting your search or filters' :'Complete lessons and challenges to earn your first achievements!'}
          </p>
        </div>
      )}
      {/* Achievement Progress Summary */}
      {achievements?.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Achievements:</span>
              <span className="ml-2 text-gray-600">{stats?.total}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Achievement XP:</span>
              <span className="ml-2 text-gray-600">{stats?.totalXP} XP</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Highest Tier:</span>
              <span className="ml-2 text-gray-600">
                {stats?.diamond > 0 ? 'Diamond' : 
                 stats?.platinum > 0 ? 'Platinum' : 
                 stats?.gold > 0 ? 'Gold' : 
                 stats?.silver > 0 ? 'Silver' : 'Bronze'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementShowcaseTab;