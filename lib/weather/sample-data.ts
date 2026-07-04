import type { WeatherReport } from "@/lib/weather/types";
import { createSunMoonTiming } from "@/lib/weather/astronomy";

export const sampleWeather: WeatherReport = {
  current: {
    locationName: "San Francisco",
    country: "US",
    observedAt: "2026-07-04T16:35:00-07:00",
    timezone: "America/Los_Angeles",
    condition: "clouds",
    description: "Partly cloudy",
    icon: "02d",
    isDay: true,
    temperatureC: 19.4,
    feelsLikeC: 18.7,
    humidity: 68,
    pressureHpa: 1015,
    dewPointC: 13.1,
    visibilityMeters: 10000,
    cloudCover: 42,
    windSpeedMs: 5.8,
    windDegree: 274,
    sunrise: "2026-07-04T05:53:00-07:00",
    sunset: "2026-07-04T20:36:00-07:00"
  },
  daily: [
    {
      date: "2026-07-04T12:00:00-07:00",
      summary: "Clouds early, brighter late afternoon",
      precipitationChance: 12,
      temperatureMinC: 14.2,
      temperatureMaxC: 21.4,
      sunMoon: createSunMoonTiming({
        date: "2026-07-04T12:00:00-07:00",
        sunrise: "2026-07-04T05:53:00-07:00",
        sunset: "2026-07-04T20:36:00-07:00",
        moonrise: "2026-07-04T22:11:00-07:00",
        moonset: "2026-07-04T08:42:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-05T12:00:00-07:00",
      summary: "Mild with a steady ocean breeze",
      precipitationChance: 8,
      temperatureMinC: 13.9,
      temperatureMaxC: 22.1,
      sunMoon: createSunMoonTiming({
        date: "2026-07-05T12:00:00-07:00",
        sunrise: "2026-07-05T05:54:00-07:00",
        sunset: "2026-07-05T20:35:00-07:00",
        moonrise: "2026-07-05T22:43:00-07:00",
        moonset: "2026-07-05T09:55:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-06T12:00:00-07:00",
      summary: "Sunny breaks after morning fog",
      precipitationChance: 5,
      temperatureMinC: 14.8,
      temperatureMaxC: 23.6,
      sunMoon: createSunMoonTiming({
        date: "2026-07-06T12:00:00-07:00",
        sunrise: "2026-07-06T05:54:00-07:00",
        sunset: "2026-07-06T20:35:00-07:00",
        moonrise: "2026-07-06T23:12:00-07:00",
        moonset: "2026-07-06T11:06:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-07T12:00:00-07:00",
      summary: "Warmer inland, clear by noon",
      precipitationChance: 4,
      temperatureMinC: 15.1,
      temperatureMaxC: 25.2,
      sunMoon: createSunMoonTiming({
        date: "2026-07-07T12:00:00-07:00",
        sunrise: "2026-07-07T05:55:00-07:00",
        sunset: "2026-07-07T20:35:00-07:00",
        moonrise: "2026-07-07T23:39:00-07:00",
        moonset: "2026-07-07T12:17:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-08T12:00:00-07:00",
      summary: "Dry air with light afternoon wind",
      precipitationChance: 3,
      temperatureMinC: 15.7,
      temperatureMaxC: 24.8,
      sunMoon: createSunMoonTiming({
        date: "2026-07-08T12:00:00-07:00",
        sunrise: "2026-07-08T05:56:00-07:00",
        sunset: "2026-07-08T20:34:00-07:00",
        moonrise: "2026-07-08T00:00:00-07:00",
        moonset: "2026-07-08T13:28:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-09T12:00:00-07:00",
      summary: "Cooler coast, sunny neighborhoods",
      precipitationChance: 6,
      temperatureMinC: 14.4,
      temperatureMaxC: 22.6,
      sunMoon: createSunMoonTiming({
        date: "2026-07-09T12:00:00-07:00",
        sunrise: "2026-07-09T05:56:00-07:00",
        sunset: "2026-07-09T20:34:00-07:00",
        moonrise: "2026-07-09T00:07:00-07:00",
        moonset: "2026-07-09T14:39:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-10T12:00:00-07:00",
      summary: "Patchy low cloud, calm evening",
      precipitationChance: 10,
      temperatureMinC: 13.8,
      temperatureMaxC: 21.9,
      sunMoon: createSunMoonTiming({
        date: "2026-07-10T12:00:00-07:00",
        sunrise: "2026-07-10T05:57:00-07:00",
        sunset: "2026-07-10T20:33:00-07:00",
        moonrise: "2026-07-10T00:37:00-07:00",
        moonset: "2026-07-10T15:50:00-07:00",
        source: "provider"
      })
    },
    {
      date: "2026-07-11T12:00:00-07:00",
      summary: "Bright and comfortable",
      precipitationChance: 7,
      temperatureMinC: 14.5,
      temperatureMaxC: 23.0,
      sunMoon: createSunMoonTiming({
        date: "2026-07-11T12:00:00-07:00",
        sunrise: "2026-07-11T05:58:00-07:00",
        sunset: "2026-07-11T20:33:00-07:00",
        moonrise: "2026-07-11T01:09:00-07:00",
        moonset: "2026-07-11T16:58:00-07:00",
        source: "provider"
      })
    }
  ],
  metadata: {
    provider: "Open-Meteo",
    fetchedAt: "2026-07-04T16:35:00-07:00",
    attribution: "Sample forecast shaped like Open-Meteo output"
  }
};
