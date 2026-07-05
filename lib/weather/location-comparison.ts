import { buildWeatherRiskSignals } from "@/lib/weather/risk-signals";
import {
  formatPercent,
  formatTemperature,
  formatWindSpeed
} from "@/lib/weather/formatters";
import type {
  WeatherMenuLocation,
  WeatherUnitPreferences
} from "@/lib/weather/preferences";
import type { WeatherReport } from "@/lib/weather/types";

export const MAX_COMPARE_LOCATIONS = 4;

export type LocationComparisonSource = "current" | "saved";

export type LocationComparisonTarget = {
  location: WeatherMenuLocation;
  source: LocationComparisonSource;
};

export type LocationComparisonReport = LocationComparisonTarget & {
  weather: WeatherReport;
};

export type LocationComparisonSummary = {
  detail: string;
  headline: string;
  highlights: string[];
};

export function selectLocationComparisonTargets({
  currentLocation,
  savedLocations
}: {
  currentLocation: WeatherMenuLocation | null;
  savedLocations: WeatherMenuLocation[];
}): LocationComparisonTarget[] {
  const locations = new Map<string, LocationComparisonTarget>();

  if (currentLocation) {
    locations.set(currentLocation.id, {
      location: currentLocation,
      source: "current"
    });
  }

  for (const location of savedLocations) {
    if (!locations.has(location.id)) {
      locations.set(location.id, {
        location,
        source: "saved"
      });
    }
  }

  return Array.from(locations.values()).slice(0, MAX_COMPARE_LOCATIONS);
}

export function buildLocationComparisonSummary(
  reports: LocationComparisonReport[],
  units: WeatherUnitPreferences
): LocationComparisonSummary {
  if (reports.length === 0) {
    return {
      detail: "Save locations from the menu to compare live conditions side by side.",
      headline: "No comparison locations yet",
      highlights: ["Open the menu", "Save locations", "Compare up to four"]
    };
  }

  if (reports.length === 1) {
    return {
      detail: `Save another location to compare against ${reports[0].location.label}.`,
      headline: "One location ready",
      highlights: [
        `${reports[0].location.label}: ${formatTemperature(
          reports[0].weather.current.temperatureC,
          units.temperature
        )}`,
        "Add one more saved city",
        "Partial failures stay isolated"
      ]
    };
  }

  const warmest = maxBy(reports, (report) => report.weather.current.temperatureC);
  const lowestRain = minBy(reports, (report) => getTomorrowRainChance(report.weather));
  const windiest = maxBy(reports, (report) => report.weather.current.windSpeedMs);
  const riskiest = maxBy(reports, (report) => getTopRiskScore(report, units));
  const riskiestSignal = riskiest
    ? buildWeatherRiskSignals(riskiest.weather, units)[0]
    : null;

  return {
    detail: lowestRain
      ? `${lowestRain.location.label} has the lowest tomorrow rain chance at ${formatPercent(
          getTomorrowRainChance(lowestRain.weather)
        )}.`
      : "Saved locations are ready for side-by-side weather decisions.",
    headline: "Best saved-location matchup",
    highlights: [
      warmest
        ? `Warmest now: ${warmest.location.label} at ${formatTemperature(
            warmest.weather.current.temperatureC,
            units.temperature
          )}`
        : "Warmest location unavailable",
      windiest
        ? `Windiest now: ${windiest.location.label} at ${formatWindSpeed(
            windiest.weather.current.windSpeedMs,
            units.windSpeed
          )}`
        : "Wind comparison unavailable",
      riskiest && riskiestSignal
        ? `Highest watch: ${riskiest.location.label} - ${riskiestSignal.title}`
        : "No elevated risks across saved locations"
    ]
  };
}

export function getTomorrowRainChance(weather: WeatherReport) {
  return weather.daily[1]?.precipitationChance ?? weather.daily[0]?.precipitationChance ?? 0;
}

function getTopRiskScore(
  report: LocationComparisonReport,
  units: WeatherUnitPreferences
) {
  return buildWeatherRiskSignals(report.weather, units)[0]?.score ?? 0;
}

function maxBy<T>(values: T[], getValue: (value: T) => number) {
  return values.reduce<T | null>((best, value) => {
    if (!best || getValue(value) > getValue(best)) {
      return value;
    }

    return best;
  }, null);
}

function minBy<T>(values: T[], getValue: (value: T) => number) {
  return values.reduce<T | null>((best, value) => {
    if (!best || getValue(value) < getValue(best)) {
      return value;
    }

    return best;
  }, null);
}
