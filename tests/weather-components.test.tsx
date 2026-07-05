import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  OfflineStatusBanner,
  WeatherDashboard,
  WeatherLoadingPanel,
  WeatherStatePanel,
  WEATHER_VIEW_STATES
} from "@/components/weather/weather-dashboard";
import { HourlyTimeline } from "@/components/weather/hourly-timeline";
import { LocationComparisonPanel } from "@/components/weather/location-comparison";
import { ShareForecastCard } from "@/components/weather/share-forecast-card";
import { SmartInsights } from "@/components/weather/smart-insights";
import { TomorrowBriefCard } from "@/components/weather/tomorrow-brief";
import { WeatherMenuDrawer } from "@/components/weather/weather-menu";
import { WeatherRiskCards } from "@/components/weather/weather-risk-cards";
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
import type {
  DailyForecast,
  HourlyForecast,
  WeatherReport
} from "@/lib/weather/types";

const planningDaily: DailyForecast[] = [
  {
    date: "2026-07-04T12:00:00",
    summary: "Sun and cloud mix",
    precipitationChance: 24,
    temperatureMinC: 14,
    temperatureMaxC: 24,
    sunMoon: {
      sunrise: "2026-07-04T04:48:00Z",
      sunset: "2026-07-04T20:22:00Z",
      moonrise: null,
      moonset: null,
      moonPhase: "Waning gibbous",
      moonIllumination: 82,
      source: "estimated"
    }
  },
  {
    date: "2026-07-05T12:00:00",
    summary: "Clear and dry",
    precipitationChance: 12,
    temperatureMinC: 15,
    temperatureMaxC: 26,
    sunMoon: {
      sunrise: "2026-07-05T04:49:00Z",
      sunset: "2026-07-05T20:21:00Z",
      moonrise: null,
      moonset: null,
      moonPhase: "Last quarter",
      moonIllumination: 74,
      source: "estimated"
    }
  }
];

const planningHourly: HourlyForecast[] = Array.from({ length: 30 }, (_, index) => {
  const time = new Date(Date.UTC(2026, 6, 4, 12 + index)).toISOString();

  return {
    time,
    condition: index === 4 ? "rain" : "clouds",
    description: index === 4 ? "Rain" : "Partly cloudy",
    isDay: true,
    temperatureC: index >= 18 ? 22 : 21,
    feelsLikeC: index >= 18 ? 22 : 20,
    precipitationChance: index === 4 ? 68 : 18,
    cloudCover: 42,
    windSpeedMs: index === 8 ? 10.5 : 5.8,
    windDegree: 270
  };
});

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
  daily: planningDaily,
  hourly: planningHourly,
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
    expect(markup).toContain("Risk watch");
    expect(markup).toContain("Compare locations");
    expect(markup).toContain("Share forecast");
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

  it("renders tomorrow, hourly, and smart planning sections with ready weather", () => {
    const markup = renderToStaticMarkup(
      <>
        <TomorrowBriefCard units={menuPreferences.units} weather={menuWeather} />
        <HourlyTimeline units={menuPreferences.units} weather={menuWeather} />
        <SmartInsights units={menuPreferences.units} weather={menuWeather} />
        <WeatherRiskCards units={menuPreferences.units} weather={menuWeather} />
      </>
    );

    expect(markup).toContain("Tomorrow brief");
    expect(markup).toContain("Hourly timeline");
    expect(markup).toContain("Next 24 hours");
    expect(markup).toContain("Smart insights");
    expect(markup).toContain("Umbrella window");
    expect(markup).toContain("Wind picks up");
    expect(markup).toContain("Risk watch");
    expect(markup).toContain("Weather safety signals");
    expect(markup).toContain("Rain watch");
    expect(markup).toContain("Wind watch");
  });

  it("renders compare locations and shareable forecast card surfaces", () => {
    const markup = renderToStaticMarkup(
      <>
        <LocationComparisonPanel
          currentLocation={londonLocation}
          currentWeather={menuWeather}
          isDashboardLoading={false}
          onLoadLocation={() => undefined}
          onOpenMenu={() => undefined}
          savedLocations={[londonLocation, parisLocation]}
          units={menuPreferences.units}
        />
        <ShareForecastCard units={menuPreferences.units} weather={menuWeather} />
      </>
    );

    expect(markup).toContain("Compare locations");
    expect(markup).toContain("Saved weather matchup");
    expect(markup).toContain("Manage saved");
    expect(markup).toContain("Refresh comparison");
    expect(markup).toContain("London, GB");
    expect(markup).toContain("Paris, FR");
    expect(markup).toContain("Loading saved forecast");
    expect(markup).toContain("Shareable forecast card");
    expect(markup).toContain("Ready-made weather update");
    expect(markup).toContain("Copy summary");
    expect(markup).toContain("Uses native share when available");
  });

  it("renders a persistent offline last-forecast banner", () => {
    const markup = renderToStaticMarkup(
      <OfflineStatusBanner
        isLoading={false}
        isOffline
        snapshot={{
          cachedAt: "2026-07-04T12:05:00Z",
          endpoint: "/api/weather?q=London",
          label: "London, GB",
          weather: menuWeather
        }}
      />
    );

    expect(markup).toContain("Offline mode");
    expect(markup).toContain("Showing London, GB");
    expect(markup).toContain("Reconnect to refresh live weather");
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
