import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import RoadmapFilters from './components/RoadmapFilters';
import ProgressOverview from './components/ProgressOverview';
import RecommendedNext from './components/RecommendedNext';
import RoadmapVisualization from './components/RoadmapVisualization';
import ModulePreview from './components/ModulePreview';
import Icon from '../../components/AppIcon';

const LearningRoadmap = () => {
  const navigate = useNavigate();
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState('roadmap'); // 'roadmap' or 'list'

  // Mock data for learning modules
  const modules = [
    {
      id: 'elec-001',
      title: 'Basic Circuit Analysis',
      discipline: 'electrical',
      difficulty: 'beginner',
      status: 'completed',
      estimatedTime: '2 hours',
      xpReward: 150,
      completedBy: 15420,
      progress: 100,
      prerequisites: [],
      description: `Master the fundamentals of electrical circuits including Ohm's law, Kirchhoff's laws, and basic circuit analysis techniques. This module provides the foundation for all electrical engineering concepts.`,
      objectives: [
        'Understand Ohm\'s law and its applications',
        'Apply Kirchhoff\'s voltage and current laws',
        'Analyze series and parallel circuits',
        'Calculate power consumption in circuits'
      ],
      keyConcepts: ['Voltage', 'Current', 'Resistance', 'Power', 'Kirchhoff\'s Laws']
    },
    {
      id: 'elec-002',
      title: 'AC Circuit Analysis',
      discipline: 'electrical',
      difficulty: 'intermediate',
      status: 'in-progress',
      estimatedTime: '3 hours',
      xpReward: 250,
      completedBy: 12350,
      progress: 65,
      prerequisites: ['Basic Circuit Analysis'],
      description: `Dive into alternating current circuits, phasor analysis, and impedance calculations. Learn to analyze complex AC circuits with capacitors and inductors.`,
      objectives: [
        'Understand AC waveforms and phasor representation',
        'Calculate impedance in AC circuits',
        'Analyze RLC circuits',
        'Apply power calculations in AC systems'
      ],
      keyConcepts: ['Phasors', 'Impedance', 'Reactance', 'AC Power', 'RLC Circuits']
    },
    {
      id: 'mech-001',
      title: 'Statics and Force Analysis',
      discipline: 'mechanical',
      difficulty: 'beginner',
      status: 'completed',
      estimatedTime: '2.5 hours',
      xpReward: 180,
      completedBy: 18750,
      progress: 100,
      prerequisites: [],
      description: `Learn the principles of static equilibrium, force analysis, and free body diagrams. Essential foundation for all mechanical engineering applications.`,
      objectives: [
        'Draw accurate free body diagrams',
        'Apply equilibrium equations',
        'Analyze trusses and frames',
        'Calculate moments and torques'
      ],
      keyConcepts: ['Forces', 'Moments', 'Equilibrium', 'Free Body Diagrams', 'Trusses']
    },
    {
      id: 'mech-002',
      title: 'Dynamics and Motion',
      discipline: 'mechanical',
      difficulty: 'intermediate',
      status: 'available',
      estimatedTime: '3.5 hours',
      xpReward: 300,
      completedBy: 14200,
      progress: 0,
      prerequisites: ['Statics and Force Analysis'],
      description: `Study the motion of particles and rigid bodies, including kinematics and kinetics. Apply Newton's laws to solve complex motion problems.`,
      objectives: [
        'Analyze particle kinematics','Apply Newton\'s laws of motion',
        'Study rigid body dynamics',
        'Solve vibration problems'
      ],
      keyConcepts: ['Kinematics', 'Kinetics', 'Newton\'s Laws', 'Rigid Bodies', 'Vibrations']
    },
    {
      id: 'meca-001',
      title: 'Sensors and Actuators',
      discipline: 'mechatronics',
      difficulty: 'intermediate',
      status: 'available',
      estimatedTime: '4 hours',
      xpReward: 350,
      completedBy: 9800,
      progress: 0,
      prerequisites: ['Basic Circuit Analysis', 'Statics and Force Analysis'],
      description: `Explore the interface between mechanical and electrical systems through sensors and actuators. Learn about transduction principles and system integration.`,
      objectives: [
        'Understand sensor principles and types',
        'Learn actuator technologies',
        'Study signal conditioning',
        'Design sensor-actuator systems'
      ],
      keyConcepts: ['Transducers', 'Signal Conditioning', 'Actuators', 'Sensors', 'System Integration']
    },
    {
      id: 'aero-001',
      title: 'Fundamentals of Aerodynamics',
      discipline: 'aerospace',
      difficulty: 'intermediate',
      status: 'locked',
      estimatedTime: '4.5 hours',
      xpReward: 400,
      completedBy: 7650,
      progress: 0,
      prerequisites: ['Dynamics and Motion', 'Fluid Mechanics Basics'],
      description: `Master the principles of fluid flow around bodies, lift and drag forces, and the fundamentals of flight. Essential for aerospace engineering applications.`,
      objectives: [
        'Understand fluid flow principles',
        'Calculate lift and drag forces',
        'Analyze airfoil characteristics',
        'Study compressible flow effects'
      ],
      keyConcepts: ['Lift', 'Drag', 'Airfoils', 'Flow Visualization', 'Compressible Flow']
    },
    {
      id: 'inno-001',
      title: 'Systems Thinking Challenge',
      discipline: 'innovation',
      difficulty: 'advanced',
      status: 'locked',
      estimatedTime: '6 hours',
      xpReward: 500,
      completedBy: 3200,
      progress: 0,
      prerequisites: ['AC Circuit Analysis', 'Dynamics and Motion', 'Sensors and Actuators'],
      description: `Apply interdisciplinary knowledge to solve complex engineering problems. This innovation module challenges you to think across traditional engineering boundaries.`,
      objectives: [
        'Apply systems thinking methodology',
        'Integrate multiple engineering disciplines',
        'Solve complex multi-domain problems',
        'Design innovative solutions'
      ],
      keyConcepts: ['Systems Thinking', 'Interdisciplinary Design', 'Problem Decomposition', 'Innovation', 'Integration']
    },
    {
      id: 'elec-003',
      title: 'Digital Electronics',
      discipline: 'electrical',
      difficulty: 'intermediate',
      status: 'available',
      estimatedTime: '3 hours',
      xpReward: 280,
      completedBy: 11500,
      progress: 0,
      prerequisites: ['Basic Circuit Analysis'],
      description: `Learn digital logic design, Boolean algebra, and combinational circuits. Foundation for modern electronic systems and computer engineering.`,
      objectives: [
        'Understand Boolean algebra',
        'Design combinational logic circuits',
        'Learn about flip-flops and latches',
        'Study sequential circuit design'
      ],
      keyConcepts: ['Boolean Logic', 'Logic Gates', 'Flip-Flops', 'Sequential Circuits', 'Digital Design']
    }
  ];

  // Mock user progress data
  const userProgress = {
    totalXP: 2450,
    currentStreak: 7,
    level: 12,
    completedModules: modules?.filter(m => m?.status === 'completed')?.length,
    totalModules: modules?.length
  };

  // Filter modules based on selected criteria
  const filteredModules = modules?.filter(module => {
    const disciplineMatch = selectedDiscipline === 'all' || module.discipline === selectedDiscipline;
    const difficultyMatch = selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;
    const statusMatch = selectedStatus === 'all' || module.status === selectedStatus;
    
    return disciplineMatch && difficultyMatch && statusMatch;
  });

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  const handleStartModule = (module) => {
    setSelectedModule(null);
    // Navigate to lesson interface with module data
    navigate('/lesson-interface', { state: { module } });
  };

  const handleResetFilters = () => {
    setSelectedDiscipline('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 pb-20 md:pb-8">
        <Breadcrumb />
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Learning Roadmap</h1>
            <p className="text-muted-foreground">
              Navigate your personalized engineering education journey across all disciplines
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setViewMode('roadmap')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                viewMode === 'roadmap' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="GitBranch" size={16} />
              <span>Roadmap</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                viewMode === 'list' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="List" size={16} />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <ProgressOverview modules={modules} userProgress={userProgress} />

        {/* Recommended Next Steps */}
        <RecommendedNext modules={modules} onModuleClick={handleModuleClick} />

        {/* Filters */}
        <RoadmapFilters
          selectedDiscipline={selectedDiscipline}
          setSelectedDiscipline={setSelectedDiscipline}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onResetFilters={handleResetFilters}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredModules?.length} of {modules?.length} modules
          </p>
          {filteredModules?.length !== modules?.length && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Roadmap Visualization */}
        {viewMode === 'roadmap' ? (
          <RoadmapVisualization
            modules={modules}
            filteredModules={filteredModules}
            onModuleClick={handleModuleClick}
          />
        ) : (
          /* List View */
          (<div className="bg-card border border-border rounded-lg">
            {filteredModules?.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No modules found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more modules.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredModules?.map((module) => (
                  <div
                    key={module.id}
                    className="p-6 hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleModuleClick(module)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            module.discipline === 'electrical' ? 'text-blue-600 bg-blue-50' :
                            module.discipline === 'mechanical' ? 'text-green-600 bg-green-50' :
                            module.discipline === 'mechatronics' ? 'text-purple-600 bg-purple-50' :
                            module.discipline === 'aerospace'? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'
                          }`}>
                            {module.discipline?.charAt(0)?.toUpperCase() + module.discipline?.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {module.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Icon name="Clock" size={12} />
                            <span>{module.estimatedTime}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Zap" size={12} />
                            <span>{module.xpReward} XP</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Users" size={12} />
                            <span>{module.completedBy?.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        <Icon 
                          name={
                            module.status === 'completed' ? 'CheckCircle' :
                            module.status === 'in-progress' ? 'Clock' :
                            module.status === 'available' ? 'Play' : 'Lock'
                          }
                          size={20}
                          className={
                            module.status === 'completed' ? 'text-success' :
                            module.status === 'in-progress' ? 'text-warning' :
                            module.status === 'available' ? 'text-primary' : 'text-muted-foreground'
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>)
        )}

        {/* Module Preview Modal */}
        {selectedModule && (
          <ModulePreview
            module={selectedModule}
            onClose={() => setSelectedModule(null)}
            onStartModule={handleStartModule}
          />
        )}
      </main>
    </div>
  );
};

export default LearningRoadmap;