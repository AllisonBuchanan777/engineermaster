import React from 'react';
import { CheckCircle, Clock, Award } from 'lucide-react';

const ProgressOverview = ({ modules, overallProgress }) => {
  const completedModules = modules?.filter(m => m?.progress === 100)?.length || 0;
  const totalModules = modules?.length || 1;
  const inProgressModules = modules?.filter(m => m?.progress > 0 && m?.progress < 100)?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
      
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
              className="text-orange-500 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <span className="font-semibold text-green-600">
            {completedModules}/{totalModules}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <span className="font-semibold text-yellow-600">{inProgressModules}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-2 text-orange-500" />
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <span className="font-semibold text-gray-600">
            {totalModules - completedModules - inProgressModules}
          </span>
        </div>
      </div>

      {/* Module Progress Bars */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Module Progress</h4>
        <div className="space-y-2">
          {modules?.slice(0, 4)?.map((module, index) => (
            <div key={module?.id} className="flex items-center">
              <div className="flex-1 mr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 truncate">{module?.name}</span>
                  <span className="text-xs text-gray-500">{module?.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${module?.progress || 0}%`,
                      backgroundColor: module?.color 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {modules?.length > 4 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              +{modules?.length - 4} more modules
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;