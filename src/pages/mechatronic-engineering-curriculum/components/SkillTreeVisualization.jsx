import React from 'react';
import { CheckCircle, Lock, Play, Cpu, Radio, Code, Settings, BarChart3, Bot } from 'lucide-react';

const SkillTreeVisualization = ({ modules }) => {
  if (!modules || modules?.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-sm">Loading skill tree...</div>
      </div>
    );
  }

  const getModuleIcon = (iconName) => {
    const icons = {
      Cpu,
      Radio,
      Code,
      Settings,
      BarChart3,
      Bot
    };
    const IconComponent = icons?.[iconName] || Cpu;
    return <IconComponent className="w-5 h-5" />;
  };

  const getNodeStatus = (module) => {
    if (module?.isLocked) return 'locked';
    if (module?.progress === 100) return 'completed';
    if (module?.progress > 0) return 'in-progress';
    return 'available';
  };

  const getStatusColors = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'in-progress':
        return 'bg-blue-500 text-white border-blue-500';
      case 'available':
        return 'bg-white text-gray-700 border-gray-300 hover:border-blue-400';
      case 'locked':
      default:
        return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'locked':
        return <Lock className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Skill Tree Path */}
      <div className="relative">
        {modules?.map((module, index) => {
          const status = getNodeStatus(module);
          const isLast = index === modules?.length - 1;
          
          return (
            <div key={module?.id} className="relative">
              {/* Connection Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300 z-0"></div>
              )}
              
              {/* Module Node */}
              <div className="relative z-10 flex items-center space-x-4 mb-6">
                <div 
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${getStatusColors(status)}`}
                >
                  {status === 'locked' ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    getModuleIcon(module?.icon)
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {module?.name}
                      </h4>
                      <p className={`text-sm ${status === 'locked' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {module?.difficulty} • {module?.estimatedHours}h
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className={`text-sm font-medium ${status === 'locked' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {module?.progress || 0}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status === 'completed' ? 'bg-green-500' : 
                        status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${module?.progress || 0}%` }}
                    />
                  </div>
                  
                  {/* Module Stats */}
                  {status !== 'locked' && (
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{module?.completedLessons || 0}/{module?.lessonsCount || 0} lessons</span>
                      <span>{module?.projects?.length || 0} projects</span>
                      <span>{module?.keyTopics?.length || 0} topics</span>
                    </div>
                  )}
                  
                  {/* Prerequisites */}
                  {module?.prerequisites && module?.prerequisites?.length > 0 && status === 'locked' && (
                    <div className="mt-2 text-xs text-gray-400">
                      Requires: {module?.prerequisites?.map(p => p?.replace('-', ' '))?.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-3 text-sm">Legend</h5>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
            <span className="text-gray-700">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-200"></div>
            <span className="text-gray-700">Locked</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-blue-900 text-sm">Skill Tree Progress</h5>
            <p className="text-blue-700 text-xs">
              {modules?.filter(m => m?.progress === 100)?.length || 0} of {modules?.length || 0} modules completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-900">
              {Math.round((modules?.reduce((sum, m) => sum + (m?.progress || 0), 0) / (modules?.length * 100)) * 100) || 0}%
            </div>
            <div className="text-xs text-blue-700">Overall</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeVisualization;