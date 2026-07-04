import { Moon, Sunrise, Sunset } from "lucide-react";
import type { ReactNode } from "react";
import type { DailyForecast } from "@/lib/weather/types";
import {
  formatDateLabel,
  formatDayName,
  formatTime
} from "@/lib/weather/formatters";

type SunMoonTableProps = {
  daily: DailyForecast[];
  timezone: string;
};

export function SunMoonTable({ daily, timezone }: SunMoonTableProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
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
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-100">
                <Moon aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <TimingValue
                icon={<Sunrise aria-hidden="true" className="h-4 w-4 text-amber-600" />}
                label="Sunrise"
                value={formatTime(day.sunMoon.sunrise, timezone)}
              />
              <TimingValue
                icon={<Sunset aria-hidden="true" className="h-4 w-4 text-rose-600" />}
                label="Sunset"
                value={formatTime(day.sunMoon.sunset, timezone)}
              />
              <TimingValue
                icon={<Moon aria-hidden="true" className="h-4 w-4 text-indigo-600" />}
                label="Moonrise"
                value={formatOptionalTime(day.sunMoon.moonrise, timezone)}
              />
              <TimingValue
                icon={<Moon aria-hidden="true" className="h-4 w-4 text-slate-600" />}
                label="Moonset"
                value={formatOptionalTime(day.sunMoon.moonset, timezone)}
              />
            </dl>

            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <p className="text-xs font-medium text-slate-500">Moon phase</p>
              <p className="mt-1 font-semibold text-slate-950">
                {day.sunMoon.moonPhase}
              </p>
              <p className="text-xs text-slate-500">
                {day.sunMoon.moonIllumination}% illuminated
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-black/5 bg-white/85 shadow-sm shadow-slate-200/70 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Day</th>
              <th className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Sunrise aria-hidden="true" className="h-4 w-4 text-amber-600" />
                  Sunrise
                </span>
              </th>
              <th className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Sunset aria-hidden="true" className="h-4 w-4 text-rose-600" />
                  Sunset
                </span>
              </th>
              <th className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Moon aria-hidden="true" className="h-4 w-4 text-indigo-600" />
                  Moonrise
                </span>
              </th>
              <th className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Moon aria-hidden="true" className="h-4 w-4 text-slate-600" />
                  Moonset
                </span>
              </th>
              <th className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Moon aria-hidden="true" className="h-4 w-4 text-violet-600" />
                  Moon phase
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {daily.map((day) => (
              <tr className="text-slate-700" key={day.date}>
                <td className="px-4 py-3 font-medium text-slate-950">
                  {formatDayName(day.date)}, {formatDateLabel(day.date)}
                </td>
                <td className="px-4 py-3">{formatTime(day.sunMoon.sunrise, timezone)}</td>
                <td className="px-4 py-3">{formatTime(day.sunMoon.sunset, timezone)}</td>
                <td className="px-4 py-3">
                  {formatOptionalTime(day.sunMoon.moonrise, timezone)}
                </td>
                <td className="px-4 py-3">
                  {formatOptionalTime(day.sunMoon.moonset, timezone)}
                </td>
                <td className="px-4 py-3">
                  <span className="block font-medium text-slate-950">
                    {day.sunMoon.moonPhase}
                  </span>
                  <span className="text-xs text-slate-500">
                    {day.sunMoon.moonIllumination}% illuminated
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TimingValue({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function formatOptionalTime(value: string | null, timezone: string) {
  return value ? formatTime(value, timezone) : "Not available";
}
