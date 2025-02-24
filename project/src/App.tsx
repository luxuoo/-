import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchBar } from './components/SearchBar';
import { WeatherCard } from './components/WeatherCard';
import { WeatherChart } from './components/WeatherChart';
import { ForecastList } from './components/ForecastList';
import { CityGrid } from './components/CityGrid';
import { WeatherAlert } from './components/WeatherAlert';
import { Printer, MapPin } from 'lucide-react';
import type { WeatherData } from './types';

const QWEATHER_API_KEY = '16ad6adeb7474a75a33116a10a34170b';
const QWEATHER_API_BASE = 'https://geoapi.qweather.com/v2';
const WEATHER_API_BASE = 'https://devapi.qweather.com/v7';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [monitoredCities, setMonitoredCities] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');

  const fetchWeatherData = async (location: any) => {
    const [currentWeather, forecast, hourly, warning] = await Promise.all([
      axios.get(`${WEATHER_API_BASE}/weather/now`, {
        params: {
          location: `${location.lon},${location.lat}`,
          key: QWEATHER_API_KEY
        }
      }),
      axios.get(`${WEATHER_API_BASE}/weather/7d`, {
        params: {
          location: `${location.lon},${location.lat}`,
          key: QWEATHER_API_KEY
        }
      }),
      axios.get(`${WEATHER_API_BASE}/weather/24h`, {
        params: {
          location: `${location.lon},${location.lat}`,
          key: QWEATHER_API_KEY
        }
      }),
      axios.get(`${WEATHER_API_BASE}/warning/now`, {
        params: {
          location: `${location.lon},${location.lat}`,
          key: QWEATHER_API_KEY
        }
      })
    ]);

    return {
      location: {
        name: location.name,
        country: location.country || '中国',
        lat: location.lat,
        lon: location.lon,
      },
      current: {
        temp: currentWeather.data.now.temp,
        humidity: currentWeather.data.now.humidity,
        windSpeed: currentWeather.data.now.windSpeed,
        condition: currentWeather.data.now.text,
        icon: currentWeather.data.now.icon,
      },
      forecast: forecast.data.daily.map((day: any) => ({
        date: new Date(day.fxDate).toLocaleDateString('zh-CN'),
        maxTemp: day.tempMax,
        minTemp: day.tempMin,
        condition: day.textDay,
        icon: day.iconDay,
        sunrise: day.sunrise,
        sunset: day.sunset,
        precipitation: day.precip,
        uvIndex: day.uvIndex,
        details: `${day.textDay}。最高温度${day.tempMax}°C，最低温度${day.tempMin}°C。${day.windDirDay}${day.windScaleDay}级。`
      })),
      hourly: hourly.data.hourly.map((hour: any) => ({
        time: new Date(hour.fxTime).toLocaleTimeString('zh-CN'),
        temp: hour.temp,
        condition: hour.text,
        icon: hour.icon,
      })),
      alerts: warning.data.warning?.map((alert: any) => ({
        title: alert.title,
        type: alert.type,
        level: alert.level,
        content: alert.text,
        pubTime: new Date(alert.pubTime).toLocaleString('zh-CN'),
      })) || [],
    };
  };

  const getLocationWeather = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用和风天气API进行逆地理编码
      const geoResponse = await axios.get(`${QWEATHER_API_BASE}/city/lookup`, {
        params: {
          location: `${longitude},${latitude}`,
          key: QWEATHER_API_KEY
        }
      });

      if (!geoResponse.data.location?.[0]) {
        throw new Error('无法获取当前位置信息');
      }

      const location = geoResponse.data.location[0];
      const data = await fetchWeatherData(location);
      setWeatherData(data);

      // 添加到监控城市列表
      if (!monitoredCities.some(c => c.location.name === data.location.name)) {
        setMonitoredCities([...monitoredCities, data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取天气信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationStatus('正在获取位置信息...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getLocationWeather(position.coords.latitude, position.coords.longitude);
          setLocationStatus('');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationStatus('无法获取位置信息，请手动搜索城市');
        }
      );
    } else {
      setLocationStatus('您的浏览器不支持地理位置功能');
    }
  }, []);

  const handleSearch = async (city: string) => {
    try {
      setLoading(true);
      setError(null);

      const geoResponse = await axios.get(`${QWEATHER_API_BASE}/city/lookup`, {
        params: {
          location: city,
          key: QWEATHER_API_KEY
        }
      });

      if (!geoResponse.data.location?.[0]) {
        throw new Error('未找到该城市');
      }

      const location = geoResponse.data.location[0];
      const data = await fetchWeatherData(location);
      setWeatherData(data);

      // 添加到监控城市列表
      if (!monitoredCities.some(c => c.location.name === data.location.name)) {
        setMonitoredCities([...monitoredCities, data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取天气信息失败');
    } finally {
      setLoading(false);
    }
  };

  const removeMonitoredCity = (cityName: string) => {
    setMonitoredCities(monitoredCities.filter(city => city.location.name !== cityName));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">天气预报</h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors print:hidden"
          >
            <Printer size={16} />
            打印页面
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <div className="w-full max-w-lg">
            <SearchBar onSearch={handleSearch} />
            {locationStatus && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                <MapPin size={16} className="animate-pulse" />
                {locationStatus}
              </div>
            )}
            {error && (
              <div className="text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-2 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <WeatherAlert alerts={weatherData.alerts} />
        )}

        {monitoredCities.length > 0 && (
          <CityGrid
            cities={monitoredCities}
            onRemoveCity={removeMonitoredCity}
          />
        )}

        {weatherData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeatherCard weather={weatherData} />
            <WeatherChart weather={weatherData} />
          </div>
        )}

        {weatherData && !loading && (
          <ForecastList weather={weatherData} />
        )}
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background-color: white;
          }
          .min-h-screen {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default App;