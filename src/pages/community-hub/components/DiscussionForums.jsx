import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Clock, Pin, CheckCircle, Eye, MessageCircle, ArrowUp, Plus, Filter } from 'lucide-react';
import { forumService } from '../../../services/communityService';

const DiscussionForums = ({ forums, searchQuery, selectedDiscipline, onRefresh }) => {
  const [selectedForum, setSelectedForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Filter forums based on search and discipline
  const filteredForums = forums?.filter(forum => {
    const matchesSearch = !searchQuery || 
      forum?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      forum?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
    const matchesDiscipline = !selectedDiscipline || 
      forum?.category === selectedDiscipline;
    
    return matchesSearch && matchesDiscipline;
  }) || [];

  const loadForumPosts = async (forumId) => {
    setLoading(true);
    try {
      const { data, error } = await forumService?.getForumPosts(forumId);
      if (data && !error) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error loading forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedForum) {
      loadForumPosts(selectedForum?.id);
    }
  }, [selectedForum]);

  const handleForumSelect = (forum) => {
    setSelectedForum(forum);
    setPosts([]);
  };

  const handleBackToForums = () => {
    setSelectedForum(null);
    setPosts([]);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      technical: '⚙️',
      career: '💼',
      projects: '🚀',
      general: '💬',
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
    return icons?.[category] || '📋';
  };

  // Forum list view
  if (!selectedForum) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Discussion Forums</h2>
          <button 
            onClick={() => setShowCreatePost(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Discussion
          </button>
        </div>

        {filteredForums?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forums found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredForums?.map(forum => (
              <div 
                key={forum?.id}
                onClick={() => handleForumSelect(forum)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{getCategoryIcon(forum?.category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{forum?.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{forum?.description}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span>24 discussions</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>156 members</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Active today</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Forum posts view
  return (
    <div className="space-y-6">
      {/* Forum header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToForums}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Forums
          </button>
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="solved">Solved First</option>
            </select>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </button>
          </div>
        </div>

        <div className="flex items-center mb-2">
          <span className="text-3xl mr-4">{getCategoryIcon(selectedForum?.category)}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedForum?.name}</h1>
            <p className="text-gray-600">{selectedForum?.description}</p>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 space-x-6 mt-4">
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>24 discussions</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>156 members</span>
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>1.2k views this week</span>
          </div>
        </div>
      </div>
      {/* Posts list */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading discussions...</p>
          </div>
        ) : posts?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-600 mb-4">Be the first to start a conversation in this forum</p>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Discussion
            </button>
          </div>
        ) : (
          posts?.map(post => (
            <div key={post?.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={post?.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.author?.full_name || 'User')}&background=random`}
                    alt={post?.author?.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {post?.is_pinned && <Pin className="w-4 h-4 text-orange-500" />}
                        {post?.is_solved && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {post?.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                        <span>by {post?.author?.full_name}</span>
                        <span>{formatTimeAgo(post?.created_at)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {post?.content?.substring(0, 150)}...
                      </p>
                      
                      {post?.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post?.tags?.slice(0, 3)?.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2 ml-4">
                      <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">{post?.vote_score}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{post?.view_count}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{post?._count?.post_comments || 0}</span>
                      </div>
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Join Discussion →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionForums;