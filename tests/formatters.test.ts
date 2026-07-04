import { describe, expect, it } from "vitest";
import {
  convertTemperature,
  formatPercent,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
  getSunEventStatus,
  getWindDirection
} from "@/lib/weather/formatters";

describe("weather formatters", () => {
  it("formats user-facing numeric values with stable units", () => {
    expect(formatTemperature(21.6)).toBe("22 C");
    expect(formatPercent(68.4)).toBe("68%");
    expect(formatPressure(1015.4)).toBe("1015 hPa");
    expect(formatVisibility(10000)).toBe("10.0 km");
    expect(formatWindSpeed(5.84)).toBe("5.8 m/s");
  });

  it("formats values with persisted unit preferences", () => {
    expect(convertTemperature(21, "fahrenheit")).toBeCloseTo(69.8);
    expect(formatTemperature(21, "fahrenheit")).toBe("70 F");
    expect(formatPressure(1013.25, "inhg")).toBe("29.92 inHg");
    expect(formatVisibility(1609.344, "mi")).toBe("1.0 mi");
    expect(formatWindSpeed(10, "kmh")).toBe("36.0 km/h");
    expect(formatWindSpeed(10, "mph")).toBe("22.4 mph");
  });

  it("maps wind degrees to compass directions", () => {
    expect(getWindDirection(0)).toBe("N");
    expect(getWindDirection(90)).toBe("E");
    expect(getWindDirection(181)).toBe("S");
    expect(getWindDirection(274)).toBe("W");
    expect(getWindDirection(-45)).toBe("NW");
  });

  it("keeps sunrise and sunset status consistent with the observed time", () => {
    expect(
      getSunEventStatus(
        "2026-07-04T04:00:00-07:00",
        "2026-07-04T05:53:00-07:00",
        "2026-07-04T20:36:00-07:00"
      )
    ).toEqual({
      sunrise: "Not risen",
      sunset: "Not set"
    });

    expect(
      getSunEventStatus(
        "2026-07-04T16:35:00-07:00",
        "2026-07-04T05:53:00-07:00",
        "2026-07-04T20:36:00-07:00"
      )
    ).toEqual({
      sunrise: "Risen",
      sunset: "Not set"
    });

    expect(
      getSunEventStatus(
        "2026-07-04T22:00:00-07:00",
        "2026-07-04T05:53:00-07:00",
        "2026-07-04T20:36:00-07:00"
      )
    ).toEqual({
      sunrise: "Risen",
      sunset: "Set"
    });
  });
});
