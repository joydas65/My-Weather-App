import { describe, expect, it } from "vitest";
import {
  buildTomorrowBrief,
  buildWeatherInsights,
  selectNextHourlyForecast
} from "@/lib/weather/decision-support";
import type { HourlyForecast, WeatherReport } from "@/lib/weather/types";

const report = createPlanningReport();

describe("weather decision support", () => {
  it("selects the next hourly forecast window from the observed time", () => {
    const nextHours = selectNextHourlyForecast(
      report.hourly,
      report.current.observedAt,
      12
    );

    expect(nextHours).toHaveLength(12);
    expect(nextHours[0].time).toBe(report.current.observedAt);
  });

  it("builds a tomorrow brief with periods and a best outdoor window", () => {
    const brief = buildTomorrowBrief(report);

    expect(brief).toMatchObject({
      headline: "Rain may shape tomorrow",
      precipitationChance: 65,
      temperatureMaxC: 31,
      temperatureMinC: 18
    });
    expect(brief?.bestWindow).toContain("6:00 AM");
    expect(brief?.periods.map((period) => period.label)).toEqual([
      "Morning",
      "Afternoon",
      "Evening"
    ]);
  });

  it("turns forecast signals into concise planning insights", () => {
    const insights = buildWeatherInsights(report);
    const titles = insights.map((insight) => insight.title);

    expect(titles).toContain("Umbrella window");
    expect(titles).toContain("Wind picks up");
    expect(titles).toContain("Heat planning");
    expect(titles).toContain("Best outdoor window");
  });

  it("keeps best outdoor windows inside one continuous local day", () => {
    const overnightReport: WeatherReport = {
      ...report,
      current: {
        ...report.current,
        observedAt: "2026-07-05T19:00:00.000Z"
      },
      hourly: [13, 14, 15, 24, 25].map((index) => createHourlyForecast(index))
    };
    const bestWindow = buildWeatherInsights(overnightReport).find(
      (insight) => insight.title === "Best outdoor window"
    );

    expect(bestWindow?.detail).toContain("7:00 PM-10:00 PM");
    expect(bestWindow?.detail).not.toContain("7:00 PM-8:00 AM");
  });
});

function createPlanningReport(): WeatherReport {
  const hourly = Array.from({ length: 42 }, (_, index) =>
    createHourlyForecast(index)
  );

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
    daily: [
      {
        date: "2026-07-05T12:00:00",
        summary: "Sun and cloud mix",
        precipitationChance: 30,
        temperatureMinC: 17,
        temperatureMaxC: 26,
        sunMoon: createSunMoon("2026-07-05")
      },
      {
        date: "2026-07-06T12:00:00",
        summary: "Light rain",
        precipitationChance: 65,
        temperatureMinC: 18,
        temperatureMaxC: 31,
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

function createHourlyForecast(index: number): HourlyForecast {
  const time = new Date(Date.UTC(2026, 6, 5, 6 + index)).toISOString();
  const rainHour = index === 6;
  const windyHour = index === 12;
  const tomorrowMorning = index >= 24 && index <= 29;

  return {
    time,
    condition: rainHour ? "rain" : tomorrowMorning ? "clear" : "clouds",
    description: rainHour
      ? "Rain"
      : tomorrowMorning
        ? "Clear sky"
        : "Partly cloudy",
    isDay: true,
    temperatureC: index >= 24 ? 24 : 22,
    feelsLikeC: index >= 24 ? 25 : 22,
    precipitationChance: rainHour ? 72 : tomorrowMorning ? 12 : 20,
    cloudCover: tomorrowMorning ? 12 : 45,
    windSpeedMs: windyHour ? 12 : tomorrowMorning ? 3 : 4,
    windDegree: 260
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
