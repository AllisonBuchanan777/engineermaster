import React from 'react';
import { Clock, Users, Award, Lock, Play, CheckCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ModuleCard = ({ module, index, onModuleClick, getIcon }) => {
  const Icon = getIcon?.(module?.icon);
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800', 
    advanced: 'bg-red-100 text-red-800',
    expert: 'bg-purple-100 text-purple-800'
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 30) return 'bg-red-400';
    if (progress < 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer ${
        module?.isLocked ? 'opacity-60' : 'hover:border-sky-300'
      }`}
      onClick={() => onModuleClick?.(module)}
    >
      {/* Lock Overlay */}
      {module?.isLocked && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-80 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">Locked</p>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{module?.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors?.[module?.difficulty] || difficultyColors?.beginner}`}>
                  {module?.difficulty}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{module?.totalLessons} lessons</span>
              </div>
            </div>
          </div>
          
          {/* Progress Badge */}
          <div className="text-right">
            {module?.progress === 100 ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            ) : module?.progress > 0 ? (
              <div className="flex items-center text-sky-600">
                <Play className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
            ) : (
              <div className="text-gray-400">
                <span className="text-sm">Not Started</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {module?.description}
        </p>

        {/* Learning Objectives */}
        {module?.learning_objectives && module?.learning_objectives?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">LEARNING OBJECTIVES</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {module?.learning_objectives?.slice(0, 2)?.map((objective, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="w-1 h-1 bg-sky-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>{objective}</span>
                </li>
              ))}
              {module?.learning_objectives?.length > 2 && (
                <li className="text-xs text-gray-400">
                  +{module?.learning_objectives?.length - 2} more objectives
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs font-medium text-gray-900">{module?.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(module?.progress)}`}
              style={{ width: `${module?.progress}%` }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{module?.estimatedHours || 0}h</span>
            </div>
            <div className="flex items-center">
              <Award className="w-3 h-3 mr-1" />
              <span>{module?.completedLessons}/{module?.totalLessons}</span>
            </div>
          </div>
          
          {/* Prerequisites */}
          {module?.prerequisites && module?.prerequisites?.length > 0 && (
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span className="truncate">{module?.prerequisites?.length} prereq</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;