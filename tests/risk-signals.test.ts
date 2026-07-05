import { describe, expect, it } from "vitest";
import { buildWeatherRiskSignals } from "@/lib/weather/risk-signals";
import type { HourlyForecast, WeatherReport } from "@/lib/weather/types";

describe("weather risk signals", () => {
  it("prioritizes rule-based high and moderate weather risks", () => {
    const risks = buildWeatherRiskSignals(createRiskReport());
    const titles = risks.map((risk) => risk.title);

    expect(titles).toEqual([
      "Storm risk",
      "Heavy rain risk",
      "High heat risk",
      "High wind risk"
    ]);
    expect(risks[0]).toMatchObject({
      category: "storm",
      severity: "high"
    });
    expect(risks[1].action).toContain("umbrella");
  });

  it("returns a low-risk fallback when no elevated signal is present", () => {
    const risks = buildWeatherRiskSignals(createCalmReport());

    expect(risks).toEqual([
      expect.objectContaining({
        category: "none",
        severity: "low",
        title: "No elevated risks"
      })
    ]);
  });

  it("uses current visibility as an immediate travel risk", () => {
    const report = createCalmReport();
    report.current.visibilityMeters = 700;

    const risks = buildWeatherRiskSignals(report);

    expect(risks[0]).toMatchObject({
      category: "visibility",
      severity: "high",
      title: "Poor visibility risk",
      timing: "Right now"
    });
  });
});

function createRiskReport(): WeatherReport {
  const hourly = Array.from({ length: 24 }, (_, index) =>
    createHourlyForecast(index, {
      condition: index === 2 ? "storm" : index === 4 ? "rain" : "clouds",
      precipitationChance: index === 4 ? 82 : 22,
      temperatureC: index === 10 ? 36 : 24,
      windSpeedMs: index === 12 ? 16 : 5
    })
  );

  return createReport(hourly, {
    temperatureMaxC: 36,
    visibilityMeters: 9000
  });
}

function createCalmReport(): WeatherReport {
  const hourly = Array.from({ length: 24 }, (_, index) =>
    createHourlyForecast(index, {
      condition: "clouds",
      precipitationChance: 12,
      temperatureC: 20,
      windSpeedMs: 4
    })
  );

  return createReport(hourly, {
    temperatureMaxC: 24,
    visibilityMeters: 10000
  });
}

function createReport(
  hourly: HourlyForecast[],
  overrides: {
    temperatureMaxC: number;
    visibilityMeters: number;
  }
): WeatherReport {
  return {
    current: {
      locationName: "London",
      country: "GB",
      observedAt: hourly[0].time,
      timezone: "UTC",
      condition: "clouds",
      description: "Partly cloudy",
      icon: "2",
      isDay: true,
      temperatureC: 20,
      feelsLikeC: 20,
      humidity: 62,
      pressureHpa: 1014,
      dewPointC: 12,
      visibilityMeters: overrides.visibilityMeters,
      cloudCover: 42,
      windSpeedMs: 4,
      windDegree: 270,
      sunrise: "2026-07-05T05:00:00.000Z",
      sunset: "2026-07-05T20:30:00.000Z"
    },
    daily: [
      {
        date: "2026-07-05T12:00:00",
        summary: "Sun and cloud mix",
        precipitationChance: 12,
        temperatureMinC: 16,
        temperatureMaxC: 24,
        sunMoon: createSunMoon("2026-07-05")
      },
      {
        date: "2026-07-06T12:00:00",
        summary: "Clear and dry",
        precipitationChance: 18,
        temperatureMinC: 17,
        temperatureMaxC: overrides.temperatureMaxC,
        sunMoon: createSunMoon("2026-07-06")
      }
    ],
    hourly,
    metadata: {
      attribution: "Weather data by Open-Meteo",
      fetchedAt: "2026-07-05T06:05:00.000Z",
      provider: "Open-Meteo"
    }
  };
}

function createHourlyForecast(
  index: number,
  overrides: {
    condition: HourlyForecast["condition"];
    precipitationChance: number;
    temperatureC: number;
    windSpeedMs: number;
  }
): HourlyForecast {
  return {
    time: new Date(Date.UTC(2026, 6, 5, 6 + index)).toISOString(),
    condition: overrides.condition,
    description: overrides.condition === "storm" ? "Thunderstorm" : "Cloudy",
    isDay: true,
    temperatureC: overrides.temperatureC,
    feelsLikeC: overrides.temperatureC,
    precipitationChance: overrides.precipitationChance,
    cloudCover: 42,
    windSpeedMs: overrides.windSpeedMs,
    windDegree: 270
  };
}

function createSunMoon(dateKey: string) {
  return {
    sunrise: `${dateKey}T05:00:00.000Z`,
    sunset: `${dateKey}T20:30:00.000Z`,
    moonrise: null,
    moonset: null,
    moonPhase: "Waning gibbous" as const,
    moonIllumination: 82,
    source: "estimated" as const
  };
}
