import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, Zap, Users, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leaderboardService } from '../../services/leaderboardService';

// Components
import LeaderboardCard from './components/LeaderboardCard';
import RankingFilters from './components/RankingFilters';
import UserRankCard from './components/UserRankCard';
import TopPerformersPanel from './components/TopPerformersPanel';
import Icon from '../../components/AppIcon';


const CommunityLeaderboard = () => {
  const { user, userProfile } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState('overall');
  const [timeframe, setTimeframe] = useState('all_time');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Leaderboard data
  const [leaderboards, setLeaderboards] = useState({
    overall: [],
    streaks: [],
    completions: [],
    achievements: [],
    discipline: []
  });
  
  const [userRankings, setUserRankings] = useState({
    overall: null,
    streak: null,
    completion: null
  });
  
  const [recentPerformers, setRecentPerformers] = useState([]);

  useEffect(() => {
    loadLeaderboardData();
  }, [activeCategory, timeframe, selectedDiscipline]);

  useEffect(() => {
    if (user?.id) {
      loadUserRankings();
    }
  }, [user?.id]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data = [];
      
      switch (activeCategory) {
        case 'overall':
          data = await leaderboardService?.getOverallLeaderboard(timeframe, 50);
          break;
        case 'streaks':
          data = await leaderboardService?.getStreakLeaderboard(50);
          break;
        case 'completions':
          data = await leaderboardService?.getCourseCompletionLeaderboard(50);
          break;
        case 'achievements':
          data = await leaderboardService?.getAchievementsLeaderboard(50);
          break;
        case 'discipline':
          if (selectedDiscipline !== 'all') {
            data = await leaderboardService?.getDisciplineLeaderboard(selectedDiscipline, 50);
          } else {
            data = await leaderboardService?.getOverallLeaderboard(timeframe, 50);
          }
          break;
        default:
          data = await leaderboardService?.getOverallLeaderboard(timeframe, 50);
      }

      setLeaderboards(prev => ({
        ...prev,
        [activeCategory]: data
      }));

      // Load recent performers for sidebar
      if (activeCategory === 'overall') {
        const performers = await leaderboardService?.getRecentTopPerformers(7, 20);
        setRecentPerformers(performers);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRankings = async () => {
    try {
      const rankings = await leaderboardService?.getUserRankings(user?.id);
      setUserRankings(rankings);
    } catch (err) {
      console.error('Error loading user rankings:', err);
    }
  };

  const getCurrentLeaderboard = () => {
    return leaderboards?.[activeCategory] || [];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      overall: Trophy,
      streaks: Zap,
      completions: Medal,
      achievements: Award,
      discipline: Star
    };
    return icons?.[category] || Trophy;
  };

  const getCategoryTitle = () => {
    const titles = {
      overall: 'Overall Rankings',
      streaks: 'Learning Streaks',
      completions: 'Course Completions',
      achievements: 'Achievement Points',
      discipline: selectedDiscipline === 'all' ? 'Overall Rankings' : `${selectedDiscipline?.charAt(0)?.toUpperCase() + selectedDiscipline?.slice(1)} Engineers`
    };
    return titles?.[activeCategory] || 'Overall Rankings';
  };

  const getMetricLabel = () => {
    const labels = {
      overall: 'Total XP',
      streaks: 'Streak Days',
      completions: 'Courses Completed',
      achievements: 'Achievement Score',
      discipline: 'Total XP'
    };
    return labels?.[activeCategory] || 'Points';
  };

  const getMetricValue = (user) => {
    switch (activeCategory) {
      case 'overall': case'discipline':
        return user?.total_xp?.toLocaleString() || '0';
      case 'streaks':
        return `${user?.streak_days || 0} days`;
      case 'completions':
        return `${user?.completedCourses || 0} courses`;
      case 'achievements':
        return `${user?.achievementScore || 0} pts`;
      default:
        return user?.total_xp?.toLocaleString() || '0';
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const categories = [
    { id: 'overall', name: 'Overall', icon: Trophy },
    { id: 'streaks', name: 'Streaks', icon: Zap },
    { id: 'completions', name: 'Completions', icon: Medal },
    { id: 'achievements', name: 'Achievements', icon: Award },
    { id: 'discipline', name: 'By Discipline', icon: Star }
  ];

  if (loading && getCurrentLeaderboard()?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                {[...Array(10)]?.map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded-lg mb-3"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Leaderboard</h1>
              <p className="text-gray-600">See how you rank against other engineers</p>
            </div>
          </div>

          {/* User Ranking Cards */}
          {user && userProfile && (
            <UserRankCard 
              userProfile={userProfile}
              userRankings={userRankings}
              loading={!userRankings?.overall}
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="flex flex-wrap border-b border-gray-200">
                {categories?.map((category) => {
                  const Icon = category?.icon;
                  return (
                    <button
                      key={category?.id}
                      onClick={() => setActiveCategory(category?.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activeCategory === category?.id
                          ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' :'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category?.name}
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="p-4">
                <RankingFilters
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  selectedDiscipline={selectedDiscipline}
                  setSelectedDiscipline={setSelectedDiscipline}
                  activeCategory={activeCategory}
                />
              </div>
            </div>

            {/* Leaderboard Header */}
            <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {React.createElement(getCategoryIcon(activeCategory), {
                    className: "w-6 h-6 text-blue-600"
                  })}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{getCategoryTitle()}</h2>
                    <p className="text-sm text-gray-600">
                      Ranked by {getMetricLabel()?.toLowerCase()}
                      {timeframe !== 'all_time' && ` • ${timeframe?.replace('_', ' ')}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {getCurrentLeaderboard()?.length} participants
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2">
              {getCurrentLeaderboard()?.map((user, index) => (
                <LeaderboardCard
                  key={user?.id}
                  user={user}
                  rank={user?.rank || index + 1}
                  metric={getMetricValue(user)}
                  metricLabel={getMetricLabel()}
                  rankIcon={getRankIcon(user?.rank || index + 1)}
                  isCurrentUser={user?.id === userProfile?.id}
                  category={activeCategory}
                />
              ))}
            </div>

            {getCurrentLeaderboard()?.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <Users className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-600">
                  No rankings found for the selected filters. Try adjusting your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Top Performers */}
            <TopPerformersPanel 
              performers={recentPerformers}
              loading={loading && recentPerformers?.length === 0}
            />

            {/* Leaderboard Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Learners</span>
                  <span className="font-semibold text-gray-900">12,485</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active This Week</span>
                  <span className="font-semibold text-gray-900">3,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Courses Completed</span>
                  <span className="font-semibold text-gray-900">89,241</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total XP Earned</span>
                  <span className="font-semibold text-gray-900">5.2M</span>
                </div>
              </div>
            </div>

            {/* Weekly Challenge */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm text-white p-6">
              <h3 className="text-lg font-semibold mb-2">Weekly Challenge</h3>
              <p className="text-blue-100 text-sm mb-4">
                Complete 5 lessons this week to earn bonus XP and climb the rankings!
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Join Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderboard;