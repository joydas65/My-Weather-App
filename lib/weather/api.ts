import type { WeatherReport } from "@/lib/weather/types";

export const WEATHER_ERROR_CODES = [
  "INVALID_QUERY",
  "INVALID_COORDINATES",
  "NO_RESULTS",
  "GEOCODING_UNAVAILABLE",
  "WEATHER_UNAVAILABLE"
] as const;

export type WeatherErrorCode = (typeof WEATHER_ERROR_CODES)[number];

export type WeatherApiSuccess = {
  weather: WeatherReport;
};

export type WeatherApiFailure = {
  error: {
    code: WeatherErrorCode;
    message: string;
  };
};

export type WeatherApiResponse = WeatherApiSuccess | WeatherApiFailure;

export const weatherErrorStatus: Record<WeatherErrorCode, number> = {
  INVALID_QUERY: 400,
  INVALID_COORDINATES: 400,
  NO_RESULTS: 404,
  GEOCODING_UNAVAILABLE: 502,
  WEATHER_UNAVAILABLE: 502
};

export class WeatherLookupError extends Error {
  code: WeatherErrorCode;
  status: number;

  constructor(code: WeatherErrorCode, message: string) {
    super(message);
    this.name = "WeatherLookupError";
    this.code = code;
    this.status = weatherErrorStatus[code];
  }
}

export function createWeatherApiFailure(
  code: WeatherErrorCode,
  message: string
): WeatherApiFailure {
  return {
    error: {
      code,
      message
    }
  };
}

export function isWeatherApiFailure(
  payload: WeatherApiResponse | Record<string, never>
): payload is WeatherApiFailure {
  return (
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "code" in payload.error &&
    "message" in payload.error
  );
}
