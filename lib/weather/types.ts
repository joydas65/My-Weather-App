export type WeatherCondition = "clear" | "clouds" | "rain" | "storm" | "mist";

export type CurrentWeather = {
  locationName: string;
  country: string;
  observedAt: string;
  timezone: string;
  condition: WeatherCondition;
  description: string;
  icon: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  pressureHpa: number;
  dewPointC: number;
  visibilityMeters: number;
  cloudCover: number;
  windSpeedMs: number;
  windDegree: number;
  sunrise: string;
  sunset: string;
};

export type DailyForecast = {
  date: string;
  summary: string;
  precipitationChance: number;
  temperatureMinC: number;
  temperatureMaxC: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
};

export type WeatherReport = {
  current: CurrentWeather;
  daily: DailyForecast[];
};
