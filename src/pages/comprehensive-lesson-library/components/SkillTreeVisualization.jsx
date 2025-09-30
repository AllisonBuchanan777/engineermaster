import React, { useState, useEffect } from 'react';
import { Target, Star, Crown, Lock, CheckCircle, Zap, Award } from 'lucide-react';

const SkillTreeVisualization = ({ skillTree, userProgress = [] }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodeTypes = {
    foundation: { 
      color: 'from-green-400 to-green-600', 
      icon: Star,
      size: 'w-16 h-16',
      description: 'Foundation concepts'
    },
    core: { 
      color: 'from-blue-400 to-blue-600', 
      icon: Target,
      size: 'w-14 h-14',
      description: 'Core skills'
    },
    advanced: { 
      color: 'from-purple-400 to-purple-600', 
      icon: Zap,
      size: 'w-14 h-14',
      description: 'Advanced concepts'
    },
    specialization: { 
      color: 'from-orange-400 to-orange-600', 
      icon: Award,
      size: 'w-14 h-14',
      description: 'Specialized knowledge'
    },
    mastery: { 
      color: 'from-yellow-400 to-yellow-600', 
      icon: Crown,
      size: 'w-18 h-18',
      description: 'Mastery level'
    }
  };

  const getNodeStatus = (nodeId) => {
    const progress = userProgress?.find(p => p?.skill_node_id === nodeId);
    if (progress?.status === 'completed') return 'completed';
    if (progress?.status === 'available') return 'available';
    return 'locked';
  };

  const getNodeProgress = (nodeId) => {
    const progress = userProgress?.find(p => p?.skill_node_id === nodeId);
    return progress?.progress_percentage || 0;
  };

  const isNodeUnlocked = (node) => {
    const status = getNodeStatus(node?.id);
    return status === 'available' || status === 'completed';
  };

  const renderNode = (node) => {
    const nodeType = nodeTypes?.[node?.node_type] || nodeTypes?.core;
    const status = getNodeStatus(node?.id);
    const progress = getNodeProgress(node?.id);
    const isUnlocked = isNodeUnlocked(node);
    const isCompleted = status === 'completed';
    const isHovered = hoveredNode === node?.id;
    const isSelected = selectedNode === node?.id;

    const IconComponent = nodeType?.icon;

    return (
      <div
        key={node?.id}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
        style={{
          left: `${node?.position_x}%`,
          top: `${node?.position_y}%`,
          zIndex: isSelected ? 50 : isHovered ? 30 : 20
        }}
        onClick={() => setSelectedNode(node)}
        onMouseEnter={() => setHoveredNode(node?.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {/* Node Connections - draw lines to prerequisites */}
        {node?.prerequisites?.map(prereqId => {
          const prereqNode = skillTree?.nodes?.find(n => n?.id === prereqId);
          if (!prereqNode) return null;

          return (
            <svg
              key={prereqId}
              className="absolute pointer-events-none"
              style={{
                left: `${prereqNode?.position_x - node?.position_x}%`,
                top: `${prereqNode?.position_y - node?.position_y}%`,
                width: `${Math.abs(prereqNode?.position_x - node?.position_x)}%`,
                height: `${Math.abs(prereqNode?.position_y - node?.position_y)}%`,
                zIndex: 10
              }}
            >
              <line
                x1="50%"
                y1="50%"
                x2={`${100 - Math.abs(prereqNode?.position_x - node?.position_x)}%`}
                y2={`${100 - Math.abs(prereqNode?.position_y - node?.position_y)}%`}
                stroke={isUnlocked ? '#10B981' : '#9CA3AF'}
                strokeWidth="2"
                strokeDasharray={isUnlocked ? '0' : '5,5'}
              />
            </svg>
          );
        })}
        {/* Node */}
        <div 
          className={`relative ${nodeType?.size} ${isHovered || isSelected ? 'scale-110' : 'scale-100'} transition-transform duration-200`}
        >
          {/* Outer Ring - Progress */}
          {progress > 0 && progress < 100 && (
            <div className="absolute inset-0 rounded-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray={`${progress}, 100`}
                />
              </svg>
            </div>
          )}

          {/* Main Node */}
          <div 
            className={`
              relative w-full h-full rounded-full flex items-center justify-center
              ${isCompleted 
                ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/25' 
                : isUnlocked 
                  ? `bg-gradient-to-br ${nodeType?.color} shadow-lg` 
                  : 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-md'
              }
              ${isHovered || isSelected ? 'ring-4 ring-white ring-opacity-50' : ''}
            `}
          >
            {isCompleted ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : !isUnlocked ? (
              <Lock className="w-6 h-6 text-white" />
            ) : (
              <IconComponent className="w-6 h-6 text-white" />
            )}
          </div>

          {/* Status Indicator */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        {/* Node Label */}
        <div className={`
          absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
          px-2 py-1 bg-white rounded-lg shadow-md border border-gray-200 
          text-xs font-medium text-gray-900 whitespace-nowrap
          ${isHovered || isSelected ? 'opacity-100' : 'opacity-80'}
          transition-opacity duration-200
        `}>
          {node?.name}
        </div>
        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900 text-white p-3 rounded-lg shadow-lg z-50">
            <div className="text-sm font-medium mb-1">{node?.name}</div>
            <div className="text-xs text-gray-300 mb-2">{node?.description}</div>
            <div className="flex items-center justify-between text-xs">
              <span>{nodeType?.description}</span>
              <span>{node?.required_xp} XP required</span>
            </div>
            {progress > 0 && progress < 100 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-400 h-1 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-gray-200 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      {/* Skill Tree Title */}
      <div className="absolute top-4 left-4 z-40">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {skillTree?.name}
        </h3>
        <div className="text-sm text-gray-600">
          {skillTree?.discipline?.charAt(0)?.toUpperCase() + skillTree?.discipline?.slice(1)} Engineering
        </div>
      </div>
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 z-40">
        <div className="text-sm font-medium text-gray-900 mb-2">Node Types</div>
        <div className="space-y-1 text-xs">
          {Object.entries(nodeTypes)?.map(([type, config]) => {
            const IconComponent = config?.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config?.color} flex items-center justify-center`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-600 capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Skill Nodes */}
      {skillTree?.nodes?.map(node => renderNode(node))}
      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {selectedNode?.name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {selectedNode?.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Type: {selectedNode?.node_type?.charAt(0)?.toUpperCase() + selectedNode?.node_type?.slice(1)}</span>
                <span>Required XP: {selectedNode?.required_xp}</span>
                <span>Reward: +{selectedNode?.xp_reward} XP</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Prerequisites */}
          {selectedNode?.prerequisites?.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-900 mb-1">Prerequisites:</div>
              <div className="flex flex-wrap gap-2">
                {selectedNode?.prerequisites?.map(prereqId => {
                  const prereqNode = skillTree?.nodes?.find(n => n?.id === prereqId);
                  const prereqStatus = getNodeStatus(prereqId);
                  return prereqNode ? (
                    <span 
                      key={prereqId}
                      className={`px-2 py-1 rounded-full text-xs ${
                        prereqStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' :'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {prereqNode?.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Status: <span className="capitalize">{getNodeStatus(selectedNode?.id)}</span>
            </div>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                getNodeStatus(selectedNode?.id) === 'completed'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : isNodeUnlocked(selectedNode)
                    ? 'bg-blue-600 text-white hover:bg-blue-700' :'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isNodeUnlocked(selectedNode) && getNodeStatus(selectedNode?.id) !== 'completed'}
            >
              {getNodeStatus(selectedNode?.id) === 'completed' 
                ? 'Completed' 
                : isNodeUnlocked(selectedNode) 
                  ? 'Start Learning' :'Locked'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeVisualization;