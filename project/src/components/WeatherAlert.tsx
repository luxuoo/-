import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WeatherAlertProps {
  alerts?: {
    title: string;
    type: string;
    level: string;
    content: string;
    pubTime: string;
  }[];
}

export const WeatherAlert: React.FC<WeatherAlertProps> = ({ alerts }) => {
  if (!alerts?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-yellow-500" size={20} />
        <h3 className="text-lg font-semibold">天气预警</h3>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="border-l-4 border-yellow-500 pl-3 py-2"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-red-600">{alert.title}</h4>
              <span className="text-sm text-gray-500">{alert.pubTime}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{alert.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};