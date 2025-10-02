import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Lock, CheckCircle, Trophy, Target, Clock, Zap, Bot, Cpu, Radio, Code, Settings, BarChart3, ArrowRight, BookOpen, Award, TrendingUp } from 'lucide-react';
import { mechatronicCurriculumService } from '../../services/mechatronicCurriculumService';
import ModuleCard from './components/ModuleCard';
import ProgressOverview from './components/ProgressOverview';
import DailyChallenge from './components/DailyChallenge';
import SkillTreeVisualization from './components/SkillTreeVisualization';
import AchievementsBadges from './components/AchievementsBadges';

const MechatronicEngineeringCurriculum = () => {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Fetch curriculum data on component mount
  useEffect(() => {
    loadCurriculumData();
  }, []);

  const loadCurriculumData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all curriculum data
      const [modulesData, progressData, challengeData, achievementsData] = await Promise.all([
        mechatronicCurriculumService?.getMechatronicModules(),
        mechatronicCurriculumService?.getMechatronicProgress(),
        mechatronicCurriculumService?.getTodayMechatronicChallenge(),
        mechatronicCurriculumService?.getMechatronicAchievements()
      ]);

      setModules(modulesData || []);
      setProgress(progressData || {});
      setDailyChallenge(challengeData);
      setAchievements(achievementsData || []);
    } catch (err) {
      console.error('Error loading mechatronic curriculum:', err);
      setError('Failed to load curriculum data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (module) => {
    if (!module?.isLocked) {
      setSelectedModule(module);
    }
  };

  const handleStartLesson = async (lessonId) => {
    try {
      await mechatronicCurriculumService?.startLesson(null, lessonId);
      // Refresh data after starting lesson
      loadCurriculumData();
    } catch (err) {
      console.error('Error starting lesson:', err);
      setError('Failed to start lesson. Please try again.');
    }
  };

  const getModuleIcon = (iconName) => {
    const icons = {
      Cpu,
      Radio,
      Code,
      Settings,
      BarChart3,
      Bot,
      Zap
    };
    const IconComponent = icons?.[iconName] || Cpu;
    return <IconComponent className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mechatronic curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Cpu className="w-12 h-12 mr-3" />
              <h1 className="text-4xl font-bold">Mechatronic Engineering Curriculum</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Master the integration of mechanical, electrical, and computer systems through 
              progressive modules with hands-on projects and real-world applications.
            </p>
            
            {progress && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{progress?.overallProgress || 0}%</div>
                  <div className="text-sm text-blue-100">Overall Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{progress?.completedModules || 0}/6</div>
                  <div className="text-sm text-blue-100">Modules Complete</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{progress?.currentLevel || 1}</div>
                  <div className="text-sm text-blue-100">Current Level</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{progress?.totalXP || 0}</div>
                  <div className="text-sm text-blue-100">Total XP</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Progress Overview */}
        <div className="mb-8">
          <ProgressOverview progress={progress} />
        </div>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="mb-8">
            <DailyChallenge challenge={dailyChallenge} onRefresh={loadCurriculumData} />
          </div>
        )}

        {/* Learning Path Overview */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2 text-purple-600" />
            Learning Path Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules?.map((module, index) => (
              <div key={module?.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                  ${module?.isLocked ? 'bg-gray-400' : module?.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{module?.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{module?.progress || 0}% complete</span>
                    {module?.isLocked && <Lock className="w-4 h-4" />}
                    {module?.progress === 100 && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            Mechatronic Engineering Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules?.map((module) => (
              <ModuleCard 
                key={module?.id}
                module={module}
                onClick={() => handleModuleClick(module)}
                getIcon={getModuleIcon}
              />
            ))}
          </div>
        </div>

        {/* Skills and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skill Tree Visualization */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Skill Development Tree
            </h3>
            <SkillTreeVisualization modules={modules} />
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Achievements & Badges
            </h3>
            <AchievementsBadges achievements={achievements?.slice(0, 6)} />
            {achievements?.length > 6 && (
              <Link 
                to="/achievement-levels" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-4"
              >
                View All Achievements
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Module Detail Modal */}
        {selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white mr-4`}
                         style={{ backgroundColor: selectedModule?.color }}>
                      {getModuleIcon(selectedModule?.icon)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedModule?.name}</h3>
                      <p className="text-gray-600">{selectedModule?.difficulty} • {selectedModule?.estimatedHours}h</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedModule(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-700 mb-6">{selectedModule?.description}</p>

                {/* Key Topics */}
                {selectedModule?.keyTopics && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Topics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedModule?.keyTopics?.map((topic, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {selectedModule?.projects && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Hands-on Projects</h4>
                    <div className="space-y-2">
                      {selectedModule?.projects?.map((project, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <Target className="w-4 h-4 mr-2 text-blue-500" />
                          {project}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lessons */}
                {selectedModule?.lessons?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Available Lessons</h4>
                    <div className="space-y-2">
                      {selectedModule?.lessons?.slice(0, 5)?.map((lesson) => (
                        <div key={lesson?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3
                              ${lesson?.userProgress?.completion_percentage === 100 ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                              {lesson?.userProgress?.completion_percentage === 100 ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{lesson?.title}</h5>
                              <p className="text-sm text-gray-600">{lesson?.estimated_duration_minutes}min • {lesson?.xp_reward}XP</p>
                            </div>
                          </div>
                          {lesson?.userProgress?.completion_percentage !== 100 && (
                            <button 
                              onClick={() => handleStartLesson(lesson?.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedModule?.estimatedHours}h estimated
                  </div>
                  <Link 
                    to={`/lesson-interface?module=${selectedModule?.id}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                  >
                    Enter Module
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start Your Mechatronic Journey?</h3>
          <p className="text-gray-600 mb-4">
            Begin with integrated systems and progress through advanced robotics concepts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/comprehensive-lesson-library" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse All Lessons
            </Link>
            <Link 
              to="/skill-trees" 
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Skill Trees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechatronicEngineeringCurriculum;