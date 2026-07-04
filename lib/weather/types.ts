export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "storm"
  | "mist"
  | "snow";

export type WeatherProvider = "Open-Meteo";

export type MoonPhaseName =
  | "New moon"
  | "Waxing crescent"
  | "First quarter"
  | "Waxing gibbous"
  | "Full moon"
  | "Waning gibbous"
  | "Last quarter"
  | "Waning crescent";

export type SunMoonTiming = {
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: MoonPhaseName;
  moonIllumination: number;
  source: "provider" | "estimated";
};

export type CurrentWeather = {
  locationName: string;
  country: string;
  observedAt: string;
  timezone: string;
  condition: WeatherCondition;
  description: string;
  icon: string;
  isDay: boolean;
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
  sunMoon: SunMoonTiming;
};

export type WeatherReportMetadata = {
  provider: WeatherProvider;
  fetchedAt: string;
  attribution: string;
};

export type WeatherReport = {
  current: CurrentWeather;
  daily: DailyForecast[];
  metadata: WeatherReportMetadata;
};

export type PrecipitationChartPoint = {
  label: string;
  value: number;
};

export type TemperatureChartPoint = {
  label: string;
  min: number;
  max: number;
};
