import {
  CalendarDays,
  Clock3,
  CloudRain,
  ThermometerSun,
  Wind
} from "lucide-react";
import { getWeatherConditionPresentation } from "@/components/weather/weather-condition-icon";
import { buildTomorrowBrief } from "@/lib/weather/decision-support";
import {
  formatDateLabel,
  formatPercent,
  formatTemperature,
  formatWindSpeed
} from "@/lib/weather/formatters";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type { TomorrowPeriod, WeatherReport } from "@/lib/weather/types";

type TomorrowBriefProps = {
  units: WeatherUnitPreferences;
  weather: WeatherReport;
};

export function TomorrowBriefCard({ units, weather }: TomorrowBriefProps) {
  const brief = buildTomorrowBrief(weather);

  if (!brief) {
    return (
      <article className="rounded-lg border border-black/5 bg-white/85 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
        <p className="text-sm font-medium text-slate-500">Tomorrow brief</p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
          Forecast building
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tomorrow planning will appear as soon as the daily forecast is available.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-black/5 bg-white/90 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Tomorrow brief</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            {brief.headline}
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100">
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          {formatDateLabel(brief.date)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{brief.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <BriefStat
          icon={ThermometerSun}
          label="Range"
          value={`${formatTemperature(
            brief.temperatureMinC,
            units.temperature
          )} / ${formatTemperature(brief.temperatureMaxC, units.temperature)}`}
        />
        <BriefStat
          icon={CloudRain}
          label="Rain peak"
          value={formatPercent(brief.precipitationChance)}
        />
        <BriefStat
          icon={Clock3}
          label="Best window"
          value={brief.bestWindow ?? "Watch later"}
        />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {brief.periods.map((period) => (
          <TomorrowPeriodPanel key={period.label} period={period} units={units} />
        ))}
      </div>
    </article>
  );
}

function BriefStat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof ThermometerSun;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-400">
        <Icon aria-hidden="true" className="h-4 w-4 text-cyan-700" />
        {label}
      </div>
      <p className="mt-2 text-base font-semibold tracking-normal text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TomorrowPeriodPanel({
  period,
  units
}: {
  period: TomorrowPeriod;
  units: WeatherUnitPreferences;
}) {
  const presentation = getWeatherConditionPresentation(
    period.condition,
    period.isDay
  );
  const Icon = presentation.icon;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-950">{period.label}</p>
          <p className="text-xs text-slate-500">{period.summary}</p>
        </div>
        <span
          aria-label={presentation.label}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-700 ring-1 ring-slate-100"
          role="img"
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 grid gap-1.5 text-xs font-medium text-slate-500">
        <span>{formatTemperature(period.temperatureC, units.temperature)}</span>
        <span>{formatPercent(period.precipitationChance)} rain</span>
        <span className="inline-flex items-center gap-1">
          <Wind aria-hidden="true" className="h-3.5 w-3.5" />
          {formatWindSpeed(period.windSpeedMs, units.windSpeed)}
        </span>
      </div>
    </div>
  );
}
