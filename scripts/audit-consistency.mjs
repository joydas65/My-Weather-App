import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const readme = await readFile(join(root, "README.md"), "utf8");
const scaffoldAudit = await readFile(join(root, "docs", "scaffold-audit.md"), "utf8");
const formatterTests = await readFile(join(root, "tests", "formatters.test.ts"), "utf8");
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
const requiredEnvVars = ["OPENWEATHER_API_KEY"];
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

for (const envVar of requiredEnvVars) {
  if (!readme.includes(envVar) || !scaffoldAudit.includes(envVar)) {
    failures.push(`${envVar} is not documented consistently.`);
  }
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

if (failures.length > 0) {
  console.error("Consistency audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Consistency audit passed.");
