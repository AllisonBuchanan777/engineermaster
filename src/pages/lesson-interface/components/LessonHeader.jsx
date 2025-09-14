import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LessonHeader = ({ lesson, progress, onToggleNotes, showNotes }) => {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/learning-roadmap">
            <Button variant="ghost" size="icon">
              <Icon name="ArrowLeft" size={20} />
            </Button>
          </Link>
          
          <div>
            <h1 className="text-xl font-semibold text-foreground">{lesson?.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-muted-foreground">{lesson?.discipline}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{lesson?.difficulty}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{lesson?.duration} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleNotes}
            iconName={showNotes ? "PanelRightClose" : "PanelRightOpen"}
            iconPosition="left"
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </Button>
          
          <Button variant="ghost" size="icon">
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Progress: {progress?.current} of {progress?.total} sections
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((progress?.current / progress?.total) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress?.current / progress?.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;