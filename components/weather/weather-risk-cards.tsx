import {
  AlertTriangle,
  CloudFog,
  CloudLightning,
  CloudRain,
  ShieldCheck,
  Snowflake,
  SunMedium,
  Wind,
  type LucideIcon
} from "lucide-react";
import { buildWeatherRiskSignals } from "@/lib/weather/risk-signals";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type {
  WeatherRiskCategory,
  WeatherRiskSeverity,
  WeatherRiskSignal,
  WeatherReport
} from "@/lib/weather/types";

type WeatherRiskCardsProps = {
  units: WeatherUnitPreferences;
  weather: WeatherReport;
};

const categoryIcons: Record<WeatherRiskCategory, LucideIcon> = {
  cold: Snowflake,
  heat: SunMedium,
  none: ShieldCheck,
  rain: CloudRain,
  storm: CloudLightning,
  visibility: CloudFog,
  wind: Wind
};

const severityStyles: Record<
  WeatherRiskSeverity,
  {
    badge: string;
    card: string;
    icon: string;
    label: string;
  }
> = {
  high: {
    badge: "bg-rose-100 text-rose-800 ring-rose-200",
    card: "border-rose-200 bg-rose-50/80",
    icon: "bg-white text-rose-700 ring-rose-200",
    label: "High"
  },
  low: {
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    card: "border-emerald-200 bg-emerald-50/80",
    icon: "bg-white text-emerald-700 ring-emerald-200",
    label: "Low"
  },
  moderate: {
    badge: "bg-amber-100 text-amber-800 ring-amber-200",
    card: "border-amber-200 bg-amber-50/80",
    icon: "bg-white text-amber-700 ring-amber-200",
    label: "Moderate"
  }
};

export function WeatherRiskCards({ units, weather }: WeatherRiskCardsProps) {
  const risks = buildWeatherRiskSignals(weather, units);
  const elevatedCount = risks.filter((risk) => risk.severity !== "low").length;

  return (
    <article className="rounded-lg border border-black/5 bg-white/90 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Risk watch</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
            Weather safety signals
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
          <AlertTriangle aria-hidden="true" className="h-4 w-4" />
          {elevatedCount > 0 ? `${elevatedCount} active` : "Clear"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {risks.map((risk) => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </div>
    </article>
  );
}

function RiskCard({ risk }: { risk: WeatherRiskSignal }) {
  const Icon = categoryIcons[risk.category];
  const styles = severityStyles[risk.severity];

  return (
    <section className={`rounded-lg border px-3 py-3 ${styles.card}`}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${styles.icon}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span
          className={`rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${styles.badge}`}
        >
          {styles.label}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-normal text-slate-950">
        {risk.title}
      </h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-slate-500">
        {risk.timing}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{risk.detail}</p>
      <p className="mt-3 rounded-lg bg-white/75 px-3 py-2 text-sm font-medium leading-6 text-slate-800 ring-1 ring-black/5">
        {risk.action}
      </p>
    </section>
  );
}
