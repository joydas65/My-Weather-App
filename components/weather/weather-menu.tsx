"use client";

import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Clock3,
  Database,
  History,
  LocateFixed,
  LucideIcon,
  RefreshCw,
  Ruler,
  Search,
  Sparkles,
  SunMedium,
  ThermometerSun,
  Trash2,
  TrendingUp,
  X
} from "lucide-react";
import { useEffect, useRef } from "react";
import { formatTime } from "@/lib/weather/formatters";
import type {
  WeatherMenuLocation,
  WeatherMenuPreferences,
  WeatherUnitPreferences
} from "@/lib/weather/preferences";
import type { WeatherReport } from "@/lib/weather/types";

type UnitPreferenceChangeHandler = <
  UnitName extends keyof WeatherUnitPreferences
>(
  unitName: UnitName,
  value: WeatherUnitPreferences[UnitName]
) => void;

type WeatherMenuDrawerProps = {
  activeLocationId?: string;
  currentLocation: WeatherMenuLocation | null;
  isCurrentLocationSaved: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLoadLocation: (location: WeatherMenuLocation) => void;
  onRefresh?: () => void;
  onRemoveSavedLocation: (locationId: string) => void;
  onSaveCurrentLocation: () => void;
  onUnitPreferenceChange: UnitPreferenceChangeHandler;
  onUseLocation?: () => void;
  preferences: WeatherMenuPreferences;
  weather: WeatherReport | null;
};

type MenuItem = {
  detail: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

type UnitOption<UnitValue extends string> = {
  label: string;
  value: UnitValue;
};

const activeForecastItems: MenuItem[] = [
  {
    detail: "Conditions and weather metrics",
    href: "#current-weather",
    icon: ThermometerSun,
    label: "Current weather"
  },
  {
    detail: "Tomorrow brief and planning signals",
    href: "#smart-forecast",
    icon: Sparkles,
    label: "Smart forecast"
  },
  {
    detail: "Next 24 hours at a glance",
    href: "#hourly-timeline",
    icon: Clock3,
    label: "Hourly timeline"
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

const unitOptions = {
  pressure: [
    { label: "hPa", value: "hpa" },
    { label: "inHg", value: "inhg" }
  ],
  temperature: [
    { label: "C", value: "celsius" },
    { label: "F", value: "fahrenheit" }
  ],
  visibility: [
    { label: "km", value: "km" },
    { label: "mi", value: "mi" }
  ],
  windSpeed: [
    { label: "m/s", value: "ms" },
    { label: "km/h", value: "kmh" },
    { label: "mph", value: "mph" }
  ]
} satisfies {
  [UnitName in keyof WeatherUnitPreferences]: UnitOption<
    WeatherUnitPreferences[UnitName]
  >[];
};

export function WeatherMenuDrawer({
  activeLocationId,
  currentLocation,
  isCurrentLocationSaved,
  isLoading,
  isOpen,
  onClose,
  onLoadLocation,
  onRefresh,
  onRemoveSavedLocation,
  onSaveCurrentLocation,
  onUnitPreferenceChange,
  onUseLocation,
  preferences,
  weather
}: WeatherMenuDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const locationLabel = weather
    ? [weather.current.locationName, weather.current.country]
        .filter(Boolean)
        .join(", ")
    : "No location selected";
  const dataStatus = weather ? "Loaded" : "Waiting";
  const savedButtonLabel = isCurrentLocationSaved
    ? "Current location saved"
    : "Save current location";

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
        className="relative flex h-full w-[min(25rem,calc(100vw-1rem))] flex-col overflow-y-auto bg-white p-4 shadow-2xl shadow-slate-950/25 sm:w-[26rem] sm:p-5"
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
          <section aria-labelledby="weather-menu-start-heading">
            <h3
              className="text-xs font-semibold uppercase tracking-normal text-slate-400"
              id="weather-menu-start-heading"
            >
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

          <section aria-labelledby="weather-menu-locations-heading">
            <h3
              className="text-xs font-semibold uppercase tracking-normal text-slate-400"
              id="weather-menu-locations-heading"
            >
              Locations
            </h3>
            <div className="mt-3 grid gap-3">
              <button
                aria-pressed={isCurrentLocationSaved}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-left text-slate-800 transition hover:border-cyan-200 hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!currentLocation || isCurrentLocationSaved}
                onClick={onSaveCurrentLocation}
                type="button"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                  {isCurrentLocationSaved ? (
                    <BookmarkCheck aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Bookmark aria-hidden="true" className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {savedButtonLabel}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {currentLocation?.label ?? "Load a forecast first"}
                  </span>
                </span>
              </button>

              <LocationList
                activeLocationId={activeLocationId}
                emptyLabel="No saved locations"
                icon={BookmarkCheck}
                isLoading={isLoading}
                locations={preferences.savedLocations}
                onClose={onClose}
                onLoadLocation={onLoadLocation}
                onRemoveLocation={onRemoveSavedLocation}
                title="Saved"
              />

              <LocationList
                activeLocationId={activeLocationId}
                emptyLabel="No recent locations"
                icon={History}
                isLoading={isLoading}
                locations={preferences.recentLocations}
                onClose={onClose}
                onLoadLocation={onLoadLocation}
                title="Recent"
              />
            </div>
          </section>

          <section aria-labelledby="weather-menu-units-heading">
            <h3
              className="text-xs font-semibold uppercase tracking-normal text-slate-400"
              id="weather-menu-units-heading"
            >
              Units
            </h3>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Ruler aria-hidden="true" className="h-4 w-4 text-cyan-700" />
                Measurement preferences
              </div>
              <div className="grid gap-3">
                <UnitControl
                  label="Temperature"
                  onChange={onUnitPreferenceChange}
                  options={unitOptions.temperature}
                  unitName="temperature"
                  value={preferences.units.temperature}
                />
                <UnitControl
                  label="Wind"
                  onChange={onUnitPreferenceChange}
                  options={unitOptions.windSpeed}
                  unitName="windSpeed"
                  value={preferences.units.windSpeed}
                />
                <UnitControl
                  label="Pressure"
                  onChange={onUnitPreferenceChange}
                  options={unitOptions.pressure}
                  unitName="pressure"
                  value={preferences.units.pressure}
                />
                <UnitControl
                  label="Visibility"
                  onChange={onUnitPreferenceChange}
                  options={unitOptions.visibility}
                  unitName="visibility"
                  value={preferences.units.visibility}
                />
              </div>
            </div>
          </section>

          {weather ? (
            <section aria-labelledby="weather-menu-dashboard-heading">
              <h3
                className="text-xs font-semibold uppercase tracking-normal text-slate-400"
                id="weather-menu-dashboard-heading"
              >
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950">
                    {weather?.metadata.provider ?? "Open-Meteo"}
                  </p>
                  <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                    {dataStatus}
                  </span>
                </div>
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

function LocationList({
  activeLocationId,
  emptyLabel,
  icon: Icon,
  isLoading,
  locations,
  onClose,
  onLoadLocation,
  onRemoveLocation,
  title
}: {
  activeLocationId?: string;
  emptyLabel: string;
  icon: LucideIcon;
  isLoading: boolean;
  locations: WeatherMenuLocation[];
  onClose: () => void;
  onLoadLocation: (location: WeatherMenuLocation) => void;
  onRemoveLocation?: (locationId: string) => void;
  title: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-400">
        {title}
      </p>
      {locations.length > 0 ? (
        <div className="grid gap-2">
          {locations.map((location) => {
            const isActive = location.id === activeLocationId;

            return (
              <div
                className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white"
                key={location.id}
              >
                <button
                  aria-current={isActive ? "location" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left text-slate-800 transition hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading}
                  onClick={() => {
                    onClose();
                    onLoadLocation(location);
                  }}
                  type="button"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-700 ring-1 ring-slate-100">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {location.label}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {isActive ? "Current dashboard" : "Load forecast"}
                    </span>
                  </span>
                </button>
                {onRemoveLocation ? (
                  <button
                    aria-label={`Remove ${location.label} from saved locations`}
                    className="flex w-11 shrink-0 items-center justify-center border-l border-slate-200 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-100"
                    onClick={() => onRemoveLocation(location.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

function UnitControl<UnitName extends keyof WeatherUnitPreferences>({
  label,
  onChange,
  options,
  unitName,
  value
}: {
  label: string;
  onChange: UnitPreferenceChangeHandler;
  options: UnitOption<WeatherUnitPreferences[UnitName]>[];
  unitName: UnitName;
  value: WeatherUnitPreferences[UnitName];
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <div
        aria-label={`${label} unit`}
        className="inline-flex rounded-lg bg-white p-1 ring-1 ring-slate-200"
        role="group"
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              aria-pressed={isSelected}
              className={`h-8 rounded-md px-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
                isSelected
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
              key={option.value}
              onClick={() => onChange(unitName, option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
