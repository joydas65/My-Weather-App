# Scaffold Audit

This document records the consistency checks expected from the new scaffold.

## Stack

- Next.js App Router
- React with TypeScript
- Tailwind CSS
- Chart.js through `react-chartjs-2`
- Vitest for formatter-level unit tests

## Runtime Configuration

The future live weather data layer must read `OPENWEATHER_API_KEY` from server-side environment variables. The key must not be exposed to client components.

## Audit Scope

`pnpm audit` is intentionally not the consistency audit for this project. The local audit script is `pnpm audit:consistency`, which runs `scripts/audit-consistency.mjs` and checks that:

- README scripts match `package.json`.
- `OPENWEATHER_API_KEY` appears in scaffold documentation.
- Required public assets are present.
- The retired legacy static HTML/CSS/JS files remain absent.
- Weather formatter utilities are covered by unit tests.

Security dependency audits can be added separately once dependencies are installed and locked.
