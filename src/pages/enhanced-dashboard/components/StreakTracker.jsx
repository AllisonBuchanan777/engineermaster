import React, { useState } from 'react';
import { Flame, Snowflake } from 'lucide-react';

const StreakTracker = ({ streakData, userId }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!streakData) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 w-48">
        <div className="text-center">
          <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded mx-auto w-16"></div>
        </div>
      </div>
    );
  }

  const { currentStreak, streakFreezes, dailyActivity } = streakData;
  const isOnFire = currentStreak >= 7;
  const canUseFreeze = streakFreezes?.available > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 w-48 relative group">
      {/* Main Streak Display */}
      <div className="text-center">
        <div className="relative mb-3">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
            isOnFire 
              ? 'bg-gradient-to-br from-orange-400 to-red-500' :'bg-gradient-to-br from-blue-400 to-purple-500'
          }`}>
            <Flame className={`w-6 h-6 ${isOnFire ? 'text-white animate-pulse' : 'text-white'}`} />
          </div>
          {isOnFire && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs">🔥</span>
            </div>
          )}
        </div>

        <div className="mb-2">
          <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">day streak</div>
        </div>

        {/* Streak Status */}
        <div className={`text-xs px-2 py-1 rounded-full ${
          isOnFire 
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {isOnFire ? 'On Fire! 🔥' : 'Building Momentum'}
        </div>
      </div>
      {/* Streak Freeze Indicator */}
      {canUseFreeze && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Snowflake className="w-3 h-3 text-blue-600" />
          </div>
        </div>
      )}
      {/* Hover Details */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="space-y-3">
          {/* Streak Info */}
          <div>
            <div className="text-sm font-medium text-foreground mb-1">Streak Details</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Current Streak:</span>
                <span className="font-medium">{currentStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span>Longest Streak:</span>
                <span className="font-medium">{streakData?.longestStreak || currentStreak} days</span>
              </div>
            </div>
          </div>

          {/* Streak Freezes */}
          <div>
            <div className="text-sm font-medium text-foreground mb-1">Streak Freezes</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-medium">{streakFreezes?.available || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Used:</span>
                <span className="font-medium">{streakFreezes?.used || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="text-sm font-medium text-foreground mb-2">Last 7 Days</div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date?.setDate(date?.getDate() - (6 - i));
                const dateStr = date?.toISOString()?.split('T')?.[0];
                const activity = dailyActivity?.find(a => a?.date === dateStr);
                
                return (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                      activity?.hasActivity
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :'bg-muted text-muted-foreground'
                    }`}
                    title={`${dateStr}: ${activity?.xp || 0} XP`}
                  >
                    {activity?.hasActivity ? '✓' : '·'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="border-t border-border pt-2">
            <div className="text-xs text-center text-muted-foreground">
              {currentStreak === 0 ? "Start your streak today! 💪" :
               currentStreak < 3 ? "Keep it going! 🎯" :
               currentStreak < 7 ? "You're building momentum! 🚀" :
               currentStreak < 30 ? "Amazing consistency! 🌟": "You're a learning legend! 👑"}
            </div>
          </div>
        </div>
      </div>
      {/* Streak Milestones */}
      {currentStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-center">
            <div className="flex gap-1">
              {[3, 7, 14, 30, 100]?.map((milestone) => (
                <div
                  key={milestone}
                  className={`w-2 h-2 rounded-full ${
                    currentStreak >= milestone
                      ? 'bg-yellow-400' :'bg-muted'
                  }`}
                  title={`${milestone} day milestone ${currentStreak >= milestone ? 'achieved' : 'upcoming'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakTracker;