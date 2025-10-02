import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';

const ProgressOverview = ({ progress }) => {
  if (!progress) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3]?.map(i => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.overallProgress || 0;
  const completionLevel = progressPercentage >= 100 ? 'expert' : 
                         progressPercentage >= 75 ? 'advanced' : 
                         progressPercentage >= 50 ? 'intermediate' : 'beginner';

  const levelColors = {
    beginner: 'text-green-600 bg-green-100',
    intermediate: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-orange-600 bg-orange-100',
    expert: 'text-purple-600 bg-purple-100'
  };

  const estimatedTimeRemaining = Math.max(0, Math.ceil((100 - progressPercentage) * 0.2)); // Rough estimate

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Your Mechatronic Progress
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors?.[completionLevel]}`}>
          {completionLevel} level
        </div>
      </div>
      {/* Main Progress Visualization */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-medium text-gray-700">Overall Completion</span>
          <span className="text-2xl font-bold text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Advanced</span>
          <span>Expert</span>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Modules Completed</p>
              <p className="text-2xl font-bold text-blue-900">
                {progress?.completedModules || 0}/{progress?.totalModules || 6}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Lessons Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {progress?.completedLessons || 0}/{progress?.totalLessons || 0}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total XP Earned</p>
              <p className="text-2xl font-bold text-purple-900">{progress?.totalXP || 0}</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Current Level</p>
              <p className="text-2xl font-bold text-orange-900">{progress?.currentLevel || 1}</p>
            </div>
            <Award className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>
      {/* Learning Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Learning Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-600" />
            <span className="text-gray-700">
              ~{estimatedTimeRemaining}h remaining to complete all modules
            </span>
          </div>
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-gray-700">
              Average {Math.round((progress?.totalXP || 0) / Math.max(1, progress?.completedLessons || 1))} XP per lesson
            </span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-gray-700">
              {progressPercentage >= 50 ? 'Great progress!' : 'Keep going!'}
            </span>
          </div>
        </div>
      </div>
      {/* Next Steps */}
      {progressPercentage < 100 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
          <p className="text-blue-700 text-sm">
            {progressPercentage === 0 
              ? "Start with 'Integrated Systems' to learn the fundamentals of mechatronic engineering."
              : progressPercentage < 25
              ? "Continue building your foundation with sensor and actuator concepts."
              : progressPercentage < 50
              ? "Dive into embedded programming to control mechatronic systems."
              : progressPercentage < 75
              ? "Master control systems and automation principles." :"Complete your journey with advanced signal processing and robotics!"
            }
          </p>
        </div>
      )}
      {/* Completion Celebration */}
      {progressPercentage === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Award className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h4 className="font-semibold text-green-900">Congratulations!</h4>
              <p className="text-green-700 text-sm">
                You've completed the entire Mechatronic Engineering curriculum. You're now ready for advanced projects!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;