import { describe, expect, it } from "vitest";
import {
  buildLocationComparisonSummary,
  getTomorrowRainChance,
  MAX_COMPARE_LOCATIONS,
  selectLocationComparisonTargets,
  type LocationComparisonReport
} from "@/lib/weather/location-comparison";
import { DEFAULT_UNIT_PREFERENCES } from "@/lib/weather/preferences";
import type { WeatherMenuLocation } from "@/lib/weather/preferences";
import type { WeatherReport } from "@/lib/weather/types";

const londonLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=London",
  id: "/api/weather?q=london",
  label: "London, GB",
  updatedAt: "2026-07-05T09:00:00Z"
};

const parisLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=Paris",
  id: "/api/weather?q=paris",
  label: "Paris, FR",
  updatedAt: "2026-07-05T09:05:00Z"
};

const tokyoLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=Tokyo",
  id: "/api/weather?q=tokyo",
  label: "Tokyo, JP",
  updatedAt: "2026-07-05T09:10:00Z"
};

const sydneyLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=Sydney",
  id: "/api/weather?q=sydney",
  label: "Sydney, AU",
  updatedAt: "2026-07-05T09:15:00Z"
};

const berlinLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=Berlin",
  id: "/api/weather?q=berlin",
  label: "Berlin, DE",
  updatedAt: "2026-07-05T09:20:00Z"
};

describe("location comparison helpers", () => {
  it("deduplicates the current city and limits comparison targets", () => {
    const targets = selectLocationComparisonTargets({
      currentLocation: londonLocation,
      savedLocations: [
        londonLocation,
        parisLocation,
        tokyoLocation,
        sydneyLocation,
        berlinLocation
      ]
    });

    expect(targets).toHaveLength(MAX_COMPARE_LOCATIONS);
    expect(targets[0]).toMatchObject({
      location: londonLocation,
      source: "current"
    });
    expect(targets.map((target) => target.location.label)).toEqual([
      "London, GB",
      "Paris, FR",
      "Tokyo, JP",
      "Sydney, AU"
    ]);
  });

  it("builds a practical comparison summary across saved locations", () => {
    const reports: LocationComparisonReport[] = [
      {
        location: londonLocation,
        source: "current",
        weather: createWeather("London", "GB", 18, 14, 23, 18, 5)
      },
      {
        location: parisLocation,
        source: "saved",
        weather: createWeather("Paris", "FR", 28, 19, 31, 8, 7)
      },
      {
        location: tokyoLocation,
        source: "saved",
        weather: createWeather("Tokyo", "JP", 27, 22, 34, 62, 12)
      }
    ];

    const summary = buildLocationComparisonSummary(
      reports,
      DEFAULT_UNIT_PREFERENCES
    );

    expect(summary.headline).toBe("Best saved-location matchup");
    expect(summary.detail).toContain("Paris, FR has the lowest tomorrow rain chance");
    expect(summary.highlights).toContain("Warmest now: Paris, FR at 28 C");
    expect(summary.highlights).toContain("Windiest now: Tokyo, JP at 12.0 m/s");
    expect(summary.highlights.join(" ")).toContain("Highest watch");
  });

  it("handles empty and single-location states with useful guidance", () => {
    expect(
      buildLocationComparisonSummary([], DEFAULT_UNIT_PREFERENCES).headline
    ).toBe("No comparison locations yet");

    const single = buildLocationComparisonSummary(
      [
        {
          location: londonLocation,
          source: "current",
          weather: createWeather("London", "GB", 18, 14, 23, 18, 5)
        }
      ],
      DEFAULT_UNIT_PREFERENCES
    );

    expect(single.headline).toBe("One location ready");
    expect(single.detail).toContain("Save another location");
  });

  it("uses tomorrow rain chance with a today fallback", () => {
    const weather = createWeather("London", "GB", 18, 14, 23, 18, 5);

    expect(getTomorrowRainChance(weather)).toBe(18);
    expect(getTomorrowRainChance({ ...weather, daily: [weather.daily[0]] })).toBe(
      weather.daily[0].precipitationChance
    );
  });
});

function createWeather(
  locationName: string,
  country: string,
  temperatureC: number,
  tomorrowMinC: number,
  tomorrowMaxC: number,
  tomorrowRain: number,
  windSpeedMs: number
): WeatherReport {
  return {
    current: {
      cloudCover: 35,
      condition: tomorrowRain > 50 ? "rain" : "clouds",
      country,
      description: tomorrowRain > 50 ? "Rain" : "Partly cloudy",
      dewPointC: 11,
      feelsLikeC: temperatureC,
      humidity: 62,
      icon: "partly-cloudy-day",
      isDay: true,
      locationName,
      observedAt: "2026-07-05T09:00:00Z",
      pressureHpa: 1013,
      sunrise: "2026-07-05T05:00:00Z",
      sunset: "2026-07-05T20:00:00Z",
      temperatureC,
      timezone: "UTC",
      visibilityMeters: 10000,
      windDegree: 240,
      windSpeedMs
    },
    daily: [
      {
        date: "2026-07-05T12:00:00Z",
        precipitationChance: 12,
        summary: "Mild",
        sunMoon: createSunMoonTiming("2026-07-05"),
        temperatureMaxC: 22,
        temperatureMinC: 13
      },
      {
        date: "2026-07-06T12:00:00Z",
        precipitationChance: tomorrowRain,
        summary: "Tomorrow",
        sunMoon: createSunMoonTiming("2026-07-06"),
        temperatureMaxC: tomorrowMaxC,
        temperatureMinC: tomorrowMinC
      }
    ],
    hourly: Array.from({ length: 24 }, (_, index) => ({
      cloudCover: 35,
      condition: tomorrowRain > 50 && index === 5 ? "rain" : "clouds",
      description: tomorrowRain > 50 && index === 5 ? "Rain" : "Partly cloudy",
      feelsLikeC: temperatureC + index / 10,
      isDay: true,
      precipitationChance: index === 5 ? tomorrowRain : 8,
      temperatureC: temperatureC + index / 10,
      time: new Date(Date.UTC(2026, 6, 5, 9 + index)).toISOString(),
      windDegree: 240,
      windSpeedMs
    })),
    metadata: {
      attribution: "Weather data by Open-Meteo",
      fetchedAt: "2026-07-05T09:03:00Z",
      provider: "Open-Meteo"
    }
  };
}

function createSunMoonTiming(day: string) {
  return {
    moonIllumination: 64,
    moonPhase: "Waning gibbous" as const,
    moonrise: null,
    moonset: null,
    source: "estimated" as const,
    sunrise: `${day}T05:00:00Z`,
    sunset: `${day}T20:00:00Z`
  };
}
