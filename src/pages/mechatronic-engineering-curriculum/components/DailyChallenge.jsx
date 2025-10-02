import React, { useState } from 'react';
import { 
  Calendar, 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle,
  Star,
  Zap,
  Cpu
} from 'lucide-react';

const DailyChallenge = ({ challenge, onRefresh }) => {
  const [attempting, setAttempting] = useState(false);

  if (!challenge) {
    return (
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-center">
          <Calendar className="w-6 h-6 mr-2" />
          <span>No mechatronic challenge available today. Check back tomorrow!</span>
        </div>
      </div>
    );
  }

  const handleAttemptChallenge = async () => {
    setAttempting(true);
    // Simulate challenge attempt
    setTimeout(() => {
      setAttempting(false);
      if (onRefresh) onRefresh();
    }, 2000);
  };

  const isCompleted = challenge?.isCompleted;

  return (
    <div className={`rounded-lg shadow-sm p-6 text-white relative overflow-hidden
      ${isCompleted 
        ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500' :'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500'}`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Cpu className="w-full h-full" />
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mr-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                {isCompleted ? 'Challenge Completed!' : "Today's Mechatronic Challenge"}
              </h3>
              <p className="text-white/80 text-sm">
                {new Date()?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {isCompleted && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <CheckCircle className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Challenge Description
          </h4>
          <p className="text-white/90 text-sm mb-3">
            {challenge?.description}
          </p>
          
          {challenge?.mechatronicFocus && (
            <div className="bg-white/10 rounded-lg p-3 mb-3">
              <p className="text-xs text-white/80 mb-1">Mechatronic Focus:</p>
              <p className="text-white/90 text-sm font-medium">
                {challenge?.mechatronicFocus}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-white/80" />
              <span className="text-sm text-white/90">
                {challenge?.lessons?.estimated_duration_minutes || 30} min
              </span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-sm text-white/90">
                {challenge?.reward_points || 50} XP
              </span>
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-white/80" />
              <span className="text-sm text-white/90">
                {challenge?.difficulty || 'Intermediate'}
              </span>
            </div>
          </div>
        </div>

        {/* Bonus XP for Mechatronic Context */}
        {challenge?.bonusPoints && (
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="text-sm font-medium">Mechatronic Bonus</span>
              </div>
              <span className="text-sm font-bold text-yellow-300">
                +{Math.floor((challenge?.bonusPoints - challenge?.reward_points) || 0)} XP
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {isCompleted ? (
            <div className="flex items-center text-white/90">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Completed today!</span>
            </div>
          ) : (
            <button 
              onClick={handleAttemptChallenge}
              disabled={attempting}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {attempting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </span>
              ) : (
                'Start Challenge'
              )}
            </button>
          )}

          <div className="text-right">
            <p className="text-xs text-white/70">Total Reward</p>
            <p className="text-lg font-bold">
              {challenge?.bonusPoints || challenge?.reward_points || 50} XP
            </p>
          </div>
        </div>

        {/* Related Lesson Link */}
        {challenge?.lessons && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-white/80 mb-2">Related to lesson:</p>
            <p className="text-white/90 font-medium">{challenge?.lessons?.title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;