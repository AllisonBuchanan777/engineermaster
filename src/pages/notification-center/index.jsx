import React, { useState, useEffect } from 'react';
import { Bell, Settings, Filter, Search, X, Eye, CheckCircle, Clock, Award, BookOpen, Zap, User, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { analyticsService } from '../../services/analyticsService';
import Icon from '../../components/AppIcon';


const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  const categories = [
    { id: 'all', label: 'All Notifications', icon: Bell, count: 0 },
    { id: 'achievement_earned', label: 'Achievements', icon: Award, count: 0 },
    { id: 'lesson_completed', label: 'Learning Progress', icon: BookOpen, count: 0 },
    { id: 'daily_challenge', label: 'Challenges', icon: Zap, count: 0 },
    { id: 'community_activity', label: 'Community', icon: User, count: 0 },
    { id: 'system_announcement', label: 'System Updates', icon: Info, count: 0 }
  ];

  const priorities = [
    { id: 'all', label: 'All Priorities' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'high', label: 'High' },
    { id: 'normal', label: 'Normal' },
    { id: 'low', label: 'Low' }
  ];

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadPreferences();
      analyticsService?.trackPageView('Notification Center', user?.id);
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedCategory, selectedPriority, searchTerm]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await notificationService?.getUserNotifications(user?.id, {
        limit: 100
      });
      
      if (error) {
        console.error('Error loading notifications:', error);
      } else {
        setNotifications(data || []);
      }

      // Load unread count
      const { count, error: countError } = await notificationService?.getUnreadCount(user?.id);
      if (!countError) {
        setUnreadCount(count || 0);
      }
      
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data, error } = await notificationService?.getUserPreferences(user?.id);
      if (error) {
        console.error('Error loading preferences:', error);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(notification => notification?.type === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered?.filter(notification => notification?.priority === selectedPriority);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered?.filter(notification =>
        notification?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        notification?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);

    // Update category counts
    categories?.forEach(category => {
      if (category?.id === 'all') {
        category.count = notifications?.length || 0;
      } else {
        category.count = notifications?.filter(n => n?.type === category?.id)?.length || 0;
      }
    });
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { data, error } = await notificationService?.markAsRead(notificationId, user?.id);
      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev?.map(notification =>
          notification?.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date()?.toISOString() }
            : notification
        )
      );

      setUnreadCount(prev => Math?.max(0, prev - 1));
      
      analyticsService?.trackEngagement('mark_as_read', 'notification', user?.id, {
        notification_id: notificationId
      });
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data, error } = await notificationService?.markAllAsRead(user?.id);
      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev?.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date()?.toISOString() 
        }))
      );

      setUnreadCount(0);
      
      analyticsService?.trackEngagement('mark_all_as_read', 'notifications', user?.id);
      
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDismissNotification = async (notificationId) => {
    try {
      const { data, error } = await notificationService?.dismissNotification(notificationId, user?.id);
      if (error) {
        console.error('Error dismissing notification:', error);
        return;
      }

      // Remove from local state
      setNotifications(prev => prev?.filter(n => n?.id !== notificationId));
      
      analyticsService?.trackEngagement('dismiss', 'notification', user?.id, {
        notification_id: notificationId
      });
      
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification?.is_read) {
      await handleMarkAsRead(notification?.id);
    }

    // Navigate to action URL if available
    if (notification?.action_url) {
      window.location.href = notification?.action_url;
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconMap = {
      achievement_earned: Award,
      lesson_completed: BookOpen,
      daily_challenge: Zap,
      community_activity: User,
      system_announcement: Info,
      lesson_reminder: Clock
    };

    const IconComponent = iconMap[type] || Bell;
    const priorityColors = {
      urgent: 'text-red-500',
      high: 'text-orange-500',
      normal: 'text-blue-500',
      low: 'text-gray-500'
    };

    return <IconComponent className={`h-5 w-5 ${priorityColors[priority] || 'text-gray-500'}`} />;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || colors.normal}`}>
        {priority?.charAt(0)?.toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math?.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math?.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math?.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math?.floor(diffInSeconds / 86400)}d ago`;
    
    return date?.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border p-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  {[...Array(6)]?.map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg border p-6">
                  {[...Array(8)]?.map((_, i) => (
                    <div key={i} className="border-b border-gray-200 pb-4 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-8 w-8 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              <p className="text-gray-600">
                Stay updated with your learning progress and community activities
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark All Read</span>
              </button>
            )}
            
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories?.map((category) => {
                  const Icon = category?.icon;
                  return (
                    <button
                      key={category?.id}
                      onClick={() => setSelectedCategory(category?.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                        ${selectedCategory === category?.id
                          ? 'bg-blue-100 text-blue-700' :'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4" />
                        <span>{category?.label}</span>
                      </div>
                      {category?.count > 0 && (
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${selectedCategory === category?.id
                            ? 'bg-blue-200 text-blue-800' :'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {category?.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority</h3>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {priorities?.map((priority) => (
                  <option key={priority?.id} value={priority?.id}>
                    {priority?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCategory === 'all' ?'All Notifications' 
                      : categories?.find(c => c?.id === selectedCategory)?.label
                    }
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredNotifications?.length} notification{filteredNotifications?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-200">
                {filteredNotifications?.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all' ?'No notifications match your current filters' :'No notifications yet'
                      }
                    </p>
                  </div>
                ) : (
                  filteredNotifications?.map((notification) => (
                    <div
                      key={notification?.id}
                      className={`
                        p-6 hover:bg-gray-50 transition-colors cursor-pointer
                        ${!notification?.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Icon */}
                          <div className={`
                            p-2 rounded-lg
                            ${!notification?.is_read ? 'bg-blue-100' : 'bg-gray-100'}
                          `}>
                            {getNotificationIcon(notification?.type, notification?.priority)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`
                                text-sm font-medium
                                ${!notification?.is_read ? 'text-gray-900' : 'text-gray-700'}
                              `}>
                                {notification?.title}
                              </h3>
                              {!notification?.is_read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                              {getPriorityBadge(notification?.priority)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {notification?.message}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(notification?.created_at)}</span>
                              </div>
                              
                              {notification?.action_url && (
                                <div className="flex items-center space-x-1 text-blue-600">
                                  <ExternalLink className="h-3 w-3" />
                                  <span>{notification?.action_label || 'View'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification?.is_read && (
                            <button
                              onClick={(e) => {
                                e?.stopPropagation();
                                handleMarkAsRead(notification?.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e?.stopPropagation();
                              handleDismissNotification(notification?.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Dismiss"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More */}
              {filteredNotifications?.length >= 20 && (
                <div className="px-6 py-4 border-t border-gray-200 text-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Load More Notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;