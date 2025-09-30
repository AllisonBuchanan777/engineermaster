import React, { useState, useEffect } from 'react';
import { Search, Users, MessageSquare, Star, ChevronRight, User } from 'lucide-react';
import { forumService, studyGroupService, projectService } from '../../services/communityService';
import DiscussionForums from './components/DiscussionForums';
import StudyGroups from './components/StudyGroups';
import ProjectShowcases from './components/ProjectShowcases';
import TrendingTopics from './components/TrendingTopics';
import LeaderboardPanel from './components/LeaderboardPanel';
import CommunityStats from './components/CommunityStats';

const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('forums');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [forums, setForums] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    activeDiscussions: 0,
    studyGroups: 0,
    projects: 0
  });

  const disciplines = [
    'mechanical', 'electrical', 'civil', 'chemical', 'computer',
    'aerospace', 'biomedical', 'environmental', 'materials', 'industrial'
  ];

  const tabs = [
    { id: 'forums', label: 'Discussion Forums', icon: MessageSquare },
    { id: 'groups', label: 'Study Groups', icon: Users },
    { id: 'projects', label: 'Project Showcases', icon: Star },
    { id: 'mentorship', label: 'Mentorship', icon: User }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all data in parallel
      const [forumsResult, groupsResult, projectsResult] = await Promise.all([
        forumService?.getForums(),
        studyGroupService?.getStudyGroups(),
        projectService?.getProjects()
      ]);

      if (forumsResult?.data) {
        setForums(forumsResult?.data);
      }

      if (groupsResult?.data) {
        setStudyGroups(groupsResult?.data);
      }

      if (projectsResult?.data) {
        setProjects(projectsResult?.data);
      }

      // Calculate stats
      setCommunityStats({
        totalMembers: 1247, // This would come from a stats API
        activeDiscussions: forumsResult?.data?.length || 0,
        studyGroups: groupsResult?.data?.length || 0,
        projects: projectsResult?.data?.length || 0
      });

    } catch (err) {
      console.error('Error loading community data:', err);
      setError('Failed to load community data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDisciplineFilter = (discipline) => {
    setSelectedDiscipline(discipline);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadInitialData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
                <p className="mt-2 text-gray-600">
                  Connect, learn, and collaborate with fellow engineers
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search community..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e?.target?.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                <select
                  value={selectedDiscipline}
                  onChange={(e) => handleDisciplineFilter(e?.target?.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Disciplines</option>
                  {disciplines?.map(discipline => (
                    <option key={discipline} value={discipline}>
                      {discipline?.charAt(0)?.toUpperCase() + discipline?.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Community Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommunityStats stats={communityStats} />
      </div>
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs?.map(tab => {
              const IconComponent = tab?.icon;
              return (
                <button
                  key={tab?.id}
                  onClick={() => handleTabChange(tab?.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {tab?.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Primary Content */}
          <div className="flex-1">
            {activeTab === 'forums' && (
              <DiscussionForums 
                forums={forums}
                searchQuery={searchQuery}
                selectedDiscipline={selectedDiscipline}
                onRefresh={loadInitialData}
              />
            )}
            
            {activeTab === 'groups' && (
              <StudyGroups 
                studyGroups={studyGroups}
                searchQuery={searchQuery}
                selectedDiscipline={selectedDiscipline}
                onRefresh={loadInitialData}
              />
            )}
            
            {activeTab === 'projects' && (
              <ProjectShowcases 
                projects={projects}
                searchQuery={searchQuery}
                selectedDiscipline={selectedDiscipline}
                onRefresh={loadInitialData}
              />
            )}
            
            {activeTab === 'mentorship' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentorship Program</h2>
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Connect with experienced engineers for guidance</p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Find a Mentor
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            <TrendingTopics />
            <LeaderboardPanel />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-blue-900 font-medium">Start Discussion</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-900 font-medium">Create Study Group</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-green-600" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-purple-900 font-medium">Share Project</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Community Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Be respectful and professional in all interactions
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Share knowledge and help others learn
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Stay on topic and provide constructive feedback
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  No spam, self-promotion, or inappropriate content
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;