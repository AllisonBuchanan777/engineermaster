import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressOverview = () => {
  const userProgress = {
    xp: 2450,
    level: 12,
    streak: 7,
    nextLevelXP: 3000,
    totalXP: 15750
  };

  const progressPercentage = ((userProgress?.xp / userProgress?.nextLevelXP) * 100)?.toFixed(1);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Your Progress</h2>
        <div className="flex items-center space-x-2 px-3 py-1 bg-accent/10 rounded-full">
          <Icon name="Trophy" size={16} color="var(--color-accent)" />
          <span className="text-sm font-medium text-accent">Level {userProgress?.level}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* XP Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Experience Points</span>
            <span className="text-sm font-medium text-foreground">{userProgress?.xp?.toLocaleString()} XP</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {(userProgress?.nextLevelXP - userProgress?.xp)?.toLocaleString()} XP to Level {userProgress?.level + 1}
          </p>
        </div>

        {/* Streak Counter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <div className="flex items-center space-x-1">
              <Icon name="Flame" size={16} color="var(--color-warning)" />
              <span className="text-sm font-medium text-foreground">{userProgress?.streak} days</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {[...Array(7)]?.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full ${
                  index < userProgress?.streak ? 'bg-warning' : 'bg-muted'
                }`}
              ></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Keep it up! 3 more days for a badge</p>
        </div>

        {/* Total Learning Time */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total XP Earned</span>
            <div className="flex items-center space-x-1">
              <Icon name="Zap" size={16} color="var(--color-accent)" />
              <span className="text-sm font-medium text-foreground">{userProgress?.totalXP?.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full w-3/4"></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Top 15% of all learners</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;