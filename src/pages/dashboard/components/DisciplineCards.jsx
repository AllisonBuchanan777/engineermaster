import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DisciplineCards = () => {
  const disciplines = [
    {
      id: 'electrical',
      name: 'Electrical Engineering',
      icon: 'Zap',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
      progress: 68,
      completedModules: 12,
      totalModules: 18,
      nextLesson: 'Signal Processing Fundamentals',
      estimatedTime: '25 min',
      description: 'Master circuits, electronics, and power systems'
    },
    {
      id: 'mechanical',
      name: 'Mechanical Engineering',
      icon: 'Cog',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10',
      progress: 45,
      completedModules: 8,
      totalModules: 16,
      nextLesson: 'Thermodynamics Principles',
      estimatedTime: '30 min',
      description: 'Explore mechanics, materials, and thermal systems'
    },
    {
      id: 'mechatronics',
      name: 'Mechatronics',
      icon: 'Bot',
      color: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
      progress: 32,
      completedModules: 5,
      totalModules: 14,
      nextLesson: 'Sensor Integration Basics',
      estimatedTime: '35 min',
      description: 'Combine mechanical and electrical systems'
    },
    {
      id: 'aerospace',
      name: 'Aerospace Engineering',
      icon: 'Rocket',
      color: 'var(--color-secondary)',
      bgColor: 'bg-secondary/10',
      progress: 15,
      completedModules: 2,
      totalModules: 20,
      nextLesson: 'Aerodynamics Introduction',
      estimatedTime: '40 min',
      description: 'Design aircraft and spacecraft systems'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Engineering Disciplines</h2>
        <Link 
          to="/learning-roadmap"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-150"
        >
          View All Roadmaps
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {disciplines?.map((discipline) => (
          <div key={discipline?.id} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${discipline?.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon name={discipline?.icon} size={24} color={discipline?.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{discipline?.name}</h3>
                  <p className="text-sm text-muted-foreground">{discipline?.description}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-foreground">{discipline?.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${discipline?.progress}%`,
                    backgroundColor: discipline?.color
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {discipline?.completedModules} of {discipline?.totalModules} modules completed
              </p>
            </div>

            {/* Next Lesson */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">Next Lesson</span>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                  <span className="text-xs text-muted-foreground">{discipline?.estimatedTime}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{discipline?.nextLesson}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                iconName="Play"
                iconPosition="left"
                iconSize={16}
              >
                Continue
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                iconName="BookOpen"
                iconSize={16}
              >
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisciplineCards;