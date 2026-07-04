"use client";

import {
  CategoryScale,
  type ChartData,
  type ChartOptions,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem
} from "chart.js";
import { AlertCircle, CloudRain } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Line } from "react-chartjs-2";
import type { DailyForecast } from "@/lib/weather/types";
import {
  buildPrecipitationSeries,
  buildTemperatureSeries
} from "@/lib/weather/chart-data";
import {
  convertTemperature,
  formatTemperature
} from "@/lib/weather/formatters";
import {
  DEFAULT_UNIT_PREFERENCES,
  type WeatherUnitPreferences
} from "@/lib/weather/preferences";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

export type ForecastChartMode = "precipitation" | "temperature";

type ForecastChartProps = {
  daily: DailyForecast[];
  mode: ForecastChartMode;
  units?: WeatherUnitPreferences;
};

type ForecastChartStatus = "empty" | "error";

type ForecastChartSummaryItem = {
  label: string;
  value: string;
};

type ReadyForecastChartModel = {
  status: "ready";
  ariaLabel: string;
  data: ChartData<"line", number[], string>;
  options: ChartOptions<"line">;
  summary: ForecastChartSummaryItem[];
};

type ForecastChartModel =
  | ReadyForecastChartModel
  | {
      status: ForecastChartStatus;
      title: string;
      detail: string;
    };

type ForecastChartErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ForecastChartErrorBoundaryState = {
  hasError: boolean;
};

export function ForecastChart({
  daily,
  mode,
  units = DEFAULT_UNIT_PREFERENCES
}: ForecastChartProps) {
  const model = buildForecastChartModel(daily, mode, units);

  if (model.status !== "ready") {
    return (
      <ForecastChartStatePanel
        detail={model.detail}
        status={model.status}
        title={model.title}
      />
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      <dl className="grid grid-cols-2 gap-2 text-xs sm:flex sm:flex-wrap">
        {model.summary.map((item) => (
          <div
            className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
            key={item.label}
          >
            <dt className="font-medium text-slate-500">{item.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="relative h-72 min-w-0 w-full overflow-hidden rounded-lg bg-gradient-to-b from-white to-slate-50 p-2 ring-1 ring-slate-100 sm:p-3">
        <div className="pointer-events-none absolute inset-x-4 top-4 h-px bg-gradient-to-r from-cyan-200/0 via-cyan-200 to-rose-200/0" />
        <ForecastChartErrorBoundary
          fallback={
            <ForecastChartStatePanel
              detail="The forecast arrived, but the chart could not be rendered safely."
              fill
              status="error"
              title="Chart unavailable"
            />
          }
        >
          <Line
            aria-label={model.ariaLabel}
            data={model.data}
            options={model.options}
          />
        </ForecastChartErrorBoundary>
      </div>
    </div>
  );
}

export function buildForecastChartModel(
  daily: DailyForecast[],
  mode: ForecastChartMode,
  units: WeatherUnitPreferences = DEFAULT_UNIT_PREFERENCES
): ForecastChartModel {
  if (daily.length === 0) {
    return {
      status: "empty",
      title: "No forecast trend yet",
      detail: "Search a location or use your current position to load chart-ready forecast data."
    };
  }

  if (!hasRenderableForecastData(daily, mode)) {
    return {
      status: "error",
      title: "Chart unavailable",
      detail: "Forecast values are incomplete or outside the expected chart range."
    };
  }

  const precipitation = buildPrecipitationSeries(daily);
  const temperature = buildTemperatureSeries(daily);
  const rawTemperatures = daily.map((day) => ({
    max: day.temperatureMaxC,
    min: day.temperatureMinC
  }));
  const isPrecipitation = mode === "precipitation";
  const labels = (isPrecipitation ? precipitation : temperature).map(
    (item) => item.label
  );
  const temperatureSuffix = units.temperature === "fahrenheit" ? "F" : "C";

  const data: ChartData<"line", number[], string> = isPrecipitation
    ? {
        labels,
        datasets: [
          {
            label: "Rain chance",
            data: precipitation.map((item) => item.value),
            borderColor: "#0891b2",
            backgroundColor: "rgba(8, 145, 178, 0.16)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHitRadius: 12,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#0891b2",
            pointBorderWidth: 2
          }
        ]
      }
    : {
        labels,
        datasets: [
          {
            label: "High",
            data: rawTemperatures.map((item) =>
              Math.round(convertTemperature(item.max, units.temperature))
            ),
            borderColor: "#e11d48",
            backgroundColor: "rgba(225, 29, 72, 0.08)",
            borderWidth: 3,
            fill: false,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHitRadius: 12,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#e11d48",
            pointBorderWidth: 2
          },
          {
            label: "Low",
            data: rawTemperatures.map((item) =>
              Math.round(convertTemperature(item.min, units.temperature))
            ),
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.08)",
            borderWidth: 3,
            fill: false,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHitRadius: 12,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#4f46e5",
            pointBorderWidth: 2
          }
        ]
      };

  return {
    status: "ready",
    ariaLabel: isPrecipitation
      ? "Precipitation probability forecast chart"
      : "Daily high and low temperature forecast chart",
    data,
    options: buildForecastChartOptions(isPrecipitation, temperatureSuffix),
    summary: isPrecipitation
      ? buildPrecipitationSummary(precipitation.map((item) => item.value))
      : buildTemperatureSummary(
          rawTemperatures.map((item) => item.min),
          rawTemperatures.map((item) => item.max),
          units
        )
  };
}

function buildForecastChartOptions(
  isPrecipitation: boolean,
  temperatureSuffix: string
): ChartOptions<"line"> {
  const valueSuffix = isPrecipitation ? "%" : ` ${temperatureSuffix}`;

  return {
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      intersect: false,
      mode: "index"
    },
    plugins: {
      legend: {
        align: "end",
        labels: {
          boxHeight: 8,
          boxWidth: 8,
          color: "#334155",
          font: {
            family: "Arial",
            size: 12,
            weight: 600
          },
          padding: 16,
          usePointStyle: true
        },
        position: "top"
      },
      tooltip: {
        backgroundColor: "#0f172a",
        bodyColor: "#e2e8f0",
        bodyFont: {
          family: "Arial",
          size: 12
        },
        bodySpacing: 4,
        borderColor: "rgba(255, 255, 255, 0.18)",
        borderWidth: 1,
        boxPadding: 4,
        caretPadding: 8,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleColor: "#f8fafc",
        titleFont: {
          family: "Arial",
          size: 13,
          weight: 700
        },
        callbacks: {
          label: (context: TooltipItem<"line">) => {
            const label = context.dataset.label ?? "Value";
            return `${label}: ${context.parsed.y}${valueSuffix}`;
          }
        }
      }
    },
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          display: false
        },
        ticks: {
          autoSkip: true,
          color: "#64748b",
          maxRotation: 0,
          padding: 8
        },
        title: {
          color: "#64748b",
          display: true,
          font: {
            family: "Arial",
            size: 12,
            weight: 600
          },
          text: "Forecast day"
        }
      },
      y: {
        beginAtZero: isPrecipitation,
        border: {
          display: false
        },
        grid: {
          color: "rgba(148, 163, 184, 0.22)",
          drawTicks: false
        },
        max: isPrecipitation ? 100 : undefined,
        min: isPrecipitation ? 0 : undefined,
        ticks: {
          color: "#64748b",
          padding: 8,
          callback: (value) => `${value}${valueSuffix}`
        },
        title: {
          color: "#64748b",
          display: true,
          font: {
            family: "Arial",
            size: 12,
            weight: 600
          },
          text: isPrecipitation
            ? "Probability (%)"
            : `Temperature (${temperatureSuffix})`
        }
      }
    }
  };
}

function ForecastChartStatePanel({
  detail,
  fill = false,
  status,
  title
}: {
  detail: string;
  fill?: boolean;
  status: ForecastChartStatus;
  title: string;
}) {
  const Icon = status === "empty" ? CloudRain : AlertCircle;
  const toneClasses =
    status === "empty"
      ? "border-cyan-100 bg-cyan-50/70 text-cyan-900"
      : "border-amber-100 bg-amber-50/80 text-amber-950";

  return (
    <div
      aria-live={status === "error" ? "assertive" : "polite"}
      className={`flex ${fill ? "h-full" : "h-72"} w-full items-center justify-center rounded-lg border border-dashed p-5 text-center ${toneClasses}`}
      role={status === "error" ? "alert" : "status"}
    >
      <div className="mx-auto max-w-sm">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white/80 ring-1 ring-black/5">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <p className="mt-3 font-semibold">{title}</p>
        <p className="mt-2 text-sm leading-6 opacity-80">{detail}</p>
      </div>
    </div>
  );
}

class ForecastChartErrorBoundary extends Component<
  ForecastChartErrorBoundaryProps,
  ForecastChartErrorBoundaryState
> {
  state: ForecastChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ForecastChartErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function hasRenderableForecastData(
  daily: DailyForecast[],
  mode: ForecastChartMode
) {
  return daily.every((day) => {
    const hasDate = Number.isFinite(new Date(day.date).getTime());

    if (!hasDate) {
      return false;
    }

    if (mode === "precipitation") {
      return (
        Number.isFinite(day.precipitationChance) &&
        day.precipitationChance >= 0 &&
        day.precipitationChance <= 100
      );
    }

    return (
      Number.isFinite(day.temperatureMinC) &&
      Number.isFinite(day.temperatureMaxC) &&
      day.temperatureMinC <= day.temperatureMaxC
    );
  });
}

function buildPrecipitationSummary(values: number[]): ForecastChartSummaryItem[] {
  const peak = Math.max(...values);
  const average = Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );

  return [
    { label: "Peak rain", value: `${peak}%` },
    { label: "Average", value: `${average}%` }
  ];
}

function buildTemperatureSummary(
  minimums: number[],
  maximums: number[],
  units: WeatherUnitPreferences
): ForecastChartSummaryItem[] {
  return [
    {
      label: "Warmest",
      value: formatTemperature(Math.max(...maximums), units.temperature)
    },
    {
      label: "Coolest",
      value: formatTemperature(Math.min(...minimums), units.temperature)
    }
  ];
}
