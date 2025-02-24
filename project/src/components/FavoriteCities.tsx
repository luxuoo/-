import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import type { City } from '../types';

interface FavoriteCitiesProps {
  cities: City[];
  onSelectCity: (cityName: string) => void;
  onRemoveCity: (cityId: string) => void;
}

export const FavoriteCities: React.FC<FavoriteCitiesProps> = ({
  cities,
  onSelectCity,
  onRemoveCity,
}) => {
  if (cities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star className="text-yellow-500" size={20} />
        收藏城市
      </h3>
      <div className="flex flex-wrap gap-3">
        {cities.map((city) => (
          <div
            key={city.id}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
          >
            <button
              onClick={() => onSelectCity(city.name)}
              className="text-gray-700 hover:text-blue-600"
            >
              {city.name}
            </button>
            <button
              onClick={() => onRemoveCity(city.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}