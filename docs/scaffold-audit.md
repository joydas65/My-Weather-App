# Scaffold Audit

This document records the consistency checks expected from the new scaffold.

## Stack

- Next.js App Router
- React with TypeScript
- Tailwind CSS
- Chart.js through `react-chartjs-2`
- Vitest for formatter, weather-adapter, chart-data, astronomy, and component behavior unit tests

## Runtime Configuration

The live weather data layer uses the local `/api/weather` route, which calls Open-Meteo forecast and geocoding endpoints from the server side. No weather API key is required for this implementation.

Open-Meteo is the live forecast source. Sun timing comes from the forecast response, while moonrise and moonset remain nullable because the current adapter does not receive those values. The data layer estimates moon phase and illumination so the timing table stays useful instead of rendering an empty moon section.

## Audit Scope

`pnpm audit` is intentionally not the consistency audit for this project. The local audit script is `pnpm audit:consistency`, which runs `scripts/audit-consistency.mjs` and checks that:

- README scripts match `package.json`.
- Open-Meteo and the no-key runtime model are documented.
- The Open-Meteo adapter centralizes forecast and geocoding endpoints.
- The local weather API route supports both search and coordinate lookup.
- Weather models include explicit provider metadata, sun/moon timing, and chart series types.
- The dashboard exposes dynamic condition icons, last-updated status, and typed notice states.
- Required public assets are present.
- Vercel deployment configuration pins the framework preset to Next.js.
- The retired legacy static HTML/CSS/JS files remain absent.
- Weather formatter utilities are covered by unit tests.
- Open-Meteo weather-code and response mapping are covered by unit tests.
- Chart-data builders, astronomy helpers, and weather component behavior are covered by unit tests.

Security dependency audits can be added separately once dependencies are installed and locked.
