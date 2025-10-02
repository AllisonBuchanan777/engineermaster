import React from 'react';
import { Calendar, Clock, Zap, Trophy, Play, CheckCircle } from 'lucide-react';

const DailyChallenge = ({ challenge, onStartChallenge }) => {
  if (!challenge) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No daily challenge available today</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isCompleted = challenge?.isCompleted || false;
  const timeLimit = challenge?.challenge_data?.time_limit || 300; // 5 minutes default
  const questionsCount = challenge?.challenge_data?.questions?.length || 1;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-6 border border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Daily Challenge</h3>
            <p className="text-xs text-gray-500">Electrical Engineering</p>
          </div>
        </div>
        
        {isCompleted && (
          <CheckCircle className="w-6 h-6 text-green-500" />
        )}
      </div>
      <h4 className="font-medium text-gray-900 mb-2">{challenge?.title}</h4>
      <p className="text-sm text-gray-600 mb-4">{challenge?.description}</p>
      {/* Challenge Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Time Limit</span>
          </div>
          <span className="font-medium text-gray-900">
            {Math.floor(timeLimit / 60)}:{(timeLimit % 60)?.toString()?.padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Trophy className="w-4 h-4 mr-1" />
            <span>XP Reward</span>
          </div>
          <span className="font-medium text-yellow-600">+{challenge?.xp_reward}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Questions</span>
          <span className="font-medium text-gray-900">{questionsCount}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Difficulty</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(challenge?.difficulty)}`}>
            {challenge?.difficulty}
          </span>
        </div>
      </div>
      {/* Related Lesson */}
      {challenge?.lessons && (
        <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg border border-yellow-200">
          <p className="text-xs text-gray-600 mb-1">Based on:</p>
          <p className="text-sm font-medium text-gray-900">{challenge?.lessons?.title}</p>
        </div>
      )}
      {/* Challenge Status & Action */}
      {isCompleted ? (
        <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Challenge Completed!</span>
          </div>
          {challenge?.userCompletion && (
            <div className="text-sm text-green-700">
              Score: {challenge?.userCompletion?.score}% • 
              XP Earned: +{challenge?.userCompletion?.xp_earned}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onStartChallenge}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Daily Challenge
        </button>
      )}
      {/* Motivational message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          {isCompleted 
            ? "Come back tomorrow for a new challenge!" 
            : "Test your knowledge and earn bonus XP!"
          }
        </p>
      </div>
    </div>
  );
};

export default DailyChallenge;