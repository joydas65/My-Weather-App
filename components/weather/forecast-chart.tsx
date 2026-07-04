"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { DailyForecast } from "@/lib/weather/types";
import {
  buildPrecipitationSeries,
  buildTemperatureSeries
} from "@/lib/weather/chart-data";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

type ForecastChartProps = {
  daily: DailyForecast[];
  mode: "precipitation" | "temperature";
};

export function ForecastChart({ daily, mode }: ForecastChartProps) {
  const precipitation = buildPrecipitationSeries(daily);
  const temperature = buildTemperatureSeries(daily);
  const labels = precipitation.map((item) => item.label);
  const isPrecipitation = mode === "precipitation";

  const data = isPrecipitation
    ? {
        labels,
        datasets: [
          {
            label: "Rain chance",
            data: precipitation.map((item) => item.value),
            borderColor: "#0891b2",
            backgroundColor: "rgba(8, 145, 178, 0.14)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      }
    : {
        labels,
        datasets: [
          {
            label: "High",
            data: temperature.map((item) => item.max),
            borderColor: "#e11d48",
            backgroundColor: "rgba(225, 29, 72, 0.08)",
            fill: false,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Low",
            data: temperature.map((item) => item.min),
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.08)",
            fill: false,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };

  return (
    <div className="h-72 w-full">
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              labels: {
                boxWidth: 12,
                color: "#334155",
                font: {
                  family: "Arial"
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const suffix = isPrecipitation ? "%" : " C";
                  return `${context.dataset.label}: ${context.parsed.y}${suffix}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: "#64748b"
              }
            },
            y: {
              beginAtZero: isPrecipitation,
              suggestedMax: isPrecipitation ? 100 : undefined,
              ticks: {
                color: "#64748b",
                callback: (value) => `${value}${isPrecipitation ? "%" : " C"}`
              },
              grid: {
                color: "rgba(148, 163, 184, 0.22)"
              }
            }
          }
        }}
      />
    </div>
  );
}
