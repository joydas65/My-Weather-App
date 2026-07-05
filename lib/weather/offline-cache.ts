import type { WeatherReport } from "@/lib/weather/types";

export type WeatherOfflineSnapshot = {
  cachedAt: string;
  endpoint: string;
  label: string;
  weather: WeatherReport;
};

export type WeatherOfflineStorage = Pick<Storage, "getItem" | "setItem">;

export const WEATHER_OFFLINE_SNAPSHOT_KEY =
  "my-weather-app:last-weather-snapshot:v1";

export function createWeatherOfflineSnapshot(
  weather: WeatherReport,
  endpoint: string,
  cachedAt = new Date().toISOString()
): WeatherOfflineSnapshot {
  return {
    cachedAt,
    endpoint,
    label: [weather.current.locationName, weather.current.country]
      .filter(Boolean)
      .join(", "),
    weather
  };
}

export function readLastWeatherSnapshot(
  storage: WeatherOfflineStorage | null | undefined = getBrowserStorage()
) {
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(WEATHER_OFFLINE_SNAPSHOT_KEY);

    return rawValue ? normalizeWeatherOfflineSnapshot(JSON.parse(rawValue)) : null;
  } catch {
    return null;
  }
}

export function writeLastWeatherSnapshot(
  snapshot: WeatherOfflineSnapshot,
  storage: WeatherOfflineStorage | null | undefined = getBrowserStorage()
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      WEATHER_OFFLINE_SNAPSHOT_KEY,
      JSON.stringify(normalizeWeatherOfflineSnapshot(snapshot) ?? snapshot)
    );
  } catch {
    // Storage can be unavailable in private or locked-down browser contexts.
  }
}

export function normalizeWeatherOfflineSnapshot(
  value: unknown
): WeatherOfflineSnapshot | null {
  if (!isPlainObject(value) || !isPlainObject(value.weather)) {
    return null;
  }

  if (
    typeof value.cachedAt !== "string" ||
    Number.isNaN(Date.parse(value.cachedAt)) ||
    typeof value.endpoint !== "string" ||
    !value.endpoint.startsWith("/api/weather") ||
    typeof value.label !== "string" ||
    !isWeatherReport(value.weather)
  ) {
    return null;
  }

  return {
    cachedAt: value.cachedAt,
    endpoint: value.endpoint,
    label: value.label,
    weather: value.weather
  };
}

function isWeatherReport(value: unknown): value is WeatherReport {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isPlainObject(value.current) &&
    typeof value.current.locationName === "string" &&
    typeof value.current.timezone === "string" &&
    typeof value.current.observedAt === "string" &&
    Array.isArray(value.daily) &&
    Array.isArray(value.hourly) &&
    isPlainObject(value.metadata) &&
    typeof value.metadata.fetchedAt === "string" &&
    typeof value.metadata.provider === "string"
  );
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
