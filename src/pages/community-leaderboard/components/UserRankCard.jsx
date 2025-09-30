import React from 'react';
import { Trophy, Zap, Medal } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const UserRankCard = ({ userProfile, userRankings, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)]?.map((_, i) => (
          <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const getRankDisplay = (rank) => {
    if (!rank) return 'Unranked';
    if (rank === 1) return '🥇 1st';
    if (rank === 2) return '🥈 2nd';
    if (rank === 3) return '🥉 3rd';
    if (rank <= 10) return `🏆 #${rank}`;
    if (rank <= 100) return `#${rank}`;
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (!rank) return 'text-gray-500';
    if (rank <= 3) return 'text-yellow-600';
    if (rank <= 10) return 'text-blue-600';
    if (rank <= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  const cards = [
    {
      title: 'Overall Rank',
      value: getRankDisplay(userRankings?.overall),
      subtitle: `${userProfile?.total_xp?.toLocaleString() || 0} XP`,
      icon: Trophy,
      color: 'bg-blue-500',
      textColor: getRankColor(userRankings?.overall)
    },
    {
      title: 'Streak Rank',
      value: getRankDisplay(userRankings?.streak),
      subtitle: `${userProfile?.streak_days || 0} day streak`,
      icon: Zap,
      color: 'bg-green-500',
      textColor: getRankColor(userRankings?.streak)
    },
    {
      title: 'Completion Rank',
      value: getRankDisplay(userRankings?.completion),
      subtitle: 'Courses completed',
      icon: Medal,
      color: 'bg-purple-500',
      textColor: getRankColor(userRankings?.completion)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards?.map((card, index) => {
        const Icon = card?.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card?.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card?.title}</p>
                <p className={`text-lg font-bold ${card?.textColor}`}>
                  {card?.value}
                </p>
                <p className="text-xs text-gray-500">{card?.subtitle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserRankCard;