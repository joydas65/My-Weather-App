"use client";

import {
  AlertCircle,
  ArrowRight,
  BookmarkPlus,
  LoaderCircle,
  MapPinned,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Wind
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildLocationComparisonSummary,
  getTomorrowRainChance,
  selectLocationComparisonTargets,
  type LocationComparisonReport,
  type LocationComparisonTarget
} from "@/lib/weather/location-comparison";
import { isWeatherApiFailure, type WeatherApiResponse } from "@/lib/weather/api";
import {
  formatPercent,
  formatTemperature,
  formatWindSpeed
} from "@/lib/weather/formatters";
import type {
  WeatherMenuLocation,
  WeatherUnitPreferences
} from "@/lib/weather/preferences";
import { buildWeatherRiskSignals } from "@/lib/weather/risk-signals";
import type {
  WeatherCondition,
  WeatherRiskSeverity,
  WeatherReport
} from "@/lib/weather/types";
import { getWeatherConditionPresentation } from "@/components/weather/weather-condition-icon";

type LocationComparisonPanelProps = {
  currentLocation: WeatherMenuLocation | null;
  currentWeather: WeatherReport | null;
  isDashboardLoading: boolean;
  onLoadLocation: (location: WeatherMenuLocation) => void;
  onOpenMenu: () => void;
  savedLocations: WeatherMenuLocation[];
  units: WeatherUnitPreferences;
};

type ComparisonItem =
  | (LocationComparisonTarget & { status: "loading" })
  | (LocationComparisonTarget & {
      message: string;
      status: "error";
    })
  | (LocationComparisonReport & { status: "ready" });

type RemoteComparisonItems = Record<string, ComparisonItem | undefined>;

const severityClasses: Record<
  WeatherRiskSeverity,
  {
    badge: string;
    dot: string;
    label: string;
  }
> = {
  high: {
    badge: "bg-rose-50 text-rose-700 ring-rose-100",
    dot: "bg-rose-500",
    label: "High watch"
  },
  low: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-500",
    label: "Low watch"
  },
  moderate: {
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
    label: "Moderate watch"
  }
};

export function LocationComparisonPanel({
  currentLocation,
  currentWeather,
  isDashboardLoading,
  onLoadLocation,
  onOpenMenu,
  savedLocations,
  units
}: LocationComparisonPanelProps) {
  const [refreshToken, setRefreshToken] = useState(0);
  const targets = useMemo(
    () =>
      selectLocationComparisonTargets({
        currentLocation,
        savedLocations
      }),
    [currentLocation, savedLocations]
  );
  const [remoteItems, setRemoteItems] = useState<RemoteComparisonItems>({});
  const items = useMemo(
    () =>
      targets.map<ComparisonItem>((target) => {
        if (currentWeather && target.location.id === currentLocation?.id) {
          return {
            ...target,
            status: "ready",
            weather: currentWeather
          };
        }

        return (
          remoteItems[target.location.id] ?? {
            ...target,
            status: "loading"
          }
        );
      }),
    [currentLocation, currentWeather, remoteItems, targets]
  );

  useEffect(() => {
    const controller = new AbortController();
    const remoteTargets = targets.filter(
      (target) => target.location.id !== currentLocation?.id
    );

    if (remoteTargets.length === 0) {
      return () => controller.abort();
    }

    if (isBrowserOffline()) {
      void Promise.resolve().then(() =>
        setRemoteItems(createRemoteErrorItems(remoteTargets))
      );
      return () => controller.abort();
    }

    void Promise.resolve().then(() =>
      setRemoteItems(createRemoteLoadingItems(remoteTargets))
    );

    for (const target of remoteTargets) {
      void fetchComparisonWeather(target.location.endpoint, controller.signal)
        .then((weather) => {
          setRemoteItems((currentItems) => ({
            ...currentItems,
            [target.location.id]: {
              ...target,
              status: "ready",
              weather
            }
          }));
        })
        .catch((error) => {
          if (controller.signal.aborted) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : "Could not load this saved location.";

          setRemoteItems((currentItems) => ({
            ...currentItems,
            [target.location.id]: {
              ...target,
              message,
              status: "error"
            }
          }));
        });
    }

    return () => controller.abort();
  }, [currentLocation, refreshToken, targets]);

  const readyReports = items.filter(
    (item): item is LocationComparisonReport & { status: "ready" } =>
      item.status === "ready"
  );
  const summary = buildLocationComparisonSummary(readyReports, units);
  const isLoading = items.some((item) => item.status === "loading");

  return (
    <article className="rounded-lg border border-black/5 bg-white/90 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">Compare locations</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
            Saved weather matchup
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Compare your current dashboard with saved cities, including tomorrow
            rain, wind, and risk signals. Partial failures stay isolated.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
            onClick={onOpenMenu}
            type="button"
          >
            <BookmarkPlus aria-hidden="true" className="h-4 w-4" />
            Manage saved
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDashboardLoading || targets.length === 0}
            onClick={() => setRefreshToken((current) => current + 1)}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh comparison
          </button>
        </div>
      </div>

      <section className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-950">
              {summary.headline}
            </p>
            <p className="mt-1 text-sm leading-6 text-cyan-800">
              {summary.detail}
            </p>
          </div>
          <div className="grid gap-2 md:min-w-80">
            {summary.highlights.map((highlight) => (
              <span
                className="rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-cyan-900 ring-1 ring-cyan-100"
                key={highlight}
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      {items.length > 0 ? (
        <div
          aria-busy={isLoading}
          className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          {items.map((item) => (
            <ComparisonCard
              item={item}
              key={item.location.id}
              onLoadLocation={onLoadLocation}
              onRetry={() => setRefreshToken((current) => current + 1)}
              units={units}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
          <div className="flex gap-3">
            <MapPinned aria-hidden="true" className="mt-0.5 h-5 w-5 text-cyan-700" />
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Save locations to unlock comparison
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Load a city, open the menu, and save it. The comparison board
                supports up to four locations with independent loading states.
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ComparisonCard({
  item,
  onLoadLocation,
  onRetry,
  units
}: {
  item: ComparisonItem;
  onLoadLocation: (location: WeatherMenuLocation) => void;
  onRetry: () => void;
  units: WeatherUnitPreferences;
}) {
  if (item.status === "loading") {
    return (
      <section className="min-h-64 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-slate-950">
            {item.location.label}
          </p>
          <LoaderCircle
            aria-hidden="true"
            className="h-5 w-5 animate-spin text-cyan-700"
          />
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-4 rounded-full bg-slate-100" />
          <div className="h-4 w-5/6 rounded-full bg-slate-100" />
          <div className="h-4 w-2/3 rounded-full bg-slate-100" />
        </div>
        <p className="mt-6 text-sm text-slate-500">Loading saved forecast...</p>
      </section>
    );
  }

  if (item.status === "error") {
    return (
      <section className="min-h-64 rounded-lg border border-rose-100 bg-rose-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-rose-700 ring-1 ring-rose-100">
            <AlertCircle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-rose-950">
              {item.location.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-rose-800">
              {item.message}
            </p>
          </div>
        </div>
        <button
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-100 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Retry comparison
        </button>
      </section>
    );
  }

  const weather = item.weather;
  const tomorrow = weather.daily[1] ?? weather.daily[0];
  const risk = buildWeatherRiskSignals(weather, units)[0];
  const riskStyle = severityClasses[risk.severity];

  return (
    <section className="min-h-64 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {item.location.label}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {item.source === "current" ? "Current dashboard" : "Saved location"}
          </p>
        </div>
        <SmallConditionIcon
          condition={weather.current.condition}
          isDay={weather.current.isDay}
        />
      </div>

      <p className="mt-5 text-4xl font-semibold tracking-normal text-slate-950">
        {formatTemperature(weather.current.temperatureC, units.temperature)}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {weather.current.description}
      </p>

      <div className="mt-5 grid gap-2 text-sm">
        <ComparisonMetric
          label="Tomorrow"
          value={
            tomorrow
              ? `${formatTemperature(
                  tomorrow.temperatureMinC,
                  units.temperature
                )} - ${formatTemperature(
                  tomorrow.temperatureMaxC,
                  units.temperature
                )}`
              : "Unavailable"
          }
        />
        <ComparisonMetric
          label="Rain"
          value={formatPercent(getTomorrowRainChance(weather))}
        />
        <ComparisonMetric
          label="Wind"
          value={formatWindSpeed(weather.current.windSpeedMs, units.windSpeed)}
        />
      </div>

      <div
        className={`mt-4 inline-flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ${riskStyle.badge}`}
      >
        <span className={`h-2 w-2 rounded-full ${riskStyle.dot}`} />
        <span className="truncate">
          {riskStyle.label}: {risk.title}
        </span>
      </div>

      <button
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
        onClick={() => onLoadLocation(item.location)}
        type="button"
      >
        Open dashboard
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </section>
  );
}

function ComparisonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-slate-500">
        {label === "Wind" ? (
          <Wind aria-hidden="true" className="h-3.5 w-3.5" />
        ) : label === "Rain" ? (
          <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
        )}
        {label}
      </span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function SmallConditionIcon({
  condition,
  isDay
}: {
  condition: WeatherCondition;
  isDay: boolean;
}) {
  const presentation = getWeatherConditionPresentation(condition, isDay);
  const Icon = presentation.icon;

  return (
    <span
      aria-label={presentation.label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-amber-200"
      role="img"
    >
      <Icon aria-hidden="true" className="h-6 w-6" />
    </span>
  );
}

function createRemoteLoadingItems(targets: LocationComparisonTarget[]) {
  return Object.fromEntries(
    targets.map((target) => [
      target.location.id,
      {
        ...target,
        status: "loading"
      } satisfies ComparisonItem
    ])
  );
}

function createRemoteErrorItems(targets: LocationComparisonTarget[]) {
  return Object.fromEntries(
    targets.map((target) => [
      target.location.id,
      {
        ...target,
        message: "Connect to the internet to compare this saved city.",
        status: "error"
      } satisfies ComparisonItem
    ])
  );
}

async function fetchComparisonWeather(endpoint: string, signal: AbortSignal) {
  const response = await fetch(endpoint, { cache: "no-store", signal });
  const payload = (await response.json().catch(() => ({}))) as
    | WeatherApiResponse
    | Record<string, never>;

  if (!response.ok || isWeatherApiFailure(payload)) {
    const message = isWeatherApiFailure(payload)
      ? payload.error.message
      : "Could not load this saved location.";

    throw new Error(message);
  }

  if (!("weather" in payload)) {
    throw new Error("Could not load this saved location.");
  }

  return payload.weather;
}

function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
