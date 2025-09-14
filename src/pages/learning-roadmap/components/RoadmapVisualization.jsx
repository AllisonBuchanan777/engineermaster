import React, { useState, useRef, useEffect } from 'react';
import ModuleNode from './ModuleNode';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RoadmapVisualization = ({ modules, filteredModules, onModuleClick }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Calculate module positions in a flowchart layout
  const calculateModulePositions = (modules) => {
    const positions = {};
    const disciplineColumns = {
      electrical: 0,
      mechanical: 1,
      mechatronics: 2,
      aerospace: 3,
      innovation: 4
    };

    const columnWidth = 320;
    const rowHeight = 200;
    const disciplineCounts = {};

    modules?.forEach(module => {
      const discipline = module.discipline;
      const column = disciplineColumns?.[discipline] || 0;
      
      if (!disciplineCounts?.[discipline]) {
        disciplineCounts[discipline] = 0;
      }
      
      const row = disciplineCounts?.[discipline];
      disciplineCounts[discipline]++;

      positions[module.id] = {
        left: column * columnWidth + 160,
        top: row * rowHeight + 100
      };
    });

    return positions;
  };

  const modulePositions = calculateModulePositions(filteredModules);

  const handleMouseDown = (e) => {
    if (e?.target === containerRef?.current) {
      setIsDragging(true);
      setDragStart({
        x: e?.clientX - pan?.x,
        y: e?.clientY - pan?.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Draw connections between modules
  const renderConnections = () => {
    const connections = [];
    
    filteredModules?.forEach(module => {
      module.prerequisites?.forEach(prereqTitle => {
        const prereqModule = modules?.find(m => m?.title === prereqTitle);
        if (prereqModule && modulePositions?.[prereqModule?.id] && modulePositions?.[module.id]) {
          const startPos = modulePositions?.[prereqModule?.id];
          const endPos = modulePositions?.[module.id];
          
          connections?.push(
            <line
              key={`${prereqModule?.id}-${module.id}`}
              x1={startPos?.left}
              y1={startPos?.top}
              x2={endPos?.left}
              y2={endPos?.top}
              stroke="var(--color-border)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          );
        }
      });
    });

    return connections;
  };

  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden" style={{ height: '600px' }}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <Button size="icon" variant="outline" onClick={handleZoomIn}>
          <Icon name="ZoomIn" size={16} />
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomOut}>
          <Icon name="ZoomOut" size={16} />
        </Button>
        <Button size="icon" variant="outline" onClick={handleResetView}>
          <Icon name="RotateCcw" size={16} />
        </Button>
      </div>
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-card border border-border rounded-lg p-3">
        <h4 className="text-sm font-semibold text-foreground mb-2">Disciplines</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Electrical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Mechanical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-muted-foreground">Mechatronics</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">Aerospace</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-muted-foreground">Innovation</span>
          </div>
        </div>
      </div>
      {/* Roadmap Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        style={{
          transform: `scale(${zoom}) translate(${pan?.x}px, ${pan?.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '2000px', height: '1500px' }}>
          {renderConnections()}
        </svg>

        {/* Module Nodes */}
        <div className="relative" style={{ width: '2000px', height: '1500px' }}>
          {filteredModules?.map(module => (
            <ModuleNode
              key={module.id}
              module={module}
              onModuleClick={onModuleClick}
              style={modulePositions?.[module.id]}
            />
          ))}
        </div>
      </div>
      {/* Empty State */}
      {filteredModules?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No modules found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more modules.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapVisualization;