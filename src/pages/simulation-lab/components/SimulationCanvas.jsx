import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SimulationCanvas = ({ activeSimulation, components, onComponentAdd, onParameterChange, simulationState }) => {
  const canvasRef = useRef(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleDragStart = (component) => {
    setDraggedComponent(component);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    if (!draggedComponent) return;

    const rect = canvasRef?.current?.getBoundingClientRect();
    const x = e?.clientX - rect?.left;
    const y = e?.clientY - rect?.top;

    const newComponent = {
      ...draggedComponent,
      id: Date.now(),
      x: x - 25,
      y: y - 25,
      connections: []
    };

    setCanvasComponents(prev => [...prev, newComponent]);
    setDraggedComponent(null);
    onComponentAdd(newComponent);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const clearCanvas = () => {
    setCanvasComponents([]);
    setSelectedComponent(null);
    setIsRunning(false);
  };

  const getCanvasContent = () => {
    switch (activeSimulation) {
      case 'circuit':
        return (
          <div className="relative w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="absolute inset-4 bg-white rounded border grid grid-cols-20 grid-rows-15 gap-px">
              {/* Grid dots for circuit placement */}
              {Array.from({ length: 300 })?.map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-200 rounded-full"></div>
              ))}
            </div>
            {/* Placed components */}
            {canvasComponents?.map((component) => (
              <div
                key={component?.id}
                className={`absolute w-12 h-12 bg-white border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  selectedComponent?.id === component?.id ? 'border-primary shadow-lg' : 'border-gray-300 hover:border-gray-400'
                } ${isRunning ? 'animate-pulse' : ''}`}
                style={{ left: component?.x, top: component?.y }}
                onClick={() => handleComponentClick(component)}
              >
                <Icon name={component?.icon} size={24} color={component?.color} />
              </div>
            ))}
            {canvasComponents?.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Icon name="Zap" size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Circuit Design Canvas</p>
                  <p className="text-sm">Drag components from the toolbox to start building</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'mechanical':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="absolute inset-4 bg-white rounded border">
              {/* 3D viewport simulation */}
              <div className="absolute top-4 left-4 text-xs text-gray-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="RotateCcw" size={16} />
                  <span>X: 0° Y: 0° Z: 0°</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Move3D" size={16} />
                  <span>Perspective View</span>
                </div>
              </div>

              {/* Placed mechanical components */}
              {canvasComponents?.map((component) => (
                <div
                  key={component?.id}
                  className={`absolute w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-400 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg ${
                    selectedComponent?.id === component?.id ? 'border-primary shadow-xl' : 'border-gray-300 hover:border-gray-400'
                  } ${isRunning ? 'animate-bounce' : ''}`}
                  style={{ left: component?.x, top: component?.y }}
                  onClick={() => handleComponentClick(component)}
                >
                  <Icon name={component?.icon} size={28} color={component?.color} />
                </div>
              ))}

              {canvasComponents?.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Icon name="Box" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">3D Assembly Workspace</p>
                    <p className="text-sm">Drag mechanical components to create assemblies</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'aerospace':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {/* Space background with stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 50 })?.map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                ></div>
              ))}
            </div>
            {/* Earth in corner */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400 to-green-400 rounded-full transform translate-x-16 translate-y-16 opacity-80"></div>
            {/* Orbital paths */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border border-white/30 rounded-full"></div>
              <div className="absolute w-48 h-48 border border-white/20 rounded-full"></div>
              <div className="absolute w-80 h-80 border border-white/10 rounded-full"></div>
            </div>
            {/* Placed spacecraft components */}
            {canvasComponents?.map((component) => (
              <div
                key={component?.id}
                className={`absolute w-12 h-12 bg-white/90 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  selectedComponent?.id === component?.id ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-white/50 hover:border-white/70'
                } ${isRunning ? 'animate-spin' : ''}`}
                style={{ left: component?.x, top: component?.y }}
                onClick={() => handleComponentClick(component)}
              >
                <Icon name={component?.icon} size={24} color={component?.color} />
              </div>
            ))}
            {canvasComponents?.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Icon name="Rocket" size={48} className="mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-medium">Orbital Mechanics Simulator</p>
                  <p className="text-sm opacity-80">Design spacecraft and simulate orbital trajectories</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Icon name="Wrench" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a Simulation Type</p>
              <p className="text-sm">Choose from Circuit, Mechanical, or Aerospace simulations</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border border-border overflow-hidden">
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">
            {activeSimulation === 'circuit' && 'Circuit Designer'}
            {activeSimulation === 'mechanical' && '3D Assembly'}
            {activeSimulation === 'aerospace' && 'Orbital Simulator'}
            {!activeSimulation && 'Simulation Canvas'}
          </h3>
          {selectedComponent && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
              <Icon name={selectedComponent?.icon} size={16} />
              <span className="text-sm font-medium">{selectedComponent?.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            iconName={isRunning ? "Square" : "Play"}
            iconPosition="left"
            onClick={toggleSimulation}
            disabled={canvasComponents?.length === 0}
          >
            {isRunning ? 'Stop' : 'Run'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            onClick={clearCanvas}
            disabled={canvasComponents?.length === 0}
          >
            Clear
          </Button>

          <Button
            variant="ghost"
            size="sm"
            iconName="Save"
          >
            Save
          </Button>
        </div>
      </div>
      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 p-4 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {getCanvasContent()}
      </div>
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Components: {canvasComponents?.length}</span>
          <span>Status: {isRunning ? 'Running' : 'Stopped'}</span>
          {activeSimulation && (
            <span>Mode: {activeSimulation?.charAt(0)?.toUpperCase() + activeSimulation?.slice(1)}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={16} />
          <span>Real-time Simulation</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;