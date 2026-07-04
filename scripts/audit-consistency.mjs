import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const readme = await readFile(join(root, "README.md"), "utf8");
const scaffoldAudit = await readFile(join(root, "docs", "scaffold-audit.md"), "utf8");
const formatterTests = await readFile(join(root, "tests", "formatters.test.ts"), "utf8");
const openMeteoTests = await readFile(join(root, "tests", "open-meteo.test.ts"), "utf8");
const openMeteoAdapter = await readFile(
  join(root, "lib", "weather", "open-meteo.ts"),
  "utf8"
);
const weatherApiRoute = await readFile(
  join(root, "app", "api", "weather", "route.ts"),
  "utf8"
);
const vercelConfig = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));

const requiredScripts = [
  "dev",
  "build",
  "start",
  "lint",
  "test",
  "audit:consistency",
  "check"
];
const requiredPublicAssets = ["barometer.png", "spinner.gif", "loading.gif"];
const retiredLegacyFiles = [
  "index.html",
  "international.html",
  "css/index.css",
  "js/index.js"
];

const failures = [];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    failures.push(`package.json is missing the ${script} script.`);
  }

  if (!readme.includes(`pnpm ${script}`)) {
    failures.push(`README.md does not document pnpm ${script}.`);
  }
}

if (
  !readme.includes("Open-Meteo") ||
  !scaffoldAudit.includes("Open-Meteo") ||
  !readme.includes("No weather API key is required")
) {
  failures.push("Open-Meteo and its no-key runtime model are not documented consistently.");
}

if (readme.includes("OPENWEATHER_API_KEY") || scaffoldAudit.includes("OPENWEATHER_API_KEY")) {
  failures.push("OpenWeather environment key documentation should remain retired.");
}

if (
  !openMeteoAdapter.includes("https://api.open-meteo.com/v1/forecast") ||
  !openMeteoAdapter.includes("https://geocoding-api.open-meteo.com/v1/search")
) {
  failures.push("Open-Meteo forecast and geocoding endpoints are not centralized in the adapter.");
}

if (
  !weatherApiRoute.includes("fetchWeatherByCoordinates") ||
  !weatherApiRoute.includes("fetchWeatherBySearch")
) {
  failures.push("The weather API route must use both coordinate and search lookup paths.");
}

if (vercelConfig.framework !== "nextjs") {
  failures.push("vercel.json must pin the Vercel framework preset to nextjs.");
}

if (!readme.includes("vercel.json") || !scaffoldAudit.includes("Vercel deployment configuration")) {
  failures.push("Vercel deployment configuration is not documented consistently.");
}

for (const asset of requiredPublicAssets) {
  if (!existsSync(join(root, "public", asset))) {
    failures.push(`public/${asset} is missing.`);
  }
}

for (const legacyFile of retiredLegacyFiles) {
  if (existsSync(join(root, legacyFile))) {
    failures.push(`${legacyFile} should remain retired from the Next.js scaffold.`);
  }
}

if (readme.includes("legacy static files are still present")) {
  failures.push("README.md still says the legacy static files are present.");
}

if (!readme.includes("Legacy static HTML/CSS/JS files have been retired")) {
  failures.push("README.md does not document the retired legacy files.");
}

if (!scaffoldAudit.includes("legacy static HTML/CSS/JS files remain absent")) {
  failures.push("docs/scaffold-audit.md does not document the legacy-file audit.");
}

const formatterNames = [
  "formatTemperature",
  "formatPercent",
  "formatPressure",
  "formatVisibility",
  "formatWindSpeed",
  "getWindDirection",
  "getSunEventStatus"
];

for (const formatterName of formatterNames) {
  if (!formatterTests.includes(formatterName)) {
    failures.push(`${formatterName} is missing formatter test coverage.`);
  }
}

const openMeteoCoverage = ["mapWeatherCode", "mapOpenMeteoResponse"];

for (const coveredName of openMeteoCoverage) {
  if (!openMeteoTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing Open-Meteo test coverage.`);
  }
}

if (failures.length > 0) {
  console.error("Consistency audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Consistency audit passed.");
