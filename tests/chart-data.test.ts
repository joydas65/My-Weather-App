import { describe, expect, it } from "vitest";
import {
  buildPrecipitationSeries,
  buildTemperatureSeries
} from "@/lib/weather/chart-data";
import { createSunMoonTiming } from "@/lib/weather/astronomy";
import type { DailyForecast } from "@/lib/weather/types";

const daily: DailyForecast[] = [
  {
    date: "2026-07-04T12:00:00Z",
    summary: "Clear and dry",
    precipitationChance: 12.4,
    temperatureMinC: 14.2,
    temperatureMaxC: 21.6,
    sunMoon: createSunMoonTiming({
      date: "2026-07-04T12:00:00Z",
      sunrise: "2026-07-04T05:53:00Z",
      sunset: "2026-07-04T20:36:00Z"
    })
  },
  {
    date: "2026-07-05T12:00:00Z",
    summary: "Rain showers",
    precipitationChance: 49.6,
    temperatureMinC: 15.1,
    temperatureMaxC: 24.4,
    sunMoon: createSunMoonTiming({
      date: "2026-07-05T12:00:00Z",
      sunrise: "2026-07-05T05:54:00Z",
      sunset: "2026-07-05T20:35:00Z"
    })
  }
];

describe("chart data builders", () => {
  it("builds rounded precipitation chart points", () => {
    expect(buildPrecipitationSeries(daily)).toEqual([
      { label: "Jul 4", value: 12 },
      { label: "Jul 5", value: 50 }
    ]);
  });

  it("builds rounded temperature chart points", () => {
    expect(buildTemperatureSeries(daily)).toEqual([
      { label: "Jul 4", min: 14, max: 22 },
      { label: "Jul 5", min: 15, max: 24 }
    ]);
  });
});
