"use client";

import {
  Cloud,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  MapPin,
  Search,
  Sunrise,
  Sunset,
  Thermometer,
  Wind
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { ForecastChart } from "@/components/weather/forecast-chart";
import { MetricCard } from "@/components/weather/metric-card";
import { SunMoonTable } from "@/components/weather/sun-moon-table";
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
  initialWeather: WeatherReport;
};

export function WeatherDashboard({ initialWeather }: WeatherDashboardProps) {
  const [weather, setWeather] = useState(initialWeather);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sunStatus = getSunEventStatus(
    weather.current.observedAt,
    weather.current.sunrise,
    weather.current.sunset
  );

  function showSettledNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      showSettledNotice("Enter a city or ZIP code");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      setWeather((current) => ({
        ...current,
        current: {
          ...current.current,
          locationName: trimmedQuery,
          country: ""
        }
      }));
      setIsLoading(false);
      showSettledNotice(`Showing ${trimmedQuery}`);
    }, 450);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      showSettledNotice("Location is unavailable in this browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setWeather((current) => ({
          ...current,
          current: {
            ...current.current,
            locationName: "Current location",
            country: ""
          }
        }));
        setIsLoading(false);
        showSettledNotice("Location updated");
      },
      () => {
        setIsLoading(false);
        showSettledNotice("Location access blocked");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000
      }
    );
  }

  const location = [weather.current.locationName, weather.current.country]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white/80 p-4 shadow-sm shadow-slate-200/70 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPin aria-hidden="true" className="h-4 w-4 text-emerald-600" />
              {location}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              {weather.current.description}
            </h1>
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
              <Search aria-hidden="true" className="h-5 w-5" />
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

        {notice ? (
          <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
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
              <div className="rounded-lg bg-white/10 p-4">
                <CloudSun aria-hidden="true" className="h-16 w-16 text-amber-200" />
              </div>
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

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-lg border border-black/5 bg-white/85 p-5 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Rain forecast</p>
                <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                  Next 8 days
                </h2>
              </div>
              <Image
                alt=""
                className="h-8 w-8 opacity-70"
                height={32}
                src="/barometer.png"
                width={32}
              />
            </div>
            <ForecastChart daily={weather.daily} mode="precipitation" />
          </article>

          <article className="rounded-lg border border-black/5 bg-white/85 p-5 shadow-sm shadow-slate-200/70">
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

        <section>
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Daily outlook</p>
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">
              Forecast cards
            </h2>
          </div>
          <DailyForecast daily={weather.daily} />
        </section>

        <section>
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
      </section>
    </main>
  );
}
