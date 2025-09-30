import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Components
import XPProgressChart from './components/XPProgressChart';
import DisciplineRadarChart from './components/DisciplineRadarChart';
import StreakCalendar from './components/StreakCalendar';
import AchievementTimeline from './components/AchievementTimeline';
import LearningVelocityChart from './components/LearningVelocityChart';
import PerformanceMetrics from './components/PerformanceMetrics';
import ProgressExport from './components/ProgressExport';

const ProgressAnalyticsPage = () => {
  const { user, userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [velocityData, setVelocityData] = useState(null);
  const [competencyData, setCompetencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load main analytics data
      const { data: analytics, error: analyticsError } = await analyticsService?.getUserProgressAnalytics(user?.id);
      if (analyticsError) throw new Error(analyticsError);
      setAnalyticsData(analytics);

      // Load streak data
      const { data: streak, error: streakError } = await analyticsService?.getStreakAnalytics(user?.id);
      if (streakError) throw new Error(streakError);
      setStreakData(streak);

      // Load learning velocity
      const weeks = timeRange === '1month' ? 4 : timeRange === '3months' ? 12 : 26;
      const { data: velocity, error: velocityError } = await analyticsService?.getLearningVelocity(user?.id, weeks);
      if (velocityError) throw new Error(velocityError);
      setVelocityData(velocity);

      // Load discipline competency
      const { data: competency, error: competencyError } = await analyticsService?.getDisciplineCompetency(user?.id);
      if (competencyError) throw new Error(competencyError);
      setCompetencyData(competency);

    } catch (error) {
      setError(`Failed to load analytics: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!analyticsData) return;
    
    const exportData = analyticsService?.formatAnalyticsExport(analyticsData);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-analytics-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Icon name="BarChart" size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your analytics</h2>
            <p className="text-gray-600 mb-8">
              Track your learning progress, skill development, and achievements across all engineering disciplines.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Analytics</h1>
              <p className="text-gray-600">
                Comprehensive insights into your learning journey and skill development
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e?.target?.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>

              {/* Export Button */}
              <Button
                onClick={handleExportData}
                variant="outline"
                iconName="Download"
                className="whitespace-nowrap"
              >
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Icon name="AlertCircle" className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Performance Metrics Overview */}
        <PerformanceMetrics
          data={analyticsData?.progressStats}
          userProfile={userProfile}
          className="mb-8"
        />

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* XP Progress Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Icon name="TrendingUp" className="mr-3 text-blue-500" size={24} />
              XP Progression
            </h3>
            <XPProgressChart
              data={analyticsService?.processXPHistory(analyticsData?.xpHistory)}
              height={300}
            />
          </div>

          {/* Discipline Competency Radar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Icon name="Target" className="mr-3 text-purple-500" size={24} />
              Discipline Competency
            </h3>
            <DisciplineRadarChart
              data={analyticsService?.processDisciplineRadarData(competencyData || {})}
              height={300}
            />
          </div>
        </div>

        {/* Secondary Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Streak Calendar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Icon name="Calendar" className="mr-3 text-green-500" size={24} />
              Learning Streak
            </h3>
            <StreakCalendar
              data={analyticsService?.calculateStreakData(streakData?.dailyActivity)}
              currentStreak={streakData?.currentStreak || 0}
            />
          </div>

          {/* Learning Velocity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Icon name="Zap" className="mr-3 text-yellow-500" size={24} />
              Learning Velocity
            </h3>
            <LearningVelocityChart
              data={velocityData}
              timeRange={timeRange}
            />
          </div>

          {/* Achievement Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Icon name="Award" className="mr-3 text-orange-500" size={24} />
              Recent Achievements
            </h3>
            <AchievementTimeline
              achievements={analyticsData?.achievements?.slice(0, 5) || []}
            />
          </div>
        </div>

        {/* Progress Export Section */}
        <ProgressExport
          analyticsData={analyticsData}
          onExport={handleExportData}
        />
      </div>
    </div>
  );
};

export default ProgressAnalyticsPage;