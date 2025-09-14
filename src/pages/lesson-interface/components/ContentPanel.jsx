import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ContentPanel = ({ currentSection, onSectionComplete, onNavigate }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const renderContent = () => {
    switch (currentSection?.type) {
      case 'video':
        return (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              className="w-full h-96 object-cover"
              controls
              poster="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop"
            >
              <source src={currentSection?.videoUrl} type="video/mp4" />
            </video>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Icon name="Maximize" size={20} />
            </Button>
          </div>
        );

      case 'simulation':
        return (
          <div className="bg-muted rounded-lg p-6 min-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Circuit Simulation</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant={simulationRunning ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setSimulationRunning(!simulationRunning)}
                  iconName={simulationRunning ? "Square" : "Play"}
                  iconPosition="left"
                >
                  {simulationRunning ? 'Stop' : 'Run'}
                </Button>
                <Button variant="outline" size="sm" iconName="RotateCcw">
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 h-80 flex items-center justify-center">
              <div className="text-center">
                <Icon name="Zap" size={48} className="text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive Circuit Builder</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag components from the toolbar to build your circuit
                </p>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-3">
                <label className="text-sm font-medium text-foreground">Voltage (V)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  defaultValue="5"
                  className="w-full mt-2"
                />
                <span className="text-sm text-muted-foreground">5V</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <label className="text-sm font-medium text-foreground">Resistance (Ω)</label>
                <input 
                  type="range" 
                  min="100" 
                  max="1000" 
                  defaultValue="330"
                  className="w-full mt-2"
                />
                <span className="text-sm text-muted-foreground">330Ω</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <label className="text-sm font-medium text-foreground">Current (mA)</label>
                <div className="text-lg font-semibold text-primary mt-2">15.2</div>
              </div>
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Drag & Drop Assembly Challenge
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">Components</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Resistor', 'Capacitor', 'LED', 'Battery']?.map((component) => (
                    <div
                      key={component}
                      className="bg-muted border border-border rounded-lg p-3 cursor-move hover:bg-muted/80 transition-colors"
                      draggable
                    >
                      <Icon name="Component" size={24} className="mx-auto mb-2" />
                      <p className="text-sm text-center text-foreground">{component}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3">Assembly Area</h4>
                <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg h-48 flex items-center justify-center">
                  <p className="text-muted-foreground">Drop components here</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="bg-card rounded-lg p-6">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {currentSection?.title}
              </h2>
              
              <div className="text-foreground leading-relaxed space-y-4">
                <p>
                  In electrical engineering, understanding Ohm's Law is fundamental to circuit analysis. 
                  This law describes the relationship between voltage (V), current (I), and resistance (R) 
                  in an electrical circuit.
                </p>
                
                <div className="bg-muted rounded-lg p-4 my-6">
                  <h3 className="font-semibold text-foreground mb-2">Ohm's Law Formula</h3>
                  <div className="text-center text-2xl font-mono text-primary">
                    V = I × R
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Voltage equals Current times Resistance
                  </p>
                </div>

                <p>
                  This relationship allows engineers to calculate any one of these three values 
                  when the other two are known. Let's explore how this applies in real-world scenarios.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <Image
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
                    alt="Circuit diagram showing Ohm's Law"
                    className="rounded-lg"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop"
                    alt="Electronic components on breadboard"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="p-6">
        {renderContent()}
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => onNavigate('previous')}
            iconName="ChevronLeft"
            iconPosition="left"
            disabled={currentSection?.isFirst}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              onClick={onSectionComplete}
              iconName="Check"
              iconPosition="left"
            >
              Mark Complete
            </Button>
            
            <Button
              variant="default"
              onClick={() => onNavigate('next')}
              iconName="ChevronRight"
              iconPosition="right"
              disabled={currentSection?.isLast}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPanel;