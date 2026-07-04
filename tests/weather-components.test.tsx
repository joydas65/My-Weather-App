import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  WeatherDashboard,
  WeatherLoadingPanel,
  WeatherStatePanel,
  WEATHER_VIEW_STATES
} from "@/components/weather/weather-dashboard";
import { WeatherMenuDrawer } from "@/components/weather/weather-menu";
import { SunMoonTable } from "@/components/weather/sun-moon-table";
import {
  getWeatherConditionPresentation,
  WeatherConditionIcon
} from "@/components/weather/weather-condition-icon";
import {
  addRecentLocation,
  createDefaultWeatherMenuPreferences,
  saveMenuLocation,
  type WeatherMenuLocation
} from "@/lib/weather/preferences";
import type { DailyForecast, WeatherReport } from "@/lib/weather/types";

const menuWeather: WeatherReport = {
  current: {
    locationName: "London",
    country: "GB",
    observedAt: "2026-07-04T12:00:00Z",
    timezone: "Europe/London",
    condition: "clouds",
    description: "Partly cloudy",
    icon: "partly-cloudy-day",
    isDay: true,
    temperatureC: 21,
    feelsLikeC: 20,
    humidity: 62,
    pressureHpa: 1014,
    dewPointC: 12,
    visibilityMeters: 10000,
    cloudCover: 42,
    windSpeedMs: 5.8,
    windDegree: 270,
    sunrise: "2026-07-04T04:48:00Z",
    sunset: "2026-07-04T20:22:00Z"
  },
  daily: [],
  metadata: {
    attribution: "Weather data by Open-Meteo",
    fetchedAt: "2026-07-04T12:05:00Z",
    provider: "Open-Meteo"
  }
};

const londonLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=London",
  id: "/api/weather?q=london",
  label: "London, GB",
  updatedAt: "2026-07-04T12:05:00Z"
};

const parisLocation: WeatherMenuLocation = {
  endpoint: "/api/weather?q=Paris",
  id: "/api/weather?q=paris",
  label: "Paris, FR",
  updatedAt: "2026-07-04T12:10:00Z"
};

const menuPreferences = addRecentLocation(
  saveMenuLocation(
    {
      ...createDefaultWeatherMenuPreferences(),
      units: {
        pressure: "inhg",
        temperature: "fahrenheit",
        visibility: "mi",
        windSpeed: "mph"
      }
    },
    londonLocation
  ),
  parisLocation
);

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

    expect(markup).toContain('aria-label="Open weather menu"');
    expect(markup).toContain('aria-controls="weather-menu-drawer"');
    expect(markup).toContain("No location selected");
    expect(markup).toContain("Choose a location");
    expect(markup).toContain("Search a city or use your current location");
  });

  it("renders the hamburger menu as an accessible dashboard drawer", () => {
    const markup = renderToStaticMarkup(
      <WeatherMenuDrawer
        activeLocationId={londonLocation.id}
        currentLocation={londonLocation}
        isCurrentLocationSaved
        isLoading={false}
        isOpen
        onClose={() => undefined}
        onLoadLocation={() => undefined}
        onRefresh={() => undefined}
        onRemoveSavedLocation={() => undefined}
        onSaveCurrentLocation={() => undefined}
        onUnitPreferenceChange={() => undefined}
        onUseLocation={() => undefined}
        preferences={menuPreferences}
        weather={menuWeather}
      />
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Search location");
    expect(markup).toContain("Use current location");
    expect(markup).toContain("Current weather");
    expect(markup).toContain("Forecast charts");
    expect(markup).toContain("Daily outlook");
    expect(markup).toContain("Sun and moon");
    expect(markup).toContain("Locations");
    expect(markup).toContain("Current location saved");
    expect(markup).toContain("London, GB");
    expect(markup).toContain("Paris, FR");
    expect(markup).toContain("Units");
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('aria-current="location"');
    expect(markup).toContain("Remove London, GB from saved locations");
    expect(markup).toContain("Weather data");
    expect(markup).toContain("Refresh weather");
    expect(markup).toContain("Loaded");
    expect(markup).toContain("Open-Meteo");
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
