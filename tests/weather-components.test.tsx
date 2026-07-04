import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SunMoonTable } from "@/components/weather/sun-moon-table";
import {
  getWeatherConditionPresentation,
  WeatherConditionIcon
} from "@/components/weather/weather-condition-icon";
import type { DailyForecast } from "@/lib/weather/types";

describe("weather component behavior", () => {
  it("maps weather conditions to accessible icon presentations", () => {
    expect(getWeatherConditionPresentation("rain", true).label).toBe(
      "Rainy weather"
    );
    expect(getWeatherConditionPresentation("clear", false).label).toBe(
      "Clear night weather"
    );

    const markup = renderToStaticMarkup(
      <WeatherConditionIcon condition="storm" isDay />
    );

    expect(markup).toContain('aria-label="Stormy weather"');
  });

  it("renders moon phase and unavailable moon timing clearly", () => {
    const daily: DailyForecast[] = [
      {
        date: "2026-07-04T12:00:00Z",
        summary: "Clear and dry",
        precipitationChance: 12,
        temperatureMinC: 14,
        temperatureMaxC: 22,
        sunMoon: {
          sunrise: "2026-07-04T05:53:00Z",
          sunset: "2026-07-04T20:36:00Z",
          moonrise: null,
          moonset: null,
          moonPhase: "Waning gibbous",
          moonIllumination: 87,
          source: "estimated"
        }
      }
    ];

    const markup = renderToStaticMarkup(
      <SunMoonTable daily={daily} timezone="UTC" />
    );

    expect(markup).toContain("Not available");
    expect(markup).toContain("Waning gibbous");
    expect(markup).toContain("87% illuminated");
  });
});
