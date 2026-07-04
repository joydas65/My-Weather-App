import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone: "aqua" | "amber" | "rose" | "green" | "indigo" | "stone";
};

const toneClasses = {
  aqua: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  stone: "bg-stone-100 text-stone-700 ring-stone-200"
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: MetricCardProps) {
  return (
    <article className="rounded-lg border border-black/5 bg-white/85 p-4 shadow-sm shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <span className={`rounded-lg p-2 ring-1 ${toneClasses[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      {detail ? <p className="mt-3 text-sm text-slate-500">{detail}</p> : null}
    </article>
  );
}
