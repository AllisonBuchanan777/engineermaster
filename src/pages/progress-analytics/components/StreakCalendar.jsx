import React from 'react';
import Icon from '../../../components/AppIcon';

const StreakCalendar = ({ data, currentStreak }) => {
  if (!data || data?.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <Icon name="Calendar" size={32} className="mx-auto mb-2 text-gray-300" />
        <div className="text-sm">No activity data available</div>
      </div>
    );
  }

  const getActivityLevel = (xp) => {
    if (xp === 0) return 'none';
    if (xp < 50) return 'low';
    if (xp < 100) return 'medium';
    return 'high';
  };

  const getActivityColor = (level) => {
    switch (level) {
      case 'none': return 'bg-gray-100';
      case 'low': return 'bg-green-200';
      case 'medium': return 'bg-green-400';
      case 'high': return 'bg-green-600';
      default: return 'bg-gray-100';
    }
  };

  const groupedData = [];
  for (let i = 0; i < data?.length; i += 7) {
    groupedData?.push(data?.slice(i, i + 7));
  }

  return (
    <div>
      {/* Current Streak Display */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-green-600 flex items-center justify-center">
          <Icon name="Flame" className="mr-2 text-orange-500" size={28} />
          {currentStreak}
        </div>
        <div className="text-sm text-gray-600">Day streak</div>
      </div>
      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Week labels */}
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>

        {/* Activity grid */}
        {groupedData?.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week?.map((day, dayIndex) => {
              const level = getActivityLevel(day?.xp);
              const colorClass = getActivityColor(level);
              
              return (
                <div
                  key={dayIndex}
                  className={`
                    w-6 h-6 rounded-sm ${colorClass} border border-gray-200
                    hover:ring-2 hover:ring-green-300 cursor-pointer
                    transition-all duration-200
                  `}
                  title={`${day?.date}: ${day?.xp} XP`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200 border border-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400 border border-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600 border border-gray-200"></div>
        </div>
        <span>More</span>
      </div>
      {/* Activity Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center mb-1">
            <span>Active days:</span>
            <span className="font-medium">
              {data?.filter(d => d?.hasActivity)?.length}/{data?.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total XP earned:</span>
            <span className="font-medium text-green-600">
              {data?.reduce((sum, d) => sum + d?.xp, 0)?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;