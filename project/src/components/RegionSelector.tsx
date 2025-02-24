import React from 'react';
import { MapPin } from 'lucide-react';
import type { Region } from '../types';

interface RegionSelectorProps {
  regions: Region[];
  onSelectCity: (cityName: string) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ regions, onSelectCity }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <MapPin className="text-blue-500" size={20} />
        热门城市
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {regions.map((region) => (
          <div key={region.name} className="space-y-3">
            <h4 className="font-medium text-gray-700 text-lg">{region.name}</h4>
            <div className="flex flex-wrap gap-3">
              {region.cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => onSelectCity(city.name)}
                  className="px-4 py-2 text-base bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex-grow sm:flex-grow-0"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}