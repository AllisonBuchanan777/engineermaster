import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, Lock, Play, Eye } from 'lucide-react';
import { freemiumService } from '../../../services/freemiumService';

const CourseCard = ({ 
  course, 
  viewMode, 
  userSubscription, 
  onSelect, 
  onPreview, 
  getDisciplineIcon, 
  getDifficultyColor 
}) => {
  const [courseStats, setCourseStats] = useState({ totalEnrollments: 0, avgCompletion: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourseStats();
  }, [course?.id]);

  const loadCourseStats = async () => {
    try {
      const stats = await freemiumService?.getCourseStats(course?.id);
      setCourseStats(stats);
    } catch (error) {
      console.error('Error loading course stats:', error);
    }
  };

  const isLocked = !course?.isAccessible;
  const isCompleted = course?.userProgress?.completion_percentage === 100;
  const inProgress = course?.userProgress?.completion_percentage > 0 && course?.userProgress?.completion_percentage < 100;

  const handleClick = () => {
    if (isLocked && course?.access_level !== 'free') {
      onPreview(course);
    } else {
      onSelect(course);
    }
  };

  const getProgressBarColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (inProgress) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getAccessLevelBadge = () => {
    if (course?.access_level === 'free') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Free
        </span>
      );
    }
    
    if (course?.access_level === 'premium') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Pro
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Professional
      </span>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
        <div className="flex items-center gap-6">
          {/* Course Icon & Discipline */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
              {getDisciplineIcon(course?.skill_trees?.discipline)}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {course?.title}
                  </h3>
                  {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                  {isCompleted && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                    </svg>
                  </div>}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {course?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course?.estimated_duration_minutes || 30} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {courseStats?.totalEnrollments} enrolled
                  </span>
                  {courseStats?.avgCompletion > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {courseStats?.avgCompletion}% avg completion
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 ml-4">
                {getAccessLevelBadge()}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course?.difficulty)}`}>
                  {course?.difficulty?.charAt(0)?.toUpperCase() + course?.difficulty?.slice(1)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {course?.userProgress && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{course?.userProgress?.completion_percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressBarColor()}`}
                    style={{ width: `${course?.userProgress?.completion_percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClick}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLocked
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : inProgress
                        ? 'bg-blue-600 text-white hover:bg-blue-700' :'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLocked ? (
                  <>
                    <Eye className="w-4 h-4 inline mr-2" />
                    Preview
                  </>
                ) : isCompleted ? (
                  'Review'
                ) : inProgress ? (
                  'Continue'
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    Start
                  </>
                )}
              </button>

              {!isLocked && course?.access_level !== 'free' && (
                <button
                  onClick={() => onPreview(course)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer group"
      onClick={handleClick}
    >
      {/* Card Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg">
              {getDisciplineIcon(course?.skill_trees?.discipline)}
            </div>
            <div className="text-sm text-gray-500">
              {course?.skill_trees?.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            {getAccessLevelBadge()}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course?.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {course?.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course?.estimated_duration_minutes || 30}m
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course?.difficulty)}`}>
            {course?.difficulty?.charAt(0)?.toUpperCase() + course?.difficulty?.slice(1)}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {courseStats?.totalEnrollments} enrolled
          </span>
          {courseStats?.avgCompletion > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {courseStats?.avgCompletion}% completion
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {course?.userProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{course?.userProgress?.completion_percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${getProgressBarColor()}`}
                style={{ width: `${course?.userProgress?.completion_percentage || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {/* Card Footer */}
      <div className="px-4 pb-4">
        <button
          onClick={(e) => {
            e?.stopPropagation();
            handleClick();
          }}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isLocked
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : inProgress
                  ? 'bg-blue-600 text-white hover:bg-blue-700' :'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLocked ? (
            <>
              <Eye className="w-4 h-4 inline mr-2" />
              Preview Course
            </>
          ) : isCompleted ? (
            <>
              <div className="w-4 h-4 inline mr-2 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                </svg>
              </div>
              Review Course
            </>
          ) : inProgress ? (
            <>
              <Play className="w-4 h-4 inline mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              <Play className="w-4 h-4 inline mr-2" />
              Start Course
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;