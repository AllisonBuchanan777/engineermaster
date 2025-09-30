import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, Settings, BarChart3, Shield, Download, RefreshCw, TrendingUp, Activity, Database, Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { analyticsService } from '../../services/analyticsService';

// Components
import ContentManagementTab from './components/ContentManagementTab';
import UserAdministrationTab from './components/UserAdministrationTab';
import AnalyticsOverviewTab from './components/AnalyticsOverviewTab';
import SystemSettingsTab from './components/SystemSettingsTab';
import Icon from '../../components/AppIcon';


const AdminCMSDashboard = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const [systemStats, setSystemStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      // Redirect non-admin users
      if (window && window.location) {
        window.location.href = '/dashboard';
      }
      return;
    }
    
    loadDashboardData();
    analyticsService?.trackPageView('Admin CMS Dashboard', user?.id, {
      admin_section: 'overview'
    });
  }, [user, userProfile]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load system statistics
      const { data: stats, error: statsError } = await adminService?.getSystemStats();
      if (statsError) {
        console.error('Error loading system stats:', statsError);
      } else {
        setSystemStats(stats);
      }

      // Load recent admin activity
      const { data: activity, error: activityError } = await adminService?.getAuditLogs({
        limit: 10
      });
      if (activityError) {
        console.error('Error loading recent activity:', activityError);
      } else {
        setRecentActivity(activity || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const tabs = [
    { 
      id: 'content', 
      label: 'Content Management', 
      icon: BookOpen,
      description: 'Manage lessons, courses, and learning materials'
    },
    { 
      id: 'users', 
      label: 'User Administration', 
      icon: Users,
      description: 'View and manage user accounts and permissions' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics Overview', 
      icon: BarChart3,
      description: 'Platform metrics and user engagement data'
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: Settings,
      description: 'Platform configuration and security settings'
    }
  ];

  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need administrator privileges to access this area.
          </p>
          <button 
            onClick={() => {
              if (window && window.location) {
                window.location.href = '/dashboard';
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin CMS Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive platform administration and content management
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
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
              <span className="text-sm font-medium">Export Data</span>
            </button>
          </div>
        </div>

        {/* System Overview Cards */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats?.users?.total?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {systemStats?.users?.active || 0} active this month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Lessons */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats?.lessons?.total?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {systemStats?.lessons?.published || 0} published
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats?.subscriptions?.total?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Excellent</p>
                  <p className="text-xs text-gray-500 mt-1">
                    99.9% uptime
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs?.map((tab) => {
                const Icon = tab?.icon;
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab?.id
                        ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab?.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {tab?.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'content' && <ContentManagementTab />}
            {activeTab === 'users' && <UserAdministrationTab />}
            {activeTab === 'analytics' && <AnalyticsOverviewTab />}
            {activeTab === 'settings' && <SystemSettingsTab />}
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        {recentActivity?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                Recent Admin Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity?.slice(0, 5)?.map((activity) => (
                <div key={activity?.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Database className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity?.action_description}
                      </p>
                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{activity?.admin_user?.full_name || 'Unknown Admin'}</span>
                        <Calendar className="h-3 w-3 ml-2" />
                        <span>{new Date(activity?.created_at)?.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${activity?.action_type === 'user_management' ? 'bg-blue-100 text-blue-800' :
                          activity?.action_type === 'lesson_management' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        {activity?.action_type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMSDashboard;