import React from 'react';
import { X, Play, Clock, BookOpen, Users, Star, Lock } from 'lucide-react';

const CoursePreview = ({ course, onClose, onEnroll }) => {
  const isPreviewMode = course?.preview?.isPreview || !course?.isAccessible;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{course?.title}</h2>
            <p className="text-gray-600 mt-1">{course?.skill_trees?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Course Info */}
          <div className="flex-1 p-6">
            {/* Preview Badge */}
            {isPreviewMode && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Preview Mode</p>
                  <p className="text-xs text-yellow-600">Upgrade to access full content</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Course</h3>
              <p className="text-gray-700 leading-relaxed">{course?.description}</p>
            </div>

            {/* Course Stats */}
            <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  {course?.estimated_duration_minutes || 30} min
                </div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {course?.difficulty}
                </div>
                <div className="text-xs text-gray-500">Level</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">1.2K</div>
                <div className="text-xs text-gray-500">Students</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">4.8</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>

            {/* Learning Objectives */}
            {course?.learning_objectives?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  {course?.learning_objectives?.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Content Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Content</h3>
              <div className="space-y-2">
                {course?.content?.sections?.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {section?.title || `Section ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {section?.duration || '5 min'}
                        {isPreviewMode && index > 0 && <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    {section?.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-7">
                        {section?.description}
                      </p>
                    )}
                  </div>
                ))}
                
                {isPreviewMode && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">More content available</p>
                    <p className="text-xs text-gray-500">
                      Upgrade to access all {course?.content?.sections?.length > 1 ? '8+' : '5+'} sections
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Prerequisites */}
            {course?.prerequisites?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                <ul className="space-y-1">
                  {course?.prerequisites?.map((prerequisite, index) => (
                    <li key={index} className="text-gray-700 text-sm">
                      • {prerequisite}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Action Panel */}
          <div className="lg:w-80 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="sticky top-6">
              {/* Access Level Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  course?.access_level === 'free' ?'bg-green-100 text-green-800'
                    : course?.access_level === 'premium' ?'bg-blue-100 text-blue-800' :'bg-purple-100 text-purple-800'
                }`}>
                  {course?.access_level === 'free' ? 'Free Course' :
                   course?.access_level === 'premium' ? 'Premium Course' : 'Professional Course'}
                </span>
              </div>

              {/* Progress (if enrolled) */}
              {course?.userProgress && (
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Your Progress</span>
                    <span>{course?.userProgress?.completion_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${course?.userProgress?.completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={onEnroll}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    course?.isAccessible
                      ? 'bg-blue-600 text-white hover:bg-blue-700' :'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {course?.isAccessible 
                    ? course?.userProgress?.completion_percentage > 0 
                      ? 'Continue Learning' :'Start Course' :'Upgrade to Access'
                  }
                </button>
                
                {!course?.isAccessible && (
                  <button className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Add to Wishlist
                  </button>
                )}
              </div>

              {/* Course Features */}
              <div className="space-y-3 text-sm">
                <h4 className="font-medium text-gray-900">This course includes:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Interactive lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Video demonstrations
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Progress tracking
                  </li>
                  {course?.access_level !== 'free' && (
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Certificate of completion
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;