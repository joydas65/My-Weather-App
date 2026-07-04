import { NextResponse } from "next/server";
import {
  fetchWeatherByCoordinates,
  fetchWeatherBySearch,
  WeatherLookupError
} from "@/lib/weather/open-meteo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  try {
    if (query) {
      if (query.length < 2) {
        return NextResponse.json(
          { error: "Enter at least two characters to search." },
          { status: 400 }
        );
      }

      const weather = await fetchWeatherBySearch(query);

      return NextResponse.json({ weather });
    }

    const latitude = parseCoordinate(searchParams.get("lat"));
    const longitude = parseCoordinate(searchParams.get("lon"));

    if (
      latitude === null ||
      longitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Provide a valid location or coordinates." },
        { status: 400 }
      );
    }

    const weather = await fetchWeatherByCoordinates({
      latitude,
      longitude,
      locationName: "Current location",
      country: ""
    });

    return NextResponse.json({ weather });
  } catch (error) {
    const status = error instanceof WeatherLookupError ? error.status : 502;
    const message =
      error instanceof Error
        ? error.message
        : "Weather data is temporarily unavailable.";

    return NextResponse.json({ error: message }, { status });
  }
}

function parseCoordinate(value: string | null) {
  if (value === null) {
    return null;
  }

  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : null;
}
