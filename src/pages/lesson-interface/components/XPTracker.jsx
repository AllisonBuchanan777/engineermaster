import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const XPTracker = ({ currentXP, earnedXP, streak }) => {
  const [showXPGain, setShowXPGain] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(currentXP);

  useEffect(() => {
    if (earnedXP > 0) {
      setShowXPGain(true);
      
      // Animate XP counter
      const duration = 1000;
      const steps = 20;
      const increment = earnedXP / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedXP(prev => Math.min(prev + increment, currentXP + earnedXP));
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setTimeout(() => setShowXPGain(false), 2000);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [earnedXP, currentXP]);

  return (
    <div className="fixed top-20 right-6 z-40">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-48">
        {/* XP Display */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <Icon name="Zap" size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {Math.floor(animatedXP)?.toLocaleString()} XP
              </p>
              <p className="text-xs text-muted-foreground">Total Experience</p>
            </div>
          </div>
          
          {showXPGain && (
            <div className="animate-bounce">
              <span className="text-sm font-semibold text-accent">
                +{earnedXP} XP
              </span>
            </div>
          )}
        </div>

        {/* Streak Display */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
            <Icon name="Flame" size={16} className="text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{streak} Day Streak</p>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Level 12</span>
            <span className="text-xs text-muted-foreground">450/500 XP</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: '90%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">50 XP to Level 13</p>
        </div>

        {/* Achievement Notification */}
        {showXPGain && (
          <div className="mt-3 p-2 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="Award" size={14} className="text-success" />
              <span className="text-xs font-medium text-success">Section Completed!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPTracker;