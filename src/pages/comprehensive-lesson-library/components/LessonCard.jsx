import React from 'react';
import { 
  Clock, 
  Star, 
  CheckCircle, 
  Lock, 
  Play, 
  BookOpen, 
  Target,
  Award,
  BarChart3,
  Zap,
  Crown,
  TreePine
} from 'lucide-react';

const LessonCard = ({ lesson, onStartLesson, userProgress }) => {
  const isCompleted = lesson?.userProgress?.completion_percentage === 100;
  const hasAccess = lesson?.hasAccess !== false;
  const progress = lesson?.userProgress?.completion_percentage || 0;
  const isInProgress = progress > 0 && progress < 100;

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    advanced: 'bg-orange-100 text-orange-800 border-orange-200',
    expert: 'bg-red-100 text-red-800 border-red-200'
  };

  const lessonTypeIcons = {
    Engineering: Target,
    Electrical: Zap,
    Simulation: BarChart3,
    Project: Award,
    Theory: BookOpen,
    Lab: Crown,
    Application: TreePine
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';  
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (!hasAccess) return <Lock className="w-6 h-6 text-gray-400" />;
    if (isInProgress) return <Play className="w-6 h-6 text-blue-500" />;
    return <Play className="w-6 h-6 text-blue-500" />;
  };

  const getButtonText = () => {
    if (isCompleted) return 'Review';
    if (!hasAccess) return 'Unlock';
    if (isInProgress) return 'Continue';
    return 'Start';
  };

  const getButtonStyle = () => {
    if (isCompleted) return 'bg-green-600 hover:bg-green-700';
    if (!hasAccess) return 'bg-gray-400 cursor-not-allowed';
    if (isInProgress) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const TypeIcon = lessonTypeIcons?.[lesson?.lesson_type] || BookOpen;

  const handleClick = () => {
    if (hasAccess && onStartLesson) {
      onStartLesson(lesson);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                difficultyColors?.[lesson?.difficulty] || difficultyColors?.beginner
              }`}>
                {lesson?.difficulty?.charAt(0)?.toUpperCase() + lesson?.difficulty?.slice(1)}
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                <TypeIcon className="w-3 h-3" />
                <span className="text-xs font-medium">{lesson?.lesson_type}</span>
              </div>
              {lesson?.access_level === 'premium' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Premium
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {lesson?.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {lesson?.description}
            </p>
          </div>

          {/* Status Icon */}
          <div className="ml-4 flex-shrink-0">
            {getStatusIcon()}
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Learning Objectives Preview */}
        {lesson?.learning_objectives?.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Learning Objectives:
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {lesson?.learning_objectives?.slice(0, 2)?.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="line-clamp-1">{objective}</span>
                </li>
              ))}
              {lesson?.learning_objectives?.length > 2 && (
                <li className="text-gray-500 text-xs">
                  +{lesson?.learning_objectives?.length - 2} more objectives
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Lesson Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lesson?.estimated_duration_minutes || 30} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{lesson?.xp_reward || 50} XP</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleClick}
            disabled={!hasAccess}
            className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${getButtonStyle()}`}
          >
            {getButtonText()}
          </button>
        </div>

        {/* Prerequisites Warning */}
        {lesson?.prerequisites?.length > 0 && !hasAccess && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              <span className="font-medium">Prerequisites required:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {lesson?.prerequisites?.slice(0, 2)?.map((prereq, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    {prereq}
                  </span>
                ))}
                {lesson?.prerequisites?.length > 2 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    +{lesson?.prerequisites?.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last Accessed */}
        {lesson?.userProgress?.last_accessed_at && (
          <div className="mt-3 text-xs text-gray-500">
            Last accessed: {new Date(lesson?.userProgress?.last_accessed_at)?.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;