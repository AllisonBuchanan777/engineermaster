import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressOverview = ({ modules, userProgress }) => {
  const calculateStats = () => {
    const totalModules = modules?.length;
    const completedModules = modules?.filter(m => m?.status === 'completed')?.length;
    const inProgressModules = modules?.filter(m => m?.status === 'in-progress')?.length;
    const availableModules = modules?.filter(m => m?.status === 'available')?.length;
    
    const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    const disciplineStats = {
      electrical: { completed: 0, total: 0 },
      mechanical: { completed: 0, total: 0 },
      mechatronics: { completed: 0, total: 0 },
      aerospace: { completed: 0, total: 0 },
      innovation: { completed: 0, total: 0 }
    };

    modules?.forEach(module => {
      if (disciplineStats?.[module.discipline]) {
        disciplineStats[module.discipline].total++;
        if (module.status === 'completed') {
          disciplineStats[module.discipline].completed++;
        }
      }
    });

    return {
      totalModules,
      completedModules,
      inProgressModules,
      availableModules,
      completionPercentage,
      disciplineStats
    };
  };

  const stats = calculateStats();

  const getDisciplineIcon = (discipline) => {
    const icons = {
      electrical: 'Zap',
      mechanical: 'Cog',
      mechatronics: 'Bot',
      aerospace: 'Rocket',
      innovation: 'Lightbulb'
    };
    return icons?.[discipline] || 'Circle';
  };

  const getDisciplineColor = (discipline) => {
    const colors = {
      electrical: 'text-blue-600',
      mechanical: 'text-green-600',
      mechatronics: 'text-purple-600',
      aerospace: 'text-red-600',
      innovation: 'text-amber-600'
    };
    return colors?.[discipline] || 'text-gray-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Learning Progress</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span>Last updated: {new Date()?.toLocaleDateString()}</span>
        </div>
      </div>
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Completion</span>
          <span className="text-sm font-semibold text-foreground">{stats?.completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats?.completionPercentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{stats?.completedModules} of {stats?.totalModules} modules completed</span>
          <span>{stats?.inProgressModules} in progress</span>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats?.completedModules}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <Icon name="Clock" size={24} className="text-warning mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats?.inProgressModules}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <Icon name="Play" size={24} className="text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats?.availableModules}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
        
        <div className="text-center p-4 bg-accent/10 rounded-lg">
          <Icon name="Zap" size={24} className="text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{userProgress?.totalXP?.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total XP</div>
        </div>
      </div>
      {/* Discipline Progress */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Progress by Discipline</h3>
        <div className="space-y-4">
          {Object.entries(stats?.disciplineStats)?.map(([discipline, data]) => {
            const percentage = data?.total > 0 ? Math.round((data?.completed / data?.total) * 100) : 0;
            return (
              <div key={discipline} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Icon 
                    name={getDisciplineIcon(discipline)} 
                    size={20} 
                    className={getDisciplineColor(discipline)}
                  />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {discipline === 'mechatronics' ? 'Mechatronics' : discipline}
                  </span>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {data?.completed}/{data?.total}
                    </span>
                    <span className="text-xs font-medium text-foreground">{percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;