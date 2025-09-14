import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';


const RoadmapFilters = ({ 
  selectedDiscipline, 
  setSelectedDiscipline, 
  selectedDifficulty, 
  setSelectedDifficulty, 
  selectedStatus, 
  setSelectedStatus,
  onResetFilters 
}) => {
  const disciplineOptions = [
    { value: 'all', label: 'All Disciplines' },
    { value: 'electrical', label: 'Electrical Engineering' },
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'mechatronics', label: 'Mechatronics' },
    { value: 'aerospace', label: 'Aerospace Engineering' },
    { value: 'innovation', label: 'Innovation Modules' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'locked', label: 'Locked' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <Select
              label="Discipline"
              options={disciplineOptions}
              value={selectedDiscipline}
              onChange={setSelectedDiscipline}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Select
              label="Difficulty"
              options={difficultyOptions}
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Select
              label="Status"
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onResetFilters}
            iconName="RotateCcw"
            iconPosition="left"
            className="whitespace-nowrap"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapFilters;