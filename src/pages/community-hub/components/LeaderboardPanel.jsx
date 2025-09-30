import React from 'react';
import { Trophy, Award, Star, TrendingUp, Medal } from 'lucide-react';

const LeaderboardPanel = () => {
  const topContributors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Mechanical Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
      points: 2840,
      contributions: 45,
      rank: 1,
      badge: 'Expert',
      specialty: 'Thermodynamics'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Software Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random',
      points: 2650,
      contributions: 38,
      rank: 2,
      badge: 'Mentor',
      specialty: 'AI/ML'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Civil Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=random',
      points: 2420,
      contributions: 34,
      rank: 3,
      badge: 'Helper',
      specialty: 'Structural Design'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Electrical Engineer',
      avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random',
      points: 2180,
      contributions: 29,
      rank: 4,
      badge: 'Contributor',
      specialty: 'Circuit Design'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      role: 'Chemical Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Wang&background=random',
      points: 1950,
      contributions: 25,
      rank: 5,
      badge: 'Active',
      specialty: 'Process Design'
    }
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-500">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Expert': 'bg-purple-100 text-purple-700',
      'Mentor': 'bg-blue-100 text-blue-700',
      'Helper': 'bg-green-100 text-green-700',
      'Contributor': 'bg-orange-100 text-orange-700',
      'Active': 'bg-red-100 text-red-700'
    };
    return colors?.[badge] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Top Contributors
        </h3>
        <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
          View Full Leaderboard
        </span>
      </div>
      <div className="space-y-4">
        {topContributors?.map((user) => (
          <div key={user?.id} className="flex items-center space-x-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex-shrink-0">
              {getRankIcon(user?.rank)}
            </div>
            
            <div className="flex-shrink-0">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {user?.name}
                </h4>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>{user?.points?.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-600 truncate">{user?.specialty}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(user?.badge)}`}>
                  {user?.badge}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{user?.contributions} contributions</p>
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all" 
                    style={{ width: `${Math.min((user?.points / 3000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* This Week's Rising Stars */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
          Rising Stars This Week
        </h4>
        <div className="space-y-2">
          {topContributors?.slice(0, 3)?.map((user) => (
            <div key={`rising-${user?.id}`} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-gray-900 font-medium">{user?.name?.split(' ')?.[0]}</span>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span className="text-xs">+{Math.floor(Math.random() * 200) + 50}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Achievement Categories */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Weekly Challenges</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-blue-600 font-semibold text-lg">12</div>
            <div className="text-blue-700 text-xs">Problems Solved</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-green-600 font-semibold text-lg">8</div>
            <div className="text-green-700 text-xs">Projects Shared</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-purple-600 font-semibold text-lg">25</div>
            <div className="text-purple-700 text-xs">Discussions</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-orange-600 font-semibold text-lg">6</div>
            <div className="text-orange-700 text-xs">New Members</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;