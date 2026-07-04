import type { MoonPhaseName, SunMoonTiming } from "@/lib/weather/types";

const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

const PHASES: Array<{ maxAge: number; name: MoonPhaseName }> = [
  { maxAge: 1.84566, name: "New moon" },
  { maxAge: 5.53699, name: "Waxing crescent" },
  { maxAge: 9.22831, name: "First quarter" },
  { maxAge: 12.91963, name: "Waxing gibbous" },
  { maxAge: 16.61096, name: "Full moon" },
  { maxAge: 20.30228, name: "Waning gibbous" },
  { maxAge: 23.99361, name: "Last quarter" },
  { maxAge: 27.68493, name: "Waning crescent" },
  { maxAge: SYNODIC_MONTH_DAYS, name: "New moon" }
];

export function estimateMoonPhase(date: string) {
  const dateTime = new Date(date).getTime();
  const daysSinceKnownNewMoon = (dateTime - KNOWN_NEW_MOON_UTC) / DAY_MS;
  const moonAge =
    ((daysSinceKnownNewMoon % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS;
  const phase =
    PHASES.find((candidate) => moonAge < candidate.maxAge)?.name ?? "New moon";
  const illumination = (1 - Math.cos((2 * Math.PI * moonAge) / SYNODIC_MONTH_DAYS)) / 2;

  return {
    phase,
    illumination: Math.round(illumination * 100)
  };
}

export function createSunMoonTiming({
  date,
  sunrise,
  sunset,
  moonrise = null,
  moonset = null,
  source = "estimated"
}: {
  date: string;
  sunrise: string;
  sunset: string;
  moonrise?: string | null;
  moonset?: string | null;
  source?: SunMoonTiming["source"];
}): SunMoonTiming {
  const moon = estimateMoonPhase(date);

  return {
    sunrise,
    sunset,
    moonrise,
    moonset,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    source
  };
}
