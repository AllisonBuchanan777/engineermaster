import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AchievementsPanel = () => {
  const recentBadges = [
    {
      id: 1,
      name: 'Circuit Master',
      description: 'Completed 10 circuit analysis problems',
      icon: 'Award',
      color: 'var(--color-warning)',
      earnedDate: '2025-09-12',
      rarity: 'Common'
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Maintained 7-day learning streak',
      icon: 'Flame',
      color: 'var(--color-error)',
      earnedDate: '2025-09-10',
      rarity: 'Uncommon'
    },
    {
      id: 3,
      name: 'Quick Learner',
      description: 'Completed lesson in under 15 minutes',
      icon: 'Zap',
      color: 'var(--color-accent)',
      earnedDate: '2025-09-08',
      rarity: 'Common'
    }
  ];

  const upcomingMilestones = [
    {
      id: 1,
      name: 'Engineering Prodigy',
      description: 'Reach Level 15',
      icon: 'Trophy',
      progress: 80,
      requirement: 'Level 15',
      current: 'Level 12'
    },
    {
      id: 2,
      name: 'Streak Legend',
      description: 'Maintain 30-day streak',
      icon: 'Target',
      progress: 23,
      requirement: '30 days',
      current: '7 days'
    },
    {
      id: 3,
      name: 'Multi-Disciplinary',
      description: 'Complete modules in all 4 disciplines',
      icon: 'Layers',
      progress: 50,
      requirement: '4 disciplines',
      current: '2 disciplines'
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
        <Button variant="ghost" size="sm" iconName="ExternalLink" iconSize={16}>
          View All
        </Button>
      </div>
      {/* Recent Badges */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Recent Badges</h3>
        <div className="space-y-3">
          {recentBadges?.map((badge) => (
            <div key={badge?.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-150">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name={badge?.icon} size={20} color={badge?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-foreground text-sm">{badge?.name}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    badge?.rarity === 'Common' ? 'bg-muted text-muted-foreground' :
                    badge?.rarity === 'Uncommon'? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                  }`}>
                    {badge?.rarity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{badge?.description}</p>
                <p className="text-xs text-muted-foreground">Earned {new Date(badge.earnedDate)?.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Upcoming Milestones */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Upcoming Milestones</h3>
        <div className="space-y-4">
          {upcomingMilestones?.map((milestone) => (
            <div key={milestone?.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name={milestone?.icon} size={16} color="var(--color-muted-foreground)" />
                  <span className="text-sm font-medium text-foreground">{milestone?.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{milestone?.current}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${milestone?.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{milestone?.description}</p>
                <span className="text-xs text-muted-foreground">{milestone?.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;