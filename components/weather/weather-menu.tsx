"use client";

import {
  CalendarDays,
  Clock3,
  Database,
  LocateFixed,
  LucideIcon,
  RefreshCw,
  Search,
  SunMedium,
  ThermometerSun,
  TrendingUp,
  X
} from "lucide-react";
import { useEffect, useRef } from "react";
import { formatTime } from "@/lib/weather/formatters";
import type { WeatherReport } from "@/lib/weather/types";

type WeatherMenuDrawerProps = {
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onUseLocation?: () => void;
  weather: WeatherReport | null;
};

type MenuItem = {
  detail: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

const activeForecastItems: MenuItem[] = [
  {
    detail: "Conditions and weather metrics",
    href: "#current-weather",
    icon: ThermometerSun,
    label: "Current weather"
  },
  {
    detail: "Precipitation and temperature trends",
    href: "#forecast-charts",
    icon: TrendingUp,
    label: "Forecast charts"
  },
  {
    detail: "Eight-day forecast cards",
    href: "#daily-outlook",
    icon: CalendarDays,
    label: "Daily outlook"
  },
  {
    detail: "Sunrise, sunset, and moon phase",
    href: "#sun-moon",
    icon: SunMedium,
    label: "Sun and moon"
  }
];

export function WeatherMenuDrawer({
  isLoading,
  isOpen,
  onClose,
  onRefresh,
  onUseLocation,
  weather
}: WeatherMenuDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const locationLabel = weather
    ? [weather.current.locationName, weather.current.country]
        .filter(Boolean)
        .join(", ")
    : "No location selected";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close weather menu overlay"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="weather-menu-title"
        aria-modal="true"
        className="relative flex h-full w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-y-auto bg-white p-4 shadow-2xl shadow-slate-950/25 sm:w-96 sm:p-5"
        id="weather-menu-drawer"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-cyan-700">
              Weather controls
            </p>
            <h2
              className="mt-1 text-2xl font-semibold tracking-normal text-slate-950"
              id="weather-menu-title"
            >
              Menu
            </h2>
            <p className="mt-2 truncate text-sm font-medium text-slate-500">
              {locationLabel}
            </p>
          </div>
          <button
            aria-label="Close weather menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-100"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Weather dashboard navigation" className="mt-6 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-normal text-slate-400">
              Start
            </h3>
            <div className="mt-3 grid gap-2">
              <MenuAnchor
                detail="Focus the city or ZIP code lookup"
                href="#weather-search-panel"
                icon={Search}
                label="Search location"
                onNavigate={onClose}
              />
              <button
                className="flex w-full items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-left text-emerald-900 transition hover:border-emerald-200 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading || !onUseLocation}
                onClick={() => {
                  onClose();
                  onUseLocation?.();
                }}
                type="button"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100">
                  <LocateFixed aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    Use current location
                  </span>
                  <span className="block text-xs text-emerald-800/75">
                    Load nearby conditions
                  </span>
                </span>
              </button>
            </div>
          </section>

          {weather ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-normal text-slate-400">
                Dashboard
              </h3>
              <div className="mt-3 grid gap-2">
                {activeForecastItems.map((item) => (
                  <MenuAnchor
                    detail={item.detail}
                    href={item.href}
                    icon={item.icon}
                    key={item.href}
                    label={item.label}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </nav>

        <section className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-normal text-slate-400">
            Weather data
          </h3>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700 ring-1 ring-slate-200">
                <Database aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">
                  {weather?.metadata.provider ?? "Open-Meteo"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {weather
                    ? weather.metadata.attribution
                    : "Forecast and geocoding provider"}
                </p>
              </div>
            </div>
            {weather ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                Updated {formatTime(weather.metadata.fetchedAt, weather.current.timezone)}
              </p>
            ) : null}
            {weather ? (
              <button
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading || !onRefresh}
                onClick={() => {
                  onClose();
                  onRefresh?.();
                }}
                type="button"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh weather
              </button>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}

function MenuAnchor({
  detail,
  href,
  icon: Icon,
  label,
  onNavigate
}: MenuItem & { onNavigate: () => void }) {
  return (
    <a
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-800 transition hover:border-cyan-200 hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100"
      href={href}
      onClick={onNavigate}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-700 ring-1 ring-slate-100">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-500">{detail}</span>
      </span>
    </a>
  );
}
