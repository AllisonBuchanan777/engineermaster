import React from 'react';
import { 
  Play, Clock, Award, Lock, CheckCircle, 
  BookOpen, Video, Zap, Users, Code, Wrench
} from 'lucide-react';
import Button from '../ui/Button';

const LessonCard = ({ 
  lesson, 
  userProgress, 
  hasAccess = true,
  onStartLesson,
  className = ''
}) => {
  const getLessonTypeIcon = (type) => {
    const icons = {
      theory: BookOpen,
      video: Video,
      interactive: Zap,
      simulation: Wrench,
      quiz: Award,
      project: Users,
      lab_exercise: Wrench,
      case_study: BookOpen,
      coding_challenge: Code,
      design_challenge: Users
    };
    return icons?.[type] || BookOpen;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100',
      intermediate: 'text-yellow-600 bg-yellow-100', 
      advanced: 'text-orange-600 bg-orange-100',
      expert: 'text-red-600 bg-red-100'
    };
    return colors?.[difficulty] || 'text-gray-600 bg-gray-100';
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const LessonIcon = getLessonTypeIcon(lesson?.lesson_type);
  const isCompleted = userProgress?.completion_percentage === 100;
  const isStarted = userProgress?.completion_percentage > 0;
  const progressPercentage = userProgress?.completion_percentage || 0;

  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md 
      transition-all duration-200 overflow-hidden
      ${!hasAccess ? 'opacity-75' : ''}
      ${className}
    `}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg
              ${hasAccess ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
            `}>
              {hasAccess ? <LessonIcon size={20} /> : <Lock size={20} />}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {lesson?.title}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getDifficultyColor(lesson?.difficulty)}
                `}>
                  {lesson?.difficulty?.charAt(0)?.toUpperCase() + lesson?.difficulty?.slice(1)}
                </span>
                
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  {lesson?.estimated_duration_minutes || 30} min
                </div>
                
                {lesson?.xp_reward && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <Award size={14} className="mr-1" />
                    {lesson?.xp_reward} XP
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Icon */}
          {isCompleted && (
            <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {lesson?.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {lesson?.description}
          </p>
        )}

        {/* Progress Bar */}
        {isStarted && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {lesson?.learning_objectives?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Learning Objectives:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {lesson?.learning_objectives?.slice(0, 3)?.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {objective}
                </li>
              ))}
              {lesson?.learning_objectives?.length > 3 && (
                <li className="text-gray-400 text-xs">
                  +{lesson?.learning_objectives?.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Access Level Info */}
        {!hasAccess && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <Lock size={16} className="mr-2" />
              <span className="text-sm font-medium">
                {lesson?.access_level?.charAt(0)?.toUpperCase() + lesson?.access_level?.slice(1)} Plan Required
              </span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Upgrade your subscription to access this lesson
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onStartLesson?.(lesson)}
          disabled={!hasAccess}
          className="w-full"
          variant={isCompleted ? 'secondary' : 'primary'}
        >
          <div className="flex items-center justify-center">
            {!hasAccess ? (
              <Lock size={18} className="mr-2" />
            ) : isCompleted ? (
              <CheckCircle size={18} className="mr-2" />
            ) : (
              <Play size={18} className="mr-2" />
            )}
            {!hasAccess 
              ? 'Upgrade Required'
              : isCompleted 
                ? 'Review Lesson'
                : isStarted 
                  ? 'Continue Lesson' :'Start Lesson'
            }
          </div>
        </Button>
      </div>
      {/* Lesson Type Indicator */}
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="capitalize">
            {lesson?.lesson_type?.replace('_', ' ')} Lesson
          </span>
          {lesson?.order_index && (
            <span>
              Lesson {lesson?.order_index}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;