import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const readme = await readFile(join(root, "README.md"), "utf8");
const scaffoldAudit = await readFile(join(root, "docs", "scaffold-audit.md"), "utf8");
const formatterTests = await readFile(join(root, "tests", "formatters.test.ts"), "utf8");
const openMeteoTests = await readFile(join(root, "tests", "open-meteo.test.ts"), "utf8");
const weatherApiTests = await readFile(join(root, "tests", "weather-api.test.ts"), "utf8");
const chartDataTests = await readFile(join(root, "tests", "chart-data.test.ts"), "utf8");
const forecastChartTests = await readFile(
  join(root, "tests", "forecast-chart.test.tsx"),
  "utf8"
);
const menuPreferenceTests = await readFile(
  join(root, "tests", "menu-preferences.test.ts"),
  "utf8"
);
const uxStructureTests = await readFile(
  join(root, "tests", "ux-structure.test.ts"),
  "utf8"
);
const astronomyTests = await readFile(join(root, "tests", "astronomy.test.ts"), "utf8");
const weatherComponentTests = await readFile(
  join(root, "tests", "weather-components.test.tsx"),
  "utf8"
);
const weatherTypes = await readFile(join(root, "lib", "weather", "types.ts"), "utf8");
const weatherPreferences = await readFile(
  join(root, "lib", "weather", "preferences.ts"),
  "utf8"
);
const astronomyHelpers = await readFile(
  join(root, "lib", "weather", "astronomy.ts"),
  "utf8"
);
const chartData = await readFile(join(root, "lib", "weather", "chart-data.ts"), "utf8");
const forecastChart = await readFile(
  join(root, "components", "weather", "forecast-chart.tsx"),
  "utf8"
);
const weatherApiContract = await readFile(join(root, "lib", "weather", "api.ts"), "utf8");
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
const weatherMenu = await readFile(
  join(root, "components", "weather", "weather-menu.tsx"),
  "utf8"
);
const homePage = await readFile(join(root, "app", "page.tsx"), "utf8");
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
const retiredLegacyFiles = [
  "index.html",
  "international.html",
  "css/index.css",
  "js/index.js"
];
const retiredProductArtifacts = [
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
  !scaffoldAudit.includes("moon phase and illumination") ||
  !readme.includes("empty`, `loading`, `ready`, `geo-blocked`, `api-error`, and `no-results`") ||
  !scaffoldAudit.includes("empty`, `loading`, `ready`, `geo-blocked`, `api-error`, and `no-results`")
) {
  failures.push("Open-Meteo, no-key runtime, moon-data, and UI state strategy are not documented consistently.");
}

if (
  !readme.includes("Legacy loading GIFs, unrelated brand artwork, bitmap chart decorations, and demo weather data are retired") ||
  !scaffoldAudit.includes("legacy loading GIFs, unrelated brand artwork, bitmap chart decorations, and demo weather data remain absent")
) {
  failures.push("Retired loading assets, unrelated artwork, bitmap chart decorations, and demo data are not documented consistently.");
}

if (
  !readme.includes("resilient Chart.js forecast visualizations") ||
  !readme.includes("chart empty/error handling") ||
  !scaffoldAudit.includes("chart empty and error states") ||
  !scaffoldAudit.includes("ForecastChart component behavior")
) {
  failures.push("Chart.js resilience, empty/error handling, and component behavior expectations are not documented consistently.");
}

if (
  !readme.includes("hamburger menu") ||
  !readme.includes("keyboard-accessible drawer") ||
  !readme.includes("saved and recent locations") ||
  !readme.includes("unit preferences") ||
  !readme.includes("localStorage") ||
  !scaffoldAudit.includes("hamburger menu") ||
  !scaffoldAudit.includes("keyboard-accessible drawer") ||
  !scaffoldAudit.includes("saved and recent locations") ||
  !scaffoldAudit.includes("unit preferences") ||
  !scaffoldAudit.includes("localStorage")
) {
  failures.push("The hamburger menu, location, unit preference, and local persistence expectations are not documented consistently.");
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

const weatherErrorCodes = [
  "INVALID_QUERY",
  "INVALID_COORDINATES",
  "NO_RESULTS",
  "GEOCODING_UNAVAILABLE",
  "WEATHER_UNAVAILABLE"
];

for (const errorCode of weatherErrorCodes) {
  if (
    !weatherApiContract.includes(errorCode) ||
    !weatherApiTests.includes(errorCode) ||
    !readme.includes(errorCode)
  ) {
    failures.push(`${errorCode} is not represented across API contract, tests, and docs.`);
  }
}

if (homePage.includes("sampleWeather") || weatherDashboard.includes("sampleWeather")) {
  failures.push("The app should start with the empty dashboard state, not sample weather.");
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
  !forecastChart.includes("buildForecastChartModel") ||
  !forecastChart.includes("ForecastChartStatePanel") ||
  !forecastChart.includes("ForecastChartErrorBoundary") ||
  !forecastChart.includes("No forecast trend yet") ||
  !forecastChart.includes("Chart unavailable") ||
  !forecastChart.includes("interaction") ||
  !forecastChart.includes("tooltip")
) {
  failures.push("ForecastChart must expose a testable model, styled tooltips, responsive interaction, and chart-specific empty/error states.");
}

if (
  !conditionIcon.includes("WeatherConditionIcon") ||
  !conditionIcon.includes("getWeatherConditionPresentation")
) {
  failures.push("Dynamic weather condition icon behavior is not centralized.");
}

if (
  !weatherDashboard.includes("metadata.fetchedAt") ||
  !weatherDashboard.includes("WEATHER_VIEW_STATES") ||
  !weatherDashboard.includes("WeatherStatePanel") ||
  !weatherDashboard.includes("EmptyStatePanel") ||
  !weatherDashboard.includes("RecoveryPanel") ||
  !weatherDashboard.includes("NoticePanel") ||
  !weatherDashboard.includes("WeatherConditionIcon") ||
  !weatherDashboard.includes("WeatherMenuDrawer") ||
  !weatherDashboard.includes("lastRequest") ||
  !weatherDashboard.includes("refreshWeather") ||
  !weatherDashboard.includes("readWeatherMenuPreferences") ||
  !weatherDashboard.includes("writeWeatherMenuPreferences") ||
  !weatherDashboard.includes("addRecentLocation") ||
  !weatherDashboard.includes("saveCurrentLocation") ||
  !weatherDashboard.includes("changeUnitPreference")
) {
  failures.push("The dashboard must expose last-updated status, typed state panels, notices, dynamic condition icons, menu refresh wiring, and persisted menu preferences.");
}

if (
  !weatherDashboard.includes('aria-label="Open weather menu"') ||
  !weatherDashboard.includes('aria-controls="weather-menu-drawer"') ||
  !weatherDashboard.includes('aria-expanded={isMenuOpen}') ||
  !weatherMenu.includes('role="dialog"') ||
  !weatherMenu.includes('aria-modal="true"') ||
  !weatherMenu.includes('event.key === "Escape"') ||
  !weatherMenu.includes("Search location") ||
  !weatherMenu.includes("Use current location") ||
  !weatherMenu.includes("Locations") ||
  !weatherMenu.includes("Save current location") ||
  !weatherMenu.includes("No saved locations") ||
  !weatherMenu.includes("No recent locations") ||
  !weatherMenu.includes("aria-current") ||
  !weatherMenu.includes("aria-pressed") ||
  !weatherMenu.includes("Temperature") ||
  !weatherMenu.includes("Measurement preferences") ||
  !weatherMenu.includes("Refresh weather") ||
  !weatherMenu.includes("#forecast-charts") ||
  !weatherMenu.includes("#daily-outlook") ||
  !weatherMenu.includes("#sun-moon")
) {
  failures.push("The hamburger menu must stay accessible, keyboard-closeable, and useful for dashboard navigation, saved/recent locations, unit preferences, and refresh actions.");
}

if (
  !weatherPreferences.includes("WEATHER_MENU_PREFERENCES_KEY") ||
  !weatherPreferences.includes("DEFAULT_UNIT_PREFERENCES") ||
  !weatherPreferences.includes("readWeatherMenuPreferences") ||
  !weatherPreferences.includes("writeWeatherMenuPreferences") ||
  !weatherPreferences.includes("addRecentLocation") ||
  !weatherPreferences.includes("saveMenuLocation") ||
  !weatherPreferences.includes("removeSavedMenuLocation") ||
  !weatherPreferences.includes("updateWeatherUnitPreference")
) {
  failures.push("Weather menu preferences must centralize unit, saved location, recent location, and localStorage behavior.");
}

if (
  !weatherDashboard.includes('aria-live="polite"') ||
  !weatherDashboard.includes('role="status"') ||
  !weatherDashboard.includes('role={tone === "error" ? "alert" : "status"}') ||
  !weatherDashboard.includes("LoaderCircle") ||
  !weatherDashboard.includes("weather-loader-bar")
) {
  failures.push("Loading, notices, and recovery states must use accessible React components instead of legacy spinner/toast assets.");
}

if (
  weatherDashboard.includes("next/image") ||
  weatherDashboard.includes("/barometer.png") ||
  weatherDashboard.includes("spinner.gif") ||
  weatherDashboard.includes("loading.gif") ||
  weatherDashboard.includes("walmart")
) {
  failures.push("The dashboard must not use retired bitmap, spinner, loading, or unrelated brand assets.");
}

if (
  !weatherDashboard.includes("flex-col") ||
  !weatherDashboard.includes("sm:flex-row") ||
  !weatherDashboard.includes("lg:flex-row") ||
  !weatherDashboard.includes("lg:grid-cols") ||
  !weatherDashboard.includes("xl:grid-cols") ||
  !weatherDashboard.includes("grid min-w-0 gap-4 xl:grid-cols-2") ||
  !forecastChart.includes("min-w-0 space-y-3") ||
  !forecastChart.includes("h-72 min-w-0 w-full")
) {
  failures.push("The dashboard and forecast charts must keep mobile-first responsive layout classes that prevent narrow-phone overflow.");
}

if (
  !sunMoonTable.includes("md:hidden") ||
  !sunMoonTable.includes("md:block") ||
  sunMoonTable.includes("min-w-[900px]") ||
  sunMoonTable.includes("overflow-x-auto")
) {
  failures.push("The sun/moon timing UI must render mobile cards and a desktop table without wide mobile overflow.");
}

const dashboardStates = [
  "empty",
  "loading",
  "ready",
  "geo-blocked",
  "api-error",
  "no-results"
];

for (const dashboardState of dashboardStates) {
  if (
    !weatherDashboard.includes(`"${dashboardState}"`) ||
    !weatherComponentTests.includes(`"${dashboardState}"`)
  ) {
    failures.push(`${dashboardState} is missing dashboard state implementation or component test coverage.`);
  }
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

for (const legacyFile of retiredLegacyFiles) {
  if (existsSync(join(root, legacyFile))) {
    failures.push(`${legacyFile} should remain retired from the Next.js scaffold.`);
  }
}

for (const artifact of retiredProductArtifacts) {
  if (existsSync(join(root, artifact))) {
    failures.push(`${artifact} should remain retired from the weather product UI.`);
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
  "convertTemperature",
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

const menuPreferenceCoverage = [
  "normalizeWeatherMenuPreferences",
  "readWeatherMenuPreferences",
  "writeWeatherMenuPreferences",
  "updateWeatherUnitPreference",
  "addRecentLocation",
  "saveMenuLocation",
  "removeSavedMenuLocation"
];

for (const coveredName of menuPreferenceCoverage) {
  if (!menuPreferenceTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing menu preference test coverage.`);
  }
}

const openMeteoCoverage = ["mapWeatherCode", "mapOpenMeteoResponse"];

for (const coveredName of openMeteoCoverage) {
  if (!openMeteoTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing Open-Meteo test coverage.`);
  }
}

const weatherApiCoverage = [
  "WEATHER_ERROR_CODES",
  "weatherErrorStatus",
  "createWeatherApiFailure",
  "isWeatherApiFailure"
];

for (const coveredName of weatherApiCoverage) {
  if (!weatherApiTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing weather API contract test coverage.`);
  }
}

const chartDataCoverage = ["buildPrecipitationSeries", "buildTemperatureSeries"];

for (const coveredName of chartDataCoverage) {
  if (!chartDataTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing chart-data test coverage.`);
  }
}

const forecastChartCoverage = [
  "ForecastChart",
  "buildForecastChartModel",
  "No forecast trend yet",
  "Chart unavailable",
  "tooltip",
  "aria-label",
  "fahrenheit"
];

for (const coveredName of forecastChartCoverage) {
  if (!forecastChartTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing forecast chart behavior test coverage.`);
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
  "SunMoonTable",
  "WeatherMenuDrawer"
];

for (const coveredName of componentCoverage) {
  if (!weatherComponentTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing component behavior test coverage.`);
  }
}

const uxStructureCoverage = [
  "retired legacy assets",
  "accessible loading",
  "mobile-first dashboard",
  "hamburger menu",
  "WEATHER_MENU_PREFERENCES_KEY",
  "forecast chart cards",
  "mobile-friendly sun and moon"
];

for (const coveredName of uxStructureCoverage) {
  if (!uxStructureTests.includes(coveredName)) {
    failures.push(`${coveredName} is missing UX structure test coverage.`);
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
