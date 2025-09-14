import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModulePreview = ({ module, onClose, onStartModule }) => {
  if (!module) return null;

  const getDisciplineColor = (discipline) => {
    const colors = {
      electrical: 'text-blue-600 bg-blue-50',
      mechanical: 'text-green-600 bg-green-50',
      mechatronics: 'text-purple-600 bg-purple-50',
      aerospace: 'text-red-600 bg-red-50',
      innovation: 'text-amber-600 bg-amber-50'
    };
    return colors?.[discipline] || 'text-gray-600 bg-gray-50';
  };

  const getDifficultyStars = (difficulty) => {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return levels?.[difficulty] || 1;
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name={getStatusIcon(module.status)} size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{module.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDisciplineColor(module.discipline)}`}>
                  {module.discipline?.charAt(0)?.toUpperCase() + module.discipline?.slice(1)}
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(4)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={14}
                      className={i < getDifficultyStars(module.difficulty) ? 'text-amber-400' : 'text-muted-foreground/30'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Module Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Icon name="Clock" size={20} className="text-primary mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">{module.estimatedTime}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Icon name="Zap" size={20} className="text-accent mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">{module.xpReward} XP</div>
              <div className="text-xs text-muted-foreground">Reward</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Icon name="Users" size={20} className="text-secondary mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">{module.completedBy?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Icon name="Target" size={20} className="text-warning mx-auto mb-1" />
              <div className="text-sm font-medium text-foreground">{module.difficulty}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">About This Module</h3>
            <p className="text-muted-foreground leading-relaxed">{module.description}</p>
          </div>

          {/* Learning Objectives */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Learning Objectives</h3>
            <ul className="space-y-2">
              {module.objectives?.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Concepts */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Key Concepts</h3>
            <div className="flex flex-wrap gap-2">
              {module.keyConcepts?.map((concept, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {module.prerequisites?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Prerequisites</h3>
              <div className="space-y-2">
                {module.prerequisites?.map((prereq, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                    <Icon name="GitBranch" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{prereq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress (for in-progress modules) */}
          {module.status === 'in-progress' && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Your Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium text-foreground">{module.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center space-x-3">
            {module.status === 'available' && (
              <Button onClick={() => onStartModule(module)} iconName="Play" iconPosition="left">
                Start Module
              </Button>
            )}
            {module.status === 'in-progress' && (
              <Button onClick={() => onStartModule(module)} iconName="ArrowRight" iconPosition="right">
                Continue Learning
              </Button>
            )}
            {module.status === 'completed' && (
              <Button variant="outline" onClick={() => onStartModule(module)} iconName="RotateCcw" iconPosition="left">
                Review Module
              </Button>
            )}
            {module.status === 'locked' && (
              <Button disabled iconName="Lock" iconPosition="left">
                Locked
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreview;