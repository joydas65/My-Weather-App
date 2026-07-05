import { describe, expect, it } from "vitest";
import {
  mapOpenMeteoResponse,
  mapWeatherCode,
  type OpenMeteoForecastResponse
} from "@/lib/weather/open-meteo";

describe("Open-Meteo weather adapter", () => {
  it("maps WMO weather codes to dashboard metadata", () => {
    expect(mapWeatherCode(0)).toMatchObject({
      condition: "clear",
      description: "Clear sky"
    });
    expect(mapWeatherCode(2)).toMatchObject({
      condition: "clouds",
      description: "Partly cloudy"
    });
    expect(mapWeatherCode(71)).toMatchObject({
      condition: "snow",
      description: "Slight snow"
    });
    expect(mapWeatherCode(95)).toMatchObject({
      condition: "storm",
      description: "Thunderstorm"
    });
  });

  it("normalizes current conditions and daily forecasts for the dashboard", () => {
    const response: OpenMeteoForecastResponse = {
      timezone: "America/Los_Angeles",
      utc_offset_seconds: -25200,
      current: {
        time: 1783144800,
        temperature_2m: 13,
        relative_humidity_2m: 96,
        apparent_temperature: 11.1,
        is_day: 1,
        weather_code: 2,
        cloud_cover: 72,
        pressure_msl: 1015.4,
        wind_speed_10m: 5.1,
        wind_direction_10m: 269,
        dew_point_2m: 12.4,
        visibility: 12200
      },
      daily: {
        time: [1783062000, 1783148400],
        weather_code: [45, 95],
        temperature_2m_max: [21.3, 18],
        temperature_2m_min: [12, 11.7],
        precipitation_probability_max: [2, 1],
        sunrise: [1783083158, 1783169589],
        sunset: [1783136113, 1783222502]
      },
      hourly: {
        time: [1783144800, 1783148400],
        temperature_2m: [13, 14],
        relative_humidity_2m: [96, 88],
        apparent_temperature: [11.1, 12.5],
        is_day: [1, 1],
        weather_code: [2, 61],
        cloud_cover: [72, 82],
        precipitation_probability: [12, 64],
        wind_speed_10m: [5.1, 6.2],
        wind_direction_10m: [269, 271]
      }
    };

    const report = mapOpenMeteoResponse(response, {
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: "San Francisco",
      country: "California, US"
    });

    expect(report.current).toMatchObject({
      locationName: "San Francisco",
      country: "California, US",
      timezone: "America/Los_Angeles",
      condition: "clouds",
      description: "Partly cloudy",
      isDay: true,
      temperatureC: 13,
      feelsLikeC: 11.1,
      humidity: 96,
      pressureHpa: 1015.4,
      dewPointC: 12.4,
      visibilityMeters: 12200,
      cloudCover: 72,
      windSpeedMs: 5.1,
      windDegree: 269
    });
    expect(report.current.observedAt).toBe(
      new Date(1783144800 * 1000).toISOString()
    );
    expect(report.daily).toHaveLength(2);
    expect(report.daily[0]).toMatchObject({
      date: expect.stringMatching(/T12:00:00$/),
      summary: "Foggy visibility",
      precipitationChance: 2,
      temperatureMinC: 12,
      temperatureMaxC: 21.3
    });
    expect(report.daily[0].sunMoon).toMatchObject({
      moonrise: null,
      moonset: null,
      source: "estimated"
    });
    expect(report.daily[1].summary).toBe("Thunderstorm risk");
    expect(report.hourly).toHaveLength(2);
    expect(report.hourly[1]).toMatchObject({
      condition: "rain",
      description: "Slight rain",
      precipitationChance: 64,
      temperatureC: 14,
      windSpeedMs: 6.2
    });
    expect(report.metadata).toMatchObject({
      provider: "Open-Meteo",
      attribution: "Forecast and geocoding data from Open-Meteo"
    });
  });
});
