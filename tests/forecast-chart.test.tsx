import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  buildForecastChartModel,
  ForecastChart
} from "@/components/weather/forecast-chart";
import { createSunMoonTiming } from "@/lib/weather/astronomy";
import type { DailyForecast } from "@/lib/weather/types";

const daily: DailyForecast[] = [
  {
    date: "2026-07-04T12:00:00Z",
    summary: "Clear and dry",
    precipitationChance: 12.4,
    temperatureMinC: 14.2,
    temperatureMaxC: 21.6,
    sunMoon: createSunMoonTiming({
      date: "2026-07-04T12:00:00Z",
      sunrise: "2026-07-04T05:53:00Z",
      sunset: "2026-07-04T20:36:00Z"
    })
  },
  {
    date: "2026-07-05T12:00:00Z",
    summary: "Rain showers",
    precipitationChance: 49.6,
    temperatureMinC: 15.1,
    temperatureMaxC: 24.4,
    sunMoon: createSunMoonTiming({
      date: "2026-07-05T12:00:00Z",
      sunrise: "2026-07-05T05:54:00Z",
      sunset: "2026-07-05T20:35:00Z"
    })
  }
];

describe("forecast chart behavior", () => {
  it("builds a styled precipitation chart model with tooltip labels", () => {
    const model = buildForecastChartModel(daily, "precipitation");

    expect(model.status).toBe("ready");

    if (model.status !== "ready") {
      return;
    }

    expect(model.data.datasets[0].label).toBe("Rain chance");
    expect(model.options.responsive).toBe(true);
    expect(model.options.maintainAspectRatio).toBe(false);
    expect(model.options.interaction).toMatchObject({
      intersect: false,
      mode: "index"
    });
    expect(model.summary).toEqual([
      { label: "Peak rain", value: "50%" },
      { label: "Average", value: "31%" }
    ]);

    const tooltip = model.options.plugins?.tooltip;

    expect(tooltip).toMatchObject({
      backgroundColor: "#0f172a",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true
    });

    if (typeof tooltip === "object") {
      expect(
        tooltip.callbacks?.label?.({
          dataset: { label: "Rain chance" },
          parsed: { y: 50 }
        } as never)
      ).toBe("Rain chance: 50%");
    }
  });

  it("builds a temperature chart model with high and low series", () => {
    const model = buildForecastChartModel(daily, "temperature");

    expect(model.status).toBe("ready");

    if (model.status !== "ready") {
      return;
    }

    expect(model.data.datasets.map((dataset) => dataset.label)).toEqual([
      "High",
      "Low"
    ]);
    expect(model.summary).toEqual([
      { label: "Warmest", value: "24 C" },
      { label: "Coolest", value: "14 C" }
    ]);
    expect(model.ariaLabel).toBe(
      "Daily high and low temperature forecast chart"
    );
  });

  it("renders a polished empty chart state", () => {
    const markup = renderToStaticMarkup(
      <ForecastChart daily={[]} mode="precipitation" />
    );

    expect(markup).toContain("No forecast trend yet");
    expect(markup).toContain("chart-ready forecast data");
    expect(markup).not.toContain("<canvas");
  });

  it("renders a chart-level error state for invalid forecast values", () => {
    const brokenDaily: DailyForecast[] = [
      {
        ...daily[0],
        precipitationChance: Number.NaN
      }
    ];

    const markup = renderToStaticMarkup(
      <ForecastChart daily={brokenDaily} mode="precipitation" />
    );

    expect(markup).toContain("Chart unavailable");
    expect(markup).toContain("outside the expected chart range");
    expect(markup).not.toContain("<canvas");
  });

  it("renders ready chart summaries and a chart canvas", () => {
    const markup = renderToStaticMarkup(
      <ForecastChart daily={daily} mode="temperature" />
    );

    expect(markup).toContain("Warmest");
    expect(markup).toContain("Coolest");
    expect(markup).toContain("<canvas");
    expect(markup).toContain(
      'aria-label="Daily high and low temperature forecast chart"'
    );
  });
});
