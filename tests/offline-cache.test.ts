import { describe, expect, it } from "vitest";
import {
  createWeatherOfflineSnapshot,
  normalizeWeatherOfflineSnapshot,
  readLastWeatherSnapshot,
  WEATHER_OFFLINE_SNAPSHOT_KEY,
  writeLastWeatherSnapshot
} from "@/lib/weather/offline-cache";
import type { WeatherReport } from "@/lib/weather/types";

describe("weather offline cache", () => {
  it("creates a labeled last-forecast snapshot", () => {
    const weather = createWeatherReport();
    const snapshot = createWeatherOfflineSnapshot(
      weather,
      "/api/weather?q=London",
      "2026-07-05T12:10:00.000Z"
    );

    expect(snapshot).toMatchObject({
      cachedAt: "2026-07-05T12:10:00.000Z",
      endpoint: "/api/weather?q=London",
      label: "London, GB",
      weather
    });
  });

  it("writes and reads a normalized snapshot from storage", () => {
    const storage = createMemoryStorage();
    const snapshot = createWeatherOfflineSnapshot(
      createWeatherReport(),
      "/api/weather?q=London",
      "2026-07-05T12:10:00.000Z"
    );

    writeLastWeatherSnapshot(snapshot, storage);

    expect(storage.getItem(WEATHER_OFFLINE_SNAPSHOT_KEY)).toContain("London");
    expect(readLastWeatherSnapshot(storage)).toEqual(snapshot);
  });

  it("ignores malformed cached snapshots", () => {
    expect(normalizeWeatherOfflineSnapshot({ endpoint: "https://example.com" }))
      .toBeNull();
    expect(readLastWeatherSnapshot(createMemoryStorage("{bad json"))).toBeNull();
  });
});

function createMemoryStorage(initialValue?: string) {
  let value = initialValue ?? "";

  return {
    getItem: () => value || null,
    setItem: (_key: string, nextValue: string) => {
      value = nextValue;
    }
  };
}

function createWeatherReport(): WeatherReport {
  return {
    current: {
      locationName: "London",
      country: "GB",
      observedAt: "2026-07-05T12:00:00.000Z",
      timezone: "Europe/London",
      condition: "clouds",
      description: "Partly cloudy",
      icon: "2",
      isDay: true,
      temperatureC: 22,
      feelsLikeC: 22,
      humidity: 62,
      pressureHpa: 1014,
      dewPointC: 12,
      visibilityMeters: 10000,
      cloudCover: 42,
      windSpeedMs: 4,
      windDegree: 270,
      sunrise: "2026-07-05T05:00:00.000Z",
      sunset: "2026-07-05T20:30:00.000Z"
    },
    daily: [],
    hourly: [],
    metadata: {
      attribution: "Weather data by Open-Meteo",
      fetchedAt: "2026-07-05T12:05:00.000Z",
      provider: "Open-Meteo"
    }
  };
}
