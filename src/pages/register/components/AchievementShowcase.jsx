import React from 'react';
import Icon from '../../../components/AppIcon';

const AchievementShowcase = () => {
  const achievements = [
    {
      id: 1,
      icon: 'Zap',
      title: 'Circuit Master',
      description: 'Complete 50 electrical circuit challenges',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 2,
      icon: 'Cog',
      title: 'Mechanical Genius',
      description: 'Master thermodynamics fundamentals',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 3,
      icon: 'Rocket',
      title: 'Space Pioneer',
      description: 'Design your first spacecraft',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 4,
      icon: 'Bot',
      title: 'Robotics Expert',
      description: 'Build 10 mechatronic systems',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const stats = [
    {
      icon: 'Users',
      value: '50,000+',
      label: 'Active Learners',
      color: 'text-primary'
    },
    {
      icon: 'BookOpen',
      value: '1,200+',
      label: 'Interactive Lessons',
      color: 'text-accent'
    },
    {
      icon: 'Award',
      value: '95%',
      label: 'Success Rate',
      color: 'text-warning'
    },
    {
      icon: 'Target',
      value: '4.9/5',
      label: 'User Rating',
      color: 'text-success'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Platform Stats */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
          Join the Engineering Revolution
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {stats?.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Icon name={stat?.icon} size={20} className={stat?.color} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat?.value}</div>
              <div className="text-sm text-muted-foreground">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Achievement Badges */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
          Unlock Achievement Badges
        </h3>
        <div className="space-y-4">
          {achievements?.map((achievement) => (
            <div
              key={achievement?.id}
              className={`flex items-center space-x-4 p-4 rounded-xl border ${achievement?.bgColor} ${achievement?.borderColor}`}
            >
              <div className={`w-12 h-12 rounded-full bg-white border-2 ${achievement?.borderColor} flex items-center justify-center`}>
                <Icon name={achievement?.icon} size={20} className={achievement?.color} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">{achievement?.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Learning Path Preview */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
          Your Learning Journey
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="Play" size={16} color="white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Start with Fundamentals</div>
              <div className="text-xs text-muted-foreground">Build your engineering foundation</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 opacity-60">
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
              <Icon name="Lock" size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground">Advanced Concepts</div>
              <div className="text-xs text-muted-foreground">Unlock with progress</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 opacity-40">
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
              <Icon name="Lock" size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground">Expert Challenges</div>
              <div className="text-xs text-muted-foreground">Master-level problems</div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonial */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-border">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="Quote" size={24} className="text-primary" />
          </div>
          <blockquote className="text-sm text-foreground mb-4 italic">
            "EngineerMaster transformed how I learn engineering. The gamified approach made complex concepts actually enjoyable to master!"
          </blockquote>
          <div className="text-sm font-medium text-foreground">Sarah Chen</div>
          <div className="text-xs text-muted-foreground">Aerospace Engineering Student, MIT</div>
        </div>
      </div>
    </div>
  );
};

export default AchievementShowcase;