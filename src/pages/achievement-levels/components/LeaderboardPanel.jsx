import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, Star, Users, TrendingUp, Zap, Target } from 'lucide-react';

// Mock leaderboard data - in a real app, this would come from an API
const MOCK_LEADERBOARD = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: null,
    totalXP: 2850,
    achievementsCount: 24,
    bronzeCount: 12,
    silverCount: 8,
    goldCount: 3,
    platinumCount: 1,
    masteredSkills: 18,
    currentLevel: 7,
    rank: 1
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    avatar: null,
    totalXP: 2640,
    achievementsCount: 21,
    bronzeCount: 10,
    silverCount: 7,
    goldCount: 3,
    platinumCount: 1,
    masteredSkills: 15,
    currentLevel: 6,
    rank: 2
  },
  {
    id: 3,
    name: 'Emily Watson',
    avatar: null,
    totalXP: 2420,
    achievementsCount: 19,
    bronzeCount: 11,
    silverCount: 6,
    goldCount: 2,
    platinumCount: 0,
    masteredSkills: 14,
    currentLevel: 6,
    rank: 3
  },
  {
    id: 4,
    name: 'You',
    avatar: null,
    totalXP: 1850,
    achievementsCount: 12,
    bronzeCount: 8,
    silverCount: 3,
    goldCount: 1,
    platinumCount: 0,
    masteredSkills: 8,
    currentLevel: 4,
    rank: 4,
    isCurrentUser: true
  },
  {
    id: 5,
    name: 'David Kim',
    avatar: null,
    totalXP: 1720,
    achievementsCount: 15,
    bronzeCount: 9,
    silverCount: 5,
    goldCount: 1,
    platinumCount: 0,
    masteredSkills: 11,
    currentLevel: 4,
    rank: 5
  }
];

const RANK_COLORS = {
  1: 'text-yellow-600 bg-yellow-50',
  2: 'text-gray-600 bg-gray-50',
  3: 'text-amber-600 bg-amber-50'
};

const TIER_ICONS = {
  bronze: Medal,
  silver: Award,
  gold: Trophy,
  platinum: Crown
};

const LeaderboardPanel = ({ userAchievements, masteryStats }) => {
  const [timeframe, setTimeframe] = useState('all'); // all, month, week
  const [category, setCategory] = useState('xp'); // xp, achievements, skills

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-600" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-600" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getAvatarFallback = (name) => {
    return name?.split(' ')?.map(n => n?.[0])?.join('')?.toUpperCase() || '?';
  };

  // Calculate user's actual stats
  const userTotalXP = userAchievements?.reduce((sum, achievement) => {
    return sum + (achievement?.achievement_types?.xp_reward || 0);
  }, 0) || 0;

  const userStats = {
    totalXP: userTotalXP,
    achievementsCount: userAchievements?.length || 0,
    masteredSkills: masteryStats?.mastered_nodes || 0,
    totalSkills: masteryStats?.total_nodes || 0
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
            <p className="text-gray-600">See how you rank among top achievers</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timeframe Filter */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e?.target?.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
            
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e?.target?.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="xp">Total XP</option>
              <option value="achievements">Achievements</option>
              <option value="skills">Mastered Skills</option>
            </select>
          </div>
        </div>

        {/* Current User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{userStats?.totalXP?.toLocaleString()}</div>
            <div className="text-sm text-indigo-600">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{userStats?.achievementsCount}</div>
            <div className="text-sm text-indigo-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{userStats?.masteredSkills}</div>
            <div className="text-sm text-indigo-600">Skills Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {userStats?.totalSkills > 0 ? Math.round((userStats?.masteredSkills / userStats?.totalSkills) * 100) : 0}%
            </div>
            <div className="text-sm text-indigo-600">Completion</div>
          </div>
        </div>
      </div>
      {/* Leaderboard List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900">Top Achievers</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {MOCK_LEADERBOARD?.map(user => (
            <div
              key={user?.id}
              className={`p-6 transition-colors ${
                user?.isCurrentUser ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    RANK_COLORS?.[user?.rank] || 'text-gray-500 bg-gray-100'
                  }`}>
                    {getRankIcon(user?.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {getAvatarFallback(user?.name)}
                    </span>
                  </div>
                  
                  {/* Name and Stats */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {user?.name}
                        {user?.isCurrentUser && (
                          <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Target className="w-4 h-4" />
                        <span>Level {user?.currentLevel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>{user?.totalXP?.toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-indigo-500" />
                        <span>{user?.achievementsCount} achievements</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Achievement Breakdown */}
                <div className="flex items-center gap-3">
                  {/* Tier Counts */}
                  <div className="flex items-center gap-2 text-sm">
                    {user?.platinumCount > 0 && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Crown className="w-4 h-4" />
                        <span>{user?.platinumCount}</span>
                      </div>
                    )}
                    {user?.goldCount > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Trophy className="w-4 h-4" />
                        <span>{user?.goldCount}</span>
                      </div>
                    )}
                    {user?.silverCount > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{user?.silverCount}</span>
                      </div>
                    )}
                    {user?.bronzeCount > 0 && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Medal className="w-4 h-4" />
                        <span>{user?.bronzeCount}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Skills Mastered */}
                  <div className="text-right text-sm text-gray-600">
                    <div className="font-medium">{user?.masteredSkills} skills</div>
                    <div className="text-xs">mastered</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Achievement Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Top Performer</h3>
              <p className="text-sm text-gray-600">This month's leader</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">Sarah Chen</div>
            <div className="text-sm text-gray-600">2,850 XP • 24 achievements</div>
            <div className="text-xs text-yellow-600">+340 XP this month</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Rising Star</h3>
              <p className="text-sm text-gray-600">Fastest climber</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">Emily Watson</div>
            <div className="text-sm text-gray-600">+5 ranks this month</div>
            <div className="text-xs text-green-600">↑ 450 XP gained</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Your Goal</h3>
              <p className="text-sm text-gray-600">Next milestone</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">Reach Top 3</div>
            <div className="text-sm text-gray-600">570 XP needed</div>
            <div className="text-xs text-purple-600">~2-3 achievements</div>
          </div>
        </div>
      </div>
      {/* Leaderboard Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Leaderboard Updates</h4>
            <p className="text-sm text-blue-700">
              Rankings are updated in real-time based on XP earned from achievements and skill mastery. 
              Complete more lessons and earn achievements to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;