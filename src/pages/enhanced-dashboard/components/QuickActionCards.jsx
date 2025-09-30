import React from 'react';
import { 
  Play, 
  Target, 
  BookOpen, 
  Trophy,
  Clock,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const QuickActionCards = ({ 
  userId, 
  dailyChallenge, 
  challengeCompleted, 
  onChallengeComplete, 
  onGoalUpdate 
}) => {
  const quickActions = [
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      description: 'Resume your last lesson',
      icon: Play,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      action: () => {
        // Navigate to last lesson or learning path
        console.log('Continue learning');
      }
    },
    {
      id: 'daily-challenge',
      title: challengeCompleted ? 'Challenge Complete!' : 'Daily Challenge',
      description: challengeCompleted 
        ? 'Come back tomorrow for a new challenge' 
        : dailyChallenge?.description?.substring(0, 50) + '...' || 'No challenge available',
      icon: challengeCompleted ? CheckCircle : Target,
      color: challengeCompleted ? 'from-green-500 to-green-600' : 'from-orange-500 to-red-500',
      bgColor: challengeCompleted 
        ? 'bg-green-50 dark:bg-green-900/20' :'bg-orange-50 dark:bg-orange-900/20',
      borderColor: challengeCompleted 
        ? 'border-green-200 dark:border-green-800' :'border-orange-200 dark:border-orange-800',
      disabled: challengeCompleted || !dailyChallenge,
      action: () => {
        if (dailyChallenge && !challengeCompleted) {
          onChallengeComplete(dailyChallenge?.id);
        }
      }
    },
    {
      id: 'explore-lessons',
      title: 'Explore Lessons',
      description: 'Discover new engineering topics',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      action: () => {
        // Navigate to lessons/courses page
        console.log('Explore lessons');
      }
    },
    {
      id: 'view-achievements',
      title: 'Achievements',
      description: 'Check your progress and badges',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      action: () => {
        // Navigate to achievements page
        console.log('View achievements');
      }
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => {
          const IconComponent = action?.icon;
          
          return (
            <button
              key={action?.id}
              onClick={action?.action}
              disabled={action?.disabled}
              className={`${action?.bgColor} ${action?.borderColor} border rounded-lg p-4 text-left hover:shadow-md transition-all duration-200 group ${
                action?.disabled 
                  ? 'opacity-60 cursor-not-allowed' :'hover:scale-[1.02] cursor-pointer'
              }`}
            >
              {/* Icon and Title */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${action?.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                  action?.disabled 
                    ? '' :'group-hover:translate-x-1 group-hover:text-foreground'
                }`} />
              </div>
              {/* Content */}
              <div>
                <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                  {action?.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {action?.description}
                </p>
              </div>
              {/* Special indicators */}
              {action?.id === 'daily-challenge' && dailyChallenge && !challengeCompleted && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Today only
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Zap className="w-3 h-3" />
                      +{dailyChallenge?.reward_points} points
                    </div>
                  </div>
                </div>
              )}
              {action?.id === 'daily-challenge' && challengeCompleted && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Completed today
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Progress Indicators */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Today's Goal</div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-full bg-muted rounded-full h-2 max-w-16">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4"></div>
              </div>
              <span className="text-xs font-medium text-foreground">75%</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Weekly Goal</div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-full bg-muted rounded-full h-2 max-w-16">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-1/2"></div>
              </div>
              <span className="text-xs font-medium text-foreground">50%</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">This Month</div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-full bg-muted rounded-full h-2 max-w-16">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-2/3"></div>
              </div>
              <span className="text-xs font-medium text-foreground">67%</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Challenge</div>
            <div className="flex items-center justify-center">
              {challengeCompleted ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Done</span>
                </div>
              ) : dailyChallenge ? (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-medium">Pending</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">None</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionCards;