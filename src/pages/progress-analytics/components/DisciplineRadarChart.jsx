import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const DisciplineRadarChart = ({ data, height = 300 }) => {
  if (!data || data?.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No competency data available</div>
          <div className="text-sm">Complete lessons in different disciplines</div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          <p className="text-purple-600">
            {`Competency: ${payload?.[0]?.value}%`}
          </p>
          <p className="text-blue-600">
            {`Lessons: ${data?.lessonsCompleted}`}
          </p>
          <p className="text-green-600">
            {`Avg Score: ${data?.averageScore}%`}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <div>Difficulty Distribution:</div>
            {Object.entries(data?.difficultyDistribution || {})?.map(([level, count]) => (
              count > 0 && (
                <div key={level} className="ml-2">
                  {level}: {count}
                </div>
              )
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="discipline" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Radar
            name="Competency"
            dataKey="competency"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DisciplineRadarChart;