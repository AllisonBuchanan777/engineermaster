import React, { useState, useEffect } from 'react';
import { Trophy, Star, CheckCircle, Clock, Zap, Cog, Plane, Cpu, Award, Target, TrendingUp, Filter, Search, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { skillTreeService } from '../../services/skillTreeService';
import SkillTreeVisualization from './components/SkillTreeVisualization';


import AchievementUnlocks from './components/AchievementUnlocks';

const DISCIPLINE_ICONS = {
  electrical: Zap,
  mechanical: Cog,
  aerospace: Plane,
  computer: Cpu,
  civil: Trophy,
  chemical: Target,
  biomedical: Star,
  environmental: TrendingUp,
  materials: Award,
  industrial: Users
};

const STATUS_COLORS = {
  locked: 'bg-gray-100 text-gray-400 border-gray-300',
  available: 'bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  mastered: 'bg-green-50 text-green-700 border-green-300'
};

const TIER_COLORS = {
  bronze: 'text-amber-600 bg-amber-50',
  silver: 'text-gray-600 bg-gray-50',
  gold: 'text-yellow-600 bg-yellow-50',
  platinum: 'text-purple-600 bg-purple-50'
};

const SkillTrees = () => {
  const { user } = useAuth();
  const [skillTrees, setSkillTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [masteryStats, setMasteryStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview'); // overview, tree, achievements
  const [filters, setFilters] = useState({
    discipline: 'all',
    tier: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSkillTreesData();
  }, [user]);

  const loadSkillTreesData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load skill trees with progress
      const { data: treesData, error: treesError } = await skillTreeService?.getAllSkillTreesWithProgress(user?.id);
      if (treesError) throw new Error(treesError);
      
      // Load mastery statistics
      const { data: statsData, error: statsError } = await skillTreeService?.getUserMasteryStats(user?.id);
      if (statsError) throw new Error(statsError);

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await skillTreeService?.getUserSkillAchievements(user?.id);
      if (achievementsError) throw new Error(achievementsError);

      setSkillTrees(treesData || []);
      setMasteryStats(statsData);
      setAchievements(achievementsData || []);
    } catch (err) {
      setError(`Failed to load skill trees: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTreeSelect = async (tree) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await skillTreeService?.getSkillTreeWithProgress(tree?.id, user?.id);
      if (error) throw new Error(error);
      
      setSelectedTree(data);
      setView('tree');
    } catch (err) {
      setError(`Failed to load skill tree details: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeInteraction = async (nodeId, action) => {
    if (!user) return;

    try {
      const updates = {
        status: action === 'start' ? 'in_progress' : 'available',
        progress_percentage: action === 'start' ? 10 : 0,
        unlocked_at: action === 'unlock' ? new Date()?.toISOString() : null
      };

      const { error } = await skillTreeService?.updateSkillProgress(user?.id, nodeId, updates);
      if (error) throw new Error(error);

      // Refresh current tree data
      if (selectedTree) {
        const { data, error: refreshError } = await skillTreeService?.getSkillTreeWithProgress(selectedTree?.tree?.id, user?.id);
        if (refreshError) throw new Error(refreshError);
        setSelectedTree(data);
      }
    } catch (err) {
      setError(`Failed to update progress: ${err?.message}`);
    }
  };

  const filteredTrees = skillTrees?.filter(tree => {
    const matchesDiscipline = filters?.discipline === 'all' || tree?.discipline === filters?.discipline;
    const matchesSearch = tree?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         tree?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesDiscipline && matchesSearch;
  }) || [];

  if (loading && !selectedTree) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill trees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-semibold text-red-900">Error Loading Skill Trees</h3>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadSkillTreesData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {view === 'tree' ? selectedTree?.tree?.name : 'Engineering Skill Trees'}
              </h1>
              <p className="text-gray-600 mt-1">
                {view === 'tree' ?'Master skills through structured learning paths' :'Visual progression paths showing engineering mastery development'
                }
              </p>
            </div>
            
            {/* View Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'overview' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setView('achievements')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'achievements' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Achievements
              </button>
              {selectedTree && (
                <button
                  onClick={() => setSelectedTree(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Back to Trees
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'overview' && !selectedTree && (
          <>
            {/* Mastery Overview */}
            {masteryStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Skills</p>
                      <p className="text-2xl font-bold text-gray-900">{masteryStats?.total_nodes}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Mastered</p>
                      <p className="text-2xl font-bold text-green-600">{masteryStats?.mastered_nodes}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">{masteryStats?.in_progress_nodes}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completion</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {masteryStats?.total_nodes > 0 ? Math.round((masteryStats?.mastered_nodes / masteryStats?.total_nodes) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search skill trees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filters?.discipline}
                    onChange={(e) => setFilters(prev => ({ ...prev, discipline: e?.target?.value }))}
                    className="border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                  >
                    <option value="all">All Disciplines</option>
                    <option value="electrical">Electrical</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="aerospace">Aerospace</option>
                    <option value="computer">Computer/Mechatronics</option>
                    <option value="civil">Civil</option>
                    <option value="chemical">Chemical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skill Trees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrees?.map((tree) => {
                const IconComponent = DISCIPLINE_ICONS?.[tree?.discipline] || Trophy;
                const progressPercentage = tree?.progress?.progress_percentage || 0;
                
                return (
                  <div
                    key={tree?.id}
                    onClick={() => handleTreeSelect(tree)}
                    className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <IconComponent className="w-6 h-6 text-indigo-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{tree?.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{tree?.description}</p>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{tree?.progress?.mastered_nodes || 0} of {tree?.progress?.total_nodes || 0} skills mastered</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTrees?.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No skill trees found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}

        {/* Individual Tree View */}
        {view === 'tree' && selectedTree && (
          <SkillTreeVisualization
            treeData={selectedTree}
            onNodeInteraction={handleNodeInteraction}
            loading={loading}
          />
        )}

        {/* Achievements View */}
        {view === 'achievements' && (
          <AchievementUnlocks
            achievements={achievements}
            masteryStats={masteryStats}
            onBack={() => setView('overview')}
          />
        )}
      </div>
    </div>
  );
};

export default SkillTrees;