import type {
  DailyForecast,
  WeatherCondition,
  WeatherReport
} from "@/lib/weather/types";
import { createSunMoonTiming } from "@/lib/weather/astronomy";
import { WeatherLookupError } from "@/lib/weather/api";

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

const CURRENT_VARIABLES = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "dew_point_2m",
  "visibility"
];

const DAILY_VARIABLES = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "sunrise",
  "sunset"
];

type OpenMeteoCurrent = {
  time?: number;
  temperature_2m?: number;
  relative_humidity_2m?: number;
  apparent_temperature?: number;
  is_day?: number;
  weather_code?: number;
  cloud_cover?: number;
  pressure_msl?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  dew_point_2m?: number;
  visibility?: number;
};

type OpenMeteoDaily = {
  time?: number[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_probability_max?: number[];
  sunrise?: number[];
  sunset?: number[];
};

export type OpenMeteoForecastResponse = {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: OpenMeteoCurrent;
  daily?: OpenMeteoDaily;
};

type OpenMeteoSearchResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
};

type OpenMeteoSearchResponse = {
  results?: OpenMeteoSearchResult[];
};

type WeatherLocation = {
  latitude: number;
  longitude: number;
  locationName: string;
  country: string;
};

type WeatherCodeMetadata = {
  condition: WeatherCondition;
  description: string;
  summary: string;
};

const WEATHER_CODES: Record<number, WeatherCodeMetadata> = {
  0: {
    condition: "clear",
    description: "Clear sky",
    summary: "Clear and dry"
  },
  1: {
    condition: "clear",
    description: "Mainly clear",
    summary: "Mostly clear"
  },
  2: {
    condition: "clouds",
    description: "Partly cloudy",
    summary: "Sun and cloud mix"
  },
  3: {
    condition: "clouds",
    description: "Overcast",
    summary: "Cloudy skies"
  },
  45: {
    condition: "mist",
    description: "Fog",
    summary: "Foggy visibility"
  },
  48: {
    condition: "mist",
    description: "Depositing rime fog",
    summary: "Foggy visibility"
  },
  51: {
    condition: "rain",
    description: "Light drizzle",
    summary: "Light drizzle"
  },
  53: {
    condition: "rain",
    description: "Drizzle",
    summary: "Drizzle likely"
  },
  55: {
    condition: "rain",
    description: "Dense drizzle",
    summary: "Steady drizzle"
  },
  56: {
    condition: "rain",
    description: "Freezing drizzle",
    summary: "Freezing drizzle"
  },
  57: {
    condition: "rain",
    description: "Dense freezing drizzle",
    summary: "Freezing drizzle"
  },
  61: {
    condition: "rain",
    description: "Slight rain",
    summary: "Light rain"
  },
  63: {
    condition: "rain",
    description: "Rain",
    summary: "Rain likely"
  },
  65: {
    condition: "rain",
    description: "Heavy rain",
    summary: "Heavy rain"
  },
  66: {
    condition: "rain",
    description: "Freezing rain",
    summary: "Freezing rain"
  },
  67: {
    condition: "rain",
    description: "Heavy freezing rain",
    summary: "Freezing rain"
  },
  71: {
    condition: "snow",
    description: "Slight snow",
    summary: "Light snow"
  },
  73: {
    condition: "snow",
    description: "Snow",
    summary: "Snow likely"
  },
  75: {
    condition: "snow",
    description: "Heavy snow",
    summary: "Heavy snow"
  },
  77: {
    condition: "snow",
    description: "Snow grains",
    summary: "Snow grains"
  },
  80: {
    condition: "rain",
    description: "Slight rain showers",
    summary: "Light showers"
  },
  81: {
    condition: "rain",
    description: "Rain showers",
    summary: "Rain showers"
  },
  82: {
    condition: "rain",
    description: "Violent rain showers",
    summary: "Heavy showers"
  },
  85: {
    condition: "snow",
    description: "Slight snow showers",
    summary: "Snow showers"
  },
  86: {
    condition: "snow",
    description: "Heavy snow showers",
    summary: "Heavy snow showers"
  },
  95: {
    condition: "storm",
    description: "Thunderstorm",
    summary: "Thunderstorm risk"
  },
  96: {
    condition: "storm",
    description: "Thunderstorm with hail",
    summary: "Storms with hail"
  },
  99: {
    condition: "storm",
    description: "Severe thunderstorm with hail",
    summary: "Severe storms"
  }
};

export function mapWeatherCode(code: number | undefined): WeatherCodeMetadata {
  if (code === undefined) {
    return {
      condition: "clouds",
      description: "Weather unavailable",
      summary: "Conditions unavailable"
    };
  }

  return (
    WEATHER_CODES[code] ?? {
      condition: "clouds",
      description: "Weather unavailable",
      summary: "Conditions unavailable"
    }
  );
}

export async function fetchWeatherBySearch(query: string) {
  const params = new URLSearchParams({
    count: "1",
    format: "json",
    language: "en",
    name: query
  });
  const response = await fetch(`${GEOCODING_ENDPOINT}?${params.toString()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new WeatherLookupError(
      "GEOCODING_UNAVAILABLE",
      "Location search is temporarily unavailable."
    );
  }

  const search = (await response.json()) as OpenMeteoSearchResponse;
  const result = search.results?.[0];

  if (!result) {
    throw new WeatherLookupError(
      "NO_RESULTS",
      "No matching location was found."
    );
  }

  return fetchWeatherByCoordinates({
    latitude: result.latitude,
    longitude: result.longitude,
    locationName: result.name,
    country: [result.admin1, result.country_code ?? result.country]
      .filter(Boolean)
      .join(", ")
  });
}

export async function fetchWeatherByCoordinates(location: WeatherLocation) {
  const params = new URLSearchParams({
    current: CURRENT_VARIABLES.join(","),
    daily: DAILY_VARIABLES.join(","),
    forecast_days: "8",
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timeformat: "unixtime",
    timezone: "auto",
    wind_speed_unit: "ms"
  });
  const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new WeatherLookupError(
      "WEATHER_UNAVAILABLE",
      "Weather data is temporarily unavailable."
    );
  }

  const forecast = (await response.json()) as OpenMeteoForecastResponse;

  return mapOpenMeteoResponse(forecast, location);
}

export function mapOpenMeteoResponse(
  response: OpenMeteoForecastResponse,
  location: WeatherLocation
): WeatherReport {
  const current = response.current;
  const daily = response.daily;
  const timezone = response.timezone ?? "UTC";
  const utcOffsetSeconds = response.utc_offset_seconds ?? 0;

  if (!current || !daily?.time?.length) {
    throw new WeatherLookupError(
      "WEATHER_UNAVAILABLE",
      "Weather provider returned an incomplete forecast."
    );
  }

  const currentWeather = mapWeatherCode(current.weather_code);
  const dailyForecasts: DailyForecast[] = daily.time.map((time, index) => {
    const dayWeather = mapWeatherCode(daily.weather_code?.[index]);

    return {
      date: unixToForecastDate(time, utcOffsetSeconds),
      summary: dayWeather.summary,
      precipitationChance: numberAt(
        daily.precipitation_probability_max,
        index,
        "daily precipitation"
      ),
      temperatureMinC: numberAt(
        daily.temperature_2m_min,
        index,
        "daily low temperature"
      ),
      temperatureMaxC: numberAt(
        daily.temperature_2m_max,
        index,
        "daily high temperature"
      ),
      sunMoon: createSunMoonTiming({
        date: unixToForecastDate(time, utcOffsetSeconds),
        sunrise: unixToIso(numberAt(daily.sunrise, index, "daily sunrise")),
        sunset: unixToIso(numberAt(daily.sunset, index, "daily sunset")),
        source: "estimated"
      })
    };
  });

  return {
    current: {
      locationName: location.locationName,
      country: location.country,
      observedAt: unixToIso(requiredNumber(current.time, "current time")),
      timezone,
      condition: currentWeather.condition,
      description: currentWeather.description,
      icon: String(current.weather_code ?? ""),
      isDay: current.is_day === 1,
      temperatureC: requiredNumber(current.temperature_2m, "current temperature"),
      feelsLikeC: requiredNumber(
        current.apparent_temperature,
        "current apparent temperature"
      ),
      humidity: requiredNumber(current.relative_humidity_2m, "current humidity"),
      pressureHpa: requiredNumber(current.pressure_msl, "current pressure"),
      dewPointC: requiredNumber(current.dew_point_2m, "current dew point"),
      visibilityMeters: requiredNumber(current.visibility, "current visibility"),
      cloudCover: requiredNumber(current.cloud_cover, "current cloud cover"),
      windSpeedMs: requiredNumber(current.wind_speed_10m, "current wind speed"),
      windDegree: requiredNumber(
        current.wind_direction_10m,
        "current wind direction"
      ),
      sunrise: unixToIso(numberAt(daily.sunrise, 0, "current sunrise")),
      sunset: unixToIso(numberAt(daily.sunset, 0, "current sunset"))
    },
    daily: dailyForecasts,
    metadata: {
      provider: "Open-Meteo",
      fetchedAt: new Date().toISOString(),
      attribution: "Forecast and geocoding data from Open-Meteo"
    }
  };
}

function requiredNumber(value: number | undefined, label: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new WeatherLookupError(
      "WEATHER_UNAVAILABLE",
      `Weather provider omitted ${label}.`
    );
  }

  return value;
}

function numberAt(values: number[] | undefined, index: number, label: string) {
  return requiredNumber(values?.[index], label);
}

function unixToIso(seconds: number) {
  return new Date(seconds * 1000).toISOString();
}

function unixToForecastDate(seconds: number, utcOffsetSeconds: number) {
  const localDate = new Date((seconds + utcOffsetSeconds) * 1000)
    .toISOString()
    .slice(0, 10);

  return `${localDate}T12:00:00`;
}
