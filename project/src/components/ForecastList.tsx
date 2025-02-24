import React, { useState } from 'react';
import type { WeatherData } from '../types';
import { Sun, Cloud, CloudRain, Sunrise, Sunset, Umbrella, Sun as UVIcon } from 'lucide-react';

interface ForecastListProps {
  weather: WeatherData;
}

export const ForecastList: React.FC<ForecastListProps> = ({ weather }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('晴')) return <Sun className="text-yellow-500" />;
    if (condition.includes('雨')) return <CloudRain className="text-blue-500" />;
    return <Cloud className="text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 w-full">
      <h3 className="text-lg font-semibold mb-4">7天预报</h3>
      <div className="space-y-2">
        {weather.forecast.map((day) => (
          <div key={day.date} className="border-b border-gray-100 last:border-0">
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
            >
              <div className="flex items-center gap-4">
                {getWeatherIcon(day.condition)}
                <div className="text-left">
                  <p className="font-medium">{day.date}</p>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{day.maxTemp}°C</p>
                <p className="text-sm text-gray-600">{day.minTemp}°C</p>
              </div>
            </button>
            
            {expandedDay === day.date && day.details && (
              <div className="p-4 bg-gray-50 rounded-lg mt-2 grid grid-cols-2 gap-4">
                {day.sunrise && (
                  <div className="flex items-center gap-2">
                    <Sunrise size={16} className="text-orange-500" />
                    <span className="text-sm">日出 {day.sunrise}</span>
                  </div>
                )}
                {day.sunset && (
                  <div className="flex items-center gap-2">
                    <Sunset size={16} className="text-orange-500" />
                    <span className="text-sm">日落 {day.sunset}</span>
                  </div>
                )}
                {day.precipitation !== undefined && (
                  <div className="flex items-center gap-2">
                    <Umbrella size={16} className="text-blue-500" />
                    <span className="text-sm">降水概率 {day.precipitation}%</span>
                  </div>
                )}
                {day.uvIndex !== undefined && (
                  <div className="flex items-center gap-2">
                    <UVIcon size={16} className="text-yellow-500" />
                    <span className="text-sm">紫外线指数 {day.uvIndex}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">{day.details}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};