import React, { useState } from 'react';
import { Trophy, Crown, Medal, Flame, Star, Users, ChevronRight } from 'lucide-react';

const LeaderboardWidget = ({ leaderboardData, currentUser }) => {
  const [activeTab, setActiveTab] = useState('xp');

  const tabs = [
    { id: 'xp', label: 'XP Leaders', icon: Star },
    { id: 'streak', label: 'Streak Masters', icon: Flame }
  ];

  const getRankIcon = (position) => {
    if (position === 1) return Crown;
    if (position === 2) return Trophy;
    if (position === 3) return Medal;
    return null;
  };

  const getRankColor = (position) => {
    if (position === 1) return 'text-yellow-500';
    if (position === 2) return 'text-gray-500';
    if (position === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getCurrentUserRank = (data, currentUser) => {
    if (!currentUser || !data?.length) return null;
    
    const userIndex = data?.findIndex(user => user?.id === currentUser?.id);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  const formatValue = (value, type) => {
    if (type === 'xp') {
      return value?.toLocaleString() || '0';
    }
    return value || 0;
  };

  const currentData = activeTab === 'xp' ? leaderboardData?.byXP : leaderboardData?.byStreak;
  const currentUserRank = getCurrentUserRank(currentData, currentUser);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header with Tabs */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
        </div>
        
        <div className="flex gap-1 border-b border-border">
          {tabs?.map((tab) => {
            const IconComponent = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab?.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Leaderboard Content */}
      <div className="p-6 pt-4">
        {currentData?.length > 0 ? (
          <div className="space-y-3">
            {currentData?.slice(0, 10)?.map((user, index) => {
              const position = index + 1;
              const RankIcon = getRankIcon(position);
              const isCurrentUser = currentUser && user?.id === currentUser?.id;
              
              return (
                <div
                  key={user?.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCurrentUser 
                      ? 'bg-primary/10 border border-primary/20' :'hover:bg-muted/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {RankIcon ? (
                      <RankIcon className={`w-5 h-5 ${getRankColor(position)}`} />
                    ) : (
                      <span className={`text-sm font-bold ${getRankColor(position)}`}>
                        {position}
                      </span>
                    )}
                  </div>
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.avatar_url ? (
                      <img 
                        src={user?.avatar_url} 
                        alt={user?.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'
                    )}
                  </div>
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${
                        isCurrentUser ? 'text-primary' : 'text-foreground'
                      }`}>
                        {user?.full_name || user?.username || 'Anonymous'}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{user?.username || 'user'}
                    </div>
                  </div>
                  {/* Value */}
                  <div className="text-right">
                    <div className="font-bold text-foreground">
                      {formatValue(
                        activeTab === 'xp' ? user?.total_xp : user?.streak_days,
                        activeTab
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activeTab === 'xp' ? 'XP' : 'days'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No leaderboard data available</p>
            <p className="text-sm text-muted-foreground">Start learning to see rankings!</p>
          </div>
        )}
      </div>
      {/* Current User Rank (if not in top 10) */}
      {currentUser && currentUserRank && currentUserRank > 10 && (
        <div className="px-6 pb-6 border-t border-border pt-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 flex items-center justify-center">
              <span className="text-sm font-bold text-muted-foreground">
                {currentUserRank}
              </span>
            </div>

            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {currentUser?.avatar_url ? (
                <img 
                  src={currentUser?.avatar_url} 
                  alt={currentUser?.username} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                currentUser?.full_name?.charAt(0) || currentUser?.username?.charAt(0) || 'U'
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary truncate">
                  {currentUser?.full_name || currentUser?.username || 'You'}
                </span>
                <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                  You
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Your current rank</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-foreground">
                {formatValue(
                  activeTab === 'xp' ? currentUser?.total_xp : currentUser?.streak_days,
                  activeTab
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {activeTab === 'xp' ? 'XP' : 'days'}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Full Leaderboard */}
      <div className="px-6 pb-6">
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:text-primary/80 transition-colors border border-border rounded-md hover:bg-muted/50">
          <span>View Full Leaderboard</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Quick Stats */}
      <div className="px-6 pb-6 border-t border-border pt-4">
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="font-bold text-foreground">
              {currentData?.length || 0}
            </div>
            <div className="text-muted-foreground">Active Learners</div>
          </div>
          <div>
            <div className="font-bold text-foreground">
              {currentUserRank || '—'}
            </div>
            <div className="text-muted-foreground">Your Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardWidget;