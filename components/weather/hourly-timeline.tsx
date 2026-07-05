import { Clock3, CloudRain, Wind } from "lucide-react";
import { getWeatherConditionPresentation } from "@/components/weather/weather-condition-icon";
import { selectNextHourlyForecast } from "@/lib/weather/decision-support";
import {
  formatPercent,
  formatTemperature,
  formatTime,
  formatWindSpeed
} from "@/lib/weather/formatters";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type { HourlyForecast, WeatherReport } from "@/lib/weather/types";

type HourlyTimelineProps = {
  units: WeatherUnitPreferences;
  weather: WeatherReport;
};

export function HourlyTimeline({ units, weather }: HourlyTimelineProps) {
  const hours = selectNextHourlyForecast(
    weather.hourly,
    weather.current.observedAt,
    24
  );

  return (
    <article className="min-w-0 rounded-lg border border-black/5 bg-white/90 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Hourly timeline</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
            Next 24 hours
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 ring-1 ring-indigo-100">
          <Clock3 aria-hidden="true" className="h-4 w-4" />
          {hours.length} points
        </span>
      </div>

      {hours.length > 0 ? (
        <div
          aria-label="Next 24 hours weather timeline"
          className="mt-5 min-w-0 overflow-x-auto pb-2"
          data-testid="hourly-timeline-scroll"
        >
          <ol className="flex min-w-max gap-3">
            {hours.map((hour) => (
              <HourlyTimelineItem
                hour={hour}
                key={hour.time}
                timezone={weather.current.timezone}
                units={units}
              />
            ))}
          </ol>
        </div>
      ) : (
        <div
          className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500"
          role="status"
        >
          Hourly forecast data will appear after the provider returns timeline
          points.
        </div>
      )}
    </article>
  );
}

function HourlyTimelineItem({
  hour,
  timezone,
  units
}: {
  hour: HourlyForecast;
  timezone: string;
  units: WeatherUnitPreferences;
}) {
  const presentation = getWeatherConditionPresentation(hour.condition, hour.isDay);
  const Icon = presentation.icon;

  return (
    <li className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700">
      <div className="flex items-center justify-between gap-2">
        <time
          className="text-sm font-semibold text-slate-950"
          dateTime={hour.time}
        >
          {formatTime(hour.time, timezone)}
        </time>
        <span
          aria-label={presentation.label}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-100"
          role="img"
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
        {formatTemperature(hour.temperatureC, units.temperature)}
      </p>
      <div className="mt-3 grid gap-1.5 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CloudRain aria-hidden="true" className="h-3.5 w-3.5 text-cyan-700" />
          {formatPercent(hour.precipitationChance)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wind aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
          {formatWindSpeed(hour.windSpeedMs, units.windSpeed)}
        </span>
      </div>
    </li>
  );
}
