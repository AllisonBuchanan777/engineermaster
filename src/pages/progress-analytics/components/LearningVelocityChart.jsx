import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LearningVelocityChart = ({ data, timeRange }) => {
  if (!data || data?.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-lg font-medium mb-2">No learning data</div>
        <div className="text-sm">Complete lessons to see your velocity</div>
      </div>
    );
  }

  // Process data into weekly buckets
  const processVelocityData = (lessons) => {
    const weeklyData = {};
    const weeks = timeRange === '1month' ? 4 : timeRange === '3months' ? 12 : 26;
    
    // Initialize weeks
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date();
      weekStart?.setDate(weekStart?.getDate() - ((weeks - 1 - i) * 7));
      const weekKey = `Week ${i + 1}`;
      weeklyData[weekKey] = {
        week: weekKey,
        lessons: 0,
        disciplines: new Set(),
        avgDifficulty: 0,
        totalDifficulty: 0
      };
    }

    // Process lessons
    lessons?.forEach(lesson => {
      if (!lesson?.completed_at) return;
      
      const completedDate = new Date(lesson.completed_at);
      const now = new Date();
      const weeksAgo = Math.floor((now - completedDate) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksAgo < weeks) {
        const weekKey = `Week ${weeks - weeksAgo}`;
        if (weeklyData?.[weekKey]) {
          weeklyData[weekKey].lessons++;
          if (lesson?.lessons?.discipline) {
            weeklyData?.[weekKey]?.disciplines?.add(lesson?.lessons?.discipline);
          }
          
          // Calculate difficulty score
          const difficultyScore = {
            beginner: 1,
            intermediate: 2,
            advanced: 3,
            expert: 4
          }?.[lesson?.lessons?.difficulty] || 1;
          
          weeklyData[weekKey].totalDifficulty += difficultyScore;
        }
      }
    });

    // Calculate average difficulty
    Object.values(weeklyData)?.forEach(week => {
      if (week?.lessons > 0) {
        week.avgDifficulty = week?.totalDifficulty / week?.lessons;
        week.disciplines = week?.disciplines?.size;
      }
    });

    return Object.values(weeklyData);
  };

  const chartData = processVelocityData(data);
  const avgLessonsPerWeek = chartData?.reduce((sum, week) => sum + week?.lessons, 0) / chartData?.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-yellow-600">
            {`Lessons: ${data?.lessons}`}
          </p>
          <p className="text-blue-600">
            {`Disciplines: ${data?.disciplines}`}
          </p>
          <p className="text-purple-600">
            {`Avg Difficulty: ${data?.avgDifficulty?.toFixed(1)}/4`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      {/* Summary Stats */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center mb-1">
            <span>Avg per week:</span>
            <span className="font-medium text-yellow-600">
              {avgLessonsPerWeek?.toFixed(1)} lessons
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total completed:</span>
            <span className="font-medium">
              {data?.length} lessons
            </span>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              stroke="#6b7280"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="lessons"
              fill="#eab308"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LearningVelocityChart;