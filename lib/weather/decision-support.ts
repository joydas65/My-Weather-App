import {
  formatPercent,
  formatTemperature,
  formatTime,
  formatWindSpeed
} from "@/lib/weather/formatters";
import { DEFAULT_UNIT_PREFERENCES } from "@/lib/weather/preferences";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type {
  HourlyForecast,
  TomorrowBrief,
  TomorrowPeriod,
  WeatherCondition,
  WeatherInsight,
  WeatherReport
} from "@/lib/weather/types";

type LocalHour = {
  dateKey: string;
  hour: number;
};

type PeriodConfig = {
  endHour: number;
  label: TomorrowPeriod["label"];
  startHour: number;
};

type WeatherWindow = {
  endTime: string;
  label: string;
  score: number;
  startTime: string;
};

const TOMORROW_PERIODS: PeriodConfig[] = [
  { endHour: 12, label: "Morning", startHour: 6 },
  { endHour: 18, label: "Afternoon", startHour: 12 },
  { endHour: 24, label: "Evening", startHour: 18 }
];

const CONDITION_PRIORITY: Record<WeatherCondition, number> = {
  storm: 6,
  snow: 5,
  rain: 4,
  mist: 3,
  clouds: 2,
  clear: 1
};

const COMFORTABLE_CONDITIONS = new Set<WeatherCondition>([
  "clear",
  "clouds",
  "mist"
]);

export function selectNextHourlyForecast(
  hourly: HourlyForecast[],
  observedAt: string,
  limit = 24
) {
  const observedTime = Date.parse(observedAt);
  const safeObservedTime = Number.isNaN(observedTime) ? Date.now() : observedTime;
  const upcoming = hourly.filter((hour) => Date.parse(hour.time) >= safeObservedTime);

  return (upcoming.length > 0 ? upcoming : hourly).slice(0, limit);
}

export function buildTomorrowBrief(weather: WeatherReport): TomorrowBrief | null {
  const tomorrow = weather.daily[1];

  if (!tomorrow) {
    return null;
  }

  const timezone = weather.current.timezone;
  const tomorrowDateKey = tomorrow.date.slice(0, 10);
  const tomorrowHours = weather.hourly.filter(
    (hour) => getLocalHour(hour.time, timezone).dateKey === tomorrowDateKey
  );
  const periods = TOMORROW_PERIODS.map((period) =>
    buildTomorrowPeriod(period, tomorrowHours, timezone, {
      condition: weather.current.condition,
      precipitationChance: tomorrow.precipitationChance,
      temperatureC:
        (tomorrow.temperatureMinC + tomorrow.temperatureMaxC) / 2,
      windSpeedMs: weather.current.windSpeedMs
    })
  );
  const bestWindow = findBestWeatherWindow(tomorrowHours, timezone, 2)?.label ?? null;
  const headline = buildTomorrowHeadline(tomorrow, tomorrowHours, bestWindow);

  return {
    bestWindow,
    date: tomorrow.date,
    headline,
    periods,
    precipitationChance: tomorrow.precipitationChance,
    summary: buildTomorrowSummary(tomorrow, bestWindow),
    temperatureMaxC: tomorrow.temperatureMaxC,
    temperatureMinC: tomorrow.temperatureMinC
  };
}

export function buildWeatherInsights(
  weather: WeatherReport,
  units: WeatherUnitPreferences = DEFAULT_UNIT_PREFERENCES
): WeatherInsight[] {
  const timezone = weather.current.timezone;
  const nextHours = selectNextHourlyForecast(
    weather.hourly,
    weather.current.observedAt,
    24
  );
  const tomorrow = weather.daily[1];
  const insights: WeatherInsight[] = [];
  const peakRain = maxBy(nextHours, (hour) => hour.precipitationChance);
  const peakWind = maxBy(nextHours, (hour) => hour.windSpeedMs);
  const bestWindow = findBestWeatherWindow(nextHours, timezone, 2);

  if (peakRain && peakRain.precipitationChance >= 60) {
    insights.push({
      detail: `${formatPercent(peakRain.precipitationChance)} peak chance around ${formatTime(
        peakRain.time,
        timezone
      )}.`,
      id: "umbrella-window",
      title: "Umbrella window",
      tone: "rain"
    });
  }

  if (peakWind && peakWind.windSpeedMs >= 10) {
    insights.push({
      detail: `Gusty-feeling stretch peaks near ${formatWindSpeed(
        peakWind.windSpeedMs,
        units.windSpeed
      )} around ${formatTime(peakWind.time, timezone)}.`,
      id: "wind-pickup",
      title: "Wind picks up",
      tone: "wind"
    });
  }

  if (tomorrow && tomorrow.temperatureMaxC >= 30) {
    insights.push({
      detail: `Tomorrow reaches ${formatTemperature(
        tomorrow.temperatureMaxC,
        units.temperature
      )}; shade and hydration matter.`,
      id: "heat-planning",
      title: "Heat planning",
      tone: "caution"
    });
  } else if (tomorrow && tomorrow.temperatureMinC <= 2) {
    insights.push({
      detail: `Tomorrow starts near ${formatTemperature(
        tomorrow.temperatureMinC,
        units.temperature
      )}; plan for a cold start.`,
      id: "cold-start",
      title: "Cold start",
      tone: "caution"
    });
  }

  if (bestWindow) {
    insights.push({
      detail: `${bestWindow.label} has the calmest blend of rain, wind, and comfort.`,
      id: "best-window",
      title: "Best outdoor window",
      tone: "comfort"
    });
  }

  if (insights.length === 0 && tomorrow) {
    insights.push({
      detail: `${tomorrow.summary} with a ${formatTemperature(
        tomorrow.temperatureMinC,
        units.temperature
      )} to ${formatTemperature(tomorrow.temperatureMaxC, units.temperature)} range.`,
      id: "steady-outlook",
      title: "Low-friction forecast",
      tone: "comfort"
    });
  }

  return insights.slice(0, 4);
}

function buildTomorrowPeriod(
  period: PeriodConfig,
  tomorrowHours: HourlyForecast[],
  timezone: string,
  fallback: {
    condition: WeatherCondition;
    precipitationChance: number;
    temperatureC: number;
    windSpeedMs: number;
  }
): TomorrowPeriod {
  const periodHours = tomorrowHours.filter((hour) => {
    const localHour = getLocalHour(hour.time, timezone).hour;

    return localHour >= period.startHour && localHour < period.endHour;
  });
  const condition = getDominantCondition(periodHours) ?? fallback.condition;
  const precipitationChance =
    maxBy(periodHours, (hour) => hour.precipitationChance)
      ?.precipitationChance ?? fallback.precipitationChance;
  const windSpeedMs =
    maxBy(periodHours, (hour) => hour.windSpeedMs)?.windSpeedMs ??
    fallback.windSpeedMs;
  const temperatureC =
    average(periodHours.map((hour) => hour.temperatureC)) ?? fallback.temperatureC;

  return {
    label: period.label,
    condition,
    isDay: periodHours.some((hour) => hour.isDay),
    precipitationChance,
    summary: summarizePeriod(condition, precipitationChance),
    temperatureC,
    windSpeedMs
  };
}

function buildTomorrowHeadline(
  tomorrow: WeatherReport["daily"][number],
  tomorrowHours: HourlyForecast[],
  bestWindow: string | null
) {
  const peakWind = maxBy(tomorrowHours, (hour) => hour.windSpeedMs)?.windSpeedMs ?? 0;

  if (tomorrow.precipitationChance >= 60) {
    return "Rain may shape tomorrow";
  }

  if (peakWind >= 10) {
    return "Wind is the main watch";
  }

  if (tomorrow.temperatureMaxC >= 30) {
    return "A warm day needs pacing";
  }

  if (tomorrow.temperatureMinC <= 2) {
    return "A crisp start is ahead";
  }

  if (bestWindow) {
    return "A clear planning window";
  }

  return tomorrow.summary;
}

function buildTomorrowSummary(
  tomorrow: WeatherReport["daily"][number],
  bestWindow: string | null
) {
  if (bestWindow) {
    return `${bestWindow} looks like the easiest time to be outside.`;
  }

  if (tomorrow.precipitationChance >= 60) {
    return "Keep rain gear within reach for the higher-risk stretches.";
  }

  return `${tomorrow.summary} with a steady day-to-night range.`;
}

function summarizePeriod(condition: WeatherCondition, precipitationChance: number) {
  if (precipitationChance >= 60) {
    return "Likely wet";
  }

  if (precipitationChance >= 35) {
    return "Watch showers";
  }

  if (condition === "storm") {
    return "Storm watch";
  }

  if (condition === "snow") {
    return "Snow watch";
  }

  if (condition === "rain") {
    return "Damp spell";
  }

  if (condition === "clear") {
    return "Bright spell";
  }

  return "Steady skies";
}

function findBestWeatherWindow(
  hours: HourlyForecast[],
  timezone: string,
  minimumLength: number
): WeatherWindow | null {
  const daytimeHours = hours.filter((hour) => {
    const localHour = getLocalHour(hour.time, timezone).hour;

    return localHour >= 6 && localHour <= 21;
  }).sort((first, second) => Date.parse(first.time) - Date.parse(second.time));
  const windows: WeatherWindow[] = [];
  let current: HourlyForecast[] = [];
  let previousHour: HourlyForecast | null = null;

  for (const hour of daytimeHours) {
    if (!isComfortableHour(hour)) {
      pushWindow(current);
      current = [];
      previousHour = null;
      continue;
    }

    if (
      current.length > 0 &&
      previousHour &&
      !isConsecutiveWindowHour(previousHour, hour, timezone)
    ) {
      pushWindow(current);
      current = [];
    }

    current.push(hour);
    previousHour = hour;
  }

  pushWindow(current);

  return (
    windows.sort((first, second) => second.score - first.score)[0] ?? null
  );

  function pushWindow(windowHours: HourlyForecast[]) {
    if (windowHours.length < minimumLength) {
      return;
    }

    const rainAverage = average(
      windowHours.map((hour) => hour.precipitationChance)
    ) ?? 0;
    const windAverage =
      average(windowHours.map((hour) => hour.windSpeedMs)) ?? 0;
    const temperatureScore =
      average(
        windowHours.map((hour) => 30 - Math.abs(21 - hour.temperatureC))
      ) ?? 0;
    const firstHour = windowHours[0];
    const lastHour = windowHours[windowHours.length - 1];
    const endTime = new Date(Date.parse(lastHour.time) + 60 * 60 * 1000)
      .toISOString();

    windows.push({
      endTime,
      label: `${formatTime(firstHour.time, timezone)}-${formatTime(
        endTime,
        timezone
      )}`,
      score: windowHours.length * 10 + temperatureScore - rainAverage - windAverage,
      startTime: firstHour.time
    });
  }
}

function isComfortableHour(hour: HourlyForecast) {
  return (
    COMFORTABLE_CONDITIONS.has(hour.condition) &&
    hour.precipitationChance <= 30 &&
    hour.windSpeedMs <= 8 &&
    hour.temperatureC >= 7 &&
    hour.temperatureC <= 30
  );
}

function isConsecutiveWindowHour(
  previousHour: HourlyForecast,
  currentHour: HourlyForecast,
  timezone: string
) {
  const differenceMs = Date.parse(currentHour.time) - Date.parse(previousHour.time);

  return (
    differenceMs > 0 &&
    differenceMs <= 90 * 60 * 1000 &&
    getLocalHour(previousHour.time, timezone).dateKey ===
      getLocalHour(currentHour.time, timezone).dateKey
  );
}

function getDominantCondition(hours: HourlyForecast[]) {
  return maxBy(hours, (hour) => CONDITION_PRIORITY[hour.condition])?.condition;
}

function maxBy<T>(values: T[], selector: (value: T) => number): T | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((best, value) =>
    selector(value) > selector(best) ? value : best
  );
}

function average(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((total, value) => total + value, 0) / validValues.length;
}

function getLocalHour(value: string, timezone: string): LocalHour {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric"
  }).formatToParts(new Date(value));
  const partMap = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    dateKey: `${partMap.year}-${partMap.month}-${partMap.day}`,
    hour: Number(partMap.hour)
  };
}
