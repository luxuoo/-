import React from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import type { WeatherData } from '../types';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{weather.location.name}</h2>
          <p className="text-gray-600">{weather.location.country}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-gray-800">{weather.current.temp}°C</p>
          <p className="text-gray-600">{weather.current.condition}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">湿度</p>
            <p className="font-semibold">{weather.current.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">风速</p>
            <p className="font-semibold">{weather.current.windSpeed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">天气</p>
            <p className="font-semibold">{weather.current.condition}</p>
          </div>
        </div>
      </div>
    </div>
  );
};