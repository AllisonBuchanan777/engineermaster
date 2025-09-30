import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Star, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const WeeklyProgressSummary = ({ userId, recentXP, streakData }) => {
  const [weekData, setWeekData] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  useEffect(() => {
    if (recentXP?.length > 0) {
      calculateWeekData();
    }
  }, [recentXP, currentWeekOffset]);

  const calculateWeekData = () => {
    // Calculate the start of the current week (or offset week)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek?.setDate(now?.getDate() - now?.getDay() - (currentWeekOffset * 7));
    startOfWeek?.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek?.setDate(startOfWeek?.getDate() + 6);
    endOfWeek?.setHours(23, 59, 59, 999);

    // Filter XP transactions for this week
    const weekXP = recentXP?.filter(xp => {
      const xpDate = new Date(xp.created_at);
      return xpDate >= startOfWeek && xpDate <= endOfWeek;
    });

    // Group by day
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date?.setDate(startOfWeek?.getDate() + i);
      const dateStr = date?.toISOString()?.split('T')?.[0];
      
      const dayXP = weekXP?.filter(xp => 
        xp?.created_at?.split('T')?.[0] === dateStr
      );

      return {
        date: dateStr,
        dayName: date?.toLocaleDateString('en', { weekday: 'short' }),
        xp: dayXP?.reduce((sum, xp) => sum + (xp?.amount || 0), 0),
        activities: dayXP?.length,
        hasActivity: dayXP?.length > 0
      };
    });

    // Calculate week statistics
    const totalXP = dailyData?.reduce((sum, day) => sum + day?.xp, 0);
    const totalActivities = dailyData?.reduce((sum, day) => sum + day?.activities, 0);
    const activeDays = dailyData?.filter(day => day?.hasActivity)?.length;
    const averageXPPerDay = totalXP / 7;
    
    // Calculate previous week for comparison
    const previousWeekStart = new Date(startOfWeek);
    previousWeekStart?.setDate(startOfWeek?.getDate() - 7);
    const previousWeekEnd = new Date(endOfWeek);
    previousWeekEnd?.setDate(endOfWeek?.getDate() - 7);
    
    const previousWeekXP = recentXP?.filter(xp => {
      const xpDate = new Date(xp.created_at);
      return xpDate >= previousWeekStart && xpDate <= previousWeekEnd;
    });
    
    const previousWeekTotal = previousWeekXP?.reduce((sum, xp) => sum + (xp?.amount || 0), 0);
    const weekGrowth = previousWeekTotal > 0 
      ? ((totalXP - previousWeekTotal) / previousWeekTotal) * 100 
      : totalXP > 0 ? 100 : 0;

    setWeekData({
      startDate: startOfWeek,
      endDate: endOfWeek,
      dailyData,
      totalXP,
      totalActivities,
      activeDays,
      averageXPPerDay,
      weekGrowth,
      isCurrentWeek: currentWeekOffset === 0
    });
  };

  const navigateWeek = (direction) => {
    setCurrentWeekOffset(prev => prev + direction);
  };

  const getWeekDateRange = (startDate, endDate) => {
    const start = startDate?.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const end = endDate?.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const getMaxXP = () => {
    if (!weekData?.dailyData) return 100;
    const max = Math.max(...weekData?.dailyData?.map(day => day?.xp));
    return Math.max(max, 100); // Minimum scale of 100
  };

  if (!weekData) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const maxXP = getMaxXP();

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weekly Progress</h3>
          <p className="text-sm text-muted-foreground">
            {getWeekDateRange(weekData?.startDate, weekData?.endDate)}
            {weekData?.isCurrentWeek && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Current Week
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(1)}
            className="w-8 h-8 rounded-md border border-border hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateWeek(-1)}
            disabled={currentWeekOffset === 0}
            className="w-8 h-8 rounded-md border border-border hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{weekData?.totalXP}</div>
          <div className="text-sm text-muted-foreground">Total XP</div>
          {weekData?.weekGrowth !== 0 && (
            <div className={`flex items-center justify-center gap-1 text-xs mt-1 ${
              weekData?.weekGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {weekData?.weekGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(weekData?.weekGrowth)?.toFixed(0)}%
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{weekData?.activeDays}</div>
          <div className="text-sm text-muted-foreground">Active Days</div>
          <div className="text-xs text-muted-foreground mt-1">out of 7</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{weekData?.totalActivities}</div>
          <div className="text-sm text-muted-foreground">Activities</div>
          <div className="text-xs text-muted-foreground mt-1">completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{Math.round(weekData?.averageXPPerDay)}</div>
          <div className="text-sm text-muted-foreground">Avg XP/Day</div>
          <div className="text-xs text-muted-foreground mt-1">this week</div>
        </div>
      </div>
      {/* Daily Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium text-foreground">Daily Activity</h4>
        </div>
        
        <div className="h-32 flex items-end justify-between gap-2">
          {weekData?.dailyData?.map((day, index) => {
            const heightPercentage = day?.xp > 0 ? (day?.xp / maxXP) * 100 : 0;
            const isToday = weekData?.isCurrentWeek && 
              new Date()?.toISOString()?.split('T')?.[0] === day?.date;
            
            return (
              <div key={day?.date} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-24 mb-2">
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      day?.hasActivity
                        ? isToday
                          ? 'bg-gradient-to-t from-primary to-primary/70' :'bg-gradient-to-t from-blue-500 to-blue-400' :'bg-muted'
                    }`}
                    style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                    title={`${day?.dayName}: ${day?.xp} XP, ${day?.activities} activities`}
                  />
                </div>
                {/* Day Label */}
                <div className={`text-xs text-center ${
                  isToday 
                    ? 'text-primary font-medium' 
                    : day?.hasActivity 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                }`}>
                  {day?.dayName}
                  {isToday && (
                    <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
                  )}
                </div>
                {/* XP Amount */}
                {day?.xp > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {day?.xp}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Weekly Goal Progress */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Weekly Goal</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {weekData?.totalXP} / 1000 XP
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((weekData?.totalXP / 1000) * 100, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>{Math.min(Math.round((weekData?.totalXP / 1000) * 100), 100)}% complete</span>
          <span>1000 XP</span>
        </div>
      </div>
      {/* Insights */}
      {weekData?.isCurrentWeek && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-foreground">
            {weekData?.activeDays >= 6 ? (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Amazing consistency! You're on track for a perfect week! 🌟</span>
              </div>
            ) : weekData?.activeDays >= 4 ? (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Great progress this week! Keep up the momentum! 🚀</span>
              </div>
            ) : weekData?.activeDays >= 2 ? (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span>You're building a good habit! Try for 4+ active days this week! 💪</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>There's still time to make this week count! Start a lesson today! 🎯</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyProgressSummary;