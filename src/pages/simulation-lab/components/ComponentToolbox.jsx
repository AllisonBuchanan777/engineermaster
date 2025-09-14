import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ComponentToolbox = ({ activeSimulation, onComponentDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const componentLibraries = {
    circuit: {
      categories: [
        { id: 'all', name: 'All Components', icon: 'Grid3X3' },
        { id: 'basic', name: 'Basic', icon: 'Zap' },
        { id: 'sources', name: 'Sources', icon: 'Battery' },
        { id: 'passive', name: 'Passive', icon: 'Radio' },
        { id: 'active', name: 'Active', icon: 'Cpu' },
        { id: 'digital', name: 'Digital', icon: 'Binary' }
      ],
      components: [
        { id: 'resistor', name: 'Resistor', category: 'passive', icon: 'Minus', color: '#8B5CF6', description: 'Limits current flow' },
        { id: 'capacitor', name: 'Capacitor', category: 'passive', icon: 'Layers', color: '#06B6D4', description: 'Stores electrical energy' },
        { id: 'inductor', name: 'Inductor', category: 'passive', icon: 'Repeat', color: '#10B981', description: 'Stores magnetic energy' },
        { id: 'battery', name: 'Battery', category: 'sources', icon: 'Battery', color: '#F59E0B', description: 'DC voltage source' },
        { id: 'ground', name: 'Ground', category: 'basic', icon: 'ArrowDown', color: '#6B7280', description: 'Reference point' },
        { id: 'switch', name: 'Switch', category: 'basic', icon: 'ToggleLeft', color: '#EF4444', description: 'Controls circuit flow' },
        { id: 'led', name: 'LED', category: 'active', icon: 'Lightbulb', color: '#F97316', description: 'Light emitting diode' },
        { id: 'transistor', name: 'Transistor', category: 'active', icon: 'Triangle', color: '#8B5CF6', description: 'Amplifies signals' },
        { id: 'opamp', name: 'Op-Amp', category: 'active', icon: 'TrendingUp', color: '#06B6D4', description: 'Operational amplifier' },
        { id: 'and_gate', name: 'AND Gate', category: 'digital', icon: 'GitMerge', color: '#10B981', description: 'Logic AND operation' },
        { id: 'or_gate', name: 'OR Gate', category: 'digital', icon: 'GitBranch', color: '#F59E0B', description: 'Logic OR operation' },
        { id: 'not_gate', name: 'NOT Gate', category: 'digital', icon: 'RotateCcw', color: '#EF4444', description: 'Logic NOT operation' }
      ]
    },
    mechanical: {
      categories: [
        { id: 'all', name: 'All Parts', icon: 'Grid3X3' },
        { id: 'structural', name: 'Structural', icon: 'Box' },
        { id: 'motion', name: 'Motion', icon: 'RotateCw' },
        { id: 'fasteners', name: 'Fasteners', icon: 'Wrench' },
        { id: 'bearings', name: 'Bearings', icon: 'Circle' },
        { id: 'gears', name: 'Gears', icon: 'Settings' }
      ],
      components: [
        { id: 'beam', name: 'I-Beam', category: 'structural', icon: 'Minus', color: '#6B7280', description: 'Structural support beam' },
        { id: 'plate', name: 'Plate', category: 'structural', icon: 'Square', color: '#8B5CF6', description: 'Flat structural plate' },
        { id: 'shaft', name: 'Shaft', category: 'motion', icon: 'Minus', color: '#06B6D4', description: 'Rotating shaft' },
        { id: 'gear', name: 'Gear', category: 'gears', icon: 'Settings', color: '#10B981', description: 'Mechanical gear' },
        { id: 'bearing', name: 'Bearing', category: 'bearings', icon: 'Circle', color: '#F59E0B', description: 'Reduces friction' },
        { id: 'bolt', name: 'Bolt', category: 'fasteners', icon: 'Wrench', color: '#EF4444', description: 'Threaded fastener' },
        { id: 'spring', name: 'Spring', category: 'motion', icon: 'Repeat', color: '#F97316', description: 'Elastic element' },
        { id: 'piston', name: 'Piston', category: 'motion', icon: 'ArrowUpDown', color: '#8B5CF6', description: 'Linear actuator' },
        { id: 'pulley', name: 'Pulley', category: 'motion', icon: 'Circle', color: '#06B6D4', description: 'Belt drive system' },
        { id: 'motor', name: 'Motor', category: 'motion', icon: 'Zap', color: '#10B981', description: 'Electric motor' },
        { id: 'coupling', name: 'Coupling', category: 'motion', icon: 'Link', color: '#F59E0B', description: 'Shaft connector' },
        { id: 'bracket', name: 'Bracket', category: 'structural', icon: 'CornerUpRight', color: '#EF4444', description: 'Support bracket' }
      ]
    },
    aerospace: {
      categories: [
        { id: 'all', name: 'All Systems', icon: 'Grid3X3' },
        { id: 'propulsion', name: 'Propulsion', icon: 'Rocket' },
        { id: 'structure', name: 'Structure', icon: 'Box' },
        { id: 'control', name: 'Control', icon: 'Navigation' },
        { id: 'power', name: 'Power', icon: 'Battery' },
        { id: 'payload', name: 'Payload', icon: 'Package' }
      ],
      components: [
        { id: 'engine', name: 'Rocket Engine', category: 'propulsion', icon: 'Rocket', color: '#EF4444', description: 'Main propulsion system' },
        { id: 'fuel_tank', name: 'Fuel Tank', category: 'propulsion', icon: 'Fuel', color: '#F59E0B', description: 'Propellant storage' },
        { id: 'thruster', name: 'RCS Thruster', category: 'propulsion', icon: 'ArrowUp', color: '#06B6D4', description: 'Attitude control' },
        { id: 'solar_panel', name: 'Solar Panel', category: 'power', icon: 'Sun', color: '#10B981', description: 'Power generation' },
        { id: 'battery_pack', name: 'Battery Pack', category: 'power', icon: 'Battery', color: '#8B5CF6', description: 'Energy storage' },
        { id: 'antenna', name: 'Antenna', category: 'control', icon: 'Radio', color: '#F97316', description: 'Communication system' },
        { id: 'gyroscope', name: 'Gyroscope', category: 'control', icon: 'RotateCw', color: '#06B6D4', description: 'Attitude sensing' },
        { id: 'heat_shield', name: 'Heat Shield', category: 'structure', icon: 'Shield', color: '#EF4444', description: 'Thermal protection' },
        { id: 'payload_bay', name: 'Payload Bay', category: 'payload', icon: 'Package', color: '#10B981', description: 'Cargo compartment' },
        { id: 'docking_port', name: 'Docking Port', category: 'structure', icon: 'Link', color: '#8B5CF6', description: 'Spacecraft connection' },
        { id: 'parachute', name: 'Parachute', category: 'structure', icon: 'Umbrella', color: '#F59E0B', description: 'Recovery system' },
        { id: 'landing_leg', name: 'Landing Leg', category: 'structure', icon: 'ArrowDown', color: '#6B7280', description: 'Landing support' }
      ]
    }
  };

  const currentLibrary = componentLibraries?.[activeSimulation] || { categories: [], components: [] };

  const filteredComponents = currentLibrary?.components?.filter(component => {
    const matchesSearch = component?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         component?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = activeCategory === 'all' || component?.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleDragStart = (e, component) => {
    e.dataTransfer.effectAllowed = 'copy';
    onComponentDragStart(component);
  };

  if (!activeSimulation) {
    return (
      <div className="w-80 bg-card border-r border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
          <Icon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Component Toolbox</p>
          <p className="text-sm">Select a simulation type to view available components</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* Toolbox Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Component Library</h2>
        
        {/* Search */}
        <Input
          type="search"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="mb-3"
        />

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {currentLibrary?.categories?.map((category) => (
            <Button
              key={category?.id}
              variant={activeCategory === category?.id ? "default" : "ghost"}
              size="xs"
              iconName={category?.icon}
              iconPosition="left"
              onClick={() => setActiveCategory(category?.id)}
              className="text-xs"
            >
              {category?.name}
            </Button>
          ))}
        </div>
      </div>
      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredComponents?.map((component) => (
            <div
              key={component?.id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all duration-200 group"
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: `${component?.color}20`, border: `2px solid ${component?.color}40` }}
                >
                  <Icon name={component?.icon} size={20} color={component?.color} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors duration-200">
                    {component?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {component?.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredComponents?.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Icon name="Search" size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No components found</p>
            <p className="text-xs">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
      {/* Toolbox Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground text-center">
          <p className="mb-1">💡 Drag components to the canvas</p>
          <p>{filteredComponents?.length} components available</p>
        </div>
      </div>
    </div>
  );
};

export default ComponentToolbox;