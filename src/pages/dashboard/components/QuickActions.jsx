import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActions = () => {
  const quickActions = [
    {
      id: 'resume',
      title: 'Resume Learning',
      description: 'Continue where you left off',
      icon: 'Play',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
      route: '/lesson-interface',
      lastLesson: 'Signal Processing Fundamentals',
      progress: 68
    },
    {
      id: 'challenge',
      title: 'Daily Challenge',
      description: 'Earn bonus XP today',
      icon: 'Target',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10',
      route: '/simulation-lab',
      timeLeft: '14h 32m',
      xpReward: 150
    },
    {
      id: 'explore',
      title: 'Explore Content',
      description: 'Discover new topics',
      icon: 'Compass',
      color: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
      route: '/learning-roadmap',
      newContent: 3
    },
    {
      id: 'lab',
      title: 'Simulation Lab',
      description: 'Practice with interactive tools',
      icon: 'FlaskConical',
      color: 'var(--color-secondary)',
      bgColor: 'bg-secondary/10',
      route: '/simulation-lab',
      activeSimulations: 2
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => (
          <Link
            key={action?.id}
            to={action?.route}
            className="group block"
          >
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-102">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${action?.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon name={action?.icon} size={20} color={action?.color} />
                </div>
                <Icon 
                  name="ArrowUpRight" 
                  size={16} 
                  className="text-muted-foreground group-hover:text-foreground transition-colors duration-150" 
                />
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">{action?.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{action?.description}</p>
              
              {/* Action-specific details */}
              <div className="space-y-2">
                {action?.id === 'resume' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium text-foreground">{action?.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full"
                        style={{ width: `${action?.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{action?.lastLesson}</p>
                  </div>
                )}
                
                {action?.id === 'challenge' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} color="var(--color-muted-foreground)" />
                      <span className="text-xs text-muted-foreground">{action?.timeLeft} left</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Award" size={12} color="var(--color-accent)" />
                      <span className="text-xs font-medium text-accent">{action?.xpReward} XP</span>
                    </div>
                  </div>
                )}
                
                {action?.id === 'explore' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-xs text-accent font-medium">{action?.newContent} new modules available</span>
                  </div>
                )}
                
                {action?.id === 'lab' && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Activity" size={12} color="var(--color-secondary)" />
                    <span className="text-xs text-secondary font-medium">{action?.activeSimulations} active simulations</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;