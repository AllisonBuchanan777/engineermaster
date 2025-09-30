import React, { useState, useEffect } from 'react';
import { Wrench, Play, Save, RotateCcw, Settings, Eye, BookOpen } from 'lucide-react';
import Button from '../ui/Button';
import { curriculumService } from '../../services/curriculumService';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '../../contexts/AuthContext';

const SimulationLab = ({ 
  templateId, 
  lessonId = null,
  onComplete,
  className = '' 
}) => {
  const { user } = useAuth();
  const [template, setTemplate] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState({
    isRunning: false,
    results: null,
    configuration: {}
  });
  const [sessionData, setSessionData] = useState({});

  useEffect(() => {
    loadSimulationTemplate();
  }, [templateId]);

  const loadSimulationTemplate = async () => {
    try {
      const [templateData] = await curriculumService?.getSimulationTemplates();
      const targetTemplate = templateData?.find(t => t?.id === templateId);
      
      if (targetTemplate) {
        setTemplate(targetTemplate);
        
        // Check access level
        const access = await subscriptionService?.checkContentAccess(
          user?.id, 
          targetTemplate?.access_level
        );
        setHasAccess(access);
        
        // Initialize configuration
        setSimulation(prev => ({
          ...prev,
          configuration: { ...targetTemplate?.configuration }
        }));
      }
    } catch (error) {
      console.error('Error loading simulation template:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!hasAccess) return;

    setSimulation(prev => ({ ...prev, isRunning: true }));

    try {
      // Simulate running the simulation (in production, this would interface with actual simulation engines)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock results based on simulation type
      const results = generateSimulationResults(template?.simulation_type, simulation?.configuration);
      
      setSimulation(prev => ({
        ...prev,
        isRunning: false,
        results: results
      }));

      // Update session data
      const newSessionData = {
        ...sessionData,
        simulation_runs: (sessionData?.simulation_runs || 0) + 1,
        last_results: results,
        configuration_history: [
          ...(sessionData?.configuration_history || []),
          { timestamp: new Date()?.toISOString(), config: simulation?.configuration, results }
        ]
      };
      setSessionData(newSessionData);

    } catch (error) {
      console.error('Error running simulation:', error);
      setSimulation(prev => ({ ...prev, isRunning: false }));
    }
  };

  const saveSession = async () => {
    if (!user || !template) return;

    try {
      await curriculumService?.saveSimulationSession(
        user?.id,
        template?.id,
        {
          ...sessionData,
          final_configuration: simulation?.configuration,
          final_results: simulation?.results,
          completed_at: new Date()?.toISOString()
        },
        lessonId
      );

      onComplete?.({
        type: 'simulation',
        templateId: template?.id,
        results: simulation?.results,
        sessionData
      });
    } catch (error) {
      console.error('Error saving simulation session:', error);
    }
  };

  const resetSimulation = () => {
    if (!template) return;
    
    setSimulation({
      isRunning: false,
      results: null,
      configuration: { ...template?.configuration }
    });
  };

  const updateConfiguration = (key, value) => {
    setSimulation(prev => ({
      ...prev,
      configuration: {
        ...prev?.configuration,
        [key]: value
      }
    }));
  };

  const generateSimulationResults = (type, config) => {
    // Mock simulation results - in production, this would come from actual simulation engines
    switch (type) {
      case 'circuit_builder':
        return {
          voltage_measurements: [5.2, 3.8, 1.4],
          current_measurements: [0.52, 0.38, 0.14],
          power_consumption: 2.7,
          efficiency: 87.3
        };
      case 'bridge_stress':
        return {
          max_stress: 245.6,
          deflection: 0.0032,
          safety_factor: 2.4,
          critical_points: [
            { location: 'Mid-span', stress: 245.6 },
            { location: 'Support', stress: 189.2 }
          ]
        };
      case 'fluid_dynamics':
        return {
          flow_rate: 0.025,
          pressure_drop: 150,
          reynolds_number: 2340,
          flow_type: 'Laminar'
        };
      default:
        return {
          status: 'completed',
          execution_time: Math.random() * 10 + 5,
          iterations: Math.floor(Math.random() * 100) + 50
        };
    }
  };

  const renderConfigurationPanel = () => {
    if (!template || !hasAccess) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Configuration</h4>
          <Settings size={18} className="text-gray-500" />
        </div>
        {/* Mock configuration controls - would be dynamic based on simulation type */}
        {template?.simulation_type === 'circuit_builder' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voltage Source (V)
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="0.1"
                value={simulation?.configuration?.voltage || 5}
                onChange={(e) => updateConfiguration('voltage', parseFloat(e?.target?.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center">
                {simulation?.configuration?.voltage || 5}V
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resistance (Ω)
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={simulation?.configuration?.resistance || 100}
                onChange={(e) => updateConfiguration('resistance', parseInt(e?.target?.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center">
                {simulation?.configuration?.resistance || 100}Ω
              </div>
            </div>
          </div>
        )}
        {template?.simulation_type === 'bridge_stress' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applied Load (kN)
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={simulation?.configuration?.load || 100}
                onChange={(e) => updateConfiguration('load', parseInt(e?.target?.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center">
                {simulation?.configuration?.load || 100} kN
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!simulation?.results) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Simulation Results</h4>
          <Eye size={18} className="text-green-500" />
        </div>
        {template?.simulation_type === 'circuit_builder' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Voltage</div>
              <div className="text-lg font-bold text-blue-900">
                {simulation?.results?.voltage_measurements?.[0]?.toFixed(2)}V
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Current</div>
              <div className="text-lg font-bold text-green-900">
                {simulation?.results?.current_measurements?.[0]?.toFixed(2)}A
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Power</div>
              <div className="text-lg font-bold text-purple-900">
                {simulation?.results?.power_consumption?.toFixed(2)}W
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Efficiency</div>
              <div className="text-lg font-bold text-orange-900">
                {simulation?.results?.efficiency?.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
        {template?.simulation_type === 'bridge_stress' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Max Stress</div>
                <div className="text-lg font-bold text-red-900">
                  {simulation?.results?.max_stress?.toFixed(1)} MPa
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Deflection</div>
                <div className="text-lg font-bold text-blue-900">
                  {simulation?.results?.deflection?.toFixed(4)} m
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Safety Factor</div>
              <div className="text-lg font-bold text-green-900">
                {simulation?.results?.safety_factor?.toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 text-center ${className}`}>
        <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Simulation Not Found
        </h3>
        <p className="text-gray-600">
          The requested simulation template could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">{template?.name}</h3>
            <p className="text-indigo-100">{template?.description}</p>
          </div>
          <Wrench size={32} className="text-indigo-200" />
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {!hasAccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Premium Access Required
            </h4>
            <p className="text-gray-600 mb-4">
              This simulation requires a {template?.access_level} subscription or higher.
            </p>
            <Button>Upgrade Now</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Learning Objectives */}
            {template?.learning_objectives?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Learning Objectives:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {template?.learning_objectives?.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Configuration Panel */}
            {renderConfigurationPanel()}

            {/* Control Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={runSimulation}
                disabled={simulation?.isRunning}
                className="flex-1"
              >
                {simulation?.isRunning ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Running...
                  </div>
                ) : (
                  <>
                    <Play size={18} className="mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>

              <Button
                onClick={resetSimulation}
                variant="secondary"
                disabled={simulation?.isRunning}
              >
                <RotateCcw size={18} />
              </Button>

              {simulation?.results && (
                <Button
                  onClick={saveSession}
                  variant="secondary"
                >
                  <Save size={18} className="mr-2" />
                  Save
                </Button>
              )}
            </div>

            {/* Results */}
            {renderResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationLab;