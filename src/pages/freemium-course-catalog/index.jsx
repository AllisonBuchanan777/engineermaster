import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Grid, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { freemiumService } from '../../services/freemiumService';
import { useNavigate } from 'react-router-dom';

// Components
import CourseCard from './components/CourseCard';
import FilterPanel from './components/FilterPanel';
import UpgradeModal from './components/UpgradeModal';
import CoursePreview from './components/CoursePreview';

const FreemiumCourseCatalog = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Filter panel state
  const [showFilters, setShowFilters] = useState(false);
  
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    loadCourses();
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [courses, searchTerm, selectedDiscipline, selectedDifficulty, selectedAccessLevel, sortBy]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await freemiumService?.getCourses(user?.id);
      setCourses(data || []);
      
      if (user?.id) {
        const subscription = await freemiumService?.getUserSubscription(user?.id);
        setUserSubscription(subscription);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered?.filter(course =>
        course?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        course?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        course?.skill_trees?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Discipline filter
    if (selectedDiscipline !== 'all') {
      filtered = filtered?.filter(course => course?.skill_trees?.discipline === selectedDiscipline);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered?.filter(course => course?.difficulty === selectedDifficulty);
    }

    // Access level filter
    if (selectedAccessLevel !== 'all') {
      filtered = filtered?.filter(course => course?.access_level === selectedAccessLevel);
    }

    // Sort courses
    filtered = filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a?.title?.localeCompare(b?.title);
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          return (difficultyOrder?.[a?.difficulty] || 0) - (difficultyOrder?.[b?.difficulty] || 0);
        case 'duration':
          return (a?.estimated_duration_minutes || 0) - (b?.estimated_duration_minutes || 0);
        case 'newest':
          return new Date(b?.created_at) - new Date(a?.created_at);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  const handleCourseSelect = async (course) => {
    if (!course?.isAccessible) {
      setSelectedCourse(course);
      setShowUpgradeModal(true);
    } else if (user?.id) {
      try {
        await freemiumService?.startLesson(user?.id, course?.id);
        navigate(`/lesson/${course?.id}`);
      } catch (err) {
        console.error('Error starting lesson:', err);
        if (err?.message?.includes('Upgrade required')) {
          setSelectedCourse(course);
          setShowUpgradeModal(true);
        } else {
          setError('Failed to start lesson. Please try again.');
        }
      }
    } else {
      navigate('/login');
    }
  };

  const handlePreviewCourse = async (course) => {
    try {
      const preview = await freemiumService?.getCoursePreview(course?.id, user?.id);
      setSelectedCourse({ ...course, preview });
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Failed to load course preview.');
    }
  };

  const getDisciplineIcon = (discipline) => {
    const icons = {
      mechanical: '⚙️',
      electrical: '⚡',
      civil: '🏗️',
      chemical: '🧪',
      computer: '💻',
      aerospace: '🚀',
      biomedical: '🧬',
      environmental: '🌱',
      materials: '🔬',
      industrial: '🏭'
    };
    return icons?.[discipline] || '📚';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors?.[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)]?.map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
              <p className="text-gray-600 mt-2">
                Discover engineering courses designed for every skill level
              </p>
            </div>
            
            {userSubscription && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <span className="font-medium capitalize">{userSubscription?.tier} Plan</span>
                {userSubscription?.tier === 'free' && (
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, topics, or disciplines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e?.target?.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Disciplines</option>
                <option value="mechanical">Mechanical</option>
                <option value="electrical">Electrical</option>
                <option value="civil">Civil</option>
                <option value="chemical">Chemical</option>
                <option value="computer">Computer</option>
                <option value="aerospace">Aerospace</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e?.target?.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <FilterPanel
              selectedAccessLevel={selectedAccessLevel}
              setSelectedAccessLevel={setSelectedAccessLevel}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {filteredCourses?.length} course{filteredCourses?.length !== 1 ? 's' : ''} found
            </p>
            
            {(searchTerm || selectedDiscipline !== 'all' || selectedDifficulty !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDiscipline('all');
                  setSelectedDifficulty('all');
                  setSelectedAccessLevel('all');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Course Grid/List */}
        {filteredCourses?.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ?'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :'grid-cols-1'
          }`}>
            {filteredCourses?.map((course) => (
              <CourseCard
                key={course?.id}
                course={course}
                viewMode={viewMode}
                userSubscription={userSubscription}
                onSelect={handleCourseSelect}
                onPreview={handlePreviewCourse}
                getDisciplineIcon={getDisciplineIcon}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more courses.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpgradeModal && selectedCourse && (
        <UpgradeModal
          course={selectedCourse}
          userSubscription={userSubscription}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => navigate('/subscription-plans')}
        />
      )}

      {showPreviewModal && selectedCourse && (
        <CoursePreview
          course={selectedCourse}
          onClose={() => setShowPreviewModal(false)}
          onEnroll={() => {
            setShowPreviewModal(false);
            handleCourseSelect(selectedCourse);
          }}
        />
      )}
    </div>
  );
};

export default FreemiumCourseCatalog;