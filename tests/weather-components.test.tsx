import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  WeatherDashboard,
  WeatherLoadingPanel,
  WeatherStatePanel,
  WEATHER_VIEW_STATES
} from "@/components/weather/weather-dashboard";
import { SunMoonTable } from "@/components/weather/sun-moon-table";
import {
  getWeatherConditionPresentation,
  WeatherConditionIcon
} from "@/components/weather/weather-condition-icon";
import type { DailyForecast } from "@/lib/weather/types";

describe("weather component behavior", () => {
  it("keeps the expected dashboard view states explicit", () => {
    expect(WEATHER_VIEW_STATES).toEqual([
      "empty",
      "loading",
      "ready",
      "geo-blocked",
      "api-error",
      "no-results"
    ]);
  });

  it("starts with a recoverable empty location state", () => {
    const markup = renderToStaticMarkup(<WeatherDashboard />);

    expect(markup).toContain("No location selected");
    expect(markup).toContain("Choose a location");
    expect(markup).toContain("Search a city or use your current location");
  });

  it("renders loading, blocked, no-results, and retryable API states", () => {
    expect(
      renderToStaticMarkup(
        <WeatherLoadingPanel
          state={{
            title: "Loading local weather",
            detail: "Fetching current conditions and the 8-day outlook."
          }}
        />
      )
    ).toContain("Loading local weather");

    expect(
      renderToStaticMarkup(
        <WeatherStatePanel
          state={{
            status: "geo-blocked",
            message: "Location access was blocked."
          }}
        />
      )
    ).toContain("Location access blocked");

    expect(
      renderToStaticMarkup(
        <WeatherStatePanel
          state={{
            status: "no-results",
            query: "Atlantis",
            message: "No matching location was found."
          }}
        />
      )
    ).toContain('No results for &quot;Atlantis&quot;');

    expect(
      renderToStaticMarkup(
        <WeatherStatePanel
          onRetry={() => undefined}
          state={{
            status: "api-error",
            code: "WEATHER_UNAVAILABLE",
            message: "Weather data is temporarily unavailable.",
            retry: {
              endpoint: "/api/weather?q=London",
              loading: {
                title: "Finding forecast",
                detail: "Resolving the location."
              }
            }
          }}
        />
      )
    ).toContain("Retry");
  });

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
