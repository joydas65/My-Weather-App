import { describe, expect, it } from "vitest";
import {
  createSunMoonTiming,
  estimateMoonPhase
} from "@/lib/weather/astronomy";

describe("astronomy helpers", () => {
  it("estimates moon phase and illumination from a forecast date", () => {
    expect(estimateMoonPhase("2000-01-06T18:14:00Z")).toEqual({
      phase: "New moon",
      illumination: 0
    });
  });

  it("creates a complete sun/moon timing model with estimated moon data", () => {
    const timing = createSunMoonTiming({
      date: "2026-07-04T12:00:00Z",
      sunrise: "2026-07-04T05:53:00Z",
      sunset: "2026-07-04T20:36:00Z"
    });

    expect(timing).toMatchObject({
      sunrise: "2026-07-04T05:53:00Z",
      sunset: "2026-07-04T20:36:00Z",
      moonrise: null,
      moonset: null,
      source: "estimated"
    });
    expect(timing.moonIllumination).toBeGreaterThanOrEqual(0);
    expect(timing.moonIllumination).toBeLessThanOrEqual(100);
  });
});
