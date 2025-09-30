import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { enhancedDashboardService } from '../../services/enhancedDashboardService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';

// Import components
import StreakTracker from './components/StreakTracker';
import XPProgressRing from './components/XPProgressRing';
import DisciplineProgressCards from './components/DisciplineProgressCards';
import PersonalizedFeed from './components/PersonalizedFeed';
import AchievementNotifications from './components/AchievementNotifications';
import WeeklyProgressSummary from './components/WeeklyProgressSummary';
import QuickActionCards from './components/QuickActionCards';
import LearningGoalsPanel from './components/LearningGoalsPanel';
import LeaderboardWidget from './components/LeaderboardWidget';

const EnhancedDashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [skillProgress, setSkillProgress] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [leaderboard, setLeaderboard] = useState({ byXP: [], byStreak: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id && !loading) {
      loadDashboardData();
    }
  }, [user?.id, loading]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [
        dashboardResult,
        skillResult,
        streakResult,
        recommendationsResult,
        leaderboardResult
      ] = await Promise.all([
        enhancedDashboardService?.getUserDashboardData(user?.id),
        enhancedDashboardService?.getUserSkillProgress(user?.id),
        enhancedDashboardService?.getStreakAnalytics(user?.id),
        enhancedDashboardService?.getLearningRecommendations(user?.id),
        enhancedDashboardService?.getLeaderboardData(10)
      ]);

      if (dashboardResult?.error) {
        throw dashboardResult?.error;
      }

      setDashboardData(dashboardResult);
      setSkillProgress(skillResult?.data || []);
      setStreakData(streakResult?.data);
      setRecommendations(recommendationsResult?.data);
      setLeaderboard(leaderboardResult?.data || { byXP: [], byStreak: [] });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallengeComplete = async (challengeId) => {
    try {
      const result = await enhancedDashboardService?.completeDailyChallenge(
        user?.id, 
        challengeId, 
        100, 
        15
      );

      if (result?.error) {
        throw result?.error;
      }

      // Reload dashboard data to reflect changes
      await loadDashboardData();
      
      // Show success notification (you can implement a toast system)
      console.log('Challenge completed successfully!');
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError(err?.message || 'Failed to complete challenge');
    }
  };

  const handleGoalUpdate = async (goalType, increment = 1) => {
    try {
      const result = await enhancedDashboardService?.updateGoalProgress(
        user?.id, 
        goalType, 
        increment
      );

      if (result?.error) {
        throw result?.error;
      }

      // Reload dashboard data to reflect changes
      await loadDashboardData();

      if (result?.isCompleted) {
        console.log('Goal completed! Bonus XP awarded.');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err?.message || 'Failed to update goal');
    }
  };

  // Calculate level progress
  const levelProgress = userProfile?.total_xp 
    ? enhancedDashboardService?.calculateLevelProgress(userProfile?.total_xp)
    : null;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Loading skeleton */}
          <div className="space-y-8">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3]?.map((i) => (
                    <div key={i} className="h-24 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2]?.map((i) => (
                  <div key={i} className="h-64 bg-card rounded-xl border border-border animate-pulse"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[1, 2, 3]?.map((i) => (
                  <div key={i} className="h-48 bg-card rounded-xl border border-border animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Breadcrumb />
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const profile = dashboardData?.userProfile || userProfile;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 pb-20 md:pb-8">
        <Breadcrumb />
        
        {/* Hero Section with Streak and Level */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border border-border">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Welcome and User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Welcome back, {profile?.full_name?.split(' ')?.[0] || profile?.username || 'Engineer'}! 🚀
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Ready to advance your engineering mastery?
                    </p>
                  </div>
                </div>
                
                {/* Level and XP Progress */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Level</span>
                      <span className="text-2xl font-bold text-primary">
                        {levelProgress?.currentLevel || profile?.current_level || 1}
                      </span>
                    </div>
                    {levelProgress && (
                      <div className="flex-1 min-w-32">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{levelProgress?.progressXP} XP</span>
                          <span>{levelProgress?.requiredXP} XP to next level</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${levelProgress?.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Streak Tracker and XP Ring */}
              <div className="flex items-center gap-6">
                <StreakTracker 
                  streakData={streakData}
                  userId={user?.id}
                />
                <XPProgressRing 
                  currentXP={profile?.total_xp || 0}
                  levelProgress={levelProgress}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActionCards 
            userId={user?.id}
            dailyChallenge={dashboardData?.dailyChallenge}
            challengeCompleted={dashboardData?.challengeCompleted}
            onChallengeComplete={handleChallengeComplete}
            onGoalUpdate={handleGoalUpdate}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Discipline Progress Cards */}
            <DisciplineProgressCards 
              skillProgress={skillProgress}
              userId={user?.id}
            />
            
            {/* Personalized Learning Feed */}
            <PersonalizedFeed 
              recommendations={recommendations}
              userId={user?.id}
              onGoalUpdate={handleGoalUpdate}
            />
            
            {/* Weekly Progress Summary */}
            <WeeklyProgressSummary 
              userId={user?.id}
              recentXP={dashboardData?.recentXP || []}
              streakData={streakData}
            />
          </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-8">
            {/* Learning Goals Panel */}
            <LearningGoalsPanel 
              learningGoals={dashboardData?.learningGoals || []}
              userId={user?.id}
              onGoalUpdate={handleGoalUpdate}
            />
            
            {/* Achievement Notifications */}
            <AchievementNotifications 
              achievements={dashboardData?.achievements || []}
              recentXP={dashboardData?.recentXP || []}
            />
            
            {/* Leaderboard Widget */}
            <LeaderboardWidget 
              leaderboardData={leaderboard}
              currentUser={profile}
            />
          </div>
        </div>

        {/* Mobile-specific bottom spacing */}
        <div className="md:hidden h-20"></div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;