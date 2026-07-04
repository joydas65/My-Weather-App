import type { WeatherReport } from "@/lib/weather/types";

export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindSpeedUnit = "ms" | "kmh" | "mph";
export type PressureUnit = "hpa" | "inhg";
export type VisibilityUnit = "km" | "mi";

export type WeatherUnitPreferences = {
  pressure: PressureUnit;
  temperature: TemperatureUnit;
  visibility: VisibilityUnit;
  windSpeed: WindSpeedUnit;
};

export type WeatherMenuLocation = {
  endpoint: string;
  id: string;
  label: string;
  updatedAt: string;
};

export type WeatherMenuPreferences = {
  recentLocations: WeatherMenuLocation[];
  savedLocations: WeatherMenuLocation[];
  units: WeatherUnitPreferences;
};

export type WeatherMenuStorage = Pick<Storage, "getItem" | "setItem">;

export const WEATHER_MENU_PREFERENCES_KEY =
  "my-weather-app:menu-preferences:v1";

export const DEFAULT_UNIT_PREFERENCES: WeatherUnitPreferences = {
  pressure: "hpa",
  temperature: "celsius",
  visibility: "km",
  windSpeed: "ms"
};

const MAX_RECENT_LOCATIONS = 5;
const MAX_SAVED_LOCATIONS = 8;

const temperatureUnits: TemperatureUnit[] = ["celsius", "fahrenheit"];
const windSpeedUnits: WindSpeedUnit[] = ["ms", "kmh", "mph"];
const pressureUnits: PressureUnit[] = ["hpa", "inhg"];
const visibilityUnits: VisibilityUnit[] = ["km", "mi"];

export function createDefaultWeatherMenuPreferences(): WeatherMenuPreferences {
  return {
    recentLocations: [],
    savedLocations: [],
    units: { ...DEFAULT_UNIT_PREFERENCES }
  };
}

export function createWeatherMenuLocation(
  weather: WeatherReport,
  endpoint: string,
  updatedAt = weather.metadata.fetchedAt
): WeatherMenuLocation {
  return {
    endpoint,
    id: createLocationId(endpoint),
    label: [weather.current.locationName, weather.current.country]
      .filter(Boolean)
      .join(", "),
    updatedAt
  };
}

export function createLocationId(endpoint: string) {
  return endpoint.trim().toLowerCase();
}

export function normalizeWeatherMenuPreferences(
  value: unknown
): WeatherMenuPreferences {
  const defaults = createDefaultWeatherMenuPreferences();

  if (!isPlainObject(value)) {
    return defaults;
  }

  return {
    recentLocations: normalizeLocationList(
      value.recentLocations,
      MAX_RECENT_LOCATIONS
    ),
    savedLocations: normalizeLocationList(
      value.savedLocations,
      MAX_SAVED_LOCATIONS
    ),
    units: normalizeUnitPreferences(value.units)
  };
}

export function readWeatherMenuPreferences(
  storage: WeatherMenuStorage | null | undefined = getBrowserStorage()
) {
  if (!storage) {
    return createDefaultWeatherMenuPreferences();
  }

  try {
    const rawValue = storage.getItem(WEATHER_MENU_PREFERENCES_KEY);
    return rawValue
      ? normalizeWeatherMenuPreferences(JSON.parse(rawValue))
      : createDefaultWeatherMenuPreferences();
  } catch {
    return createDefaultWeatherMenuPreferences();
  }
}

export function writeWeatherMenuPreferences(
  preferences: WeatherMenuPreferences,
  storage: WeatherMenuStorage | null | undefined = getBrowserStorage()
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      WEATHER_MENU_PREFERENCES_KEY,
      JSON.stringify(normalizeWeatherMenuPreferences(preferences))
    );
  } catch {
    // Local storage may be unavailable in private windows or locked-down browsers.
  }
}

export function updateWeatherUnitPreference<
  UnitName extends keyof WeatherUnitPreferences
>(
  preferences: WeatherMenuPreferences,
  unitName: UnitName,
  value: WeatherUnitPreferences[UnitName]
): WeatherMenuPreferences {
  return normalizeWeatherMenuPreferences({
    ...preferences,
    units: {
      ...preferences.units,
      [unitName]: value
    }
  });
}

export function addRecentLocation(
  preferences: WeatherMenuPreferences,
  location: WeatherMenuLocation
): WeatherMenuPreferences {
  return normalizeWeatherMenuPreferences({
    ...preferences,
    recentLocations: prioritizeLocation(
      preferences.recentLocations,
      location,
      MAX_RECENT_LOCATIONS
    )
  });
}

export function saveMenuLocation(
  preferences: WeatherMenuPreferences,
  location: WeatherMenuLocation
): WeatherMenuPreferences {
  return normalizeWeatherMenuPreferences({
    ...preferences,
    savedLocations: prioritizeLocation(
      preferences.savedLocations,
      location,
      MAX_SAVED_LOCATIONS
    )
  });
}

export function removeSavedMenuLocation(
  preferences: WeatherMenuPreferences,
  locationId: string
): WeatherMenuPreferences {
  return normalizeWeatherMenuPreferences({
    ...preferences,
    savedLocations: preferences.savedLocations.filter(
      (location) => location.id !== locationId
    )
  });
}

export function isMenuLocationSaved(
  preferences: WeatherMenuPreferences,
  locationId?: string
) {
  return Boolean(
    locationId &&
      preferences.savedLocations.some((location) => location.id === locationId)
  );
}

function normalizeUnitPreferences(value: unknown): WeatherUnitPreferences {
  if (!isPlainObject(value)) {
    return { ...DEFAULT_UNIT_PREFERENCES };
  }

  return {
    pressure: pressureUnits.includes(value.pressure as PressureUnit)
      ? (value.pressure as PressureUnit)
      : DEFAULT_UNIT_PREFERENCES.pressure,
    temperature: temperatureUnits.includes(value.temperature as TemperatureUnit)
      ? (value.temperature as TemperatureUnit)
      : DEFAULT_UNIT_PREFERENCES.temperature,
    visibility: visibilityUnits.includes(value.visibility as VisibilityUnit)
      ? (value.visibility as VisibilityUnit)
      : DEFAULT_UNIT_PREFERENCES.visibility,
    windSpeed: windSpeedUnits.includes(value.windSpeed as WindSpeedUnit)
      ? (value.windSpeed as WindSpeedUnit)
      : DEFAULT_UNIT_PREFERENCES.windSpeed
  };
}

function normalizeLocationList(value: unknown, limit: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  const locations = new Map<string, WeatherMenuLocation>();

  for (const candidate of value) {
    const location = normalizeLocation(candidate);

    if (location && !locations.has(location.id)) {
      locations.set(location.id, location);
    }
  }

  return Array.from(locations.values()).slice(0, limit);
}

function normalizeLocation(value: unknown): WeatherMenuLocation | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const endpoint = typeof value.endpoint === "string" ? value.endpoint.trim() : "";
  const label = typeof value.label === "string" ? value.label.trim() : "";

  if (!endpoint || !label) {
    return null;
  }

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : createLocationId(endpoint);

  return {
    endpoint,
    id,
    label,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt.trim()
        ? value.updatedAt.trim()
        : new Date(0).toISOString()
  };
}

function prioritizeLocation(
  locations: WeatherMenuLocation[],
  location: WeatherMenuLocation,
  limit: number
) {
  return [
    location,
    ...locations.filter((candidate) => candidate.id !== location.id)
  ].slice(0, limit);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getBrowserStorage(): WeatherMenuStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
