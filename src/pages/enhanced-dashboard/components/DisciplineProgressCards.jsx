import React from 'react';
import { 
  Cog, 
  Zap, 
  Building, 
  Cpu, 
  Plane, 
  Activity,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';

const DisciplineProgressCards = ({ skillProgress, userId }) => {
  // Map disciplines to icons and colors
  const disciplineConfig = {
    mechanical: {
      icon: Cog,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    electrical: {
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    civil: {
      icon: Building,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800'
    },
    computer: {
      icon: Cpu,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    aerospace: {
      icon: Plane,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    biomedical: {
      icon: Activity,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  };

  if (!skillProgress?.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Discipline Progress</h3>
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <Cog className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No skill progress found.</p>
            <p className="text-sm">Start a lesson to begin building your skills!</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Explore Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Discipline Progress</h3>
        <div className="text-sm text-muted-foreground">
          {skillProgress?.length} discipline{skillProgress?.length !== 1 ? 's' : ''} active
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillProgress?.map((discipline) => {
          const config = disciplineConfig?.[discipline?.discipline] || disciplineConfig?.mechanical;
          const IconComponent = config?.icon;
          
          return (
            <div
              key={discipline?.discipline}
              className={`${config?.bgColor} ${config?.borderColor} border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${config?.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground capitalize">
                      {discipline?.skillTree?.name || discipline?.discipline}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {discipline?.totalNodes} skill node{discipline?.totalNodes !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              {/* Progress Overview */}
              <div className="space-y-3">
                {/* Completion Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium text-foreground">
                      {discipline?.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${config?.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${discipline?.completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{discipline?.completedNodes} completed</span>
                    <span>{discipline?.totalNodes - discipline?.completedNodes} remaining</span>
                  </div>
                </div>

                {/* XP Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-medium text-foreground">
                      {discipline?.earnedXP} / {discipline?.totalXP}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`bg-gradient-to-r ${config?.color} h-1.5 rounded-full transition-all duration-500 opacity-70`}
                      style={{ width: `${discipline?.xpPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs">
                  {/* Completed Nodes */}
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="text-muted-foreground">
                      {discipline?.completedNodes} done
                    </span>
                  </div>

                  {/* In Progress */}
                  {discipline?.inProgressNodes > 0 && (
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-500" />
                      <span className="text-muted-foreground">
                        {discipline?.inProgressNodes} in progress
                      </span>
                    </div>
                  )}

                  {/* Trend */}
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      +{Math.round(discipline?.earnedXP * 0.1)} XP/week
                    </span>
                  </div>
                </div>

                {/* Next Milestone */}
                {discipline?.completionPercentage < 100 && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      Next milestone: 
                      <span className="font-medium text-foreground ml-1">
                        {discipline?.completionPercentage < 25 ? '25% Complete' :
                         discipline?.completionPercentage < 50 ? '50% Complete' :
                         discipline?.completionPercentage < 75 ? '75% Complete': 'Full Mastery'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Overall Progress Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {skillProgress?.reduce((sum, d) => sum + d?.completedNodes, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Skills Mastered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {skillProgress?.reduce((sum, d) => sum + d?.earnedXP, 0)?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total XP Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(
                skillProgress?.reduce((sum, d) => sum + d?.completionPercentage, 0) / 
                skillProgress?.length
              )}%
            </div>
            <div className="text-sm text-muted-foreground">Avg. Completion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineProgressCards;