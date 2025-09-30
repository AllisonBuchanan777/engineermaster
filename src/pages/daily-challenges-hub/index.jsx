import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Flame, Star, Timer, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ChallengeCard from './components/ChallengeCard';
import LeaderboardPanel from './components/LeaderboardPanel';
import ChallengeHistory from './components/ChallengeHistory';
import StreakTracker from './components/StreakTracker';
import ChallengeModal from './components/ChallengeModal';
import Header from '../../components/ui/Header';

const DailyChallengesHub = () => {
  const { user, userProfile } = useAuth();
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [upcomingChallenges, setUpcomingChallenges] = useState([]);
  const [userChallengeAttempts, setUserChallengeAttempts] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0, lastActivity: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Load daily challenges data
  useEffect(() => {
    if (user?.id) {
      loadDailyChallengesData();
      loadUserProgress();
      loadLeaderboardData();
    }
  }, [user?.id]);

  const loadDailyChallengesData = async () => {
    try {
      setError(null);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date()?.toISOString()?.split('T')?.[0];
      
      // Load today's challenge
      const { data: todayData, error: todayError } = await supabase
        ?.from('daily_challenges')
        ?.select('*')
        ?.eq('challenge_date', today)
        ?.single();

      if (todayError && todayError?.code !== 'PGRST116') {
        throw todayError;
      }

      setTodayChallenge(todayData || null);

      // Load upcoming challenges (next 7 days)
      const nextWeek = new Date();
      nextWeek?.setDate(nextWeek?.getDate() + 7);
      
      const { data: upcomingData, error: upcomingError } = await supabase
        ?.from('daily_challenges')
        ?.select('*')
        ?.gt('challenge_date', today)
        ?.lte('challenge_date', nextWeek?.toISOString()?.split('T')?.[0])
        ?.order('challenge_date')
        ?.limit(7);

      if (upcomingError) {
        throw upcomingError;
      }

      setUpcomingChallenges(upcomingData || []);

    } catch (err) {
      console.error('Error loading daily challenges:', err);
      setError('Failed to load daily challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user?.id) return;

    try {
      // Load user's challenge attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        ?.from('user_daily_challenges')
        ?.select(`
          *,
          daily_challenges (
            id,
            challenge_date,
            title,
            challenge_type,
            discipline,
            difficulty,
            xp_reward
          )
        `)
        ?.eq('user_id', user?.id)
        ?.order('completed_at', { ascending: false })
        ?.limit(10);

      if (attemptsError) throw attemptsError;
      setUserChallengeAttempts(attemptsData || []);

      // Load streak data from user profile
      if (userProfile) {
        setStreakData({
          current: userProfile?.streak_days || 0,
          longest: userProfile?.current_level || 0, // Using current_level as proxy for longest streak
          lastActivity: userProfile?.last_activity_date
        });
      }

    } catch (err) {
      console.error('Error loading user progress:', err);
    }
  };

  const loadLeaderboardData = async () => {
    try {
      // Load top performers for daily challenges (this month)
      const startOfMonth = new Date();
      startOfMonth?.setDate(1);
      startOfMonth?.setHours(0, 0, 0, 0);
      
      const { data: leaderboardQuery, error: leaderboardError } = await supabase
        ?.from('user_daily_challenges')
        ?.select(`
          user_id,
          xp_earned,
          score,
          user_profiles (
            full_name,
            username,
            avatar_url,
            current_level,
            specialization
          )
        `)
        ?.gte('completed_at', startOfMonth?.toISOString())
        ?.order('xp_earned', { ascending: false })
        ?.limit(10);

      if (leaderboardError) throw leaderboardError;

      // Aggregate user data for leaderboard
      const userMap = new Map();
      leaderboardQuery?.forEach(attempt => {
        const userId = attempt?.user_id;
        if (!userMap?.has(userId)) {
          userMap?.set(userId, {
            ...attempt?.user_profiles,
            totalXP: 0,
            challengesCompleted: 0,
            averageScore: 0,
            user_id: userId
          });
        }
        const user = userMap?.get(userId);
        user.totalXP += attempt?.xp_earned || 0;
        user.challengesCompleted += 1;
        user.averageScore = ((user?.averageScore * (user?.challengesCompleted - 1)) + (attempt?.score || 0)) / user?.challengesCompleted;
      });

      const leaderboard = Array.from(userMap?.values())
        ?.sort((a, b) => b?.totalXP - a?.totalXP)
        ?.slice(0, 10)
        ?.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setLeaderboardData(leaderboard);

    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const handleStartChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setShowChallengeModal(true);
  };

  const handleChallengeComplete = async (challengeId, score, xpEarned) => {
    try {
      // Record challenge attempt
      const { error: insertError } = await supabase
        ?.from('user_daily_challenges')
        ?.insert({
          user_id: user?.id,
          challenge_id: challengeId,
          score: score,
          xp_earned: xpEarned
        });

      if (insertError) throw insertError;

      // Update streak if it's today's challenge
      if (todayChallenge?.id === challengeId) {
        const { error: streakError } = await supabase
          ?.from('user_profiles')
          ?.update({
            streak_days: streakData?.current + 1,
            last_activity_date: new Date()?.toISOString()?.split('T')?.[0]
          })
          ?.eq('id', user?.id);

        if (streakError) {
          console.error('Error updating streak:', streakError);
        }
      }

      // Refresh data
      await Promise.all([
        loadUserProgress(),
        loadLeaderboardData()
      ]);

      setShowChallengeModal(false);
      setSelectedChallenge(null);

    } catch (err) {
      console.error('Error completing challenge:', err);
      setError('Failed to record challenge completion. Please try again.');
    }
  };

  const hasCompletedToday = todayChallenge && userChallengeAttempts?.some(
    attempt => attempt?.daily_challenges?.id === todayChallenge?.id
  );

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-orange-100 text-orange-800 border-orange-200',
      expert: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors?.[difficulty] || colors?.intermediate;
  };

  const getDisciplineIcon = (discipline) => {
    const icons = {
      mechanical: '⚙️',
      electrical: '⚡',
      civil: '🏗️',
      computer: '💻',
      aerospace: '🚀',
      chemical: '⚗️'
    };
    return icons?.[discipline] || '🔧';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Challenges Hub</h1>
              <p className="text-gray-600">Test your engineering knowledge with time-limited challenges</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{streakData?.current}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userChallengeAttempts?.length || 0}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Featured Challenge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Today's Challenge</h2>
                    <p className="text-blue-100 text-sm">Complete before midnight for maximum XP</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">Time Remaining</div>
                    <div className="text-white text-lg font-semibold">
                      <Timer className="inline-block w-4 h-4 mr-1" />
                      {new Date()?.getHours()}h {60 - new Date()?.getMinutes()}m
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {todayChallenge ? (
                  <ChallengeCard
                    challenge={todayChallenge}
                    onStartChallenge={handleStartChallenge}
                    isCompleted={hasCompletedToday}
                    isToday={true}
                    getDifficultyColor={getDifficultyColor}
                    getDisciplineIcon={getDisciplineIcon}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Challenge Today</h3>
                    <p className="text-gray-500">Check back tomorrow for a new challenge!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Challenges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Challenges</h2>
                  <span className="text-sm text-gray-500">Next 7 days</span>
                </div>
              </div>
              
              <div className="p-6">
                {upcomingChallenges?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {upcomingChallenges?.map((challenge) => (
                      <div
                        key={challenge?.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{getDisciplineIcon(challenge?.discipline)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(challenge?.difficulty)}`}>
                            {challenge?.difficulty}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{challenge?.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{challenge?.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(challenge?.challenge_date)?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <div className="flex items-center text-yellow-600">
                            <Star className="w-3 h-3 mr-1" />
                            {challenge?.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No upcoming challenges scheduled</p>
                  </div>
                )}
              </div>
            </div>

            {/* Challenge History */}
            <ChallengeHistory 
              userChallengeAttempts={userChallengeAttempts}
              getDifficultyColor={getDifficultyColor}
              getDisciplineIcon={getDisciplineIcon}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Tracker */}
            <StreakTracker 
              streakData={streakData}
              hasCompletedToday={hasCompletedToday}
            />

            {/* Daily Leaderboard */}
            <LeaderboardPanel 
              leaderboardData={leaderboardData}
              currentUserId={user?.id}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Challenges Won</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {userChallengeAttempts?.filter(attempt => attempt?.score >= 70)?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Total Attempts</span>
                  </div>
                  <span className="font-semibold text-gray-900">{userChallengeAttempts?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-600">XP Earned</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {userChallengeAttempts?.reduce((total, attempt) => total + (attempt?.xp_earned || 0), 0) || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Flame className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Best Streak</span>
                  </div>
                  <span className="font-semibold text-gray-900">{streakData?.longest || 0} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Challenge Modal */}
      {selectedChallenge && (
        <ChallengeModal
          isOpen={showChallengeModal}
          onClose={() => {
            setShowChallengeModal(false);
            setSelectedChallenge(null);
          }}
          challenge={selectedChallenge}
          onComplete={handleChallengeComplete}
          getDifficultyColor={getDifficultyColor}
          getDisciplineIcon={getDisciplineIcon}
        />
      )}
    </div>
  );
};

export default DailyChallengesHub;