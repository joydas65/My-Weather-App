import type { DailyForecast } from "@/lib/weather/types";
import { formatDateLabel } from "@/lib/weather/formatters";

export function buildPrecipitationSeries(daily: DailyForecast[]) {
  return daily.map((day) => ({
    label: formatDateLabel(day.date),
    value: Math.round(day.precipitationChance)
  }));
}

export function buildTemperatureSeries(daily: DailyForecast[]) {
  return daily.map((day) => ({
    label: formatDateLabel(day.date),
    min: Math.round(day.temperatureMinC),
    max: Math.round(day.temperatureMaxC)
  }));
}
