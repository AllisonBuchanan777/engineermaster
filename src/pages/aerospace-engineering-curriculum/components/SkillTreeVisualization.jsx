import React from 'react';
import { CheckCircle, Circle, Lock, Star } from 'lucide-react';

const SkillTreeVisualization = ({ skillTree, onNodeClick }) => {
  if (!skillTree || !skillTree?.nodes) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Star className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Skill Tree Coming Soon</h3>
        <p className="text-gray-500">The aerospace engineering skill tree is being prepared.</p>
      </div>
    );
  }

  const getNodeStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-600 text-white';
      case 'available': return 'bg-sky-500 border-sky-600 text-white';
      case 'in_progress': return 'bg-yellow-500 border-yellow-600 text-white';
      case 'locked': 
      default: return 'bg-gray-300 border-gray-400 text-gray-600';
    }
  };

  const getNodeIcon = (status, isMilestone) => {
    if (isMilestone) {
      switch (status) {
        case 'completed': return <CheckCircle className="w-6 h-6" />;
        case 'available': case'in_progress': return <Star className="w-6 h-6" />;
        case 'locked':
        default: return <Lock className="w-6 h-6" />;
      }
    } else {
      switch (status) {
        case 'completed': return <CheckCircle className="w-5 h-5" />;
        case 'available': case'in_progress': return <Circle className="w-5 h-5" />;
        case 'locked':
        default: return <Lock className="w-5 h-5" />;
      }
    }
  };

  const getTierLabel = (tier) => {
    const tierMap = {
      bronze: 'Foundation',
      silver: 'Intermediate', 
      gold: 'Advanced',
      platinum: 'Expert',
      diamond: 'Master'
    };
    return tierMap?.[tier] || tier;
  };

  // Group nodes by tier for better layout
  const nodesByTier = skillTree?.nodes?.reduce((groups, node) => {
    const tier = node?.tier || 'bronze';
    if (!groups?.[tier]) groups[tier] = [];
    groups?.[tier]?.push(node);
    return groups;
  }, {}) || {};

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{skillTree?.name}</h2>
        <p className="text-gray-600">{skillTree?.description}</p>
      </div>

      <div className="space-y-8">
        {tierOrder?.map(tier => {
          const nodes = nodesByTier?.[tier];
          if (!nodes || nodes?.length === 0) return null;

          return (
            <div key={tier} className="relative">
              {/* Tier Header */}
              <div className="flex items-center mb-4">
                <div className={`w-1 h-6 rounded mr-3 ${
                  tier === 'bronze' ? 'bg-amber-500' :
                  tier === 'silver' ? 'bg-gray-400' :
                  tier === 'gold' ? 'bg-yellow-500' :
                  tier === 'platinum'? 'bg-purple-500' : 'bg-blue-500'
                }`} />
                <h3 className="text-lg font-semibold text-gray-800">
                  {getTierLabel(tier)} Level
                </h3>
              </div>

              {/* Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes?.map(node => (
                  <div
                    key={node?.id}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      getNodeStatusColor(node?.status)
                    } ${
                      node?.status === 'available' || node?.status === 'in_progress' ?'hover:shadow-lg transform hover:-translate-y-1' 
                        : node?.status === 'locked' ?'cursor-not-allowed' :''
                    } ${node?.is_milestone ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}`}
                    onClick={() => {
                      if (node?.status !== 'locked' && node?.lesson_id) {
                        onNodeClick?.(node?.lesson_id);
                      }
                    }}
                  >
                    {/* Milestone Badge */}
                    {node?.is_milestone && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-800" />
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNodeIcon(node?.status, node?.is_milestone)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{node?.name}</h4>
                        <p className="text-xs opacity-90 line-clamp-2">{node?.description}</p>
                        
                        {/* XP Requirement */}
                        <div className="mt-2 text-xs opacity-75">
                          {node?.xp_required} XP required
                        </div>

                        {/* Status Badge */}
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            node?.status === 'completed' ? 'bg-green-100 text-green-800' :
                            node?.status === 'available' ? 'bg-sky-100 text-sky-800' :
                            node?.status === 'in_progress'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {node?.status === 'completed' ? 'Completed' :
                             node?.status === 'available' ? 'Available' :
                             node?.status === 'in_progress'? 'In Progress' : 'Locked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-gray-600">Milestone</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <Circle className="w-4 h-4 text-sky-500 mr-1" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <Lock className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-600">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeVisualization;