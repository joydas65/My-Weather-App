import { CloudRain, ThermometerSun } from "lucide-react";
import type { DailyForecast as DailyForecastType } from "@/lib/weather/types";
import {
  formatDateLabel,
  formatDayName,
  formatPercent,
  formatTemperature
} from "@/lib/weather/formatters";

type DailyForecastProps = {
  daily: DailyForecastType[];
};

export function DailyForecast({ daily }: DailyForecastProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {daily.map((day) => (
        <article
          className="rounded-lg border border-black/5 bg-white/85 p-4 shadow-sm shadow-slate-200/70"
          key={day.date}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {formatDayName(day.date)}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-normal text-slate-950">
                {formatDateLabel(day.date)}
              </h3>
            </div>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700 ring-1 ring-amber-100">
              <ThermometerSun aria-hidden="true" className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">
            {day.summary}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-950">
              {formatTemperature(day.temperatureMaxC)} /{" "}
              {formatTemperature(day.temperatureMinC)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-cyan-700">
              <CloudRain aria-hidden="true" className="h-4 w-4" />
              {formatPercent(day.precipitationChance)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
