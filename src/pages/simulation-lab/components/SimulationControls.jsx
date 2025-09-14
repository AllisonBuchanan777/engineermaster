import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SimulationControls = ({ activeSimulation, selectedComponent, onParameterChange, simulationState }) => {
  const [activeTab, setActiveTab] = useState('parameters');

  const simulationTabs = [
    { id: 'parameters', name: 'Parameters', icon: 'Sliders' },
    { id: 'analysis', name: 'Analysis', icon: 'BarChart3' },
    { id: 'measurements', name: 'Measurements', icon: 'Ruler' }
  ];

  const getParameterControls = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <Icon name="MousePointer" size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a component to view parameters</p>
        </div>
      );
    }

    switch (activeSimulation) {
      case 'circuit':
        return getCircuitParameters();
      case 'mechanical':
        return getMechanicalParameters();
      case 'aerospace':
        return getAerospaceParameters();
      default:
        return null;
    }
  };

  const getCircuitParameters = () => {
    const componentParams = {
      resistor: [
        { name: 'Resistance', value: '1000', unit: 'Ω', min: '1', max: '1000000', step: '1' },
        { name: 'Power Rating', value: '0.25', unit: 'W', min: '0.125', max: '5', step: '0.125' },
        { name: 'Tolerance', value: '5', unit: '%', min: '1', max: '20', step: '1' }
      ],
      capacitor: [
        { name: 'Capacitance', value: '100', unit: 'μF', min: '1', max: '10000', step: '1' },
        { name: 'Voltage Rating', value: '25', unit: 'V', min: '5', max: '500', step: '5' },
        { name: 'ESR', value: '0.1', unit: 'Ω', min: '0.01', max: '10', step: '0.01' }
      ],
      battery: [
        { name: 'Voltage', value: '9', unit: 'V', min: '1.5', max: '24', step: '0.1' },
        { name: 'Capacity', value: '2000', unit: 'mAh', min: '100', max: '10000', step: '100' },
        { name: 'Internal Resistance', value: '0.5', unit: 'Ω', min: '0.1', max: '5', step: '0.1' }
      ]
    };

    const params = componentParams?.[selectedComponent?.id] || [];

    return (
      <div className="space-y-4">
        {params?.map((param, index) => (
          <div key={index}>
            <Input
              label={`${param?.name} (${param?.unit})`}
              type="number"
              value={param?.value}
              min={param?.min}
              max={param?.max}
              step={param?.step}
              onChange={(e) => onParameterChange(selectedComponent?.id, param?.name, e?.target?.value)}
            />
          </div>
        ))}
      </div>
    );
  };

  const getMechanicalParameters = () => {
    const componentParams = {
      gear: [
        { name: 'Teeth Count', value: '20', unit: '', min: '8', max: '100', step: '1' },
        { name: 'Module', value: '2', unit: 'mm', min: '0.5', max: '10', step: '0.5' },
        { name: 'Material', value: 'steel', options: ['steel', 'aluminum', 'plastic', 'brass'] }
      ],
      shaft: [
        { name: 'Diameter', value: '20', unit: 'mm', min: '5', max: '100', step: '1' },
        { name: 'Length', value: '100', unit: 'mm', min: '10', max: '1000', step: '10' },
        { name: 'Material', value: 'steel', options: ['steel', 'aluminum', 'stainless', 'carbon'] }
      ],
      spring: [
        { name: 'Spring Rate', value: '10', unit: 'N/mm', min: '0.1', max: '1000', step: '0.1' },
        { name: 'Free Length', value: '50', unit: 'mm', min: '10', max: '200', step: '5' },
        { name: 'Wire Diameter', value: '2', unit: 'mm', min: '0.5', max: '10', step: '0.5' }
      ]
    };

    const params = componentParams?.[selectedComponent?.id] || [];

    return (
      <div className="space-y-4">
        {params?.map((param, index) => (
          <div key={index}>
            {param?.options ? (
              <Select
                label={param?.name}
                options={param?.options?.map(opt => ({ value: opt, label: opt?.charAt(0)?.toUpperCase() + opt?.slice(1) }))}
                value={param?.value}
                onChange={(value) => onParameterChange(selectedComponent?.id, param?.name, value)}
              />
            ) : (
              <Input
                label={`${param?.name}${param?.unit ? ` (${param?.unit})` : ''}`}
                type="number"
                value={param?.value}
                min={param?.min}
                max={param?.max}
                step={param?.step}
                onChange={(e) => onParameterChange(selectedComponent?.id, param?.name, e?.target?.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getAerospaceParameters = () => {
    const componentParams = {
      engine: [
        { name: 'Thrust', value: '1000', unit: 'N', min: '100', max: '100000', step: '100' },
        { name: 'Specific Impulse', value: '300', unit: 's', min: '200', max: '500', step: '10' },
        { name: 'Throttle', value: '100', unit: '%', min: '0', max: '100', step: '1' }
      ],
      fuel_tank: [
        { name: 'Capacity', value: '1000', unit: 'L', min: '10', max: '10000', step: '10' },
        { name: 'Fuel Type', value: 'rp1', options: ['rp1', 'methane', 'hydrogen', 'hypergolic'] },
        { name: 'Pressure', value: '20', unit: 'bar', min: '1', max: '300', step: '1' }
      ],
      solar_panel: [
        { name: 'Power Output', value: '100', unit: 'W', min: '10', max: '10000', step: '10' },
        { name: 'Efficiency', value: '22', unit: '%', min: '15', max: '35', step: '1' },
        { name: 'Area', value: '2', unit: 'm²', min: '0.1', max: '50', step: '0.1' }
      ]
    };

    const params = componentParams?.[selectedComponent?.id] || [];

    return (
      <div className="space-y-4">
        {params?.map((param, index) => (
          <div key={index}>
            {param?.options ? (
              <Select
                label={param?.name}
                options={param?.options?.map(opt => ({ value: opt, label: opt?.toUpperCase() }))}
                value={param?.value}
                onChange={(value) => onParameterChange(selectedComponent?.id, param?.name, value)}
              />
            ) : (
              <Input
                label={`${param?.name}${param?.unit ? ` (${param?.unit})` : ''}`}
                type="number"
                value={param?.value}
                min={param?.min}
                max={param?.max}
                step={param?.step}
                onChange={(e) => onParameterChange(selectedComponent?.id, param?.name, e?.target?.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getAnalysisContent = () => {
    if (!activeSimulation) return null;

    const analysisData = {
      circuit: [
        { label: 'Total Resistance', value: '1.5 kΩ', status: 'normal' },
        { label: 'Current Flow', value: '6 mA', status: 'normal' },
        { label: 'Power Consumption', value: '54 mW', status: 'normal' },
        { label: 'Voltage Drop', value: '9 V', status: 'normal' }
      ],
      mechanical: [
        { label: 'Total Mass', value: '2.5 kg', status: 'normal' },
        { label: 'Center of Mass', value: 'X: 0, Y: 0, Z: 15mm', status: 'normal' },
        { label: 'Max Stress', value: '45 MPa', status: 'warning' },
        { label: 'Safety Factor', value: '3.2', status: 'normal' }
      ],
      aerospace: [
        { label: 'Total Mass', value: '1,250 kg', status: 'normal' },
        { label: 'Delta-V', value: '3,200 m/s', status: 'normal' },
        { label: 'Thrust-to-Weight', value: '1.8', status: 'normal' },
        { label: 'Orbital Period', value: '92 min', status: 'normal' }
      ]
    };

    const data = analysisData?.[activeSimulation] || [];

    return (
      <div className="space-y-3">
        {data?.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground">{item?.label}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-foreground">{item?.value}</span>
              <div className={`w-2 h-2 rounded-full ${
                item?.status === 'normal' ? 'bg-success' : 
                item?.status === 'warning' ? 'bg-warning' : 'bg-error'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getMeasurementsContent = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" iconName="Ruler" iconPosition="left">
            Distance
          </Button>
          <Button variant="outline" size="sm" iconName="RotateCw" iconPosition="left">
            Angle
          </Button>
          <Button variant="outline" size="sm" iconName="Zap" iconPosition="left">
            Voltage
          </Button>
          <Button variant="outline" size="sm" iconName="Activity" iconPosition="left">
            Current
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Active Measurements</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
              <span>Voltage (R1)</span>
              <span className="font-mono">3.3V</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
              <span>Current (Total)</span>
              <span className="font-mono">6.0mA</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Controls Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Simulation Controls</h2>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {simulationTabs?.map((tab) => (
            <Button
              key={tab?.id}
              variant={activeTab === tab?.id ? "default" : "ghost"}
              size="xs"
              iconName={tab?.icon}
              iconPosition="left"
              onClick={() => setActiveTab(tab?.id)}
              className="flex-1 text-xs"
            >
              {tab?.name}
            </Button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'parameters' && getParameterControls()}
        {activeTab === 'analysis' && getAnalysisContent()}
        {activeTab === 'measurements' && getMeasurementsContent()}
      </div>
      {/* Quick Actions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="space-y-2">
          <Button variant="outline" size="sm" iconName="Download" fullWidth>
            Export Results
          </Button>
          <Button variant="ghost" size="sm" iconName="Share" fullWidth>
            Share Simulation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;