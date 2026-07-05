import { describe, expect, it } from "vitest";
import { buildForecastShareCardModel } from "@/lib/weather/share-card";
import { DEFAULT_UNIT_PREFERENCES } from "@/lib/weather/preferences";
import type { WeatherReport } from "@/lib/weather/types";

describe("shareable forecast card helpers", () => {
  it("builds a compact share model with current and tomorrow context", () => {
    const model = buildForecastShareCardModel(
      createWeather(),
      DEFAULT_UNIT_PREFERENCES
    );

    expect(model.location).toBe("London, GB");
    expect(model.headline).toBe("Partly cloudy in London, GB");
    expect(model.summary).toContain("21 C");
    expect(model.detail).toContain("Tomorrow");
    expect(model.detail).toContain("68% rain chance");
    expect(model.chips).toEqual(["Now 21 C", "Rain 68%", "Wind 5.8 m/s"]);
    expect(model.text).toContain("Weather in London, GB");
    expect(model.text).toContain("Source: Open-Meteo");
  });

  it("honors unit preferences in shared text and chips", () => {
    const model = buildForecastShareCardModel(createWeather(), {
      pressure: "hpa",
      temperature: "fahrenheit",
      visibility: "km",
      windSpeed: "mph"
    });

    expect(model.summary).toContain("70 F");
    expect(model.chips).toContain("Wind 13.0 mph");
    expect(model.text).toContain("70 F");
    expect(model.text).toContain("13.0 mph");
  });
});

function createWeather(): WeatherReport {
  return {
    current: {
      cloudCover: 42,
      condition: "clouds",
      country: "GB",
      description: "Partly cloudy",
      dewPointC: 12,
      feelsLikeC: 20,
      humidity: 62,
      icon: "partly-cloudy-day",
      isDay: true,
      locationName: "London",
      observedAt: "2026-07-05T09:00:00Z",
      pressureHpa: 1014,
      sunrise: "2026-07-05T05:00:00Z",
      sunset: "2026-07-05T20:00:00Z",
      temperatureC: 21,
      timezone: "Europe/London",
      visibilityMeters: 10000,
      windDegree: 270,
      windSpeedMs: 5.8
    },
    daily: [
      {
        date: "2026-07-05T12:00:00Z",
        precipitationChance: 14,
        summary: "Cloudy",
        sunMoon: createSunMoonTiming("2026-07-05"),
        temperatureMaxC: 24,
        temperatureMinC: 14
      },
      {
        date: "2026-07-06T12:00:00Z",
        precipitationChance: 68,
        summary: "Rain later",
        sunMoon: createSunMoonTiming("2026-07-06"),
        temperatureMaxC: 26,
        temperatureMinC: 16
      }
    ],
    hourly: Array.from({ length: 24 }, (_, index) => ({
      cloudCover: 42,
      condition: index === 4 ? "rain" : "clouds",
      description: index === 4 ? "Rain" : "Partly cloudy",
      feelsLikeC: 20,
      isDay: true,
      precipitationChance: index === 4 ? 68 : 14,
      temperatureC: 21,
      time: new Date(Date.UTC(2026, 6, 5, 9 + index)).toISOString(),
      windDegree: 270,
      windSpeedMs: 5.8
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
