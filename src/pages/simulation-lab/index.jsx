import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SimulationSelector from './components/SimulationSelector';
import ComponentToolbox from './components/ComponentToolbox';
import SimulationCanvas from './components/SimulationCanvas';
import SimulationControls from './components/SimulationControls';
import ChallengePanel from './components/ChallengePanel';

const SimulationLab = () => {
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [activeView, setActiveView] = useState('workspace'); // 'workspace' or 'challenges'
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    components: [],
    parameters: {}
  });
  const [draggedComponent, setDraggedComponent] = useState(null);

  // Handle component drag start from toolbox
  const handleComponentDragStart = (component) => {
    setDraggedComponent(component);
  };

  // Handle component addition to canvas
  const handleComponentAdd = (component) => {
    setSimulationState(prev => ({
      ...prev,
      components: [...prev?.components, component]
    }));
  };

  // Handle parameter changes
  const handleParameterChange = (componentId, paramName, value) => {
    setSimulationState(prev => ({
      ...prev,
      parameters: {
        ...prev?.parameters,
        [componentId]: {
          ...prev?.parameters?.[componentId],
          [paramName]: value
        }
      }
    }));
  };

  // Handle simulation type change
  const handleSimulationChange = (simulationType) => {
    setActiveSimulation(simulationType);
    setSelectedComponent(null);
    setSimulationState({
      isRunning: false,
      components: [],
      parameters: {}
    });
  };

  // Handle challenge selection
  const handleChallengeSelect = (challenge) => {
    // Switch to workspace view when challenge is selected
    setActiveView('workspace');
    // Could initialize workspace with challenge-specific setup
  };

  // Handle view switching
  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-full mx-auto px-6 py-6">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Simulation Lab</h1>
              <p className="text-muted-foreground">
                Interactive engineering simulations for hands-on learning and experimentation
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
              <Button
                variant={activeView === 'workspace' ? "default" : "ghost"}
                size="sm"
                iconName="Wrench"
                iconPosition="left"
                onClick={() => handleViewChange('workspace')}
              >
                Workspace
              </Button>
              <Button
                variant={activeView === 'challenges' ? "default" : "ghost"}
                size="sm"
                iconName="Target"
                iconPosition="left"
                onClick={() => handleViewChange('challenges')}
              >
                Challenges
              </Button>
            </div>
          </div>

          {/* Main Content */}
          {activeView === 'challenges' ? (
            /* Challenge View */
            (<div className="max-w-4xl mx-auto">
              <ChallengePanel 
                activeSimulation={activeSimulation}
                onChallengeSelect={handleChallengeSelect}
              />
            </div>)
          ) : (
            /* Workspace View */
            (<>
              {!activeSimulation ? (
                /* Simulation Selection */
                (<SimulationSelector 
                  activeSimulation={activeSimulation}
                  onSimulationChange={handleSimulationChange}
                />)
              ) : (
                /* Active Simulation Interface */
                (<div className="flex h-[calc(100vh-200px)] bg-card rounded-lg border border-border overflow-hidden">
                  {/* Component Toolbox */}
                  <ComponentToolbox 
                    activeSimulation={activeSimulation}
                    onComponentDragStart={handleComponentDragStart}
                  />
                  {/* Main Canvas Area */}
                  <SimulationCanvas 
                    activeSimulation={activeSimulation}
                    components={simulationState?.components}
                    onComponentAdd={handleComponentAdd}
                    onParameterChange={handleParameterChange}
                    simulationState={simulationState}
                  />
                  {/* Controls Panel */}
                  <SimulationControls 
                    activeSimulation={activeSimulation}
                    selectedComponent={selectedComponent}
                    onParameterChange={handleParameterChange}
                    simulationState={simulationState}
                  />
                </div>)
              )}
              {/* Quick Actions Bar */}
              {activeSimulation && (
                <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ArrowLeft"
                      iconPosition="left"
                      onClick={() => setActiveSimulation(null)}
                    >
                      Back to Selection
                    </Button>
                    
                    <div className="w-px h-6 bg-border"></div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Icon name="Info" size={16} />
                      <span>
                        {activeSimulation === 'circuit' && 'Drag components from the toolbox to build circuits'}
                        {activeSimulation === 'mechanical' && 'Create 3D assemblies with mechanical components'}
                        {activeSimulation === 'aerospace' && 'Design spacecraft and simulate orbital mechanics'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="BookOpen"
                      iconPosition="left"
                      onClick={() => handleViewChange('challenges')}
                    >
                      View Challenges
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="HelpCircle"
                    >
                      Help
                    </Button>
                  </div>
                </div>
              )}
            </>)
          )}
        </div>
      </main>
    </div>
  );
};

export default SimulationLab;