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

export type HourlyForecast = {
  time: string;
  condition: WeatherCondition;
  description: string;
  isDay: boolean;
  temperatureC: number;
  feelsLikeC: number;
  precipitationChance: number;
  cloudCover: number;
  windSpeedMs: number;
  windDegree: number;
};

export type TomorrowPeriod = {
  label: "Morning" | "Afternoon" | "Evening";
  condition: WeatherCondition;
  isDay: boolean;
  precipitationChance: number;
  summary: string;
  temperatureC: number;
  windSpeedMs: number;
};

export type TomorrowBrief = {
  bestWindow: string | null;
  date: string;
  headline: string;
  periods: TomorrowPeriod[];
  precipitationChance: number;
  summary: string;
  temperatureMaxC: number;
  temperatureMinC: number;
};

export type WeatherInsightTone = "caution" | "comfort" | "rain" | "wind";

export type WeatherInsight = {
  detail: string;
  id: string;
  title: string;
  tone: WeatherInsightTone;
};

export type WeatherReportMetadata = {
  provider: WeatherProvider;
  fetchedAt: string;
  attribution: string;
};

export type WeatherReport = {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
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
