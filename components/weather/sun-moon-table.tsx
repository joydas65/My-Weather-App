import { Moon, Sunrise, Sunset } from "lucide-react";
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
    <div className="overflow-x-auto rounded-lg border border-black/5 bg-white/85 shadow-sm shadow-slate-200/70">
      <table className="min-w-[900px] w-full border-collapse text-left text-sm">
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
  );
}

function formatOptionalTime(value: string | null, timezone: string) {
  return value ? formatTime(value, timezone) : "Not available";
}
