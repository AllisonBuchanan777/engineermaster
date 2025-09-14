import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const LeaderboardPanel = () => {
  const [activeTab, setActiveTab] = useState('global');

  const leaderboardData = {
    global: [
      {
        id: 1,
        rank: 1,
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        xp: 15420,
        level: 18,
        streak: 45,
        badge: 'Engineering Master'
      },
      {
        id: 2,
        rank: 2,
        name: 'Marcus Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        xp: 14890,
        level: 17,
        streak: 32,
        badge: 'Circuit Wizard'
      },
      {
        id: 3,
        rank: 3,
        name: 'Emily Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        xp: 14250,
        level: 17,
        streak: 28,
        badge: 'Mech Expert'
      },
      {
        id: 4,
        rank: 4,
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        xp: 13680,
        level: 16,
        streak: 7,
        badge: 'Rising Star',
        isCurrentUser: true
      },
      {
        id: 5,
        rank: 5,
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        xp: 13420,
        level: 16,
        streak: 15,
        badge: 'Aerospace Ace'
      }
    ],
    friends: [
      {
        id: 1,
        rank: 1,
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        xp: 13680,
        level: 16,
        streak: 7,
        badge: 'Rising Star',
        isCurrentUser: true
      },
      {
        id: 2,
        rank: 2,
        name: 'Jessica Park',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        xp: 12890,
        level: 15,
        streak: 12,
        badge: 'Study Buddy'
      },
      {
        id: 3,
        rank: 3,
        name: 'Ryan Thompson',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        xp: 11250,
        level: 14,
        streak: 5,
        badge: 'Team Player'
      }
    ]
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: 'Crown', color: 'var(--color-warning)' };
      case 2: return { icon: 'Medal', color: 'var(--color-muted-foreground)' };
      case 3: return { icon: 'Award', color: 'var(--color-warning)' };
      default: return { icon: 'Hash', color: 'var(--color-muted-foreground)' };
    }
  };

  const currentData = leaderboardData?.[activeTab];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Leaderboard</h2>
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 ${
              activeTab === 'global' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 ${
              activeTab === 'friends' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Friends
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {currentData?.map((user) => {
          const rankInfo = getRankIcon(user?.rank);
          
          return (
            <div
              key={user?.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-150 ${
                user?.isCurrentUser
                  ? 'bg-primary/10 border border-primary/20' :'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                {user?.rank <= 3 ? (
                  <Icon name={rankInfo?.icon} size={18} color={rankInfo?.color} />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">#{user?.rank}</span>
                )}
              </div>
              {/* Avatar */}
              <div className="relative">
                <Image
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {user?.isCurrentUser && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="User" size={10} color="white" />
                  </div>
                )}
              </div>
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`font-medium text-sm ${
                    user?.isCurrentUser ? 'text-primary' : 'text-foreground'
                  }`}>
                    {user?.name}
                  </p>
                  {user?.isCurrentUser && (
                    <span className="text-xs text-primary">(You)</span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span>Level {user?.level}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Flame" size={10} />
                    <span>{user?.streak}d</span>
                  </div>
                </div>
              </div>
              {/* XP */}
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {user?.xp?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* View More */}
      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-150">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderboardPanel;