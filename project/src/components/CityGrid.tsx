import React from 'react';
import { MapPin, Wind, Droplets, Sun } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { WeatherData } from '../types';

interface CityGridProps {
  cities: WeatherData[];
  onRemoveCity: (cityName: string) => void;
}

export const CityGrid: React.FC<CityGridProps> = ({ cities, onRemoveCity }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cities.map((city) => (
        <div key={city.location.name} className="bg-white rounded-lg shadow-sm p-4 relative group">
          <button
            onClick={() => onRemoveCity(city.location.name)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
          
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-800">{city.location.name}</h3>
              <p className="text-sm text-gray-500">{city.current.condition}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{city.current.temp}°C</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <div className="flex items-center gap-1">
              <Wind size={14} className="text-blue-500" />
              <span>{city.current.windSpeed}km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets size={14} className="text-blue-500" />
              <span>{city.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Sun size={14} className="text-yellow-500" />
              <span>{city.forecast[0].maxTemp}°</span>
            </div>
          </div>

          <div className="h-24 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={city.hourly.slice(0, 12)}>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  interval={2}
                  tickFormatter={(time) => {
                    if (!time) return '';
                    const parts = time.split(' ');
                    return parts.length > 1 ? parts[1].slice(0, 5) : time;
                  }}
                />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 10 }}
                  width={25}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};