import React from 'react';
import { Lock, CheckCircle, Play, Star } from 'lucide-react';

const SkillTreeVisualization = ({ skillTree, onNodeClick }) => {
  const renderSkillNode = (node, index) => {
    const isUnlocked = node?.isUnlocked !== false;
    const isCompleted = node?.userProgress?.status === 'completed';
    const isInProgress = node?.userProgress?.status === 'in_progress';

    return (
      <div
        key={node?.id}
        className={`relative bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 ${
          !isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
        } ${isCompleted ? 'border-2 border-green-400' : isInProgress ? 'border-2 border-yellow-400' : 'border border-gray-200'}`}
        onClick={() => isUnlocked && onNodeClick?.(node?.lesson_id)}
        style={{
          transform: `translate(${node?.position_x || index * 120}px, ${node?.position_y || index * 100}px)`,
        }}
      >
        {/* Node Status Icon */}
        <div className="absolute -top-2 -right-2">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : !isUnlocked ? (
            <Lock className="w-6 h-6 text-gray-400" />
          ) : isInProgress ? (
            <Play className="w-6 h-6 text-yellow-500" />
          ) : (
            <Star className="w-6 h-6 text-orange-500" />
          )}
        </div>

        {/* Node Content */}
        <div className="text-center">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {node?.name}
          </h4>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {node?.description}
          </p>
          
          {/* Tier Badge */}
          <div className="flex items-center justify-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              node?.tier === 1 ? 'bg-green-100 text-green-700' :
              node?.tier === 2 ? 'bg-yellow-100 text-yellow-700' :
              node?.tier === 3 ? 'bg-orange-100 text-orange-700': 'bg-red-100 text-red-700'
            }`}>
              Tier {node?.tier}
            </span>
          </div>
          
          {/* XP Required */}
          {node?.xp_required && (
            <p className="text-xs text-gray-500 mt-2">
              {node?.xp_required} XP required
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isInProgress && node?.userProgress?.progress_percentage && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${node?.userProgress?.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConnectionLines = (nodes) => {
    const lines = [];
    
    nodes?.forEach((node, index) => {
      node?.prerequisites?.forEach((prereqId) => {
        const prereqNode = nodes?.find(n => n?.id === prereqId);
        if (prereqNode) {
          const startX = prereqNode?.position_x + 60; // Half node width
          const startY = prereqNode?.position_y + 30; // Half node height
          const endX = node?.position_x + 60;
          const endY = node?.position_y + 30;
          
          lines?.push(
            <line
              key={`${prereqNode?.id}-${node?.id}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#D1D5DB"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        }
      });
    });
    
    return lines;
  };

  if (!skillTree?.skill_nodes?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🌳</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Tree Coming Soon</h3>
        <p className="text-gray-600">
          The mechanical engineering skill tree is being developed. Check back soon!
        </p>
      </div>
    );
  }

  const nodes = skillTree?.skill_nodes || [];
  const maxX = Math.max(...nodes?.map(n => n?.position_x || 0)) + 120;
  const maxY = Math.max(...nodes?.map(n => n?.position_y || 0)) + 120;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Mechanical Engineering Skill Tree
        </h3>
        <div className="text-sm text-gray-500">
          {nodes?.filter(n => n?.userProgress?.status === 'completed')?.length} / {nodes?.length} completed
        </div>
      </div>

      <div className="relative overflow-x-auto overflow-y-hidden">
        <div 
          className="relative"
          style={{ 
            width: Math.max(maxX, 800),
            height: Math.max(maxY, 400),
            minHeight: '400px'
          }}
        >
          {/* Connection Lines */}
          <svg 
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
          >
            {renderConnectionLines(nodes)}
          </svg>

          {/* Skill Nodes */}
          {nodes?.map((node, index) => renderSkillNode(node, index))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center">
          <Play className="w-4 h-4 text-yellow-500 mr-1" />
          <span className="text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center">
          <Star className="w-4 h-4 text-orange-500 mr-1" />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <Lock className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-gray-600">Locked</span>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeVisualization;