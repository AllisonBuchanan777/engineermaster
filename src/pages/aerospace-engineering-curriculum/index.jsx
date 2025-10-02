import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Zap, Navigation, Cpu, Layers, Globe, Clock, Award, BookOpen, TrendingUp, Target } from 'lucide-react';
import { aerospaceCurriculumService } from '../../services/aerospaceCurriculumService';
import ModuleCard from './components/ModuleCard';
import ProgressOverview from './components/ProgressOverview';
import SkillTreeVisualization from './components/SkillTreeVisualization';
import AchievementsBadges from './components/AchievementsBadges';
import DailyChallenge from './components/DailyChallenge';
import Icon from '../../components/AppIcon';


const AerospaceEngineeringCurriculum = () => {
  const [modules, setModules] = useState([]);
  const [skillTree, setSkillTree] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('modules'); // modules, skillTree, achievements
  
  const navigate = useNavigate();
  
  // Mock user ID - in real app, get from auth context
  const userId = 'current-user-id'; 

  useEffect(() => {
    loadCurriculumData();
  }, []);

  const loadCurriculumData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [modulesData, skillTreeData, achievementsData, challengeData] = await Promise.all([
        aerospaceCurriculumService?.getAerospaceModules(userId),
        aerospaceCurriculumService?.getAerospaceSkillTree(userId),
        aerospaceCurriculumService?.getAerospaceAchievements(userId),
        aerospaceCurriculumService?.getTodayAerospaceChallenge(userId)
      ]);

      setModules(modulesData || []);
      setSkillTree(skillTreeData);
      setAchievements(achievementsData || []);
      setDailyChallenge(challengeData);

      // Calculate overall progress
      const completedModules = modulesData?.filter(module => module?.progress === 100)?.length || 0;
      const totalModules = modulesData?.length || 1;
      setOverallProgress(Math.round((completedModules / totalModules) * 100));

    } catch (err) {
      console.error('Error loading curriculum data:', err);
      setError('Failed to load curriculum data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = async (lessonId) => {
    try {
      await aerospaceCurriculumService?.startLesson(userId, lessonId);
      navigate(`/lesson/${lessonId}`);
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  };

  const handleModuleClick = (module) => {
    if (module?.isLocked) {
      return; // Show locked state
    }
    
    // Navigate to first lesson in module or module overview
    const firstLesson = module?.lessons?.[0];
    if (firstLesson) {
      handleStartLesson(firstLesson?.id);
    }
  };

  const getModuleIcon = (iconName) => {
    const icons = {
      'Wind': Wind,
      'Zap': Zap,
      'Navigation': Navigation,
      'Cpu': Cpu,
      'Layers': Layers,
      'Globe': Globe
    };
    return icons?.[iconName] || BookOpen;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Aerospace Engineering Curriculum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Curriculum</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadCurriculumData}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                ✈️ Aerospace Engineering Curriculum
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Master aerospace engineering from aerodynamics and propulsion to space systems and mission design
              </p>
              
              {/* Progress Overview */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{modules?.length} Modules</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>~95 Hours Total</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  <span>{achievements?.filter(a => a?.isEarned)?.length}/{achievements?.length} Achievements</span>
                </div>
              </div>
            </div>
            
            {/* Progress Ring */}
            <div className="mt-6 md:mt-0">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress / 100)}`}
                    className="text-sky-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{overallProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'modules', name: 'Modules', icon: BookOpen },
              { id: 'skillTree', name: 'Skill Tree', icon: TrendingUp },
              { id: 'achievements', name: 'Achievements', icon: Award }
            ]?.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id)}
                className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === id
                    ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedView === 'modules' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules?.map((module, index) => (
                    <ModuleCard
                      key={module?.id}
                      module={module}
                      index={index}
                      onModuleClick={handleModuleClick}
                      getIcon={getModuleIcon}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'skillTree' && (
              <SkillTreeVisualization 
                skillTree={skillTree}
                onNodeClick={handleStartLesson}
              />
            )}

            {selectedView === 'achievements' && (
              <AchievementsBadges 
                achievements={achievements}
                onAchievementClick={(achievement) => console.log('Achievement clicked:', achievement)}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Overview */}
            <ProgressOverview 
              modules={modules}
              overallProgress={overallProgress}
            />

            {/* Daily Challenge */}
            {dailyChallenge && (
              <DailyChallenge 
                challenge={dailyChallenge}
                onStartChallenge={() => console.log('Start daily challenge')}
              />
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Modules</span>
                  <span className="font-semibold">
                    {modules?.filter(m => m?.progress === 100)?.length}/{modules?.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total XP Earned</span>
                  <span className="font-semibold text-sky-600">2,340</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Learning Streak</span>
                  <span className="font-semibold text-green-600">8 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Invested</span>
                  <span className="font-semibold">12.3 hours</span>
                </div>
              </div>
            </div>

            {/* Recommended Next */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-sky-600" />
                Recommended Next
              </h3>
              {(() => {
                const nextModule = modules?.find(m => m?.progress < 100 && !m?.isLocked);
                return nextModule ? (
                  <div 
                    className="p-4 border border-sky-200 rounded-lg cursor-pointer hover:bg-sky-50 transition-colors"
                    onClick={() => handleModuleClick(nextModule)}
                  >
                    <div className="flex items-center mb-2">
                      {(() => {
                        const Icon = getModuleIcon(nextModule?.icon);
                        return <Icon className="w-5 h-5 mr-2 text-sky-600" />;
                      })()}
                      <h4 className="font-medium text-gray-900">{nextModule?.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{nextModule?.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{nextModule?.difficulty}</span>
                      <span>{nextModule?.estimatedHours}h</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Great job! You have completed the curriculum.</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AerospaceEngineeringCurriculum;