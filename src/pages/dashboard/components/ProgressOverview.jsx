import React, { useState, useEffect } from 'react';
import { Award, Target, BookOpen, Flame, Crown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

import { subscriptionService } from '../../../services/subscriptionService';
import DailyChallenge from '../../../components/gamification/DailyChallenge';

const ProgressOverview = () => {
  const { user, userProfile } = useAuth();
  const [learningStats, setLearningStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalXP: 0,
    currentStreak: 0,
    weeklyGoalProgress: 0
  });
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load subscription info
      const subData = await subscriptionService?.getCurrentSubscription(user?.id);
      setSubscription(subData);

      // Load learning statistics (mock data for now - would come from analytics)
      setLearningStats({
        totalLessons: 47,
        completedLessons: 12,
        totalXP: userProfile?.total_xp || 0,
        currentStreak: userProfile?.streak_days || 0,
        weeklyGoalProgress: 75 // This would be calculated based on weekly activity
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    return subscriptionService?.formatSubscriptionStatus(subscription);
  };

  const progressPercentage = learningStats?.totalLessons > 0 
    ? Math.round((learningStats?.completedLessons / learningStats?.totalLessons) * 100)
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)]?.map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Subscription Status Banner */}
      {subscription?.status === 'trial' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">
                  {subscription?.tier?.charAt(0)?.toUpperCase() + subscription?.tier?.slice(1)} Trial Active
                </h3>
                <p className="text-blue-100 text-sm">
                  {subscription?.trial_ends_at && 
                    `${Math.ceil((new Date(subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`
                  }
                </p>
              </div>
            </div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Learning Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {learningStats?.completedLessons} of {learningStats?.totalLessons} lessons completed
          </p>
        </div>

        {/* Total XP */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total XP</p>
              <p className="text-2xl font-bold text-gray-900">
                {learningStats?.totalXP?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Level {userProfile?.current_level || 1} Engineer
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats?.currentStreak}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {learningStats?.currentStreak === 0 
              ? 'Complete a lesson to start your streak!'
              : `Keep it up! Longest streak: ${userProfile?.longest_streak || learningStats?.currentStreak}`
            }
          </p>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats?.weeklyGoalProgress}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${learningStats?.weeklyGoalProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {Math.round((userProfile?.weekly_xp_goal || 500) * learningStats?.weeklyGoalProgress / 100)} of {userProfile?.weekly_xp_goal || 500} XP this week
          </p>
        </div>
      </div>
      {/* Daily Challenge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DailyChallenge />
        </div>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-semibold text-gray-900">3 lessons</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold text-gray-900">12 lessons</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Score</span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Studied</span>
                <span className="font-semibold text-gray-900">24h 30m</span>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
              <div className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${getSubscriptionStatus()?.color === 'green' ? 'bg-green-100 text-green-800' : 
                  getSubscriptionStatus()?.color === 'blue'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
              `}>
                {getSubscriptionStatus()?.status}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {getSubscriptionStatus()?.description}
            </p>
            <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
              {subscription?.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;