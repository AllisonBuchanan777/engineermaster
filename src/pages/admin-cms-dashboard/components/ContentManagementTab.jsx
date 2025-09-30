import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Eye, Search, Filter, MoreVertical, Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../../../services/adminService';

const ContentManagementTab = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, searchTerm, statusFilter, difficultyFilter]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminService?.getLessonsForAdmin({
        limit: 100
      });
      
      if (error) {
        console.error('Error loading lessons:', error);
      } else {
        setLessons(data || []);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLessons = () => {
    let filtered = [...lessons];

    // Search filter
    if (searchTerm) {
      filtered = filtered?.filter(lesson =>
        lesson?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        lesson?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published';
      filtered = filtered?.filter(lesson => lesson?.is_published === isPublished);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered?.filter(lesson => lesson?.difficulty === difficultyFilter);
    }

    setFilteredLessons(filtered);
  };

  const handlePublishToggle = async (lessonId, currentStatus) => {
    try {
      const { data, error } = await adminService?.updateLesson(
        lessonId,
        { is_published: !currentStatus },
        user?.id
      );

      if (error) {
        console.error('Error updating lesson:', error);
        alert('Failed to update lesson status');
        return;
      }

      // Update local state
      setLessons(prevLessons =>
        prevLessons?.map(lesson =>
          lesson?.id === lessonId
            ? { ...lesson, is_published: !currentStatus }
            : lesson
        )
      );

      alert(`Lesson ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Failed to update lesson status');
    }
  };

  const getStatusIcon = (isPublished) => {
    return isPublished 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-gray-400" />;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors?.[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          {[...Array(5)]?.map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Management</h2>
          <p className="text-gray-600 text-sm">
            Manage lessons, courses, and learning materials across all engineering disciplines
          </p>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Create Lesson</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="sm:w-48">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredLessons?.length} of {lessons?.length} lessons
        </span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            {lessons?.filter(l => l?.is_published)?.length} Published
          </span>
          <span className="flex items-center">
            <XCircle className="h-4 w-4 text-gray-400 mr-1" />
            {lessons?.filter(l => !l?.is_published)?.length} Drafts
          </span>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || difficultyFilter !== 'all'
                ? 'No lessons match your current filters' :'No lessons available yet'
              }
            </p>
          </div>
        ) : (
          filteredLessons?.map((lesson) => (
            <div key={lesson?.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(lesson?.is_published)}
                    <h3 className="text-lg font-medium text-gray-900">
                      {lesson?.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(lesson?.difficulty)}`}>
                      {lesson?.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {lesson?.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{lesson?.created_by_user?.full_name || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(lesson?.updated_at)?.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{lesson?.estimated_duration_minutes || 30} min</span>
                    </div>
                    
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{lesson?.learning_path?.title || 'No path'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handlePublishToggle(lesson?.id, lesson?.is_published)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-full transition-colors
                      ${lesson?.is_published
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' :'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    `}
                  >
                    {lesson?.is_published ? 'Published' : 'Draft'}
                  </button>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredLessons?.length > 10 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to {Math?.min(10, filteredLessons?.length)} of {filteredLessons?.length} results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagementTab;