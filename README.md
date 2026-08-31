# TrackMe Suite — Tracking Portal & Control Tower

Frontend-only logistics monitoring prototype built with React, TypeScript, Vite/Vinext, Tailwind CSS, Zustand, TanStack Query, and MapLibre.

## Run locally

Use Node 22.13 or newer.

```bash
npm install
npm run dev
```

The default experience is available at `/`. All data and live GPS events come from the typed mock `TrackingService`; the application makes no backend API calls.

## Review routes

Required alternate states are URL-addressable without adding prototype controls to the approved UI:

| View | URL |
| --- | --- |
| Control Tower default | `/?state=default` |
| Control Tower loading | `/?state=loading` |
| Empty tenant | `/?state=empty` |
| Filtered no results | `/?state=no-results` |
| Control Tower error | `/?state=error` |
| Fullscreen Control Tower | `/?fullscreen=1` |
| On Track Trip | `/?view=trip&trip=on-track` |
| At Risk Trip | `/?view=trip&trip=at-risk` |
| Delayed Trip | `/?view=trip&trip=delayed` |
| No Signal Trip | `/?view=trip&trip=no-signal` |
| Completed Trip | `/?view=trip&trip=completed` |
| Trip loading | `/?view=trip&state=trip-loading` |
| Trip partial loading | `/?view=trip&trip=delayed&state=partial` |
| Trip error | `/?view=trip&state=trip-error` |
| Trip not found | `/?view=trip&state=not-found` |
| Fullscreen Trip Detail | `/?view=trip&trip=delayed&fullscreen=1` |

Tablet layouts are responsive at landscape and portrait viewport sizes; no separate build is required.
