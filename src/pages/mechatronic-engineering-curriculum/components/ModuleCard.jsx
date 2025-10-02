import React from 'react';
import { 
  Lock, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Target,
  Award,
  ArrowRight
} from 'lucide-react';

const ModuleCard = ({ module, onClick, getIcon }) => {
  const progressPercentage = module?.progress || 0;
  const isCompleted = progressPercentage === 100;
  const isLocked = module?.isLocked;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer
        ${isLocked 
          ? 'border-gray-200 opacity-60 cursor-not-allowed' 
          : isCompleted 
            ? 'border-green-200 hover:border-green-300 hover:shadow-md' 
            : 'border-blue-200 hover:border-blue-300 hover:shadow-md'
        }`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white mr-4
                ${isLocked ? 'bg-gray-400' : ''}`}
              style={!isLocked ? { backgroundColor: module?.color } : {}}
            >
              {isLocked ? <Lock className="w-6 h-6" /> : getIcon(module?.icon)}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                {module?.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${module?.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    module?.difficulty === 'intermediate'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {module?.difficulty}
                </span>
                <Clock className="w-4 h-4" />
                <span>{module?.estimatedHours}h</span>
              </div>
            </div>
          </div>
          
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {module?.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={isLocked ? 'text-gray-400' : 'text-gray-700'}>
              Progress
            </span>
            <span className={isLocked ? 'text-gray-400' : 'text-gray-700'}>
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300
                ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
              {module?.lessonsCount || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <BookOpen className="w-3 h-3 mr-1" />
              Lessons
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
              {module?.totalProjects || module?.projects?.length || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Target className="w-3 h-3 mr-1" />
              Projects
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
              {module?.totalTopics || module?.keyTopics?.length || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Award className="w-3 h-3 mr-1" />
              Topics
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        {module?.prerequisites && module?.prerequisites?.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Prerequisites:</div>
            <div className="flex flex-wrap gap-1">
              {module?.prerequisites?.map((prereq, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {prereq?.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          {isLocked ? (
            <div className="flex items-center text-gray-400 text-sm">
              <Lock className="w-4 h-4 mr-2" />
              Complete prerequisites to unlock
            </div>
          ) : (
            <button 
              className={`flex items-center text-sm font-medium transition-colors
                ${isCompleted 
                  ? 'text-green-600 hover:text-green-700' :'text-blue-600 hover:text-blue-700'}`}
            >
              {isCompleted ? 'Review Module' : 'Start Learning'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
          
          {!isLocked && (
            <div className="text-xs text-gray-500">
              {module?.completedLessons || 0}/{module?.lessonsCount || 0} lessons
            </div>
          )}
        </div>

        {/* Unlock Requirement */}
        {isLocked && module?.unlockRequirement && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-xs text-yellow-700">
              <Award className="w-4 h-4 mr-2" />
              Requires {module?.unlockRequirement}% completion of prerequisites
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;