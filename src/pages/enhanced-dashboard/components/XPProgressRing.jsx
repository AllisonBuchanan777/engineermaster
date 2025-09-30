import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const XPProgressRing = ({ currentXP, levelProgress }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    // Animate progress ring
    const timer = setTimeout(() => {
      setAnimatedProgress(levelProgress?.progressPercentage || 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [levelProgress?.progressPercentage]);

  // Calculate ring properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Check for level up animation trigger
  useEffect(() => {
    if (levelProgress?.progressPercentage === 100) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [levelProgress?.progressPercentage]);

  if (!levelProgress) {
    return (
      <div className="relative w-32 h-32">
        <div className="w-full h-full bg-muted rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative w-32 h-32 group">
      {/* SVG Progress Ring */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-muted opacity-20"
        />
        
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="url(#xpGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* XP Amount */}
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {currentXP?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
        
        {/* Level indicator */}
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-medium text-foreground">
            Lvl {levelProgress?.currentLevel}
          </span>
        </div>
      </div>
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
            LEVEL UP! 🎉
          </div>
        </div>
      )}
      {/* Hover Details */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="space-y-2">
          {/* Current Level Info */}
          <div>
            <div className="text-sm font-medium text-foreground mb-1">Level Progress</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Current Level:</span>
                <span className="font-medium">{levelProgress?.currentLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-medium">{levelProgress?.progressXP} / {levelProgress?.requiredXP} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Next Level:</span>
                <span className="font-medium">{levelProgress?.nextLevelXP} XP</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress?.progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-center text-muted-foreground mt-1">
              {levelProgress?.progressPercentage}% to next level
            </div>
          </div>

          {/* Motivational Message */}
          <div className="border-t border-border pt-2">
            <div className="text-xs text-center text-muted-foreground">
              {levelProgress?.progressPercentage < 25 ? "Just getting started! 🌱" :
               levelProgress?.progressPercentage < 50 ? "Making progress! 📈" :
               levelProgress?.progressPercentage < 75 ? "You're on fire! 🔥" :
               levelProgress?.progressPercentage < 95 ? "Almost there! 🎯": "Level up incoming! 🚀"}
            </div>
          </div>
        </div>
      </div>
      {/* Floating XP particles for level up */}
      {showLevelUp && (
        <>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default XPProgressRing;