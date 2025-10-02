import React from 'react';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

const ProgressOverview = ({ modules, overallProgress }) => {
  const completedModules = modules?.filter(m => m?.progress === 100)?.length || 0;
  const inProgressModules = modules?.filter(m => m?.progress > 0 && m?.progress < 100)?.length || 0;
  const totalHours = modules?.reduce((sum, module) => sum + (module?.estimatedHours || 0), 0);
  const completedHours = modules?.reduce((sum, module) => {
    return sum + ((module?.estimatedHours || 0) * (module?.progress || 0) / 100);
  }, 0);

  const progressSegments = [
    { label: 'Completed', value: completedModules, color: 'bg-green-500' },
    { label: 'In Progress', value: inProgressModules, color: 'bg-yellow-400' },
    { label: 'Not Started', value: (modules?.length || 0) - completedModules - inProgressModules, color: 'bg-gray-200' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
        <TrendingUp className="w-5 h-5 text-sky-600" />
      </div>

      {/* Overall Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallProgress / 100)}`}
              className="text-sky-600"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="space-y-3 mb-6">
        {progressSegments?.map((segment, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${segment?.color} mr-2`} />
              <span className="text-sm text-gray-600">{segment?.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{segment?.value}</span>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
          <div className="flex items-center">
            <Target className="w-4 h-4 text-sky-600 mr-2" />
            <span className="text-sm text-gray-600">Modules Completed</span>
          </div>
          <span className="text-sm font-bold text-sky-700">
            {completedModules}/{modules?.length || 0}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Hours Completed</span>
          </div>
          <span className="text-sm font-bold text-green-700">
            {Math.round(completedHours)}/{totalHours}h
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center">
            <Award className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm text-gray-600">Avg Module Score</span>
          </div>
          <span className="text-sm font-bold text-purple-700">
            {modules?.length > 0 ? Math.round(overallProgress) : 0}%
          </span>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Next Milestone</h4>
        {overallProgress < 25 ? (
          <p className="text-xs text-gray-600">Complete 25% to unlock achievements</p>
        ) : overallProgress < 50 ? (
          <p className="text-xs text-gray-600">Complete 50% to unlock advanced modules</p>
        ) : overallProgress < 100 ? (
          <p className="text-xs text-gray-600">Complete all modules for certification</p>
        ) : (
          <p className="text-xs text-green-600">🎉 Curriculum completed!</p>
        )}
      </div>
    </div>
  );
};

export default ProgressOverview;