import React, { useState } from 'react';
import { Star, Eye, MessageCircle, ExternalLink, Code, Heart, Share2, Plus, Filter, Award } from 'lucide-react';
import { projectService } from '../../../services/communityService';

const ProjectShowcases = ({ projects, searchQuery, selectedDiscipline, onRefresh }) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [voteLoading, setVoteLoading] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Filter projects based on search and discipline
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = !searchQuery || 
      project?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      project?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      project?.technologies?.some(tech => tech?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
    
    const matchesDiscipline = !selectedDiscipline || 
      project?.discipline === selectedDiscipline;
    
    return matchesSearch && matchesDiscipline;
  }) || [];

  const handleVote = async (projectId, voteValue) => {
    setVoteLoading(projectId);
    try {
      const { data, error } = await projectService?.voteOnProject(projectId, voteValue);
      if (data && !error) {
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error voting on project:', error);
    } finally {
      setVoteLoading(null);
    }
  };

  const getDisciplineIcon = (discipline) => {
    const icons = {
      mechanical: '🔧',
      electrical: '⚡',
      civil: '🏗️',
      chemical: '🧪',
      computer: '💻',
      aerospace: '✈️',
      biomedical: '🩺',
      environmental: '🌱',
      materials: '⚗️',
      industrial: '🏭'
    };
    return icons?.[discipline] || '🚀';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Project Showcases</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'grid' ?'bg-blue-600 text-white' :'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ?'bg-blue-600 text-white' :'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List
            </button>
          </div>
          <button 
            onClick={() => setShowCreateProject(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Share Project
          </button>
        </div>
      </div>
      {filteredProjects?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">Be the first to showcase your engineering project</p>
          <button 
            onClick={() => setShowCreateProject(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Share Your Project
          </button>
        </div>
      ) : (
        <>
          {/* Featured Projects Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Award className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Featured Projects</h3>
                </div>
                <p className="text-gray-600">Outstanding engineering projects from our community</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                View All Featured
              </button>
            </div>
          </div>

          {/* Projects Grid/List */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProjects?.map(project => (
              <div key={project?.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                {/* Project Image/Thumbnail */}
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-purple-100">
                    {project?.images_urls?.length > 0 ? (
                      <img
                        src={project?.images_urls?.[0]}
                        alt={project?.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-4xl">{getDisciplineIcon(project?.discipline)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Featured Badge */}
                  {project?.is_featured && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </div>
                  )}

                  {/* Discipline Badge */}
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium capitalize">
                    {project?.discipline}
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {project?.title}
                    </h3>
                    <div className="flex flex-col items-center ml-4">
                      <button
                        onClick={() => handleVote(project?.id, 1)}
                        disabled={voteLoading === project?.id}
                        className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-600 mt-1">{project?.vote_count}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{project?.description}</p>

                  {/* Technologies */}
                  {project?.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project?.technologies?.slice(0, 3)?.map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                      {project?.technologies?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{project?.technologies?.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {project?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project?.tags?.slice(0, 2)?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author and Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <img
                        src={project?.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(project?.author?.full_name || 'User')}&background=random`}
                        alt={project?.author?.full_name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{project?.author?.full_name}</span>
                        <p className="text-xs text-gray-500">{formatTimeAgo(project?.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{project?.view_count}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{project?.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {project?.demo_url && (
                        <a
                          href={project?.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Demo
                        </a>
                      )}
                      {project?.source_code_url && (
                        <a
                          href={project?.source_code_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          <Code className="w-3 h-3 mr-1" />
                          Code
                        </a>
                      )}
                    </div>
                    
                    <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4 mr-1" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Project Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Popular Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'IoT Projects', icon: '📡', count: 24 },
            { name: 'Robotics', icon: '🤖', count: 18 },
            { name: 'Web Apps', icon: '💻', count: 32 },
            { name: 'Mobile Apps', icon: '📱', count: 15 },
            { name: 'AI/ML', icon: '🧠', count: 21 }
          ]?.map(category => (
            <button
              key={category?.name}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">{category?.icon}</span>
              <span className="text-sm font-medium text-gray-900">{category?.name}</span>
              <span className="text-xs text-gray-500">{category?.count} projects</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectShowcases;