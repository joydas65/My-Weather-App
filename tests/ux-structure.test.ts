import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const dashboard = read("components/weather/weather-dashboard.tsx");
const sunMoonTable = read("components/weather/sun-moon-table.tsx");

describe("UX structure", () => {
  it("keeps retired legacy assets out of the product", () => {
    const retiredArtifacts = [
      "spinner.gif",
      "loading.gif",
      "walmart-icon.png",
      "noun-barometer-78613.png",
      "public/spinner.gif",
      "public/loading.gif",
      "public/walmart-icon.png",
      "public/barometer.png",
      "lib/weather/sample-data.ts"
    ];

    for (const artifact of retiredArtifacts) {
      expect(existsSync(join(root, artifact))).toBe(false);
    }

    expect(dashboard).not.toContain("next/image");
    expect(dashboard).not.toContain("/barometer.png");
    expect(dashboard).not.toContain("spinner.gif");
    expect(dashboard).not.toContain("loading.gif");
  });

  it("uses accessible loading and alert components instead of old spinners", () => {
    expect(dashboard).toContain("WeatherLoadingPanel");
    expect(dashboard).toContain('aria-live="polite"');
    expect(dashboard).toContain('role="status"');
    expect(dashboard).toContain('role={tone === "error" ? "alert" : "status"}');
    expect(dashboard).toContain("LoaderCircle");
    expect(dashboard).toContain("weather-loader-bar");
  });

  it("keeps the mobile-first dashboard structure useful on first load", () => {
    expect(dashboard).toContain("Choose a location");
    expect(dashboard).toContain("Search a city or use your current location");
    expect(dashboard).toContain("flex-col");
    expect(dashboard).toContain("sm:flex-row");
    expect(dashboard).toContain("lg:flex-row");
    expect(dashboard).toContain("lg:grid-cols");
    expect(dashboard).toContain("xl:grid-cols");
  });

  it("renders mobile-friendly sun and moon cards before the desktop table", () => {
    expect(sunMoonTable).toContain("md:hidden");
    expect(sunMoonTable).toContain("md:block");
    expect(sunMoonTable).not.toContain("min-w-[900px]");
    expect(sunMoonTable).not.toContain("overflow-x-auto");
  });
});
