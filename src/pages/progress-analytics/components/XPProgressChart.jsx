import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const XPProgressChart = ({ data, height = 300 }) => {
  if (!data || data?.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No XP data available</div>
          <div className="text-sm">Complete lessons to see your progress</div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium">{`Date: ${label}`}</p>
          <p className="text-blue-600">
            {`Total XP: ${payload?.[0]?.value?.toLocaleString()}`}
          </p>
          {payload?.[0]?.payload?.dailyXP > 0 && (
            <p className="text-green-600">
              {`Daily XP: +${payload?.[0]?.payload?.dailyXP}`}
            </p>
          )}
          {payload?.[0]?.payload?.source && (
            <p className="text-gray-600 text-sm">
              {`Source: ${payload?.[0]?.payload?.source}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d?.getMonth() + 1}/${d?.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000)?.toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default XPProgressChart;