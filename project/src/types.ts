export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: string;
    lon: string;
  };
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
    aqi?: number; // 空气质量指数
    pressure?: number; // 气压
    visibility?: number; // 能见度
  };
  forecast: {
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
    sunrise?: string; // 日出时间
    sunset?: string; // 日落时间
    precipitation?: number; // 降水概率
    uvIndex?: number; // 紫外线指数
    details?: string; // 详细天气描述
  }[];
  hourly: {
    time: string;
    temp: number;
    condition: string;
    icon: string;
  }[];
  alerts?: {
    title: string;
    type: string;
    level: string;
    content: string;
    pubTime: string;
  }[];
}

export interface City {
  name: string;
  id: string;
  lat: string;
  lon: string;
}

export interface Region {
  name: string;
  cities: City[];
}