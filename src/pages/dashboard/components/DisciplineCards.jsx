import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Building, FlaskConical, Plane, Cpu, Heart, Leaf, ArrowRight, Play, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { curriculumService } from '../../../services/curriculumService';
import { subscriptionService } from '../../../services/subscriptionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const DisciplineCards = ({ className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  const disciplineConfig = {
    mechanical: {
      icon: Wrench,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Master mechanical systems, thermodynamics, and design'
    },
    electrical: {
      icon: Zap,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Explore circuits, power systems, and control theory'
    },
    civil: {
      icon: Building,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Design structures, infrastructure, and construction'
    },
    chemical: {
      icon: FlaskConical,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Understand processes, reactions, and material science'
    },
    aerospace: {
      icon: Plane,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Learn flight, space systems, and propulsion'
    },
    computer: {
      icon: Cpu,
      color: 'from-gray-500 to-blue-600',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      description: 'Software engineering and computational methods'
    },
    biomedical: {
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Combine engineering with medical applications'
    },
    environmental: {
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Sustainable systems and environmental protection'
    }
  };

  useEffect(() => {
    loadLearningPaths();
  }, [user]);

  const loadLearningPaths = async () => {
    try {
      const paths = await curriculumService?.getLearningPaths(user?.id);
      setLearningPaths(paths || []);
    } catch (error) {
      console.error('Error loading learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPath = async (path) => {
    // Check access level
    const hasAccess = await subscriptionService?.checkContentAccess(
      user?.id, 
      path?.access_level || 'free'
    );

    if (!hasAccess) {
      navigate('/subscription');
      return;
    }

    navigate('/learning-roadmap', { state: { selectedDiscipline: path?.discipline } });
  };

  const getDisciplineInfo = (discipline) => {
    return disciplineConfig?.[discipline] || {
      icon: Wrench,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      description: 'Comprehensive engineering education'
    };
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)]?.map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Engineering Disciplines</h2>
          <p className="text-gray-600 mt-1">Choose your path to engineering mastery</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/learning-roadmap')}
        >
          View All Paths
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {learningPaths?.map((path) => {
          const disciplineInfo = getDisciplineInfo(path?.discipline);
          const Icon = disciplineInfo?.icon;
          const progressPercentage = path?.progress || 0;

          return (
            <div
              key={path?.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-br ${disciplineInfo?.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Icon size={24} />
                  </div>
                  {progressPercentage > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">{progressPercentage}%</div>
                      <div className="text-xs opacity-90">Complete</div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{path?.name}</h3>
                <p className="text-sm opacity-90 line-clamp-2">
                  {path?.description || disciplineInfo?.description}
                </p>
              </div>
              {/* Content */}
              <div className="p-6">
                {/* Progress Bar */}
                {progressPercentage > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${disciplineInfo?.color} transition-all duration-300`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {path?.lessons?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Lessons</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {path?.estimated_duration_hours || 0}h
                    </div>
                    <div className="text-xs text-gray-600">Duration</div>
                  </div>
                </div>

                {/* Learning Objectives */}
                {path?.learning_objectives?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">You'll Learn:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {path?.learning_objectives?.slice(0, 2)?.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle size={14} className={`mt-0.5 mr-2 flex-shrink-0 ${disciplineInfo?.textColor}`} />
                          <span className="line-clamp-1">{objective}</span>
                        </li>
                      ))}
                      {path?.learning_objectives?.length > 2 && (
                        <li className="text-gray-400 text-xs ml-5">
                          +{path?.learning_objectives?.length - 2} more objectives...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Difficulty & Prerequisites */}
                <div className="flex items-center justify-between mb-4 text-xs">
                  <span className={`
                    px-2 py-1 rounded-full font-medium
                    ${path?.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      path?.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      path?.difficulty === 'advanced'? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {path?.difficulty?.charAt(0)?.toUpperCase() + path?.difficulty?.slice(1)}
                  </span>
                  
                  {path?.prerequisites?.length > 0 && (
                    <span className="text-gray-500">
                      {path?.prerequisites?.length} prerequisite{path?.prerequisites?.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleStartPath(path)}
                  className={`w-full bg-gradient-to-r ${disciplineInfo?.color} hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center justify-center">
                    {progressPercentage > 0 ? (
                      <>
                        <Play size={16} className="mr-2" />
                        Continue Path
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Start Learning
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {/* All Disciplines Preview */}
      {learningPaths?.length > 0 && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Explore more engineering disciplines and specialized tracks
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/learning-roadmap')}
            size="lg"
          >
            View Complete Curriculum
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DisciplineCards;