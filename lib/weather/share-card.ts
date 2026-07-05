import { buildWeatherRiskSignals } from "@/lib/weather/risk-signals";
import {
  formatPercent,
  formatTemperature,
  formatWindSpeed
} from "@/lib/weather/formatters";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type { WeatherReport } from "@/lib/weather/types";

export type ForecastShareCardModel = {
  chips: string[];
  detail: string;
  headline: string;
  location: string;
  summary: string;
  text: string;
};

export function buildForecastShareCardModel(
  weather: WeatherReport,
  units: WeatherUnitPreferences
): ForecastShareCardModel {
  const tomorrow = weather.daily[1] ?? weather.daily[0];
  const topRisk = buildWeatherRiskSignals(weather, units)[0];
  const location = [weather.current.locationName, weather.current.country]
    .filter(Boolean)
    .join(", ");
  const currentTemperature = formatTemperature(
    weather.current.temperatureC,
    units.temperature
  );
  const feelsLike = formatTemperature(
    weather.current.feelsLikeC,
    units.temperature
  );
  const tomorrowRange = tomorrow
    ? `${formatTemperature(
        tomorrow.temperatureMinC,
        units.temperature
      )} to ${formatTemperature(tomorrow.temperatureMaxC, units.temperature)}`
    : "range unavailable";
  const rainChance = tomorrow
    ? formatPercent(tomorrow.precipitationChance)
    : "unavailable";
  const wind = formatWindSpeed(weather.current.windSpeedMs, units.windSpeed);
  const riskText =
    topRisk && topRisk.category !== "none"
      ? `${topRisk.title} ${topRisk.timing.toLowerCase()}`
      : "No elevated risks";

  const headline = `${weather.current.description} in ${location}`;
  const summary = `${currentTemperature}, feels like ${feelsLike}`;
  const detail = `Tomorrow: ${tomorrowRange}, ${rainChance} rain chance. ${riskText}.`;
  const chips = [
    `Now ${currentTemperature}`,
    `Rain ${rainChance}`,
    `Wind ${wind}`
  ];

  return {
    chips,
    detail,
    headline,
    location,
    summary,
    text: [
      `Weather in ${location}: ${weather.current.description}, ${summary}.`,
      `Tomorrow: ${tomorrowRange}, ${rainChance} rain chance, current wind ${wind}.`,
      `Watch: ${riskText}.`,
      `Source: ${weather.metadata.provider}.`
    ].join(" ")
  };
}
