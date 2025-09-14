import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChallengePanel = ({ activeSimulation, onChallengeSelect }) => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const challenges = {
    circuit: [
      {
        id: 'led_circuit',
        title: 'LED Circuit Design',
        difficulty: 'Beginner',
        xp: 100,
        description: 'Design a simple LED circuit with proper current limiting resistor',
        objectives: [
          'Add an LED component to the circuit',
          'Calculate and add appropriate resistor',
          'Connect to 9V battery source',
          'Verify LED operates within safe parameters'
        ],
        hint: 'Use Ohm\'s law: R = (Vsource - VLED) / ILED. Typical LED forward voltage is 2.1V.',
        timeLimit: 15,
        completed: false
      },
      {
        id: 'voltage_divider',
        title: 'Voltage Divider Analysis',
        difficulty: 'Beginner',
        xp: 150,
        description: 'Create a voltage divider circuit and measure output voltage',
        objectives: [
          'Build voltage divider with two resistors',
          'Calculate expected output voltage',
          'Measure actual output with multimeter',
          'Verify calculations match measurements'
        ],
        hint: 'Vout = Vin × (R2 / (R1 + R2))',
        timeLimit: 20,
        completed: true
      },
      {
        id: 'op_amp_amplifier',
        title: 'Op-Amp Amplifier',
        difficulty: 'Intermediate',
        xp: 250,
        description: 'Design a non-inverting amplifier with specific gain',
        objectives: [
          'Configure op-amp in non-inverting mode',
          'Set gain to 10x using feedback resistors',
          'Test with 1V input signal',
          'Measure and verify 10V output'
        ],
        hint: 'Gain = 1 + (Rf / Rin). Choose Rf and Rin accordingly.',
        timeLimit: 30,
        completed: false
      }
    ],
    mechanical: [
      {
        id: 'gear_train',
        title: 'Gear Train Design',
        difficulty: 'Beginner',
        xp: 120,
        description: 'Design a gear train to achieve specific speed reduction',
        objectives: [
          'Create 4:1 speed reduction',
          'Use appropriate gear sizes',
          'Verify torque multiplication',
          'Check for interference'
        ],
        hint: 'Speed ratio = N1/N2 where N is number of teeth',
        timeLimit: 25,
        completed: false
      },
      {
        id: 'beam_analysis',
        title: 'Beam Stress Analysis',
        difficulty: 'Intermediate',
        xp: 200,
        description: 'Analyze stress distribution in a loaded beam',
        objectives: [
          'Apply 1000N load to beam center',
          'Calculate maximum bending stress',
          'Verify safety factor > 2',
          'Optimize beam dimensions'
        ],
        hint: 'Maximum bending stress = M×c/I where M is moment, c is distance to neutral axis, I is moment of inertia',
        timeLimit: 35,
        completed: false
      },
      {
        id: 'spring_system',
        title: 'Spring-Mass System',
        difficulty: 'Advanced',
        xp: 300,
        description: 'Design and analyze a spring-mass vibration system',
        objectives: [
          'Design spring for 2Hz natural frequency',
          'Add 5kg mass',
          'Simulate free vibration',
          'Calculate damping coefficient'
        ],
        hint: 'Natural frequency fn = (1/2π)√(k/m)',
        timeLimit: 45,
        completed: false
      }
    ],
    aerospace: [
      {
        id: 'orbit_insertion',
        title: 'Orbital Insertion',
        difficulty: 'Intermediate',
        xp: 180,
        description: 'Design a spacecraft to achieve stable Earth orbit',
        objectives: [
          'Calculate required delta-V for 400km orbit',
          'Size propulsion system',
          'Plan insertion burn sequence',
          'Verify orbital stability'
        ],
        hint: 'Orbital velocity = √(GM/r) where G is gravitational constant, M is Earth mass, r is orbital radius',
        timeLimit: 40,
        completed: false
      },
      {
        id: 'mars_transfer',
        title: 'Mars Transfer Trajectory',
        difficulty: 'Advanced',
        xp: 400,
        description: 'Plan a Hohmann transfer orbit to Mars',
        objectives: [
          'Calculate transfer orbit parameters',
          'Determine launch window',
          'Size spacecraft for mission',
          'Plan trajectory corrections'
        ],
        hint: 'Hohmann transfer uses elliptical orbit tangent to both planetary orbits',
        timeLimit: 60,
        completed: false
      },
      {
        id: 'landing_system',
        title: 'Planetary Landing System',
        difficulty: 'Advanced',
        xp: 350,
        description: 'Design a landing system for Mars surface',
        objectives: [
          'Calculate entry velocity and heating',
          'Size heat shield and parachutes',
          'Design retro-propulsion system',
          'Verify safe landing capability'
        ],
        hint: 'Entry heating = ½ρv²Cd where ρ is atmospheric density, v is velocity, Cd is drag coefficient',
        timeLimit: 50,
        completed: false
      }
    ]
  };

  const currentChallenges = challenges?.[activeSimulation] || [];

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    onChallengeSelect(challenge);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-success bg-success/20';
      case 'Intermediate': return 'text-warning bg-warning/20';
      case 'Advanced': return 'text-error bg-error/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (!activeSimulation) {
    return (
      <div className="p-6 bg-card rounded-lg border border-border">
        <div className="text-center text-muted-foreground">
          <Icon name="Target" size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Engineering Challenges</p>
          <p className="text-sm">Select a simulation environment to view available challenges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Engineering Challenges</h2>
          <p className="text-muted-foreground">Test your skills with hands-on engineering problems</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Icon name="Trophy" size={20} color="var(--color-primary)" />
          <span className="font-semibold text-primary">
            {currentChallenges?.filter(c => c?.completed)?.length}/{currentChallenges?.length} Complete
          </span>
        </div>
      </div>
      {/* Challenge List */}
      <div className="grid gap-4">
        {currentChallenges?.map((challenge) => (
          <div
            key={challenge?.id}
            className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
              selectedChallenge?.id === challenge?.id
                ? 'border-primary bg-primary/5'
                : challenge?.completed
                ? 'border-success/50 bg-success/5' :'border-border bg-card hover:border-primary/50'
            }`}
            onClick={() => handleChallengeSelect(challenge)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  challenge?.completed ? 'bg-success/20' : 'bg-primary/20'
                }`}>
                  <Icon 
                    name={challenge?.completed ? "CheckCircle" : "Target"} 
                    size={24} 
                    color={challenge?.completed ? "var(--color-success)" : "var(--color-primary)"} 
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{challenge?.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge?.difficulty)}`}>
                      {challenge?.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3">{challenge?.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={16} />
                      <span>{challenge?.timeLimit} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Zap" size={16} />
                      <span>{challenge?.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {challenge?.completed && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-success/20 rounded-full">
                  <Icon name="Check" size={16} color="var(--color-success)" />
                  <span className="text-success text-sm font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Objectives */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-foreground">Objectives:</h4>
              <ul className="space-y-1">
                {challenge?.objectives?.map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                iconName={showHint && selectedChallenge?.id === challenge?.id ? "EyeOff" : "Eye"}
                iconPosition="left"
                onClick={(e) => {
                  e?.stopPropagation();
                  setShowHint(!showHint && selectedChallenge?.id === challenge?.id);
                }}
              >
                {showHint && selectedChallenge?.id === challenge?.id ? 'Hide Hint' : 'Show Hint'}
              </Button>

              <Button
                variant={selectedChallenge?.id === challenge?.id ? "default" : "outline"}
                size="sm"
                iconName={challenge?.completed ? "RotateCcw" : "Play"}
                iconPosition="left"
              >
                {challenge?.completed ? 'Retry' : 'Start Challenge'}
              </Button>
            </div>

            {/* Hint */}
            {showHint && selectedChallenge?.id === challenge?.id && (
              <div className="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Lightbulb" size={16} color="var(--color-warning)" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-warning mb-1">Hint:</h5>
                    <p className="text-sm text-foreground">{challenge?.hint}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Progress Summary */}
      <div className="p-6 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Progress</h3>
          <div className="text-sm text-muted-foreground">
            {Math.round((currentChallenges?.filter(c => c?.completed)?.length / currentChallenges?.length) * 100)}% Complete
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(currentChallenges?.filter(c => c?.completed)?.length / currentChallenges?.length) * 100}%` 
            }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-success">
              {currentChallenges?.filter(c => c?.completed)?.length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {currentChallenges?.reduce((sum, c) => sum + (c?.completed ? c?.xp : 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">XP Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">
              {currentChallenges?.filter(c => !c?.completed)?.length}
            </div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePanel;