import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetrics = ({ data, userProfile, className = '' }) => {
  const metrics = [
    {
      label: 'Total XP',
      value: userProfile?.total_xp || 0,
      icon: 'Star',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      format: (val) => val?.toLocaleString()
    },
    {
      label: 'Current Level',
      value: userProfile?.current_level || 1,
      icon: 'TrendingUp',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      format: (val) => `Level ${val}`
    },
    {
      label: 'Lessons Completed',
      value: data?.lessons_completed || 0,
      icon: 'BookOpen',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      format: (val) => val?.toString()
    },
    {
      label: 'Current Streak',
      value: userProfile?.streak_days || 0,
      icon: 'Flame',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      format: (val) => `${val} days`
    },
    {
      label: 'Achievements',
      value: data?.total_achievements || 0,
      icon: 'Award',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      format: (val) => val?.toString()
    },
    {
      label: 'Study Time',
      value: data?.total_study_time || 0,
      icon: 'Clock',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      format: (val) => `${Math.round(val / 60)}h`
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ${className}`}>
      {metrics?.map((metric) => (
        <div key={metric?.label} className="bg-white rounded-lg shadow-lg p-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 ${metric?.bgColor} rounded-lg mb-4`}>
            <Icon name={metric?.icon} size={24} className={metric?.color} />
          </div>
          
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metric?.format(metric?.value)}
          </div>
          
          <div className="text-sm text-gray-600">
            {metric?.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;