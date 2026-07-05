# My Weather App

A weather dashboard scaffolded with Next.js, React, TypeScript, Tailwind CSS, and Chart.js.

## Current State

The repository now contains a Next.js App Router weather app with a realistic dashboard shell, live weather lookup, typed empty/loading/error states, dynamic weather condition icons, formatter utilities, resilient Chart.js forecast visualizations, Tomorrow brief planning, an Hourly timeline, Smart insights, a keyboard-accessible drawer opened from a hamburger menu, persisted menu preferences, and unit tests. Legacy static HTML/CSS/JS files have been retired so the Next.js app is the single active implementation.

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

The first screen starts in an empty location state instead of showing demo weather. The dashboard then moves through explicit `empty`, `loading`, `ready`, `geo-blocked`, `api-error`, and `no-results` states. The weather API returns stable error codes: `INVALID_QUERY`, `INVALID_COORDINATES`, `NO_RESULTS`, `GEOCODING_UNAVAILABLE`, and `WEATHER_UNAVAILABLE`.

Forecast charts use Chart.js through `react-chartjs-2` for precipitation probability and min/max temperature trends. The chart surface includes responsive labels, styled tooltips, summary chips, chart empty/error handling, and component behavior tests for ready, empty, and invalid-data states.

Open-Meteo hourly forecast data powers the Tomorrow brief, Hourly timeline, and Smart insights sections. The `lib/weather/decision-support.ts` helpers keep best-window selection, next-hour filtering, and practical planning signals testable outside the UI.

The UI is mobile-first: the first screen exposes search and current-location actions immediately, loading and alert states use accessible React components, forecast chart cards shrink safely on narrow phones, and the sun/moon timing view renders compact mobile cards before switching to a desktop table. Legacy loading GIFs, unrelated brand artwork, bitmap chart decorations, and demo weather data are retired.

The hamburger menu is available on mobile and desktop. Its keyboard-accessible drawer provides search/location actions, saved and recent locations, unit preferences, dashboard section jumps, Open-Meteo provider context, last-updated status, and a refresh action after weather data has loaded. Menu preferences are normalized through shared helpers and persisted in `localStorage` with resilient defaults when browser storage is unavailable.

## Project Structure

- `app/` contains Next.js routes, layout, and global styles.
- `app/api/weather/` contains the server-side weather endpoint used by search and geolocation.
- `components/weather/` contains dashboard UI pieces, including metric cards, tomorrow planning, the hourly timeline, smart insights, resilient forecast charts, timing tables, notices, the hamburger menu drawer, and dynamic condition icons.
- `lib/weather/` contains typed weather data helpers, API error contracts, chart series builders, decision-support helpers, sun/moon helpers, the Open-Meteo adapter, menu preference helpers, and unit-aware formatters.
- `tests/` contains unit tests for shared weather logic, decision-support behavior, chart series, forecast chart behavior, provider mapping, astronomy helpers, and component behavior.
- `scripts/audit-consistency.mjs` checks documentation, assets, and test coverage consistency.
- `vercel.json` pins the Vercel framework preset to Next.js for production deployments.

## Migration Notes

The original static app used direct browser geolocation, OpenWeather requests from client-side JavaScript, Bootstrap, and global DOM mutation. Its root HTML files, `css/index.css`, and `js/index.js` have been removed. The new scaffold shifts toward typed React state, a server-side Open-Meteo API boundary, Tailwind styling, and testable utilities.

Legacy loading GIFs, unrelated brand artwork, bitmap chart decorations, and San Francisco sample weather data have also been removed so the product UI and repository stay focused on live weather flows.

## Deployment

The app is configured for Vercel with the Next.js framework preset in `vercel.json`. This avoids static-site fallback behavior when a Vercel project is created before framework auto-detection runs.
