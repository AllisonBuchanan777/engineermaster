import React from 'react';
import { Lock, CheckCircle, Play } from 'lucide-react';

const SkillTreeVisualization = ({ skillTree, onNodeClick }) => {
  if (!skillTree?.skill_nodes?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No skill tree data available</p>
      </div>
    );
  }

  const getNodeStatus = (node) => {
    if (!node?.isUnlocked) return 'locked';
    if (node?.userProgress?.status === 'completed') return 'completed';
    if (node?.userProgress?.status === 'in_progress') return 'in_progress';
    return 'available';
  };

  const getNodeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-600 text-white';
      case 'in_progress': return 'bg-yellow-500 border-yellow-600 text-white';
      case 'available': return 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600';
      case 'locked': return 'bg-gray-300 border-gray-400 text-gray-600';
      default: return 'bg-gray-300 border-gray-400 text-gray-600';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#CD7F32';
    }
  };

  // Sort nodes by position for proper rendering
  const sortedNodes = [...skillTree?.skill_nodes]?.sort((a, b) => {
    if (a?.position_y !== b?.position_y) return a?.position_y - b?.position_y;
    return a?.position_x - b?.position_x;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{skillTree?.name}</h2>
        <p className="text-gray-600">{skillTree?.description}</p>
      </div>
      {/* Skill Tree Visualization */}
      <div className="relative min-h-[600px] overflow-x-auto">
        <svg 
          viewBox="0 0 500 400" 
          className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg"
        >
          {/* Connection Lines */}
          {sortedNodes?.map((node) => {
            if (!node?.prerequisites?.length) return null;
            
            return node?.prerequisites?.map((prereqId) => {
              const prereqNode = sortedNodes?.find(n => n?.id === prereqId);
              if (!prereqNode) return null;

              return (
                <line
                  key={`${prereqNode?.id}-${node?.id}`}
                  x1={prereqNode?.position_x}
                  y1={prereqNode?.position_y}
                  x2={node?.position_x}
                  y2={node?.position_y}
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            });
          })}

          {/* Skill Nodes */}
          {sortedNodes?.map((node, index) => {
            const status = getNodeStatus(node);
            const isClickable = status !== 'locked';

            return (
              <g key={node?.id}>
                {/* Node Circle */}
                <circle
                  cx={node?.position_x}
                  cy={node?.position_y}
                  r="20"
                  fill={getTierColor(node?.tier)}
                  stroke={status === 'completed' ? '#10B981' : status === 'in_progress' ? '#F59E0B' : '#6B7280'}
                  strokeWidth="3"
                  className={`${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                  onClick={() => isClickable && onNodeClick?.(node?.lesson_id)}
                />
                {/* Node Icon */}
                {status === 'locked' && (
                  <foreignObject 
                    x={node?.position_x - 8} 
                    y={node?.position_y - 8} 
                    width="16" 
                    height="16"
                  >
                    <Lock className="w-4 h-4 text-gray-600" />
                  </foreignObject>
                )}
                {status === 'completed' && (
                  <foreignObject 
                    x={node?.position_x - 8} 
                    y={node?.position_y - 8} 
                    width="16" 
                    height="16"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </foreignObject>
                )}
                {status === 'available' && (
                  <foreignObject 
                    x={node?.position_x - 8} 
                    y={node?.position_y - 8} 
                    width="16" 
                    height="16"
                  >
                    <Play className="w-4 h-4 text-white" />
                  </foreignObject>
                )}
                {/* Node Label */}
                <text
                  x={node?.position_x}
                  y={node?.position_y + 35}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                  style={{ fontSize: '10px' }}
                >
                  {node?.name?.split(' ')?.slice(0, 2)?.join(' ')}
                </text>
                {/* XP Required */}
                <text
                  x={node?.position_x}
                  y={node?.position_y + 48}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                  style={{ fontSize: '8px' }}
                >
                  {node?.xp_required} XP
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Skill Tree Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Locked</span>
          </div>
        </div>

        <div className="mt-4">
          <h5 className="font-medium text-gray-900 mb-2">Tiers</h5>
          <div className="grid grid-cols-5 gap-2">
            {['bronze', 'silver', 'gold', 'platinum', 'diamond']?.map((tier) => (
              <div key={tier} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getTierColor(tier) }}
                ></div>
                <span className="text-xs text-gray-600 capitalize">{tier}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Node Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNodes?.map((node) => {
          const status = getNodeStatus(node);
          
          return (
            <div 
              key={node?.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                status === 'completed' ? 'border-green-200 bg-green-50' :
                status === 'in_progress' ? 'border-yellow-200 bg-yellow-50' :
                status === 'available'? 'border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100' : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => status !== 'locked' && onNodeClick?.(node?.lesson_id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{node?.name}</h4>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: getTierColor(node?.tier), color: 'white' }}
                >
                  {node?.tier?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">{node?.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{node?.xp_required} XP required</span>
                <div className="flex items-center">
                  {status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {status === 'in_progress' && (
                    <div className="flex items-center text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                      {node?.userProgress?.progress_percentage || 0}%
                    </div>
                  )}
                  {status === 'locked' && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTreeVisualization;