import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeatherData } from '../types';

interface WeatherChartProps {
  weather: WeatherData;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ weather }) => {
  const hourlyData = weather.hourly.map(hour => ({
    time: hour.time.split(' ')[1],
    温度: hour.temp,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h3 className="text-xl font-semibold mb-4">24小时温度预报</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="温度"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};