import React from 'react';
import { Calendar, Filter } from 'lucide-react';

const RankingFilters = ({ 
  timeframe, 
  setTimeframe, 
  selectedDiscipline, 
  setSelectedDiscipline, 
  activeCategory 
}) => {
  const timeframeOptions = [
    { value: 'all_time', label: 'All Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' }
  ];

  const disciplineOptions = [
    { value: 'all', label: 'All Disciplines' },
    { value: 'mechanical', label: 'Mechanical' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'civil', label: 'Civil' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'computer', label: 'Computer' },
    { value: 'aerospace', label: 'Aerospace' },
    { value: 'biomedical', label: 'Biomedical' },
    { value: 'environmental', label: 'Environmental' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Timeframe Filter - Show for overall, streaks, and completions */}
      {['overall', 'streaks', 'completions']?.includes(activeCategory) && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {timeframeOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Discipline Filter - Show for discipline category */}
      {activeCategory === 'discipline' && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {disciplineOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Text */}
      <div className="flex items-center text-sm text-gray-500">
        {activeCategory === 'overall' && (
          <span>Rankings based on total XP earned</span>
        )}
        {activeCategory === 'streaks' && (
          <span>Current learning streak in days</span>
        )}
        {activeCategory === 'completions' && (
          <span>Total number of courses completed</span>
        )}
        {activeCategory === 'achievements' && (
          <span>Points based on achievement tier and count</span>
        )}
        {activeCategory === 'discipline' && (
          <span>Rankings within specific engineering disciplines</span>
        )}
      </div>
    </div>
  );
};

export default RankingFilters;