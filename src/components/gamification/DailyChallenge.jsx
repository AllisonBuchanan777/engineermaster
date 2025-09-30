import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Target, Flame, CheckCircle, Play, Award, Zap } from 'lucide-react';
import Button from '../ui/Button';
import { curriculumService } from '../../services/curriculumService';
import { useAuth } from '../../contexts/AuthContext';

const DailyChallenge = ({ className = '' }) => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempting, setAttempting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const challengeData = await curriculumService?.getDailyChallenge();
      setChallenge(challengeData);
      
      // Check if user already completed today's challenge
      if (user?.user_profiles?.daily_challenge_completed_today) {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = () => {
    setShowChallenge(true);
    setAttempting(true);
  };

  const submitAnswer = async () => {
    if (!user || !challenge || !userAnswer?.trim()) return;

    try {
      // Simple scoring logic - in production, this would be more sophisticated
      const score = Math.random() * 40 + 60; // Random score between 60-100 for demo
      
      const result = await curriculumService?.completeDailyChallenge(
        user?.id, 
        challenge?.id, 
        Math.round(score)
      );

      setResult({
        score: Math.round(score),
        passed: score >= 60,
        xpEarned: result?.xp_earned
      });
      setCompleted(true);
    } catch (error) {
      console.error('Error submitting challenge:', error);
    } finally {
      setAttempting(false);
    }
  };

  const getDisciplineColor = (discipline) => {
    const colors = {
      mechanical: 'text-orange-600 bg-orange-100',
      electrical: 'text-blue-600 bg-blue-100',
      civil: 'text-green-600 bg-green-100',
      computer: 'text-purple-600 bg-purple-100',
      chemical: 'text-yellow-600 bg-yellow-100',
      aerospace: 'text-indigo-600 bg-indigo-100'
    };
    return colors?.[discipline] || 'text-gray-600 bg-gray-100';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'text-green-600',
      intermediate: 'text-yellow-600',
      advanced: 'text-orange-600',
      expert: 'text-red-600'
    };
    return colors?.[difficulty] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 text-center ${className}`}>
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Challenge Today
        </h3>
        <p className="text-gray-600">
          Check back tomorrow for a new engineering challenge!
        </p>
      </div>
    );
  }

  if (completed && result) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Challenge Complete!</h3>
              <p className="text-green-100">Great job on today's challenge</p>
            </div>
            <CheckCircle size={48} className="text-green-200" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{result?.score}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{result?.xpEarned}</div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              {result?.passed ? 'Excellent work!' : 'Good effort!'} Come back tomorrow for a new challenge.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Flame size={16} className="mr-1 text-orange-500" />
              Keep your learning streak alive!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Daily Challenge</h3>
            <p className="text-blue-100">{new Date()?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <Target size={32} className="text-blue-200" />
        </div>
      </div>
      {/* Challenge Info */}
      <div className="p-6">
        {!showChallenge ? (
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${getDisciplineColor(challenge?.discipline)}
              `}>
                {challenge?.discipline?.charAt(0)?.toUpperCase() + challenge?.discipline?.slice(1)}
              </span>
              
              <div className={`flex items-center text-sm ${getDifficultyColor(challenge?.difficulty)}`}>
                <Zap size={16} className="mr-1" />
                {challenge?.difficulty?.charAt(0)?.toUpperCase() + challenge?.difficulty?.slice(1)}
              </div>

              <div className="flex items-center text-gray-600 text-sm">
                <Award size={16} className="mr-1" />
                {challenge?.xp_reward} XP
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {challenge?.title}
            </h4>
            
            <p className="text-gray-600 mb-6">
              {challenge?.description}
            </p>

            <Button
              onClick={startChallenge}
              className="w-full"
              size="lg"
            >
              <Play size={18} className="mr-2" />
              Start Challenge
            </Button>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {challenge?.title}
            </h4>

            {/* Sample Challenge UI - In production, this would be dynamic based on challenge type */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 mb-4">
                  <strong>Problem:</strong> Calculate the maximum bending moment for a simply supported beam with a uniform distributed load of 10 kN/m over a span of 6 meters.
                </p>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Answer (kN⋅m):
                  </label>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e?.target?.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your answer..."
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={submitAnswer}
                disabled={attempting || !userAnswer?.trim()}
                className="flex-1"
              >
                {attempting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Answer'
                )}
              </Button>
              
              <Button
                onClick={() => setShowChallenge(false)}
                variant="secondary"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;