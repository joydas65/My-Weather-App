# My Weather App

A weather dashboard scaffolded with Next.js, React, TypeScript, Tailwind CSS, and Chart.js.

## Current State

The repository now contains a Next.js App Router weather app with a realistic dashboard shell, live weather lookup, typed fallback sample data, dynamic weather condition icons, formatter utilities, Chart.js forecast visualizations, and unit tests. Legacy static HTML/CSS/JS files have been retired so the Next.js app is the single active implementation.

## Tech Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Chart.js via `react-chartjs-2`
- Vitest
- ESLint

## Local Setup

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Create a production build:

```bash
pnpm build
```

Run the production server after building:

```bash
pnpm start
```

Run lint checks:

```bash
pnpm lint
```

Run unit tests:

```bash
pnpm test
```

Run scaffold consistency audit:

```bash
pnpm audit:consistency
```

Run the full local check suite:

```bash
pnpm check
```

## Environment

No weather API key is required for the current live weather flow. Browser search and geolocation call the local `/api/weather` route, which fetches forecast and geocoding data from Open-Meteo on the server side.

Open-Meteo provides sun timing but not moonrise or moonset in the current adapter. The app keeps moon timing nullable, estimates moon phase and illumination from the forecast date, and renders unavailable moon timing explicitly.

## Project Structure

- `app/` contains Next.js routes, layout, and global styles.
- `app/api/weather/` contains the server-side weather endpoint used by search and geolocation.
- `components/weather/` contains dashboard UI pieces, including metric cards, forecast charts, timing tables, notices, and dynamic condition icons.
- `lib/weather/` contains typed weather data helpers, chart series builders, sun/moon helpers, the Open-Meteo adapter, and formatters.
- `tests/` contains unit tests for shared weather logic, chart series, provider mapping, astronomy helpers, and component behavior.
- `scripts/audit-consistency.mjs` checks documentation, assets, and test coverage consistency.
- `public/` contains static assets used by the Next.js app.
- `vercel.json` pins the Vercel framework preset to Next.js for production deployments.

## Migration Notes

The original static app used direct browser geolocation, OpenWeather requests from client-side JavaScript, Bootstrap, and global DOM mutation. Its root HTML files, `css/index.css`, and `js/index.js` have been removed. The new scaffold shifts toward typed React state, a server-side Open-Meteo API boundary, Tailwind styling, and testable utilities.

## Deployment

The app is configured for Vercel with the Next.js framework preset in `vercel.json`. This avoids static-site fallback behavior when a Vercel project is created before framework auto-detection runs.
