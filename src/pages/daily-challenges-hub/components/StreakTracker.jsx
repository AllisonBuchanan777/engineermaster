import React from 'react';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';

const StreakTracker = ({ streakData, hasCompletedToday }) => {
  const getStreakColor = (current) => {
    if (current >= 30) return 'from-red-500 to-orange-500';
    if (current >= 14) return 'from-orange-500 to-yellow-500';
    if (current >= 7) return 'from-yellow-500 to-green-500';
    if (current >= 3) return 'from-green-500 to-blue-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakMessage = (current) => {
    if (current >= 30) return '🔥 Legendary streak!';
    if (current >= 14) return '🌟 Amazing dedication!';
    if (current >= 7) return '💪 Great consistency!';
    if (current >= 3) return '🚀 Building momentum!';
    if (current >= 1) return '✨ Good start!';
    return '💡 Start your streak today!';
  };

  const generateCalendar = () => {
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date?.setDate(today?.getDate() - i);
      
      const isToday = i === 0;
      const isCompleted = isToday ? hasCompletedToday : Math.random() > 0.5; // Mock data for past days
      
      last7Days?.push({
        date,
        isToday,
        isCompleted,
        dayName: date?.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date?.getDate()
      });
    }
    
    return last7Days;
  };

  const calendarDays = generateCalendar();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Flame className="w-5 h-5 text-orange-500 mr-2" />
            Streak Tracker
          </h3>
          <div className="text-xs text-gray-500">Daily consistency</div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Current Streak Display */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getStreakColor(streakData?.current)} mb-4`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{streakData?.current || 0}</div>
              <div className="text-xs text-white opacity-90">days</div>
            </div>
          </div>
          
          <div className="text-sm font-medium text-gray-900 mb-1">Current Streak</div>
          <div className="text-xs text-gray-600">{getStreakMessage(streakData?.current || 0)}</div>
        </div>

        {/* Weekly Calendar */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            This Week
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays?.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day?.dayName}</div>
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                    ${day?.isCompleted 
                      ? 'bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-md' 
                      : day?.isToday 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :'bg-gray-100 text-gray-400'
                    }
                    ${day?.isToday && day?.isCompleted ? 'ring-2 ring-green-300' : ''}
                  `}
                >
                  {day?.isCompleted ? '✓' : day?.dayNumber}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">{streakData?.longest || 0}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Math.floor(((streakData?.current || 0) / 30) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Monthly Goal</div>
          </div>
        </div>

        {/* Motivational Message */}
        {!hasCompletedToday && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-sm font-medium text-blue-900 mb-1">
                {streakData?.current > 0 ? "Don't break your streak!" : "Start your streak today!"}
              </div>
              <div className="text-xs text-blue-700">
                Complete today's challenge to {streakData?.current > 0 ? 'continue' : 'begin'} your learning streak
              </div>
            </div>
          </div>
        )}

        {/* Achievement Preview */}
        {streakData?.current > 0 && streakData?.current < 30 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-yellow-800">Next Milestone</div>
                <div className="text-xs text-yellow-600">
                  {streakData?.current < 7 ? '7-day streak' : 
                   streakData?.current < 14 ? '14-day streak' : '30-day streak'}
                </div>
              </div>
              <div className="text-lg">🏆</div>
            </div>
            <div className="mt-2 bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(streakData?.current / (streakData?.current < 7 ? 7 : streakData?.current < 14 ? 14 : 30)) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakTracker;