import {
  formatPercent,
  formatTemperature,
  formatTime,
  formatVisibility,
  formatWindSpeed
} from "@/lib/weather/formatters";
import { DEFAULT_UNIT_PREFERENCES } from "@/lib/weather/preferences";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type {
  HourlyForecast,
  WeatherRiskCategory,
  WeatherRiskSeverity,
  WeatherRiskSignal,
  WeatherReport
} from "@/lib/weather/types";
import { selectNextHourlyForecast } from "@/lib/weather/decision-support";

type RiskCandidate = Omit<WeatherRiskSignal, "id">;

type RiskThreshold = {
  high: number;
  moderate: number;
};

const severityRank: Record<WeatherRiskSeverity, number> = {
  high: 3,
  moderate: 2,
  low: 1
};

const riskOrder: Record<WeatherRiskCategory, number> = {
  storm: 6,
  rain: 5,
  heat: 4,
  cold: 3,
  wind: 2,
  visibility: 1,
  none: 0
};

const rainThresholds: RiskThreshold = {
  high: 70,
  moderate: 45
};

const heatThresholds: RiskThreshold = {
  high: 35,
  moderate: 30
};

const coldThresholds: RiskThreshold = {
  high: 0,
  moderate: 4
};

const windThresholds: RiskThreshold = {
  high: 15,
  moderate: 10
};

const visibilityThresholds: RiskThreshold = {
  high: 1000,
  moderate: 3000
};

export function buildWeatherRiskSignals(
  weather: WeatherReport,
  units: WeatherUnitPreferences = DEFAULT_UNIT_PREFERENCES
): WeatherRiskSignal[] {
  const timezone = weather.current.timezone;
  const nextHours = selectNextHourlyForecast(
    weather.hourly,
    weather.current.observedAt,
    24
  );
  const candidates = [
    buildStormRisk(nextHours, timezone),
    buildRainRisk(nextHours, timezone),
    buildHeatRisk(weather, nextHours, timezone, units),
    buildColdRisk(weather, nextHours, timezone, units),
    buildWindRisk(nextHours, timezone, units),
    buildVisibilityRisk(weather, units)
  ].filter((candidate): candidate is RiskCandidate => Boolean(candidate));
  const risks = candidates
    .sort((first, second) => {
      const severityDifference =
        severityRank[second.severity] - severityRank[first.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      const scoreDifference = second.score - first.score;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return riskOrder[second.category] - riskOrder[first.category];
    })
    .slice(0, 4)
    .map((risk) => ({
      ...risk,
      id: `${risk.category}-${risk.severity}-${risk.timing}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }));

  if (risks.length > 0) {
    return risks;
  }

  return [
    {
      action: "No immediate weather precautions stand out.",
      category: "none",
      detail: "The next 24 hours look steady across rain, wind, heat, cold, and visibility.",
      id: "none-low-steady",
      score: 0,
      severity: "low",
      timing: "Next 24 hours",
      title: "No elevated risks"
    }
  ];
}

function buildStormRisk(
  nextHours: HourlyForecast[],
  timezone: string
): RiskCandidate | null {
  const stormHour = nextHours.find((hour) => hour.condition === "storm");

  if (!stormHour) {
    return null;
  }

  return {
    action: "Keep outdoor plans flexible and check conditions before leaving.",
    category: "storm",
    detail: `${stormHour.description} appears in the hourly outlook.`,
    score: 100,
    severity: "high",
    timing: `Around ${formatTime(stormHour.time, timezone)}`,
    title: "Storm risk"
  };
}

function buildRainRisk(
  nextHours: HourlyForecast[],
  timezone: string
): RiskCandidate | null {
  const peak = maxBy(nextHours, (hour) => hour.precipitationChance);

  if (!peak || peak.precipitationChance < rainThresholds.moderate) {
    return null;
  }

  const severity = getAscendingSeverity(
    peak.precipitationChance,
    rainThresholds
  );

  return {
    action:
      severity === "high"
        ? "Carry an umbrella and leave buffer time for wet conditions."
        : "Keep light rain gear handy.",
    category: "rain",
    detail: `Rain chance peaks at ${formatPercent(peak.precipitationChance)}.`,
    score: peak.precipitationChance,
    severity,
    timing: `Around ${formatTime(peak.time, timezone)}`,
    title: severity === "high" ? "Heavy rain risk" : "Rain watch"
  };
}

function buildHeatRisk(
  weather: WeatherReport,
  nextHours: HourlyForecast[],
  timezone: string,
  units: WeatherUnitPreferences
): RiskCandidate | null {
  const peakHourly = maxBy(nextHours, (hour) =>
    Math.max(hour.temperatureC, hour.feelsLikeC)
  );
  const tomorrow = weather.daily[1];
  const peakTemperature = Math.max(
    peakHourly ? Math.max(peakHourly.temperatureC, peakHourly.feelsLikeC) : -Infinity,
    tomorrow?.temperatureMaxC ?? -Infinity
  );

  if (peakTemperature < heatThresholds.moderate) {
    return null;
  }

  const severity = getAscendingSeverity(peakTemperature, heatThresholds);
  const timing = peakHourly
    ? `Around ${formatTime(peakHourly.time, timezone)}`
    : "Tomorrow";

  return {
    action:
      severity === "high"
        ? "Plan shade, water, and lighter activity during peak heat."
        : "Pace outdoor activity and hydrate.",
    category: "heat",
    detail: `Heat reaches ${formatTemperature(
      peakTemperature,
      units.temperature
    )}.`,
    score: peakTemperature,
    severity,
    timing,
    title: severity === "high" ? "High heat risk" : "Heat watch"
  };
}

function buildColdRisk(
  weather: WeatherReport,
  nextHours: HourlyForecast[],
  timezone: string,
  units: WeatherUnitPreferences
): RiskCandidate | null {
  const coldestHourly = minBy(nextHours, (hour) =>
    Math.min(hour.temperatureC, hour.feelsLikeC)
  );
  const tomorrow = weather.daily[1];
  const coldestTemperature = Math.min(
    coldestHourly
      ? Math.min(coldestHourly.temperatureC, coldestHourly.feelsLikeC)
      : Infinity,
    tomorrow?.temperatureMinC ?? Infinity
  );

  if (coldestTemperature > coldThresholds.moderate) {
    return null;
  }

  const severity = getDescendingSeverity(coldestTemperature, coldThresholds);
  const timing = coldestHourly
    ? `Around ${formatTime(coldestHourly.time, timezone)}`
    : "Tomorrow";

  return {
    action:
      severity === "high"
        ? "Dress for freezing conditions and watch for slick surfaces."
        : "Add a warm layer before heading out.",
    category: "cold",
    detail: `Feels near ${formatTemperature(
      coldestTemperature,
      units.temperature
    )}.`,
    score: coldThresholds.moderate - coldestTemperature,
    severity,
    timing,
    title: severity === "high" ? "Freezing risk" : "Cold watch"
  };
}

function buildWindRisk(
  nextHours: HourlyForecast[],
  timezone: string,
  units: WeatherUnitPreferences
): RiskCandidate | null {
  const peak = maxBy(nextHours, (hour) => hour.windSpeedMs);

  if (!peak || peak.windSpeedMs < windThresholds.moderate) {
    return null;
  }

  const severity = getAscendingSeverity(peak.windSpeedMs, windThresholds);

  return {
    action:
      severity === "high"
        ? "Secure loose items and be careful on exposed routes."
        : "Expect a breezier stretch in exposed areas.",
    category: "wind",
    detail: `Wind peaks near ${formatWindSpeed(peak.windSpeedMs, units.windSpeed)}.`,
    score: peak.windSpeedMs,
    severity,
    timing: `Around ${formatTime(peak.time, timezone)}`,
    title: severity === "high" ? "High wind risk" : "Wind watch"
  };
}

function buildVisibilityRisk(
  weather: WeatherReport,
  units: WeatherUnitPreferences
): RiskCandidate | null {
  const visibilityMeters = weather.current.visibilityMeters;

  if (visibilityMeters > visibilityThresholds.moderate) {
    return null;
  }

  const severity = getDescendingSeverity(visibilityMeters, visibilityThresholds);

  return {
    action:
      severity === "high"
        ? "Use extra caution on roads and delay low-visibility travel if possible."
        : "Allow extra time where visibility matters.",
    category: "visibility",
    detail: `Visibility is ${formatVisibility(
      visibilityMeters,
      units.visibility
    )}.`,
    score: visibilityThresholds.moderate - visibilityMeters,
    severity,
    timing: "Right now",
    title:
      severity === "high"
        ? "Poor visibility risk"
        : "Reduced visibility watch"
  };
}

function getAscendingSeverity(value: number, threshold: RiskThreshold) {
  return value >= threshold.high ? "high" : "moderate";
}

function getDescendingSeverity(value: number, threshold: RiskThreshold) {
  return value <= threshold.high ? "high" : "moderate";
}

function maxBy<T>(values: T[], selector: (value: T) => number): T | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((best, value) =>
    selector(value) > selector(best) ? value : best
  );
}

function minBy<T>(values: T[], selector: (value: T) => number): T | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((best, value) =>
    selector(value) < selector(best) ? value : best
  );
}
