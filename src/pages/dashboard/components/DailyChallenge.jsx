import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DailyChallenge = () => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  const challenge = {
    id: 'daily-2025-09-14',
    title: 'Circuit Analysis Challenge',
    description: 'Calculate the total resistance in a complex parallel-series circuit configuration with 5 resistors.',
    difficulty: 'Intermediate',
    xpReward: 150,
    category: 'Electrical Engineering',
    timeLimit: 15, // minutes
    participants: 1247,
    completed: false,
    icon: 'Zap'
  };

  useEffect(() => {
    // Calculate time remaining until midnight (next day)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow?.setDate(tomorrow?.getDate() + 1);
    tomorrow?.setHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow?.getTime() - now?.getTime();
    setTimeRemaining(timeLeft);

    const timer = setInterval(() => {
      const currentTime = new Date()?.getTime();
      const remaining = tomorrow?.getTime() - currentTime;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${seconds?.toString()?.padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'var(--color-accent)';
      case 'Intermediate': return 'var(--color-warning)';
      case 'Advanced': return 'var(--color-error)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-foreground">Daily Challenge</h2>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
          <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
          <span className="text-sm font-medium text-muted-foreground">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Challenge Header */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name={challenge?.icon} size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-foreground">{challenge?.title}</h3>
              <span 
                className="px-2 py-0.5 text-xs rounded-full font-medium"
                style={{ 
                  backgroundColor: `${getDifficultyColor(challenge?.difficulty)}20`,
                  color: getDifficultyColor(challenge?.difficulty)
                }}
              >
                {challenge?.difficulty}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{challenge?.description}</p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="Award" size={12} />
                <span>{challenge?.xpReward} XP</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={12} />
                <span>{challenge?.timeLimit} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Users" size={12} />
                <span>{challenge?.participants?.toLocaleString()} participants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{challenge?.participants?.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Participants</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-accent">{challenge?.xpReward}</div>
            <div className="text-xs text-muted-foreground">XP Reward</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="default" 
            className="flex-1"
            iconName="Play"
            iconPosition="left"
            iconSize={16}
          >
            Start Challenge
          </Button>
          <Button 
            variant="outline"
            iconName="Info"
            iconSize={16}
          >
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <div className="flex space-x-1">
            {[...Array(7)]?.map((_, index) => {
              const dayIndex = (new Date()?.getDay() + index) % 7;
              const isToday = index === 0;
              const isCompleted = index < 3; // Mock completed days
              
              return (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    isToday ? 'bg-primary ring-2 ring-primary/30' :
                    isCompleted ? 'bg-accent' : 'bg-muted'
                  }`}
                  title={`Day ${index + 1}`}
                ></div>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground ml-2">3/7 challenges completed this week</span>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;