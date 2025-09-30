import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Calendar, Download, RefreshCw, Activity } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../../../services/adminService';

const AnalyticsOverviewTab = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminService?.getAnalyticsOverview(timeRange);
      
      if (error) {
        console.error('Error loading analytics:', error);
      } else {
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatEventType = (eventType) => {
    return eventType?.split('_')?.map(word => 
      word?.charAt(0)?.toUpperCase() + word?.slice(1)
    )?.join(' ');
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'lesson_started': 'bg-blue-100 text-blue-800',
      'lesson_completed': 'bg-green-100 text-green-800',
      'daily_login': 'bg-purple-100 text-purple-800',
      'achievement_earned': 'bg-yellow-100 text-yellow-800',
      'page_viewed': 'bg-gray-100 text-gray-800',
      'subscription_purchased': 'bg-orange-100 text-orange-800'
    };
    return colors?.[eventType] || 'bg-gray-100 text-gray-800';
  };

  const getTopEvents = () => {
    if (!analyticsData?.eventsByType) return [];
    
    return Object?.entries(analyticsData?.eventsByType)
      ?.sort(([,a], [,b]) => b - a)
      ?.slice(0, 6);
  };

  const getDailyActivityChart = () => {
    if (!analyticsData?.dailyActivity) return [];
    
    const sortedDays = Object?.entries(analyticsData?.dailyActivity)
      ?.sort(([a], [b]) => new Date(a) - new Date(b))
      ?.slice(-7); // Last 7 days
      
    return sortedDays?.map(([date, count]) => ({
      date: new Date(date)?.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      count
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)]?.map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-600 text-sm">
            Platform engagement metrics, user behavior patterns, and performance indicators
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e?.target?.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`
              flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 
              rounded-lg hover:bg-gray-50 transition-colors
              ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Events */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.totalEvents?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last {timeRange} days
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Unique Users */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.uniqueUsers?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active learners
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average Events Per User */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Events/User</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.uniqueUsers > 0 
                    ? Math?.round(analyticsData?.totalEvents / analyticsData?.uniqueUsers) 
                    : '0'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Engagement rate
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Time Period */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analysis Period</p>
                <p className="text-2xl font-bold text-gray-900">{timeRange}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Days analyzed
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Types Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Event Types</h3>
            <span className="text-sm text-gray-500">Most frequent activities</span>
          </div>
          
          <div className="space-y-4">
            {getTopEvents()?.map(([eventType, count]) => {
              const percentage = analyticsData?.totalEvents > 0 
                ? Math?.round((count / analyticsData?.totalEvents) * 100) 
                : 0;
              
              return (
                <div key={eventType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(eventType)}`}>
                      {formatEventType(eventType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
            
            {getTopEvents()?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No event data available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Activity</h3>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          
          <div className="space-y-4">
            {getDailyActivityChart()?.map((day, index) => {
              const maxCount = Math?.max(...getDailyActivityChart()?.map(d => d?.count));
              const percentage = maxCount > 0 ? (day?.count / maxCount) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-gray-600 font-medium">
                    {day?.date}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 font-medium text-right">
                    {day?.count}
                  </div>
                </div>
              );
            })}
            
            {getDailyActivityChart()?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No daily activity data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Learning Activity</span>
            </div>
            <p className="text-sm text-blue-800">
              {analyticsData?.eventsByType?.lesson_completed || 0} lessons completed
              with {analyticsData?.eventsByType?.lesson_started || 0} lessons started
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">User Engagement</span>
            </div>
            <p className="text-sm text-green-800">
              {analyticsData?.eventsByType?.daily_login || 0} daily logins
              from {analyticsData?.uniqueUsers} unique users
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Achievements</span>
            </div>
            <p className="text-sm text-purple-800">
              {analyticsData?.eventsByType?.achievement_earned || 0} achievements earned
              across all users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverviewTab;