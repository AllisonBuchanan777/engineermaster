import React from 'react';
import { Users, MessageSquare, Star, BookOpen, TrendingUp, Calendar } from 'lucide-react';

const CommunityStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Community Members',
      value: stats?.totalMembers?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Discussions',
      value: stats?.activeDiscussions?.toString() || '0',
      change: '+8%',
      changeType: 'increase',
      icon: MessageSquare,
      color: 'green'
    },
    {
      label: 'Study Groups',
      value: stats?.studyGroups?.toString() || '0',
      change: '+15%',
      changeType: 'increase',
      icon: BookOpen,
      color: 'purple'
    },
    {
      label: 'Projects Shared',
      value: stats?.projects?.toString() || '0',
      change: '+23%',
      changeType: 'increase',
      icon: Star,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-900'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-900'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-900'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-900'
      }
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems?.map((stat, index) => {
        const IconComponent = stat?.icon;
        const colorClasses = getColorClasses(stat?.color);
        
        return (
          <div key={index} className={`${colorClasses?.bg} ${colorClasses?.border} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div className={`${colorClasses?.bg} rounded-full p-3`}>
                <IconComponent className={`w-6 h-6 ${colorClasses?.icon}`} />
              </div>
              <div className={`flex items-center text-sm ${stat?.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${stat?.changeType === 'decrease' ? 'rotate-180' : ''}`} />
                <span className="font-medium">{stat?.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-bold ${colorClasses?.text}`}>
                {stat?.value}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {stat?.label}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Last 30 days</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommunityStats;