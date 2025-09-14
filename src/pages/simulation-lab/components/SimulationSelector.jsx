import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SimulationSelector = ({ activeSimulation, onSimulationChange }) => {
  const simulations = [
    {
      id: 'circuit',
      name: 'Circuit Design',
      description: 'Design and analyze electrical circuits with interactive components',
      icon: 'Zap',
      color: '#8B5CF6',
      features: ['Component Library', 'Real-time Analysis', 'SPICE Simulation', 'Oscilloscope'],
      difficulty: 'Beginner'
    },
    {
      id: 'mechanical',
      name: '3D Mechanical',
      description: 'Build and test mechanical assemblies with physics simulation',
      icon: 'Box',
      color: '#06B6D4',
      features: ['3D Assembly', 'Stress Analysis', 'Motion Study', 'Material Properties'],
      difficulty: 'Intermediate'
    },
    {
      id: 'aerospace',
      name: 'Orbital Mechanics',
      description: 'Design spacecraft and simulate orbital trajectories',
      icon: 'Rocket',
      color: '#10B981',
      features: ['Orbital Simulation', 'Trajectory Planning', 'Spacecraft Design', 'Mission Analysis'],
      difficulty: 'Advanced'
    }
  ];

  return (
    <div className="p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Choose Your Simulation Environment</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select from our comprehensive suite of engineering simulation tools to start building, testing, and analyzing your designs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {simulations?.map((simulation) => (
            <div
              key={simulation?.id}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg ${
                activeSimulation === simulation?.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => onSimulationChange(simulation?.id)}
            >
              {/* Difficulty Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  simulation?.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                  simulation?.difficulty === 'Intermediate'? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                }`}>
                  {simulation?.difficulty}
                </span>
              </div>

              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `${simulation?.color}20`, border: `2px solid ${simulation?.color}40` }}
              >
                <Icon name={simulation?.icon} size={32} color={simulation?.color} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {simulation?.name}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {simulation?.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {simulation?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                variant={activeSimulation === simulation?.id ? "default" : "outline"}
                size="sm"
                iconName={activeSimulation === simulation?.id ? "Check" : "ArrowRight"}
                iconPosition="right"
                fullWidth
                className="group-hover:scale-105 transition-transform duration-200"
              >
                {activeSimulation === simulation?.id ? 'Selected' : 'Select Environment'}
              </Button>

              {/* Active Indicator */}
              {activeSimulation === simulation?.id && (
                <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Start Guide */}
        {activeSimulation && (
          <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={20} color="var(--color-primary)" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Quick Start Guide</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>1. Browse the component library on the left panel</p>
                  <p>2. Drag components onto the simulation canvas</p>
                  <p>3. Connect components and adjust parameters</p>
                  <p>4. Run the simulation to see real-time results</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="text-2xl font-bold text-primary mb-1">150+</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="text-2xl font-bold text-success mb-1">50+</div>
            <div className="text-sm text-muted-foreground">Templates</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="text-2xl font-bold text-warning mb-1">25+</div>
            <div className="text-sm text-muted-foreground">Challenges</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="text-2xl font-bold text-accent mb-1">Real-time</div>
            <div className="text-sm text-muted-foreground">Simulation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationSelector;