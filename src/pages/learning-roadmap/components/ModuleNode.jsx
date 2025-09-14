import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModuleNode = ({ module, onModuleClick, style, isConnected = false }) => {
  const getDisciplineColor = (discipline) => {
    const colors = {
      electrical: 'bg-blue-500',
      mechanical: 'bg-green-500',
      mechatronics: 'bg-purple-500',
      aerospace: 'bg-red-500',
      innovation: 'bg-amber-500'
    };
    return colors?.[discipline] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: 'CheckCircle',
      'in-progress': 'Clock',
      available: 'Play',
      locked: 'Lock'
    };
    return icons?.[status] || 'Circle';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-success',
      'in-progress': 'text-warning',
      available: 'text-primary',
      locked: 'text-muted-foreground'
    };
    return colors?.[status] || 'text-muted-foreground';
  };

  const getDifficultyStars = (difficulty) => {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return levels?.[difficulty] || 1;
  };

  return (
    <div 
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
        module.status === 'locked' ? 'opacity-60' : ''
      }`}
      style={style}
    >
      <div
        className={`relative bg-card border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer min-w-64 max-w-80 ${
          module.status === 'locked' ?'border-muted' 
            : `border-transparent hover:border-primary ${isConnected ? 'ring-2 ring-primary/20' : ''}`
        }`}
        onClick={() => onModuleClick(module)}
      >
        {/* Discipline Indicator */}
        <div className={`absolute -top-2 -right-2 w-6 h-6 ${getDisciplineColor(module.discipline)} rounded-full border-2 border-card`}></div>
        
        {/* Status Icon */}
        <div className="flex items-center justify-between mb-3">
          <Icon 
            name={getStatusIcon(module.status)} 
            size={20} 
            className={getStatusColor(module.status)}
          />
          <div className="flex items-center space-x-1">
            {[...Array(4)]?.map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={12}
                className={i < getDifficultyStars(module.difficulty) ? 'text-amber-400' : 'text-muted-foreground/30'}
              />
            ))}
          </div>
        </div>

        {/* Module Title */}
        <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
          {module.title}
        </h3>

        {/* Module Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Icon name="Clock" size={12} />
              <span>{module.estimatedTime}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon name="Users" size={12} />
              <span>{module.completedBy?.toLocaleString()}</span>
            </span>
          </div>
          
          {module.prerequisites?.length > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="GitBranch" size={12} />
              <span>{module.prerequisites?.length} prerequisite{module.prerequisites?.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Progress Bar (for in-progress modules) */}
        {module.status === 'in-progress' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{module.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${module.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* XP Reward */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <span className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Zap" size={12} />
            <span>{module.xpReward} XP</span>
          </span>
          {module.status === 'available' && (
            <Button size="xs" variant="outline">
              Start
            </Button>
          )}
          {module.status === 'in-progress' && (
            <Button size="xs" variant="default">
              Continue
            </Button>
          )}
          {module.status === 'completed' && (
            <Button size="xs" variant="ghost">
              Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleNode;