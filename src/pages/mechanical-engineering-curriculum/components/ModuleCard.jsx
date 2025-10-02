import React from 'react';
import { Clock, Lock, CheckCircle, Play, Star } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ModuleCard = ({ module, index, onModuleClick, getIcon }) => {
  const Icon = getIcon(module?.icon);
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 ${
        module?.isLocked ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      onClick={() => onModuleClick(module)}
      style={{
        background: `linear-gradient(135deg, ${module?.color}15 0%, white 50%)`
      }}
    >
      {/* Module Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: `${module?.color}20` }}
            >
              {module?.isLocked ? (
                <Lock className="w-6 h-6 text-gray-400" />
              ) : (
                <Icon 
                  className="w-6 h-6"
                  style={{ color: module?.color }}
                />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {module?.name}
              </h3>
              <span 
                className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(module?.difficulty)}`}
              >
                {module?.difficulty}
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-right">
            {module?.progress === 100 ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - (module?.progress || 0) / 100)}`}
                    className={getProgressColor(module?.progress || 0)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">
                    {module?.progress || 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {module?.description}
        </p>

        {/* Module Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{module?.estimatedHours}h</span>
          </div>
          <div className="flex items-center">
            <span>{module?.completedLessons}/{module?.lessonsCount} lessons</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            <span>{Math.round((module?.progress || 0) / 20)} stars</span>
          </div>
        </div>

        {/* Prerequisites */}
        {module?.prerequisites?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
            <div className="flex flex-wrap gap-1">
              {module?.prerequisites?.map((prereq, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${module?.progress || 0}%`,
              backgroundColor: module?.color 
            }}
          ></div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            {module?.isLocked ? (
              <span className="text-sm text-gray-500 flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                Complete prerequisites
              </span>
            ) : module?.progress === 100 ? (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Module Complete
              </span>
            ) : (
              <span className="text-sm text-orange-600 flex items-center">
                <Play className="w-4 h-4 mr-1" />
                {module?.progress > 0 ? 'Continue Learning' : 'Start Module'}
              </span>
            )}
          </div>
          
          {/* Projects indicator */}
          {module?.projects?.length > 0 && (
            <div className="text-xs text-gray-500">
              {module?.projects?.length} project{module?.projects?.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Mini Projects Preview */}
        {module?.projects?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-1">Hands-on Projects:</p>
            <div className="space-y-1">
              {module?.projects?.slice(0, 2)?.map((project, idx) => (
                <p key={idx} className="text-xs text-gray-600">
                  • {project}
                </p>
              ))}
              {module?.projects?.length > 2 && (
                <p className="text-xs text-gray-500 italic">
                  +{module?.projects?.length - 2} more projects
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;