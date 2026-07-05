import {
  AlertTriangle,
  CloudRain,
  Sparkles,
  SunMedium,
  Wind,
  type LucideIcon
} from "lucide-react";
import { buildWeatherInsights } from "@/lib/weather/decision-support";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type { WeatherInsight, WeatherInsightTone, WeatherReport } from "@/lib/weather/types";

type SmartInsightsProps = {
  units: WeatherUnitPreferences;
  weather: WeatherReport;
};

const toneStyles: Record<
  WeatherInsightTone,
  {
    icon: LucideIcon;
    iconClass: string;
    panelClass: string;
  }
> = {
  caution: {
    icon: AlertTriangle,
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100 bg-amber-50/60"
  },
  comfort: {
    icon: SunMedium,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    panelClass: "border-emerald-100 bg-emerald-50/60"
  },
  rain: {
    icon: CloudRain,
    iconClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100 bg-cyan-50/60"
  },
  wind: {
    icon: Wind,
    iconClass: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    panelClass: "border-indigo-100 bg-indigo-50/60"
  }
};

export function SmartInsights({ units, weather }: SmartInsightsProps) {
  const insights = buildWeatherInsights(weather, units);

  return (
    <article className="rounded-lg border border-black/5 bg-slate-950 p-4 text-white shadow-sm shadow-slate-300/80 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-300">Smart insights</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal">
            Planning signals
          </h2>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-100 ring-1 ring-white/10">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {insights.map((insight) => (
          <SmartInsightPanel insight={insight} key={insight.id} />
        ))}
      </div>
    </article>
  );
}

function SmartInsightPanel({ insight }: { insight: WeatherInsight }) {
  const style = toneStyles[insight.tone];
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border px-3 py-3 ${style.panelClass}`}>
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${style.iconClass}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{insight.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{insight.detail}</p>
        </div>
      </div>
    </div>
  );
}
