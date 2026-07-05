import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const appLayout = read("app/layout.tsx");
const dashboard = read("components/weather/weather-dashboard.tsx");
const forecastChart = read("components/weather/forecast-chart.tsx");
const hourlyTimeline = read("components/weather/hourly-timeline.tsx");
const pwaRegister = read("components/pwa/pwa-register.tsx");
const smartInsights = read("components/weather/smart-insights.tsx");
const sunMoonTable = read("components/weather/sun-moon-table.tsx");
const tomorrowBrief = read("components/weather/tomorrow-brief.tsx");
const weatherRiskCards = read("components/weather/weather-risk-cards.tsx");
const weatherMenu = read("components/weather/weather-menu.tsx");
const decisionSupport = read("lib/weather/decision-support.ts");
const manifest = read("public/manifest.webmanifest");
const offlineCache = read("lib/weather/offline-cache.ts");
const preferences = read("lib/weather/preferences.ts");
const riskSignals = read("lib/weather/risk-signals.ts");
const serviceWorker = read("public/sw.js");

describe("UX structure", () => {
  it("keeps retired legacy assets out of the product", () => {
    const retiredArtifacts = [
      "spinner.gif",
      "loading.gif",
      "walmart-icon.png",
      "noun-barometer-78613.png",
      "public/spinner.gif",
      "public/loading.gif",
      "public/walmart-icon.png",
      "public/barometer.png",
      "lib/weather/sample-data.ts"
    ];

    for (const artifact of retiredArtifacts) {
      expect(existsSync(join(root, artifact))).toBe(false);
    }

    expect(dashboard).not.toContain("next/image");
    expect(dashboard).not.toContain("/barometer.png");
    expect(dashboard).not.toContain("spinner.gif");
    expect(dashboard).not.toContain("loading.gif");
  });

  it("uses accessible loading and alert components instead of old spinners", () => {
    expect(dashboard).toContain("WeatherLoadingPanel");
    expect(dashboard).toContain('aria-live="polite"');
    expect(dashboard).toContain('role="status"');
    expect(dashboard).toContain('role={tone === "error" ? "alert" : "status"}');
    expect(dashboard).toContain("LoaderCircle");
    expect(dashboard).toContain("weather-loader-bar");
  });

  it("keeps the mobile-first dashboard structure useful on first load", () => {
    expect(dashboard).toContain("Choose a location");
    expect(dashboard).toContain("Search a city or use your current location");
    expect(dashboard).toContain("WeatherMenuDrawer");
    expect(dashboard).toContain("flex-col");
    expect(dashboard).toContain("sm:flex-row");
    expect(dashboard).toContain("lg:flex-row");
    expect(dashboard).toContain("lg:grid-cols");
    expect(dashboard).toContain("xl:grid-cols");
  });

  it("keeps the hamburger menu accessible and useful across viewports", () => {
    expect(dashboard).toContain('aria-label="Open weather menu"');
    expect(dashboard).toContain('aria-controls="weather-menu-drawer"');
    expect(dashboard).toContain('aria-expanded={isMenuOpen}');
    expect(weatherMenu).toContain('role="dialog"');
    expect(weatherMenu).toContain('aria-modal="true"');
    expect(weatherMenu).toContain('event.key === "Escape"');
    expect(weatherMenu).toContain("Search location");
    expect(weatherMenu).toContain("Use current location");
    expect(weatherMenu).toContain("Locations");
    expect(weatherMenu).toContain("Save current location");
    expect(weatherMenu).toContain("No saved locations");
    expect(weatherMenu).toContain("No recent locations");
    expect(weatherMenu).toContain("aria-current");
    expect(weatherMenu).toContain("aria-pressed");
    expect(weatherMenu).toContain("Temperature");
    expect(weatherMenu).toContain("Measurement preferences");
    expect(weatherMenu).toContain("Refresh weather");
    expect(weatherMenu).toContain("#smart-forecast");
    expect(weatherMenu).toContain("#hourly-timeline");
    expect(weatherMenu).toContain("#risk-watch");
    expect(weatherMenu).toContain("#forecast-charts");
    expect(weatherMenu).toContain("#daily-outlook");
    expect(weatherMenu).toContain("#sun-moon");
    expect(preferences).toContain("WEATHER_MENU_PREFERENCES_KEY");
    expect(preferences).toContain("readWeatherMenuPreferences");
    expect(preferences).toContain("writeWeatherMenuPreferences");
  });

  it("keeps forecast chart cards shrinkable on narrow phones", () => {
    expect(dashboard).toContain("grid min-w-0 gap-4 xl:grid-cols-2");
    expect(dashboard).toContain("min-w-0 rounded-lg border");
    expect(forecastChart).toContain("min-w-0 space-y-3");
    expect(forecastChart).toContain("h-72 min-w-0 w-full");
  });

  it("keeps tomorrow, hourly, and insight planning sections responsive", () => {
    expect(dashboard).toContain("TomorrowBriefCard");
    expect(dashboard).toContain("HourlyTimeline");
    expect(dashboard).toContain("SmartInsights");
    expect(dashboard).toContain("WeatherRiskCards");
    expect(dashboard).toContain('id="smart-forecast"');
    expect(dashboard).toContain('id="hourly-timeline"');
    expect(dashboard).toContain('id="risk-watch"');
    expect(tomorrowBrief).toContain("Tomorrow brief");
    expect(tomorrowBrief).toContain("Best window");
    expect(hourlyTimeline).toContain("Hourly timeline");
    expect(hourlyTimeline).toContain("overflow-x-auto");
    expect(hourlyTimeline).toContain('data-testid="hourly-timeline-scroll"');
    expect(smartInsights).toContain("Smart insights");
    expect(smartInsights).toContain("Planning signals");
    expect(weatherRiskCards).toContain("Risk watch");
    expect(weatherRiskCards).toContain("Weather safety signals");
    expect(weatherRiskCards).toContain("buildWeatherRiskSignals");
    expect(riskSignals).toContain("buildWeatherRiskSignals");
    expect(riskSignals).toContain("Heavy rain risk");
    expect(riskSignals).toContain("Poor visibility risk");
    expect(decisionSupport).toContain("buildTomorrowBrief");
    expect(decisionSupport).toContain("buildWeatherInsights");
    expect(decisionSupport).toContain("selectNextHourlyForecast");
  });

  it("keeps PWA install and offline forecast recovery wired", () => {
    expect(appLayout).toContain('manifest: "/manifest.webmanifest"');
    expect(appLayout).toContain("PwaRegister");
    expect(manifest).toContain('"display": "standalone"');
    expect(manifest).toContain('"theme_color": "#0891b2"');
    expect(manifest).toContain("/icons/weather-icon.svg");
    expect(pwaRegister).toContain('navigator.serviceWorker.register("/sw.js")');
    expect(serviceWorker).toContain("my-weather-app-shell-v1");
    expect(serviceWorker).toContain("networkFirstNavigation");
    expect(serviceWorker).toContain('url.pathname.startsWith("/api/")');
    expect(offlineCache).toContain("WEATHER_OFFLINE_SNAPSHOT_KEY");
    expect(offlineCache).toContain("createWeatherOfflineSnapshot");
    expect(offlineCache).toContain("readLastWeatherSnapshot");
    expect(dashboard).toContain("OfflineStatusBanner");
    expect(dashboard).toContain("writeLastWeatherSnapshot");
    expect(dashboard).toContain("readLastWeatherSnapshot");
    expect(dashboard).toContain("Offline mode");
  });

  it("renders mobile-friendly sun and moon cards before the desktop table", () => {
    expect(sunMoonTable).toContain("md:hidden");
    expect(sunMoonTable).toContain("md:block");
    expect(sunMoonTable).not.toContain("min-w-[900px]");
    expect(sunMoonTable).not.toContain("overflow-x-auto");
  });
});
