import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'lesson_completed',
      title: 'Completed Circuit Analysis Basics',
      description: 'Electrical Engineering • Module 3',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      xp: 75,
      icon: 'CheckCircle',
      color: 'var(--color-accent)'
    },
    {
      id: 2,
      type: 'badge_earned',
      title: 'Earned "Circuit Master" Badge',
      description: 'Completed 10 circuit analysis problems',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      icon: 'Award',
      color: 'var(--color-warning)'
    },
    {
      id: 3,
      type: 'streak_milestone',
      title: 'Reached 7-Day Streak!',
      description: 'Keep up the momentum',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      icon: 'Flame',
      color: 'var(--color-error)'
    },
    {
      id: 4,
      type: 'challenge_completed',
      title: 'Daily Challenge Completed',
      description: 'Thermodynamics Problem Set',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      xp: 150,
      icon: 'Target',
      color: 'var(--color-primary)'
    },
    {
      id: 5,
      type: 'level_up',
      title: 'Level Up! Reached Level 12',
      description: 'Unlocked new Mechatronics modules',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      icon: 'TrendingUp',
      color: 'var(--color-accent)'
    },
    {
      id: 6,
      type: 'friend_activity',
      title: 'Jessica Park completed a lesson',
      description: 'Aerospace Engineering • Aerodynamics',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      icon: 'Users',
      color: 'var(--color-secondary)'
    }
  ];

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return timestamp?.toLocaleDateString();
  };

  const getActivityIcon = (activity) => {
    if (activity?.type === 'friend_activity' && activity?.avatar) {
      return (
        <div className="relative">
          <Image
            src={activity?.avatar}
            alt="Friend avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-card rounded-full flex items-center justify-center border border-border">
            <Icon name={activity?.icon} size={10} color={activity?.color} />
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${activity?.color}20` }}
      >
        <Icon name={activity?.icon} size={16} color={activity?.color} />
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-150">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity, index) => (
          <div key={activity?.id} className="flex items-start space-x-3">
            {/* Activity Icon */}
            {getActivityIcon(activity)}
            
            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{activity?.title}</p>
                  <p className="text-sm text-muted-foreground">{activity?.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">{getTimeAgo(activity?.timestamp)}</span>
                    {activity?.xp && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center space-x-1">
                          <Icon name="Plus" size={10} color="var(--color-accent)" />
                          <span className="text-xs text-accent font-medium">{activity?.xp} XP</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline connector */}
            {index < activities?.length - 1 && (
              <div className="absolute left-10 mt-10 w-px h-6 bg-border"></div>
            )}
          </div>
        ))}
      </div>
      {/* Load More */}
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center justify-center space-x-2">
          <Icon name="MoreHorizontal" size={16} />
          <span>Load more activities</span>
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;