import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const readme = await readFile(join(root, "README.md"), "utf8");
const scaffoldAudit = await readFile(join(root, "docs", "scaffold-audit.md"), "utf8");
const formatterTests = await readFile(join(root, "tests", "formatters.test.ts"), "utf8");
const openMeteoTests = await readFile(join(root, "tests", "open-meteo.test.ts"), "utf8");
const chartDataTests = await readFile(join(root, "tests", "chart-data.test.ts"), "utf8");
const astronomyTests = await readFile(join(root, "tests", "astronomy.test.ts"), "utf8");
const weatherComponentTests = await readFile(
  join(root, "tests", "weather-components.test.tsx"),
  "utf8"
);
const weatherTypes = await readFile(join(root, "lib", "weather", "types.ts"), "utf8");
const astronomyHelpers = await readFile(
  join(root, "lib", "weather", "astronomy.ts"),
  "utf8"
);
const chartData = await readFile(join(root, "lib", "weather", "chart-data.ts"), "utf8");
const openMeteoAdapter = await readFile(
  join(root, "lib", "weather", "open-meteo.ts"),
  "utf8"
);
const weatherApiRoute = await readFile(
  join(root, "app", "api", "weather", "route.ts"),
  "utf8"
);
const weatherDashboard = await readFile(
  join(root, "components", "weather", "weather-dashboard.tsx"),
  "utf8"
);
const conditionIcon = await readFile(
  join(root, "components", "weather", "weather-condition-icon.tsx"),
  "utf8"
);
const sunMoonTable = await readFile(
  join(root, "components", "weather", "sun-moon-table.tsx"),
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
  !readme.includes("No weather API key is required") ||
  !readme.includes("moon phase and illumination") ||
  !scaffoldAudit.includes("moon phase and illumination")
) {
  failures.push("Open-Meteo, no-key runtime, and moon-data strategy are not documented consistently.");
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

const requiredTypeNames = [
  "SunMoonTiming",
  "WeatherReportMetadata",
  "PrecipitationChartPoint",
  "TemperatureChartPoint"
];

for (const typeName of requiredTypeNames) {
  if (!weatherTypes.includes(typeName)) {
    failures.push(`${typeName} is missing from the shared weather models.`);
  }
}

if (
  !astronomyHelpers.includes("estimateMoonPhase") ||
  !astronomyHelpers.includes("createSunMoonTiming")
) {
  failures.push("Astronomy helpers must expose moon phase and sun/moon timing builders.");
}

if (
  !chartData.includes("PrecipitationChartPoint") ||
  !chartData.includes("TemperatureChartPoint")
) {
  failures.push("Chart-data builders must return typed chart series points.");
}

if (
  !conditionIcon.includes("WeatherConditionIcon") ||
  !conditionIcon.includes("getWeatherConditionPresentation")
) {
  failures.push("Dynamic weather condition icon behavior is not centralized.");
}

if (
  !weatherDashboard.includes("metadata.fetchedAt") ||
  !weatherDashboard.includes("NoticePanel") ||
  !weatherDashboard.includes("WeatherConditionIcon")
) {
  failures.push("The dashboard must expose last-updated status, notices, and dynamic condition icons.");
}

if (
  !sunMoonTable.includes("moonPhase") ||
  !sunMoonTable.includes("moonIllumination") ||
  !sunMoonTable.includes("Not available")
) {
  failures.push("The sun/moon table must show moon phase and explicit unavailable timing states.");
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

const chartDataCoverage = ["buildPrecipitationSeries", "buildTemperatureSeries"];

for (const coveredName of chartDataCoverage) {
  if (!chartDataTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing chart-data test coverage.`);
  }
}

const astronomyCoverage = ["estimateMoonPhase", "createSunMoonTiming"];

for (const coveredName of astronomyCoverage) {
  if (!astronomyTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing astronomy test coverage.`);
  }
}

const componentCoverage = [
  "WeatherConditionIcon",
  "getWeatherConditionPresentation",
  "SunMoonTable"
];

for (const coveredName of componentCoverage) {
  if (!weatherComponentTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing component behavior test coverage.`);
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
