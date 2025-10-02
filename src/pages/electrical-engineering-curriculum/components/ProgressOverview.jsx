import React from 'react';
import { TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';

const ProgressOverview = ({ modules, overallProgress }) => {
  const completedModules = modules?.filter(m => m?.progress === 100)?.length || 0;
  const inProgressModules = modules?.filter(m => m?.progress > 0 && m?.progress < 100)?.length || 0;
  const totalLessons = modules?.reduce((sum, module) => sum + (module?.lessonsCount || 0), 0);
  const completedLessons = modules?.reduce((sum, module) => sum + (module?.completedLessons || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Progress Overview
      </h3>
      
      {/* Overall Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallProgress / 100)}`}
              className="text-blue-600 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{overallProgress}%</span>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm text-gray-600">Completed Modules</span>
          </div>
          <span className="font-semibold text-gray-900">
            {completedModules}/{modules?.length || 0}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <span className="font-semibold text-gray-900">{inProgressModules}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm text-gray-600">Total Lessons</span>
          </div>
          <span className="font-semibold text-gray-900">
            {completedLessons}/{totalLessons}
          </span>
        </div>
      </div>

      {/* Progress Bar by Module */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Module Progress</h4>
        {modules?.slice(0, 3)?.map((module, index) => (
          <div key={module?.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 truncate">{module?.name}</span>
              <span className="text-gray-900 font-medium">{module?.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${module?.progress || 0}%`,
                  backgroundColor: module?.color || '#3B82F6'
                }}
              ></div>
            </div>
          </div>
        ))}
        
        {modules?.length > 3 && (
          <p className="text-xs text-gray-500 text-center pt-2">
            +{modules?.length - 3} more modules
          </p>
        )}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800 text-center">
          {overallProgress === 100 
            ? "🎉 Congratulations! You've mastered the electrical engineering curriculum!"
            : overallProgress >= 75 
            ? "🚀 Almost there! You're doing great!"
            : overallProgress >= 50 
            ? "💪 You're halfway through! Keep up the excellent work!"
            : overallProgress >= 25
            ? "📚 Good progress! You're building a strong foundation!" :"🌟 Welcome to your electrical engineering journey!"
          }
        </p>
      </div>
    </div>
  );
};

export default ProgressOverview;