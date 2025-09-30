import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Award, 
  BookOpen, 
  Play, 
  Lock, 
  CheckCircle, 
  BarChart3,
  TreePine,
  Trophy,
  Zap,
  Target,
  Crown
} from 'lucide-react';
import { learningService } from '../../services/learningService';

const ComprehensiveLessonLibrary = () => {
  const [lessons, setLessons] = useState([]);
  const [skillTrees, setSkillTrees] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('lessons'); // 'lessons', 'skill-trees', 'achievements'
  const [userProgress, setUserProgress] = useState({});

  const disciplines = [
    { value: 'all', label: 'All Disciplines', icon: BookOpen },
    { value: 'mechanical', label: 'Mechanical Engineering', icon: Target },
    { value: 'electrical', label: 'Electrical Engineering', icon: Zap },
    { value: 'civil', label: 'Civil Engineering', icon: BarChart3 },
    { value: 'chemical', label: 'Chemical Engineering', icon: Award },
    { value: 'computer', label: 'Computer Engineering', icon: Crown },
    { value: 'aerospace', label: 'Aerospace Engineering', icon: TreePine }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
    { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
  ];

  const lessonTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Simulation', label: 'Simulation' },
    { value: 'Project', label: 'Project' }
  ];

  const achievementTiers = [
    { tier: 'bronze', label: 'Bronze', color: 'from-amber-600 to-orange-700', icon: Award },
    { tier: 'silver', label: 'Silver', color: 'from-gray-400 to-gray-600', icon: Star },
    { tier: 'gold', label: 'Gold', color: 'from-yellow-400 to-yellow-600', icon: Trophy },
    { tier: 'platinum', label: 'Platinum', color: 'from-purple-400 to-purple-600', icon: Crown }
  ];

  useEffect(() => {
    fetchLibraryData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, searchQuery, selectedDiscipline, selectedDifficulty, selectedType]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      
      // Fetch lessons, skill trees, and achievements in parallel
      const [lessonsData, skillTreesData, achievementsData] = await Promise.all([
        learningService?.getAccessibleLessons(),
        fetchSkillTrees(),
        fetchAchievements()
      ]);

      setLessons(lessonsData || []);
      setSkillTrees(skillTreesData || []);
      setAchievements(achievementsData || []);
      
      // Mock user progress data
      setUserProgress({
        completedLessons: lessonsData?.filter(l => Math.random() > 0.7)?.length || 0,
        totalXP: 2450,
        currentLevel: 12,
        completedSkillNodes: 15,
        earnedAchievements: 8
      });

    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillTrees = async () => {
    try {
      // Mock skill trees data - in real app this would come from learningService
      return [
        {
          id: '1',
          name: 'Mechanical Engineering Mastery',
          discipline: 'mechanical',
          totalNodes: 5,
          completedNodes: 2,
          progress: 40,
          icon: 'Target',
          color: 'from-red-500 to-red-700'
        },
        {
          id: '2', 
          name: 'Electrical Engineering Excellence',
          discipline: 'electrical',
          totalNodes: 5,
          completedNodes: 3,
          progress: 60,
          icon: 'Zap',
          color: 'from-blue-500 to-blue-700'
        },
        {
          id: '3',
          name: 'Civil Engineering Foundations',
          discipline: 'civil', 
          totalNodes: 4,
          completedNodes: 1,
          progress: 25,
          icon: 'BarChart3',
          color: 'from-green-500 to-green-700'
        }
      ];
    } catch (error) {
      console.error('Error fetching skill trees:', error);
      return [];
    }
  };

  const fetchAchievements = async () => {
    try {
      // Mock achievements data - in real app this would come from learningService
      return [
        {
          id: '1',
          name: 'Bronze Explorer',
          description: 'Complete your first skill tree foundation node',
          tier: 'bronze',
          earned: true,
          earnedAt: new Date('2024-09-25'),
          xpReward: 25,
          icon: 'Award'
        },
        {
          id: '2',
          name: 'Silver Achiever', 
          description: 'Complete 5 core skill nodes across all disciplines',
          tier: 'silver',
          earned: true,
          earnedAt: new Date('2024-09-28'),
          xpReward: 100,
          icon: 'Star'
        },
        {
          id: '3',
          name: 'Gold Master',
          description: 'Complete 3 advanced skill nodes and earn 1000 XP',
          tier: 'gold',
          earned: false,
          progress: 65,
          xpReward: 250,
          icon: 'Trophy'
        },
        {
          id: '4',
          name: 'Platinum Elite',
          description: 'Achieve mastery in 2 different engineering disciplines',
          tier: 'platinum',
          earned: false,
          progress: 30,
          xpReward: 500,
          icon: 'Crown'
        }
      ];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  };

  const filterLessons = () => {
    let filtered = lessons || [];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered?.filter(lesson =>
        lesson?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        lesson?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Filter by discipline
    if (selectedDiscipline !== 'all') {
      // Since lessons don't have discipline directly, we need to get it from learning paths
      // For now, we'll use a simpler approach based on lesson type or title
      filtered = filtered?.filter(lesson => {
        const lessonDiscipline = getLessonDiscipline(lesson);
        return lessonDiscipline === selectedDiscipline;
      });
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered?.filter(lesson => lesson?.difficulty === selectedDifficulty);
    }

    // Filter by lesson type
    if (selectedType !== 'all') {
      filtered = filtered?.filter(lesson => lesson?.lesson_type === selectedType);
    }

    setFilteredLessons(filtered);
  };

  const getLessonDiscipline = (lesson) => {
    // Simple heuristic to determine discipline from lesson content
    const title = lesson?.title?.toLowerCase() || '';
    const type = lesson?.lesson_type?.toLowerCase() || '';
    
    if (title?.includes('mechanical') || title?.includes('statics') || title?.includes('dynamics')) {
      return 'mechanical';
    }
    if (title?.includes('electrical') || title?.includes('circuit') || type === 'electrical') {
      return 'electrical'; 
    }
    if (title?.includes('civil') || title?.includes('structural')) {
      return 'civil';
    }
    if (title?.includes('chemical') || title?.includes('process')) {
      return 'chemical';
    }
    if (title?.includes('computer') || title?.includes('digital')) {
      return 'computer';
    }
    if (title?.includes('aerospace') || title?.includes('flight')) {
      return 'aerospace';
    }
    
    return 'mechanical'; // default
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyObj = difficulties?.find(d => d?.value === difficulty);
    return difficultyObj?.color || 'bg-gray-100 text-gray-800';
  };

  const renderIconComponent = (iconName, className = 'w-5 h-5') => {
    const IconComponent = {
      BookOpen,
      Target, 
      Zap,
      BarChart3,
      Award,
      Crown,
      TreePine,
      Trophy,
      Star,
      Play,
      Lock,
      CheckCircle,
      Clock
    }?.[iconName] || BookOpen;
    
    return <IconComponent className={className} />;
  };

  const LessonCard = ({ lesson }) => {
    const isCompleted = lesson?.userProgress?.completion_percentage === 100;
    const hasAccess = lesson?.hasAccess;
    const progress = lesson?.userProgress?.completion_percentage || 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson?.difficulty)}`}>
                  {lesson?.difficulty?.charAt(0)?.toUpperCase() + lesson?.difficulty?.slice(1)}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {lesson?.lesson_type}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {lesson?.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {lesson?.description}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : !hasAccess ? (
                <Lock className="w-6 h-6 text-gray-400" />
              ) : (
                <Play className="w-6 h-6 text-blue-500" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson?.estimated_duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{lesson?.xp_reward} XP</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              {isCompleted ? 'Review' : hasAccess ? 'Start' : 'Unlock'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SkillTreeCard = ({ skillTree }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${skillTree?.color}`}>
              {renderIconComponent(skillTree?.icon, 'w-6 h-6 text-white')}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {skillTree?.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {skillTree?.discipline?.charAt(0)?.toUpperCase() + skillTree?.discipline?.slice(1)} Engineering
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{skillTree?.completedNodes}/{skillTree?.totalNodes} nodes completed</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(skillTree?.progress)}`}
                  style={{ width: `${skillTree?.progress}%` }}
                ></div>
              </div>

              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                View Skill Tree
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AchievementCard = ({ achievement }) => {
    const tierInfo = achievementTiers?.find(t => t?.tier === achievement?.tier);
    const isEarned = achievement?.earned;
    const progress = achievement?.progress || 0;

    return (
      <div className={`bg-white rounded-xl shadow-sm border-2 ${isEarned ? 'border-yellow-300' : 'border-gray-200'} hover:shadow-md transition-all duration-200`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${tierInfo?.color} ${isEarned ? '' : 'opacity-50'}`}>
              {renderIconComponent(achievement?.icon, 'w-6 h-6 text-white')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {achievement?.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tierInfo?.color} text-white`}>
                  {tierInfo?.label}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">
                {achievement?.description}
              </p>

              {isEarned ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Earned on {new Date(achievement?.earnedAt)?.toLocaleDateString()}</span>
                  <span>• +{achievement?.xpReward} XP</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Reward: +{achievement?.xpReward} XP
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comprehensive lesson library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comprehensive Lesson Library
          </h1>
          <p className="text-gray-600 mb-6">
            Master engineering concepts through structured learning paths, skill trees, and achievement-based progression
          </p>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{userProgress?.completedLessons || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total XP</p>
                  <p className="text-2xl font-bold text-gray-900">{userProgress?.totalXP?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TreePine className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skill Nodes</p>
                  <p className="text-2xl font-bold text-gray-900">{userProgress?.completedSkillNodes || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{userProgress?.earnedAchievements || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setViewMode('lessons')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'lessons' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lessons
            </button>
            <button
              onClick={() => setViewMode('skill-trees')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'skill-trees' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
              }`}
            >
              Skill Trees
            </button>
            <button
              onClick={() => setViewMode('achievements')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'achievements' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
              }`}
            >
              Achievements
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search lessons, topics, or concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e?.target?.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {disciplines?.map(discipline => (
                  <option key={discipline?.value} value={discipline?.value}>
                    {discipline?.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e?.target?.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties?.map(difficulty => (
                  <option key={difficulty?.value} value={difficulty?.value}>
                    {difficulty?.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e?.target?.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lessonTypes?.map(type => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredLessons?.length} Lessons Found
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLessons?.map(lesson => (
                <LessonCard key={lesson?.id} lesson={lesson} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'skill-trees' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Skill Trees ({skillTrees?.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {skillTrees?.map(skillTree => (
                <SkillTreeCard key={skillTree?.id} skillTree={skillTree} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Achievements ({achievements?.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {achievements?.map(achievement => (
                <AchievementCard key={achievement?.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveLessonLibrary;