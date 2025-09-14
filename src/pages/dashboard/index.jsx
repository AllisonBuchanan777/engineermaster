import React from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProgressOverview from './components/ProgressOverview';
import DisciplineCards from './components/DisciplineCards';
import AchievementsPanel from './components/AchievementsPanel';
import DailyChallenge from './components/DailyChallenge';
import LeaderboardPanel from './components/LeaderboardPanel';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 pb-20 md:pb-8">
        <Breadcrumb />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, Alex! 👋
              </h1>
              <p className="text-muted-foreground">
                Ready to continue your engineering journey? You're doing great!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Today's Goal</div>
                <div className="text-lg font-semibold text-foreground">Complete 2 lessons</div>
                <div className="w-32 bg-muted rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mb-8">
          <ProgressOverview />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Discipline Cards */}
            <DisciplineCards />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-8">
            {/* Daily Challenge */}
            <DailyChallenge />
            
            {/* Achievements Panel */}
            <AchievementsPanel />
            
            {/* Leaderboard Panel */}
            <LeaderboardPanel />
          </div>
        </div>

        {/* Mobile Goal Progress */}
        <div className="md:hidden mb-6">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Today's Goal</span>
              <span className="text-sm text-muted-foreground">1/2 completed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-1/2"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Complete 2 lessons</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;