import React, { useState, useRef, useEffect } from 'react';
import { Lock, CheckCircle, Clock, Star, Award, Target, Book, Play, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const TIER_COLORS = {
  bronze: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' },
  silver: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  gold: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' },
  platinum: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' }
};

const STATUS_CONFIG = {
  locked: { 
    icon: Lock, 
    color: 'text-gray-400', 
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    interactive: false 
  },
  available: { 
    icon: Target, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    interactive: true 
  },
  in_progress: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    interactive: true 
  },
  mastered: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    border: 'border-green-300',
    interactive: false 
  }
};

const SkillTreeVisualization = ({ treeData, onNodeInteraction, loading }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const { tree, nodes = [], progress } = treeData || {};

  useEffect(() => {
    // Reset view when tree data changes
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  }, [treeData]);

  const handleMouseDown = (e) => {
    if (e?.target?.closest('.skill-node')) return; // Don't pan when clicking on nodes
    setIsPanning(true);
    setLastPanPoint({ x: e?.clientX, y: e?.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    
    const deltaX = e?.clientX - lastPanPoint?.x;
    const deltaY = e?.clientY - lastPanPoint?.y;
    
    setPanOffset(prev => ({
      x: prev?.x + deltaX,
      y: prev?.y + deltaY
    }));
    
    setLastPanPoint({ x: e?.clientX, y: e?.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (direction) => {
    const zoomFactor = direction === 'in' ? 1.2 : 0.8;
    setZoom(prev => Math.max(0.5, Math.min(2, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const renderConnections = () => {
    return nodes?.map(node => {
      if (!node?.prerequisites?.length) return null;
      
      return node?.prerequisites?.map(prereqId => {
        const prereqNode = nodes?.find(n => n?.id === prereqId);
        if (!prereqNode) return null;
        
        const startX = prereqNode?.position_x + 60; // Node width/2
        const startY = prereqNode?.position_y + 30; // Node height/2
        const endX = node?.position_x + 60;
        const endY = node?.position_y + 30;
        
        return (
          <line
            key={`${prereqId}-${node?.id}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#e5e7eb"
            strokeWidth="2"
            strokeDasharray={node?.user_skill_progress?.[0]?.status === 'locked' ? '5,5' : 'none'}
          />
        );
      });
    }) || [];
  };

  const renderNodes = () => {
    return nodes?.map(node => {
      const userProgress = node?.user_skill_progress?.[0] || { status: 'locked', progress_percentage: 0 };
      const statusConfig = STATUS_CONFIG?.[userProgress?.status] || STATUS_CONFIG?.locked;
      const tierConfig = TIER_COLORS?.[node?.tier] || TIER_COLORS?.bronze;
      const StatusIcon = statusConfig?.icon;

      return (
        <g
          key={node?.id}
          className="skill-node cursor-pointer"
          onClick={() => setSelectedNode(node)}
        >
          {/* Node Circle */}
          <circle
            cx={node?.position_x + 60}
            cy={node?.position_y + 30}
            r="30"
            className={`${statusConfig?.bg} ${statusConfig?.border} transition-all hover:shadow-lg`}
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
          />
          {/* Status Icon */}
          <foreignObject
            x={node?.position_x + 45}
            y={node?.position_y + 15}
            width="30"
            height="30"
          >
            <div className={`w-full h-full flex items-center justify-center ${statusConfig?.color}`}>
              <StatusIcon className="w-4 h-4" />
            </div>
          </foreignObject>
          {/* Progress Ring for in-progress nodes */}
          {userProgress?.status === 'in_progress' && (
            <circle
              cx={node?.position_x + 60}
              cy={node?.position_y + 30}
              r="35"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray={`${(userProgress?.progress_percentage / 100) * 219} 219`}
              transform={`rotate(-90 ${node?.position_x + 60} ${node?.position_y + 30})`}
            />
          )}
          {/* Node Label */}
          <text
            x={node?.position_x + 60}
            y={node?.position_y + 80}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-900"
            style={{ fontSize: '10px' }}
          >
            {node?.name}
          </text>
          {/* Tier Badge */}
          <foreignObject
            x={node?.position_x + 80}
            y={node?.position_y + 5}
            width="20"
            height="20"
          >
            <div className={`w-5 h-5 rounded-full ${tierConfig?.bg} ${tierConfig?.border} border flex items-center justify-center`}>
              <Star className={`w-3 h-3 ${tierConfig?.text}`} />
            </div>
          </foreignObject>
        </g>
      );
    }) || [];
  };

  const handleNodeAction = (action) => {
    if (!selectedNode || !onNodeInteraction) return;
    
    onNodeInteraction(selectedNode?.id, action);
    setSelectedNode(null);
  };

  const getNodeActions = (node) => {
    const userProgress = node?.user_skill_progress?.[0];
    const actions = [];
    
    if (userProgress?.status === 'available') {
      actions?.push({ label: 'Start Learning', action: 'start', icon: Play, color: 'bg-blue-600 hover:bg-blue-700' });
    }
    
    if (userProgress?.status === 'in_progress') {
      actions?.push({ label: 'Continue', action: 'continue', icon: Book, color: 'bg-yellow-600 hover:bg-yellow-700' });
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill tree...</p>
        </div>
      </div>
    );
  }

  if (!tree || !nodes?.length) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No skill tree data</h3>
        <p className="text-gray-600">This skill tree is still being developed</p>
      </div>
    );
  }

  // Calculate bounds for the skill tree
  const bounds = nodes?.reduce(
    (acc, node) => ({
      minX: Math.min(acc?.minX, node?.position_x),
      minY: Math.min(acc?.minY, node?.position_y),
      maxX: Math.max(acc?.maxX, node?.position_x + 120),
      maxY: Math.max(acc?.maxY, node?.position_y + 100)
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Tree Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tree?.name}</h2>
            <p className="text-gray-600 mt-1">{tree?.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress Summary */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="font-semibold text-indigo-600">{Math.round(progress?.progress_percentage || 0)}%</div>
              <div className="text-xs text-gray-500">{progress?.mastered_nodes || 0} of {progress?.total_nodes || 0} mastered</div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Skill Tree Visualization */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden bg-gray-50"
        style={{ height: '600px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `scale(${zoom}) translate(${panOffset?.x}px, ${panOffset?.y}px)`,
            transformOrigin: 'center center',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Render connections */}
          <g>{renderConnections()}</g>
          
          {/* Render nodes */}
          <g>{renderNodes()}</g>
        </svg>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded shadow text-sm text-gray-600">
          {Math.round(zoom * 100)}%
        </div>
      </div>
      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedNode?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedNode?.description}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Tier and Status */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${TIER_COLORS?.[selectedNode?.tier]?.text}`} />
                  <span className="text-sm font-medium capitalize">{selectedNode?.tier} Tier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">{selectedNode?.xp_reward} XP</span>
                </div>
              </div>

              {/* Prerequisites */}
              {selectedNode?.prerequisites?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Prerequisites</h4>
                  <div className="space-y-1">
                    {selectedNode?.prerequisites?.map(prereqId => {
                      const prereqNode = nodes?.find(n => n?.id === prereqId);
                      return prereqNode ? (
                        <div key={prereqId} className="text-sm text-gray-600">
                          • {prereqNode?.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Progress */}
              {selectedNode?.user_skill_progress?.[0] && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{selectedNode?.user_skill_progress?.[0]?.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${selectedNode?.user_skill_progress?.[0]?.progress_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {getNodeActions(selectedNode)?.map(({ label, action, icon: Icon, color }) => (
                  <button
                    key={action}
                    onClick={() => handleNodeAction(action)}
                    className={`flex items-center gap-2 px-4 py-2 ${color} text-white rounded-lg transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeVisualization;