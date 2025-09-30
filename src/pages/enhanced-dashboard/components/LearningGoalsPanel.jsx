import React, { useState } from 'react';
import { Target, Plus, Calendar, TrendingUp, Check, Clock, Edit, Trash2 } from 'lucide-react';

const LearningGoalsPanel = ({ learningGoals, userId, onGoalUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getGoalProgress = (goal) => {
    if (!goal?.target_value || goal?.target_value === 0) return 0;
    return Math.min(Math.round((goal?.current_value / goal?.target_value) * 100), 100);
  };

  const getGoalStatus = (goal) => {
    const progress = getGoalProgress(goal);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const isOverdue = targetDate < today && progress < 100;
    
    if (progress >= 100) return { status: 'completed', color: 'green' };
    if (isOverdue) return { status: 'overdue', color: 'red' };
    if (progress >= 75) return { status: 'on-track', color: 'blue' };
    if (progress >= 50) return { status: 'behind', color: 'yellow' };
    return { status: 'started', color: 'gray' };
  };

  const formatGoalType = (goalType) => {
    return goalType?.split('_')?.map(word => 
      word?.charAt(0)?.toUpperCase() + word?.slice(1)
    )?.join(' ');
  };

  const getTimeRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffInDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Due today';
    if (diffInDays === 1) return '1 day left';
    if (diffInDays <= 7) return `${diffInDays} days left`;
    if (diffInDays <= 30) return `${Math.ceil(diffInDays / 7)} weeks left`;
    return `${Math.ceil(diffInDays / 30)} months left`;
  };

  const handleCreateGoal = () => {
    // This would typically open a modal or form
    // For now, just log the action
    console.log('Create new goal');
    setShowCreateForm(true);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Learning Goals</h3>
          </div>
          
          <button
            onClick={handleCreateGoal}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>
      </div>
      {/* Goals List */}
      <div className="px-6 pb-6">
        {learningGoals?.length > 0 ? (
          <div className="space-y-4">
            {learningGoals?.map((goal) => {
              const progress = getGoalProgress(goal);
              const goalStatus = getGoalStatus(goal);
              const timeRemaining = getTimeRemaining(goal?.target_date);
              
              return (
                <div
                  key={goal?.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors group"
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {formatGoalType(goal?.goal_type)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          goalStatus?.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          goalStatus?.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          goalStatus?.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          goalStatus?.color === 'yellow'? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {goalStatus?.status?.replace('-', ' ')}
                        </span>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {timeRemaining}
                        </div>
                      </div>
                    </div>
                    
                    {/* Goal Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="w-8 h-8 rounded-md hover:bg-destructive/10 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {goal?.current_value} / {goal?.target_value}
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goalStatus?.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          goalStatus?.color === 'red' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                          goalStatus?.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          goalStatus?.color === 'yellow'? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>{progress}% complete</span>
                      <span>{goal?.target_value}</span>
                    </div>
                  </div>
                  {/* Goal Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {/* Progress indicator */}
                      {progress >= 100 ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          <span>{goal?.target_value - goal?.current_value} remaining</span>
                        </div>
                      )}
                      
                      {/* Daily rate needed */}
                      {progress < 100 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {Math.ceil((goal?.target_value - goal?.current_value) / 
                              Math.max(1, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)))
                            )}/day needed
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick action button */}
                    {progress < 100 && (
                      <button
                        onClick={() => onGoalUpdate(goal?.goal_type, 1)}
                        className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+1</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground mb-1">No learning goals set</p>
            <p className="text-sm text-muted-foreground mb-4">
              Set goals to track your learning progress
            </p>
            <button
              onClick={handleCreateGoal}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
      {/* Quick Goal Templates */}
      {!showCreateForm && learningGoals?.length > 0 && (
        <div className="px-6 pb-6 border-t border-border pt-4">
          <div className="text-sm font-medium text-foreground mb-3">Quick Goals</div>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 text-left border border-border rounded-md hover:bg-muted/50 transition-colors">
              <div className="text-sm font-medium text-foreground">Weekly XP</div>
              <div className="text-xs text-muted-foreground">Earn 500 XP this week</div>
            </button>
            <button className="p-3 text-left border border-border rounded-md hover:bg-muted/50 transition-colors">
              <div className="text-sm font-medium text-foreground">Daily Streak</div>
              <div className="text-xs text-muted-foreground">30 day learning streak</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningGoalsPanel;