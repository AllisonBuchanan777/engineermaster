import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  Clock, 
  ChevronRight,
  Star,
  Zap,
  Trophy,
  Play,
  Calendar
} from 'lucide-react';

const PersonalizedFeed = ({ recommendations, userId, onGoalUpdate }) => {
  const [activeTab, setActiveTab] = useState('lessons');

  if (!recommendations) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3]?.map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { lessons, dailyChallenge, skills, personalizedTips } = recommendations;

  const tabs = [
    { id: 'lessons', label: 'Recommended Lessons', icon: BookOpen, count: lessons?.length || 0 },
    { id: 'challenge', label: 'Daily Challenge', icon: Target, count: dailyChallenge ? 1 : 0 },
    { id: 'skills', label: 'Skill Focus', icon: Zap, count: skills?.length || 0 },
    { id: 'tips', label: 'Learning Tips', icon: Lightbulb, count: personalizedTips?.length || 0 }
  ];

  const handleStartLesson = (lessonId) => {
    // Navigate to lesson or trigger lesson start
    console.log('Starting lesson:', lessonId);
    // You can implement navigation logic here
  };

  const handleStartChallenge = (challengeId) => {
    // Navigate to challenge or trigger challenge start
    console.log('Starting challenge:', challengeId);
    // You can implement challenge start logic here
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header with Tabs */}
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Learning Feed</h3>
        
        <div className="flex gap-1 border-b border-border">
          {tabs?.map((tab) => {
            const IconComponent = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab?.label}
                {tab?.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab?.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab?.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Content */}
      <div className="p-6 pt-4">
        {/* Recommended Lessons */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {lessons?.length > 0 ? (
              lessons?.map((lesson) => (
                <div key={lesson?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {lesson?.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          lesson?.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          lesson?.difficulty === 'intermediate'? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {lesson?.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {lesson?.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson?.estimated_duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {lesson?.xp_reward} XP
                        </div>
                        <div className="capitalize">
                          {lesson?.discipline}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStartLesson(lesson?.id)}
                      className="ml-4 flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No lesson recommendations available</p>
                <p className="text-sm text-muted-foreground">Complete more lessons to get personalized recommendations</p>
              </div>
            )}
          </div>
        )}

        {/* Daily Challenge */}
        {activeTab === 'challenge' && (
          <div className="space-y-4">
            {dailyChallenge ? (
              <div className="border border-border rounded-lg p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-foreground">Today's Challenge</h4>
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                        {dailyChallenge?.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-foreground mb-4">
                      {dailyChallenge?.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Today Only
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        {dailyChallenge?.reward_points} points
                      </div>
                      <div className="capitalize">
                        {dailyChallenge?.discipline}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartChallenge(dailyChallenge?.id)}
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    <Target className="w-4 h-4" />
                    Accept Challenge
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No challenge available today</p>
                <p className="text-sm text-muted-foreground">Check back tomorrow for a new challenge!</p>
              </div>
            )}
          </div>
        )}

        {/* Skill Focus */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            {skills?.length > 0 ? (
              skills?.map((skill) => (
                <div key={skill?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          skill?.tier === 'bronze' ? 'bg-amber-100 dark:bg-amber-900/30' :
                          skill?.tier === 'silver'? 'bg-gray-100 dark:bg-gray-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          <Zap className={`w-4 h-4 ${
                            skill?.tier === 'bronze' ? 'text-amber-600 dark:text-amber-400' :
                            skill?.tier === 'silver'? 'text-gray-600 dark:text-gray-400' : 'text-yellow-600 dark:text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{skill?.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {skill?.skill_trees?.name} • {skill?.tier} tier
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {skill?.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {skill?.xp_required} XP required
                        </div>
                        {skill?.is_milestone && (
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            Milestone
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No skill recommendations available</p>
                <p className="text-sm text-muted-foreground">Start learning to unlock skill recommendations</p>
              </div>
            )}
          </div>
        )}

        {/* Learning Tips */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            {personalizedTips?.length > 0 ? (
              personalizedTips?.map((tip, index) => (
                <div 
                  key={index} 
                  className={`border border-border rounded-lg p-4 ${
                    tip?.priority === 'high' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                    tip?.priority === 'medium'? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                      tip?.priority === 'high' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      tip?.priority === 'medium'? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      <Lightbulb className={`w-4 h-4 ${
                        tip?.priority === 'high' ? 'text-blue-600 dark:text-blue-400' :
                        tip?.priority === 'medium'? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{tip?.title}</h4>
                      <p className="text-sm text-muted-foreground">{tip?.message}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tip?.type === 'encouragement' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          tip?.type === 'habit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          tip?.type === 'discipline'? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {tip?.type}
                        </span>
                        
                        {tip?.priority === 'high' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                            Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No personalized tips available</p>
                <p className="text-sm text-muted-foreground">Keep learning to unlock personalized recommendations</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedFeed;