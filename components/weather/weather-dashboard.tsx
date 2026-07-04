"use client";

import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudRain,
  Clock3,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  Sunrise,
  Sunset,
  Thermometer,
  Wind
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { ForecastChart } from "@/components/weather/forecast-chart";
import { MetricCard } from "@/components/weather/metric-card";
import { SunMoonTable } from "@/components/weather/sun-moon-table";
import { WeatherConditionIcon } from "@/components/weather/weather-condition-icon";
import { WeatherMenuDrawer } from "@/components/weather/weather-menu";
import {
  isWeatherApiFailure,
  type WeatherApiResponse,
  type WeatherErrorCode
} from "@/lib/weather/api";
import type { WeatherReport } from "@/lib/weather/types";
import {
  formatPercent,
  formatPressure,
  formatTemperature,
  formatTime,
  formatVisibility,
  formatWindSpeed,
  getSunEventStatus,
  getWindDirection
} from "@/lib/weather/formatters";

type WeatherDashboardProps = {
  initialWeather?: WeatherReport;
};

type LoadingState = {
  title: string;
  detail: string;
};

type NoticeState = {
  message: string;
  tone: "info" | "success" | "error";
};

type WeatherRetry = {
  endpoint: string;
  loading: LoadingState;
};

export const WEATHER_VIEW_STATES = [
  "empty",
  "loading",
  "ready",
  "geo-blocked",
  "api-error",
  "no-results"
] as const;

export type WeatherViewStatus = (typeof WEATHER_VIEW_STATES)[number];

export type WeatherViewState =
  | { status: "empty" }
  | { status: "loading"; loading: LoadingState }
  | { status: "ready"; notice?: NoticeState }
  | { status: "geo-blocked"; message: string }
  | {
      status: "api-error";
      code: WeatherErrorCode;
      message: string;
      retry?: WeatherRetry;
    }
  | { status: "no-results"; query: string; message: string };

export function WeatherDashboard({ initialWeather }: WeatherDashboardProps) {
  const [weather, setWeather] = useState<WeatherReport | null>(
    initialWeather ?? null
  );
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastRequest, setLastRequest] = useState<WeatherRetry | null>(null);
  const [viewState, setViewState] = useState<WeatherViewState>(
    initialWeather ? { status: "ready" } : { status: "empty" }
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const isLoading = viewState.status === "loading";

  const sunStatus = weather
    ? getSunEventStatus(
        weather.current.observedAt,
        weather.current.sunrise,
        weather.current.sunset
      )
    : null;

  function showSettledNotice(
    message: string,
    tone: NoticeState["tone"] = "info"
  ) {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setViewState({ status: "ready", notice: { message, tone } });
    noticeTimerRef.current = window.setTimeout(() => {
      setViewState((current) =>
        current.status === "ready" && current.notice
          ? { status: "ready" }
          : current
      );
    }, 3000);
  }

  async function loadWeather(
    endpoint: string,
    state: LoadingState,
    successMessage: (weatherReport: WeatherReport) => string
  ) {
    setViewState({ status: "loading", loading: state });

    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as
        | WeatherApiResponse
        | Record<string, never>;

      if (!response.ok || isWeatherApiFailure(payload)) {
        const fallback = {
          code: "WEATHER_UNAVAILABLE" as WeatherErrorCode,
          message: "Weather data is temporarily unavailable."
        };
        const failure = isWeatherApiFailure(payload) ? payload.error : fallback;

        if (failure.code === "NO_RESULTS") {
          setViewState({
            status: "no-results",
            query: query.trim(),
            message: failure.message
          });
          return;
        }

        setViewState({
          status: "api-error",
          code: failure.code,
          message: failure.message,
          retry: {
            endpoint,
            loading: state
          }
        });
        return;
      }

      if (!("weather" in payload)) {
        setViewState({
          status: "api-error",
          code: "WEATHER_UNAVAILABLE",
          message: "Weather data is temporarily unavailable.",
          retry: {
            endpoint,
            loading: state
          }
        });
        return;
      }

      setWeather(payload.weather);
      setLastRequest({ endpoint, loading: state });
      setQuery("");
      showSettledNotice(successMessage(payload.weather), "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Weather data is temporarily unavailable.";
      setViewState({
        status: "api-error",
        code: "WEATHER_UNAVAILABLE",
        message,
        retry: {
          endpoint,
          loading: state
        }
      });
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setViewState({
        status: "api-error",
        code: "INVALID_QUERY",
        message: "Enter a city or ZIP code to load a forecast."
      });
      return;
    }

    const params = new URLSearchParams({ q: trimmedQuery });

    void loadWeather(
      `/api/weather?${params.toString()}`,
      {
        title: "Finding forecast",
        detail: "Resolving the location and loading current conditions."
      },
      (updatedWeather) => `Showing ${updatedWeather.current.locationName}`
    );
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setViewState({
        status: "geo-blocked",
        message: "This browser does not support location access. Search by city or ZIP code instead."
      });
      return;
    }

    setViewState({
      status: "loading",
      loading: {
        title: "Requesting location",
        detail: "Waiting for your browser to share coordinates."
      }
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lon: String(position.coords.longitude)
        });

        void loadWeather(
          `/api/weather?${params.toString()}`,
          {
            title: "Loading local weather",
            detail: "Fetching current conditions and the 8-day outlook."
          },
          () => "Location weather updated"
        );
      },
      () => {
        setViewState({
          status: "geo-blocked",
          message: "Location access was blocked or timed out. Search by city or ZIP code to continue."
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000
      }
    );
  }

  function retryWeather() {
    if (viewState.status !== "api-error" || !viewState.retry) {
      return;
    }

    void loadWeather(
      viewState.retry.endpoint,
      viewState.retry.loading,
      () => "Forecast updated"
    );
  }

  function closeMenu() {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  function refreshWeather() {
    if (!lastRequest || isLoading) {
      return;
    }

    void loadWeather(
      lastRequest.endpoint,
      {
        title: "Refreshing weather",
        detail: "Updating the latest dashboard conditions and forecast."
      },
      (updatedWeather) => `Updated ${updatedWeather.current.locationName}`
    );
  }

  const location = weather
    ? [weather.current.locationName, weather.current.country]
        .filter(Boolean)
        .join(", ")
    : "No location selected";

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <WeatherMenuDrawer
          isLoading={isLoading}
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onRefresh={weather && lastRequest ? refreshWeather : undefined}
          onUseLocation={handleUseLocation}
          weather={weather}
        />

        <header
          className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white/80 p-4 shadow-sm shadow-slate-200/70 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
          id="weather-search-panel"
        >
          <div className="flex min-w-0 items-start gap-3 lg:flex-1">
            <button
              aria-controls="weather-menu-drawer"
              aria-expanded={isMenuOpen}
              aria-label="Open weather menu"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              onClick={() => setIsMenuOpen(true)}
              ref={menuButtonRef}
              title="Open menu"
              type="button"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                <MapPin aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                {location}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                {weather ? weather.current.description : "Choose a location"}
              </h1>
              {weather ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    Updated {formatTime(weather.metadata.fetchedAt, weather.current.timezone)}
                  </span>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                    {weather.metadata.provider}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <form
            className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl"
            onSubmit={handleSearch}
          >
            <label className="sr-only" htmlFor="weather-search">
              Search weather
            </label>
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              />
              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                disabled={isLoading}
                id="weather-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="City or ZIP code"
                type="search"
                value={query}
              />
            </div>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
              disabled={isLoading}
              title="Search"
              type="submit"
            >
              {isLoading ? (
                <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : (
                <Search aria-hidden="true" className="h-5 w-5" />
              )}
              Search
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              disabled={isLoading}
              onClick={handleUseLocation}
              title="Use location"
              type="button"
            >
              <LocateFixed aria-hidden="true" className="h-5 w-5" />
              Use location
            </button>
          </form>
        </header>

        <WeatherStatePanel
          onRetry={retryWeather}
          onUseLocation={handleUseLocation}
          state={viewState}
        />

        {weather && sunStatus ? (
          <WeatherReportSections
            isLoading={isLoading}
            sunStatus={sunStatus}
            weather={weather}
          />
        ) : null}
      </section>
    </main>
  );
}

function WeatherReportSections({
  isLoading,
  sunStatus,
  weather
}: {
  isLoading: boolean;
  sunStatus: { sunrise: string; sunset: string };
  weather: WeatherReport;
}) {
  return (
    <>
      <section
        aria-busy={isLoading}
        className="grid scroll-mt-4 gap-4 transition-opacity lg:grid-cols-[1.1fr_1.9fr]"
        id="current-weather"
      >
          <article className="rounded-lg border border-black/5 bg-slate-950 p-5 text-white shadow-sm shadow-slate-300/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Observed {formatTime(weather.current.observedAt, weather.current.timezone)}
                </p>
                <p className="mt-4 text-6xl font-semibold tracking-normal">
                  {formatTemperature(weather.current.temperatureC)}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  Feels like {formatTemperature(weather.current.feelsLikeC)}
                </p>
              </div>
              <WeatherConditionIcon
                condition={weather.current.condition}
                isDay={weather.current.isDay}
              />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-3">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <Sunrise aria-hidden="true" className="h-4 w-4 text-amber-200" />
                  Sunrise
                </span>
                <p className="mt-1 font-semibold">
                  {formatTime(weather.current.sunrise, weather.current.timezone)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{sunStatus.sunrise}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <Sunset aria-hidden="true" className="h-4 w-4 text-rose-200" />
                  Sunset
                </span>
                <p className="mt-1 font-semibold">
                  {formatTime(weather.current.sunset, weather.current.timezone)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{sunStatus.sunset}</p>
              </div>
            </div>
          </article>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              detail={`${getWindDirection(weather.current.windDegree)} wind direction`}
              icon={Wind}
              label="Wind"
              tone="aqua"
              value={formatWindSpeed(weather.current.windSpeedMs)}
            />
            <MetricCard
              icon={Droplets}
              label="Humidity"
              tone="green"
              value={formatPercent(weather.current.humidity)}
            />
            <MetricCard
              icon={Gauge}
              label="Pressure"
              tone="stone"
              value={formatPressure(weather.current.pressureHpa)}
            />
            <MetricCard
              icon={Thermometer}
              label="Dew point"
              tone="rose"
              value={formatTemperature(weather.current.dewPointC)}
            />
            <MetricCard
              icon={Eye}
              label="Visibility"
              tone="indigo"
              value={formatVisibility(weather.current.visibilityMeters)}
            />
            <MetricCard
              icon={Cloud}
              label="Cloud cover"
              tone="amber"
              value={formatPercent(weather.current.cloudCover)}
            />
          </div>
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-2 scroll-mt-4" id="forecast-charts">
          <article className="min-w-0 rounded-lg border border-black/5 bg-white/85 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Rain forecast</p>
                <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                  Next 8 days
                </h2>
              </div>
              <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700 ring-1 ring-cyan-100">
                <CloudRain aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <ForecastChart daily={weather.daily} mode="precipitation" />
          </article>

          <article className="min-w-0 rounded-lg border border-black/5 bg-white/85 p-4 shadow-sm shadow-slate-200/70 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-500">
                Temperature forecast
              </p>
              <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                Daily range
              </h2>
            </div>
            <ForecastChart daily={weather.daily} mode="temperature" />
          </article>
        </section>

        <section className="scroll-mt-4" id="daily-outlook">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Daily outlook</p>
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">
              Forecast cards
            </h2>
          </div>
          <DailyForecast daily={weather.daily} />
        </section>

        <section className="scroll-mt-4" id="sun-moon">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Sun and moon</p>
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">
              Timing table
            </h2>
          </div>
          <SunMoonTable
            daily={weather.daily}
            timezone={weather.current.timezone}
          />
        </section>
    </>
  );
}

export function WeatherStatePanel({
  onRetry,
  onUseLocation,
  state
}: {
  onRetry?: () => void;
  onUseLocation?: () => void;
  state: WeatherViewState;
}) {
  if (state.status === "empty") {
    return <EmptyStatePanel onUseLocation={onUseLocation} />;
  }

  if (state.status === "loading") {
    return <WeatherLoadingPanel state={state.loading} />;
  }

  if (state.status === "ready" && state.notice) {
    return <NoticePanel notice={state.notice} />;
  }

  if (state.status === "geo-blocked") {
    return (
      <RecoveryPanel
        message={state.message}
        title="Location access blocked"
        tone="warning"
      />
    );
  }

  if (state.status === "no-results") {
    return (
      <RecoveryPanel
        message={state.message}
        title={`No results for "${state.query}"`}
        tone="warning"
      />
    );
  }

  if (state.status === "api-error") {
    return (
      <RecoveryPanel
        message={state.message}
        onRetry={state.retry ? onRetry : undefined}
        title="Weather service unavailable"
        tone="error"
      />
    );
  }

  return null;
}

export function EmptyStatePanel({ onUseLocation }: { onUseLocation?: () => void }) {
  return (
    <section className="rounded-lg border border-dashed border-cyan-200 bg-white/80 p-5 shadow-sm shadow-slate-200/70">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-cyan-700">Ready for local weather</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Search a city or use your current location
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The dashboard will load current conditions, metrics, forecasts, and sun timing once a location is selected.
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          onClick={onUseLocation}
          type="button"
        >
          <LocateFixed aria-hidden="true" className="h-5 w-5" />
          Use location
        </button>
      </div>
    </section>
  );
}

export function WeatherLoadingPanel({ state }: { state: LoadingState }) {
  return (
    <div
      aria-live="polite"
      className="rounded-lg border border-cyan-100 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200/70"
      role="status"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
          <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{state.title}</p>
          <p className="text-sm text-slate-500">{state.detail}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="weather-loader-bar h-full rounded-full bg-cyan-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecoveryPanel({
  message,
  onRetry,
  title,
  tone
}: {
  message: string;
  onRetry?: () => void;
  title: string;
  tone: "error" | "warning";
}) {
  const toneClasses =
    tone === "error"
      ? "border-rose-100 bg-rose-50 text-rose-900"
      : "border-amber-100 bg-amber-50 text-amber-900";

  return (
    <section
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`rounded-lg border px-4 py-4 shadow-sm shadow-slate-200/70 ${toneClasses}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm opacity-85">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white/80 px-3 text-sm font-semibold text-slate-900 ring-1 ring-black/10 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/70"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Retry
          </button>
        ) : null}
      </div>
    </section>
  );
}

function NoticePanel({ notice }: { notice: NoticeState }) {
  const toneClasses = {
    info: {
      box: "border-cyan-100 bg-cyan-50 text-cyan-800",
      icon: "text-cyan-700",
      iconNode: AlertCircle
    },
    success: {
      box: "border-emerald-100 bg-emerald-50 text-emerald-800",
      icon: "text-emerald-700",
      iconNode: CheckCircle2
    },
    error: {
      box: "border-rose-100 bg-rose-50 text-rose-800",
      icon: "text-rose-700",
      iconNode: AlertCircle
    }
  }[notice.tone];
  const Icon = toneClasses.iconNode;

  return (
    <div
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${toneClasses.box}`}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className={`h-4 w-4 ${toneClasses.icon}`} />
      {notice.message}
    </div>
  );
}
