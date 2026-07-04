import { describe, expect, it } from "vitest";
import {
  createWeatherApiFailure,
  isWeatherApiFailure,
  WEATHER_ERROR_CODES,
  weatherErrorStatus
} from "@/lib/weather/api";

describe("weather API error contract", () => {
  it("defines stable error codes for client state mapping", () => {
    expect(WEATHER_ERROR_CODES).toEqual([
      "INVALID_QUERY",
      "INVALID_COORDINATES",
      "NO_RESULTS",
      "GEOCODING_UNAVAILABLE",
      "WEATHER_UNAVAILABLE"
    ]);
  });

  it("maps validation, no-result, and provider errors to HTTP status codes", () => {
    expect(weatherErrorStatus.INVALID_QUERY).toBe(400);
    expect(weatherErrorStatus.INVALID_COORDINATES).toBe(400);
    expect(weatherErrorStatus.NO_RESULTS).toBe(404);
    expect(weatherErrorStatus.GEOCODING_UNAVAILABLE).toBe(502);
    expect(weatherErrorStatus.WEATHER_UNAVAILABLE).toBe(502);
  });

  it("creates a typed failure payload the client can recognize", () => {
    const payload = createWeatherApiFailure(
      "NO_RESULTS",
      "No matching location was found."
    );

    expect(isWeatherApiFailure(payload)).toBe(true);
    expect(payload).toEqual({
      error: {
        code: "NO_RESULTS",
        message: "No matching location was found."
      }
    });
  });
});
