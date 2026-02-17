# WallPlan — Miro App

Multi-year Gantt calendar generator for [Miro](https://miro.com). Generates a complete calendar directly on your Miro board as a high-resolution SVG image.

## Features

- **Duration:** 1 month to 20+ years
- **Custom start date:** any month/year
- **Gantt chart:** 6, 8, 10, or 12 configurable rows
- **Week start:** Monday or Sunday
- **Timeline mode:** hide days for roadmap-level planning
- **US Federal Holidays** with automatic calculation
- **Box calendar** (mini month grid) for each month
- **Week numbers** (ISO standard)
- **Embedded fonts** (IBM Plex Sans) for consistent rendering

## Quick Start

```bash
npm install
npm run start
```

Then add `http://localhost:3000` as the App URL in your [Miro Developer Dashboard](https://developers.miro.com).

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture, module map, SVG layout system |
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user guide with settings explanation |
| [APP_SUBMISSION.md](./APP_SUBMISSION.md) | Marketplace submission checklist |

## Tech Stack

- TypeScript + React
- Vite (build tool)
- Miro Web SDK 2.0
- Mirotone CSS (design system)
- IBM Plex Sans (Google Fonts, base64-embedded)

## Project Structure

```
src/
├── app.tsx              # Panel UI (settings form)
├── index.ts             # SDK entry point
├── generator.ts         # SVG → Miro board orchestrator
├── calendar-engine.ts   # Pure date math (no DOM)
├── svg-renderer.ts      # SVG string builder
└── assets/style.css     # Mirotone overrides
```

## Build

```bash
npm run build    # Output in dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages).

## License

MIT
