import type {
  PressureUnit,
  TemperatureUnit,
  VisibilityUnit,
  WindSpeedUnit
} from "@/lib/weather/preferences";

const WIND_DIRECTIONS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW"
];

export function convertTemperature(valueC: number, unit: TemperatureUnit) {
  return unit === "fahrenheit" ? valueC * (9 / 5) + 32 : valueC;
}

export function formatTemperature(
  value: number,
  unit: TemperatureUnit = "celsius"
) {
  const suffix = unit === "fahrenheit" ? "F" : "C";
  return `${Math.round(convertTemperature(value, unit))} ${suffix}`;
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatPressure(value: number, unit: PressureUnit = "hpa") {
  if (unit === "inhg") {
    return `${(value * 0.0295299830714).toFixed(2)} inHg`;
  }

  return `${Math.round(value)} hPa`;
}

export function formatWindSpeed(value: number, unit: WindSpeedUnit = "ms") {
  if (unit === "kmh") {
    return `${(value * 3.6).toFixed(1)} km/h`;
  }

  if (unit === "mph") {
    return `${(value * 2.2369362921).toFixed(1)} mph`;
  }

  return `${value.toFixed(1)} m/s`;
}

export function formatVisibility(value: number, unit: VisibilityUnit = "km") {
  if (unit === "mi") {
    return `${(value / 1609.344).toFixed(1)} mi`;
  }

  return `${(value / 1000).toFixed(1)} km`;
}

export function getWindDirection(degrees: number) {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % WIND_DIRECTIONS.length;

  return WIND_DIRECTIONS[index];
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatDayName(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short"
  }).format(new Date(value));
}

export function formatTime(value: string, timezone?: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone
  }).format(new Date(value));
}

export function getSunEventStatus(now: string, sunrise: string, sunset: string) {
  const currentTime = new Date(now).getTime();
  const sunriseTime = new Date(sunrise).getTime();
  const sunsetTime = new Date(sunset).getTime();

  if (currentTime < sunriseTime) {
    return {
      sunrise: "Not risen",
      sunset: "Not set"
    };
  }

  if (currentTime < sunsetTime) {
    return {
      sunrise: "Risen",
      sunset: "Not set"
    };
  }

  return {
    sunrise: "Risen",
    sunset: "Set"
  };
}
