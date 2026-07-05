"use client";

import { CheckCircle2, Clipboard, Share2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { buildForecastShareCardModel } from "@/lib/weather/share-card";
import type { WeatherUnitPreferences } from "@/lib/weather/preferences";
import type { WeatherReport } from "@/lib/weather/types";

type ShareForecastCardProps = {
  units: WeatherUnitPreferences;
  weather: WeatherReport;
};

export function ShareForecastCard({ units, weather }: ShareForecastCardProps) {
  const [status, setStatus] = useState<string | null>(null);
  const model = useMemo(
    () => buildForecastShareCardModel(weather, units),
    [units, weather]
  );

  async function shareForecast() {
    try {
      if (navigator.share) {
        await navigator.share({
          text: model.text,
          title: `Weather in ${model.location}`,
          url: window.location.href
        });
        setStatus("Forecast shared.");
        return;
      }

      await copyForecast();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setStatus("Sharing is unavailable right now.");
    }
  }

  async function copyForecast() {
    try {
      await navigator.clipboard.writeText(model.text);
      setStatus("Forecast summary copied.");
    } catch {
      setStatus("Copy failed. Select the card text manually if needed.");
    }
  }

  return (
    <article className="rounded-lg border border-black/5 bg-white/90 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            Shareable forecast card
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
            Ready-made weather update
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Share today&apos;s conditions and tomorrow&apos;s planning signal in
            one clean summary.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            onClick={shareForecast}
            type="button"
          >
            <Share2 aria-hidden="true" className="h-4 w-4" />
            Share
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
            onClick={copyForecast}
            type="button"
          >
            <Clipboard aria-hidden="true" className="h-4 w-4" />
            Copy summary
          </button>
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/10">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {model.location}
            </p>
            <h3 className="mt-4 max-w-2xl text-2xl font-semibold tracking-normal sm:text-3xl">
              {model.headline}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {model.summary}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {model.detail}
            </p>
          </div>
          <div className="grid gap-2">
            {model.chips.map((chip) => (
              <span
                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10"
                key={chip}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <p
        aria-live="polite"
        className="mt-3 inline-flex min-h-6 items-center gap-2 text-sm font-medium text-slate-500"
        role="status"
      >
        {status ? (
          <>
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600" />
            {status}
          </>
        ) : (
          "Uses native share when available, with clipboard copy as fallback."
        )}
      </p>
    </article>
  );
}
