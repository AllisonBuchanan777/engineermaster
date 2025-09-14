import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendedNext = ({ modules, onModuleClick }) => {
  // Get recommended modules based on user progress and prerequisites
  const getRecommendedModules = () => {
    const availableModules = modules?.filter(m => m?.status === 'available');
    const completedModules = modules?.filter(m => m?.status === 'completed');
    const completedTitles = completedModules?.map(m => m?.title);
    
    // Filter modules where all prerequisites are completed
    const readyModules = availableModules?.filter(module => 
      module.prerequisites?.every(prereq => completedTitles?.includes(prereq))
    );
    
    // Sort by priority (fewer prerequisites first, then by XP reward)
    return readyModules?.sort((a, b) => {
        if (a?.prerequisites?.length !== b?.prerequisites?.length) {
          return a?.prerequisites?.length - b?.prerequisites?.length;
        }
        return b?.xpReward - a?.xpReward;
      })?.slice(0, 3);
  };

  const recommendedModules = getRecommendedModules();

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

  const getDifficultyStars = (difficulty) => {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return levels?.[difficulty] || 1;
  };

  if (recommendedModules?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recommended Next Steps</h2>
        <div className="text-center py-8">
          <Icon name="Trophy" size={48} className="text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Great Progress!</h3>
          <p className="text-muted-foreground">
            You've completed all available modules. Check back for new content or review completed modules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Recommended Next Steps</h2>
        <Icon name="Target" size={20} className="text-primary" />
      </div>
      <p className="text-muted-foreground mb-6">
        Based on your progress, here are the modules you're ready to tackle next:
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendedModules?.map((module, index) => (
          <div
            key={module.id}
            className="relative bg-muted/50 border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onModuleClick(module)}
          >
            {/* Priority Badge */}
            {index === 0 && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                #1 Pick
              </div>
            )}

            {/* Discipline Indicator */}
            <div className={`absolute -top-2 -left-2 w-6 h-6 ${getDisciplineColor(module.discipline)} rounded-full border-2 border-card`}></div>

            {/* Module Info */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground capitalize">
                    {module.discipline}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(4)]?.map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={10}
                        className={i < getDifficultyStars(module.difficulty) ? 'text-amber-400' : 'text-muted-foreground/30'}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} />
                  <span>{module.estimatedTime}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Icon name="Zap" size={12} />
                  <span>{module.xpReward} XP</span>
                </span>
              </div>

              {module.prerequisites?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1 mb-1">
                    <Icon name="CheckCircle" size={12} className="text-success" />
                    <span>Prerequisites completed</span>
                  </div>
                </div>
              )}

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e?.stopPropagation();
                  onModuleClick(module);
                }}
              >
                Start Learning
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Call to Action */}
      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <div className="flex items-center space-x-3">
          <Icon name="Lightbulb" size={20} className="text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Focus on completing modules in order to unlock advanced topics and innovation challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedNext;