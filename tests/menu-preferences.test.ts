import { describe, expect, it } from "vitest";
import {
  addRecentLocation,
  createDefaultWeatherMenuPreferences,
  normalizeWeatherMenuPreferences,
  readWeatherMenuPreferences,
  removeSavedMenuLocation,
  saveMenuLocation,
  updateWeatherUnitPreference,
  WEATHER_MENU_PREFERENCES_KEY,
  writeWeatherMenuPreferences,
  type WeatherMenuLocation,
  type WeatherMenuStorage
} from "@/lib/weather/preferences";

function createLocation(label: string, endpoint: string): WeatherMenuLocation {
  return {
    endpoint,
    id: endpoint.toLowerCase(),
    label,
    updatedAt: "2026-07-04T12:00:00Z"
  };
}

function createStorage(initialValue?: string): WeatherMenuStorage & {
  values: Map<string, string>;
} {
  const values = new Map<string, string>();

  if (initialValue) {
    values.set(WEATHER_MENU_PREFERENCES_KEY, initialValue);
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    values
  };
}

describe("weather menu preferences", () => {
  it("normalizes unit preferences and rejects malformed location entries", () => {
    const preferences = normalizeWeatherMenuPreferences({
      recentLocations: [
        createLocation("London, GB", "/api/weather?q=London"),
        { endpoint: "", label: "Broken" }
      ],
      savedLocations: [createLocation("Paris, FR", "/api/weather?q=Paris")],
      units: {
        pressure: "inhg",
        temperature: "fahrenheit",
        visibility: "mi",
        windSpeed: "mph"
      }
    });

    expect(preferences.units).toEqual({
      pressure: "inhg",
      temperature: "fahrenheit",
      visibility: "mi",
      windSpeed: "mph"
    });
    expect(preferences.recentLocations).toHaveLength(1);
    expect(preferences.savedLocations[0].label).toBe("Paris, FR");
  });

  it("persists menu preferences with a resilient storage contract", () => {
    const storage = createStorage();
    const preferences = updateWeatherUnitPreference(
      createDefaultWeatherMenuPreferences(),
      "temperature",
      "fahrenheit"
    );

    writeWeatherMenuPreferences(preferences, storage);

    expect(readWeatherMenuPreferences(storage).units.temperature).toBe(
      "fahrenheit"
    );
  });

  it("keeps saved and recent locations deduplicated with newest first", () => {
    const london = createLocation("London, GB", "/api/weather?q=London");
    const paris = createLocation("Paris, FR", "/api/weather?q=Paris");
    const updatedLondon = {
      ...london,
      updatedAt: "2026-07-04T13:00:00Z"
    };

    const withLocations = addRecentLocation(
      addRecentLocation(
        saveMenuLocation(
          saveMenuLocation(createDefaultWeatherMenuPreferences(), london),
          paris
        ),
        london
      ),
      updatedLondon
    );

    expect(withLocations.recentLocations).toEqual([updatedLondon]);
    expect(withLocations.savedLocations.map((location) => location.label)).toEqual([
      "Paris, FR",
      "London, GB"
    ]);

    expect(
      removeSavedMenuLocation(withLocations, paris.id).savedLocations
    ).toEqual([london]);
  });
});
