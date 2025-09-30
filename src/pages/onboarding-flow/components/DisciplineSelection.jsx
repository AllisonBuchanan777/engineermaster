import React, { useState } from 'react';
import { Cog, Zap, Building, Beaker, Monitor, Plane, Heart, Leaf, Atom, Factory } from 'lucide-react';

const DisciplineSelection = ({ data, onNext, onBack }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState(data?.preferredDiscipline);
  const [hoveredDiscipline, setHoveredDiscipline] = useState(null);

  const disciplines = [
    {
      id: 'mechanical',
      name: 'Mechanical Engineering',
      icon: Cog,
      description: 'Design and manufacturing of mechanical systems, thermodynamics, and materials',
      color: 'from-blue-500 to-cyan-500',
      topics: ['Statics & Dynamics', 'Thermodynamics', 'Fluid Mechanics', 'Materials Science']
    },
    {
      id: 'electrical',
      name: 'Electrical Engineering',
      icon: Zap,
      description: 'Electronic circuits, power systems, and electromagnetic theory',
      color: 'from-yellow-500 to-orange-500',
      topics: ['Circuit Analysis', 'Digital Systems', 'Power Systems', 'Signal Processing']
    },
    {
      id: 'civil',
      name: 'Civil Engineering',
      icon: Building,
      description: 'Infrastructure design, structural analysis, and construction management',
      color: 'from-gray-500 to-slate-600',
      topics: ['Structural Analysis', 'Geotechnical', 'Transportation', 'Water Resources']
    },
    {
      id: 'chemical',
      name: 'Chemical Engineering',
      icon: Beaker,
      description: 'Process design, reaction engineering, and chemical plant operations',
      color: 'from-green-500 to-emerald-500',
      topics: ['Process Design', 'Reaction Engineering', 'Mass Transfer', 'Process Control']
    },
    {
      id: 'computer',
      name: 'Computer Engineering',
      icon: Monitor,
      description: 'Hardware design, embedded systems, and computer architecture',
      color: 'from-purple-500 to-violet-500',
      topics: ['Computer Architecture', 'Embedded Systems', 'VLSI Design', 'Digital Logic']
    },
    {
      id: 'aerospace',
      name: 'Aerospace Engineering',
      icon: Plane,
      description: 'Aircraft and spacecraft design, propulsion, and flight mechanics',
      color: 'from-indigo-500 to-blue-600',
      topics: ['Aerodynamics', 'Propulsion', 'Flight Mechanics', 'Spacecraft Design']
    },
    {
      id: 'biomedical',
      name: 'Biomedical Engineering',
      icon: Heart,
      description: 'Medical device design, biomechanics, and healthcare technology',
      color: 'from-red-500 to-pink-500',
      topics: ['Biomechanics', 'Medical Devices', 'Biotechnology', 'Healthcare Systems']
    },
    {
      id: 'environmental',
      name: 'Environmental Engineering',
      icon: Leaf,
      description: 'Pollution control, water treatment, and sustainable systems',
      color: 'from-green-600 to-teal-500',
      topics: ['Water Treatment', 'Air Pollution Control', 'Waste Management', 'Sustainability']
    },
    {
      id: 'materials',
      name: 'Materials Engineering',
      icon: Atom,
      description: 'Material properties, processing, and advanced material development',
      color: 'from-orange-500 to-red-500',
      topics: ['Material Properties', 'Processing', 'Characterization', 'Advanced Materials']
    },
    {
      id: 'industrial',
      name: 'Industrial Engineering',
      icon: Factory,
      description: 'Process optimization, quality control, and systems engineering',
      color: 'from-slate-500 to-gray-600',
      topics: ['Process Optimization', 'Quality Control', 'Operations Research', 'Ergonomics']
    }
  ];

  const handleContinue = () => {
    if (selectedDiscipline) {
      onNext({ preferredDiscipline: selectedDiscipline });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Engineering Discipline</h2>
        <p className="text-gray-600">
          Select your primary area of interest to customize your learning experience
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {disciplines?.map((discipline) => {
          const DisciplineIcon = discipline?.icon;
          const isSelected = selectedDiscipline === discipline?.id;
          const isHovered = hoveredDiscipline === discipline?.id;

          return (
            <div
              key={discipline?.id}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
              `}
              onClick={() => setSelectedDiscipline(discipline?.id)}
              onMouseEnter={() => setHoveredDiscipline(discipline?.id)}
              onMouseLeave={() => setHoveredDiscipline(null)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-gradient-to-br ${discipline?.color}
              `}>
                <DisciplineIcon className="w-6 h-6 text-white" />
              </div>
              {/* Content */}
              <h3 className="font-semibold text-gray-900 mb-1">{discipline?.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{discipline?.description}</p>
              {/* Topics Preview */}
              {(isHovered || isSelected) && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Key Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {discipline?.topics?.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Selection Summary */}
      {selectedDiscipline && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {(() => {
              const selected = disciplines?.find(d => d?.id === selectedDiscipline);
              const SelectedIcon = selected?.icon;
              return (
                <>
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${selected?.color}
                  `}>
                    <SelectedIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selected?.name}</h4>
                    <p className="text-sm text-gray-600">Great choice! We'll customize your learning path accordingly.</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!selectedDiscipline}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${selectedDiscipline 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' :'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DisciplineSelection;