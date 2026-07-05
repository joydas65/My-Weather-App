# Scaffold Audit

This document records the consistency checks expected from the new scaffold.

## Stack

- Next.js App Router
- React with TypeScript
- Tailwind CSS
- Chart.js through `react-chartjs-2`
- Vitest for formatter, weather-adapter, decision-support, chart-data, forecast chart, astronomy, and component behavior unit tests

## Runtime Configuration

The live weather data layer uses the local `/api/weather` route, which calls Open-Meteo forecast and geocoding endpoints from the server side. No weather API key is required for this implementation.

Open-Meteo is the live forecast source. Sun timing comes from the forecast response, while moonrise and moonset remain nullable because the current adapter does not receive those values. The data layer estimates moon phase and illumination so the timing table stays useful instead of rendering an empty moon section.

The dashboard starts without demo weather and asks the user to search or grant location access. Client UX states are explicit: `empty`, `loading`, `ready`, `geo-blocked`, `api-error`, and `no-results`. The weather route returns stable error codes for validation, no-result, geocoding, and forecast-provider failures.

Forecast charts use Chart.js through `react-chartjs-2` and must keep precipitation probability plus min/max temperature concepts. The chart components own responsive labels, styled tooltips, summary context, chart empty and error states, and renderable fallback UI when data is missing or invalid.

Open-Meteo hourly forecast data powers the Tomorrow brief, Hourly timeline, and Smart insights sections. The shared decision-support helpers own next-hour filtering, tomorrow period summaries, best-window selection, and practical planning signals so those behaviors stay testable outside the React components.

The app uses a mobile-first product layout. Search and location actions are available on the first screen, loading and alert states use accessible React components, forecast chart cards shrink safely on narrow phones, and sun/moon timing renders mobile cards before a desktop table. A hamburger menu is available across viewport sizes and opens a keyboard-accessible drawer with search/location actions, saved and recent locations, unit preferences, dashboard section jumps, provider context, last-updated status, and refresh behavior. Menu preferences are normalized through shared helpers and persisted in `localStorage` with resilient defaults when browser storage is unavailable. The audit expects legacy loading GIFs, unrelated brand artwork, bitmap chart decorations, and demo weather data remain absent.

## Audit Scope

`pnpm audit` is intentionally not the consistency audit for this project. The local audit script is `pnpm audit:consistency`, which runs `scripts/audit-consistency.mjs` and checks that:

- README scripts match `package.json`.
- Open-Meteo and the no-key runtime model are documented.
- The Open-Meteo adapter centralizes forecast and geocoding endpoints.
- The local weather API route supports both search and coordinate lookup.
- The weather API exposes stable error codes for invalid input, no results, and provider failures.
- Weather models include explicit provider metadata, sun/moon timing, and chart series types.
- The dashboard exposes dynamic condition icons, last-updated status, and typed empty/loading/error/no-result states.
- Tomorrow brief, Hourly timeline, and Smart insights are backed by typed hourly forecasts and decision-support helpers.
- The hamburger menu exposes a keyboard-accessible drawer with section navigation, location/search actions, saved and recent locations, unit preferences, provider context, and refresh behavior.
- Accessible loading/alert components replace legacy spinner or toast assets.
- Responsive dashboard structure and mobile-friendly sun/moon timing are covered.
- Vercel deployment configuration pins the framework preset to Next.js.
- The retired legacy static HTML/CSS/JS files remain absent.
- Retired legacy loading GIFs, unrelated brand artwork, bitmap chart decorations, and demo data remain absent.
- Weather formatter utilities, including unit-aware conversions, are covered by unit tests.
- Menu preference helpers for localStorage, saved locations, recent locations, and unit preferences are covered by unit tests.
- Open-Meteo weather-code and response mapping are covered by unit tests.
- Weather API error-code mapping is covered by unit tests.
- Decision-support helpers, chart-data builders, ForecastChart component behavior, astronomy helpers, and weather component behavior are covered by unit tests.

Security dependency audits can be added separately once dependencies are installed and locked.
