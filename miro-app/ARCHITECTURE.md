# WallPlan Miro App — Architecture

## Overview

WallPlan Miro App is a sidebar plugin that generates multi-year Gantt calendars directly on a Miro board. The calendar is rendered as a single high-resolution SVG image with embedded fonts, placed on the board via the Miro Web SDK.

## Stack

- **Runtime:** Miro Web SDK 2.0
- **UI Framework:** React + TypeScript
- **Build Tool:** Vite
- **Design System:** Mirotone CSS (official Miro UI kit)
- **Fonts:** IBM Plex Sans (loaded at runtime, base64-embedded in SVG)

---

## Module Map

```
src/
├── app.tsx              # Panel UI — settings form (React)
├── index.ts             # SDK entry point — registers panel
├── generator.ts         # Orchestrator — SVG → Miro board image
├── calendar-engine.ts   # Pure date logic — no DOM, no SVG
├── svg-renderer.ts      # SVG string builder — layout + rendering
└── assets/
    └── style.css        # Panel style overrides (Mirotone extensions)
```

### Dependency Flow

```
app.tsx → generator.ts → svg-renderer.ts → calendar-engine.ts
                  ↓
            miro.board.createImage()
```

---

## Calendar Layout (SVG Rows)

The calendar is composed of 6 horizontal rows per month column:

```
┌──────────────────────────────────────────┐
│ R1  Year header (e.g. "2026")            │  yearH = 20mm
├──────────────────────────────────────────┤
│ R2  Month name (e.g. "February")         │  monthH = 30mm
├──────────────────────────────────────────┤
│ R3  Vertical day list (1–31)             │  verRowH × 31 = 341mm
│     Day number + day-of-week letter      │  (hidden when hideDays=true)
│     Weekend rows highlighted in red      │
├──────────────────────────────────────────┤
│ R4  Gantt chart grid                     │  ganttExpandH (= R3 height,
│     Horizontal row lines                 │   or 2× when hideDays)
│     Day-of-week letters + day numbers    │
│     Vertical day separators              │
│     Weekend + week separator lines       │
├──────────────────────────────────────────┤
│ R5  Box calendar header ("February")     │  boxNameH = 28mm
├──────────────────────────────────────────┤
│ R6  Box calendar grid (mini month)       │  boxHeaderH + weeks × boxCellH
│     7-column grid (Mo Tu We Th Fr Sa Su) │
│     Week numbers on left                 │
└──────────────────────────────────────────┘
```

### Key Layout Constants

| Constant     | Value  | Description                              |
|-------------|--------|------------------------------------------|
| `mW`        | 124    | Month column width (~4mm per Gantt day)  |
| `yearH`     | 20     | R1 height                                |
| `monthH`    | 30     | R2 height                                |
| `verRowH`   | 11     | R3 single day row height                 |
| `boxNameH`  | 28     | R5 header height                         |
| `boxHeaderH`| 8      | R6 day-of-week header                    |
| `boxCellH`  | 11     | R6 single week row                       |

All values are in SVG user units (equivalent to millimeters when printed).

---

## Hide Days Mode (Timeline)

When `hideDays = true`:

- **R3** collapses to 0 height (no day list)
- **R4** (Gantt) expands to 2× normal height
- Gantt day grid lines, day-of-week letters, and day numbers are hidden
- Only horizontal row lines remain in Gantt area
- Box calendar (R5–R6) shifts upward

---

## Color Palette

```typescript
const C = {
  paper:    '#FDF6E3',  // cream background
  ink:      '#2C2C2C',  // main text
  inkLight: '#5A5A5A',  // secondary text
  red:      '#C41E3A',  // holidays, weekends, WallPlan Day
  border:   '#C8B89A',  // grid lines
  ganttBg:  '#F5ECD7',  // gantt row background
  weekend:  '#E8D5B7',  // weekend highlight
};
```

---

## Font System

Fonts are loaded at runtime from Google Fonts CDN, converted to base64, and embedded directly into the SVG via `@font-face` declarations. This ensures correct rendering in Miro (which processes SVG as a raster image).

### Loading Pipeline

```
1. Fetch CSS from fonts.googleapis.com (woff2 URLs)
2. Fetch each .woff2 binary
3. Convert ArrayBuffer → base64 string
4. Cache in module-level variable (_fontsLoaded)
5. Inject as <style>@font-face{...}</style> into SVG <defs>
```

### Font Variants Used

| Family         | Weight | Usage                      |
|---------------|--------|----------------------------|
| IBM Plex Sans | 300    | Day numbers, grid labels   |
| IBM Plex Sans | 400    | Month names, general text  |
| IBM Plex Sans | 700    | Year headers, emphasis     |

---

## Generation Pipeline

```
User clicks "Generate ▶"
  1. loadFonts()              — fetch & cache Google Fonts as base64
  2. renderCalendarSVG()      — build complete SVG string
     ├── generateMonths()     — date math, holidays, box weeks
     ├── Build R1–R6 for each month column
     └── Assemble SVG with embedded fonts
  3. svgToDataUrl()           — encode SVG as data:image/svg+xml URI
  4. miro.board.createImage() — place on board
  5. miro.board.viewport.zoomTo() — focus viewport
  6. Store image ID in board appData for cleanup
```

### Board Data Storage

```typescript
await miro.board.setAppData('wallplanIds', [imageId]);
```

Used by `clearCalendar()` to remove previously generated calendars.

---

## Calendar Engine (`calendar-engine.ts`)

Pure TypeScript module with zero DOM dependencies.

### Key Types

```typescript
interface DayData {
  day: number;       // 1–31
  month: number;     // 0-based
  year: number;
  dow: number;       // 0=Mon, 6=Sun
  isWeekend: boolean;
  holiday?: string;
  weekNum?: number;  // ISO week (Mon only)
}

interface MonthData {
  year: number;
  month: number;
  name: string;
  days: DayData[];
  weeks: number[][]; // box calendar grid (rows of 7)
}
```

### Key Functions

| Function | Purpose |
|---|---|
| `generateMonths(startYear, startMonth, count, weekStart)` | Generate array of MonthData with days, holidays, box layout |
| `buildBoxWeeks(year, month, daysInMonth, weekStart)` | Create 7-column grid for mini box calendar |
| `getHolidays(year)` | US Federal Holidays + WallPlan Day (Jan 11) |

---

## Panel UI (`app.tsx`)

React component rendered in Miro sidebar. Uses Mirotone CSS classes.

### Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| Duration (years + months) | number | 1yr 0mo | Total months = years×12 + months |
| Start | month + year | Current | Calendar start date |
| Week Start | toggle | Mon | Monday or Sunday (Sun shown in red) |
| Gantt Rows | 6/8/10/12 | 10 | Number of horizontal Gantt rows |
| Hide Days | checkbox | false | Collapse day list, expand Gantt |

---

## Deployment

### Development

```bash
cd miro-app
npm install
npm run start          # Vite dev server on localhost:3000
```

Configure `App URL = http://localhost:3000` in Miro Developer Dashboard.

### Production

```bash
npm run build          # Output in dist/
```

Host `dist/` on any static server (Vercel, Netlify, GitHub Pages).

### Required OAuth Scopes

- `boards:read` — read board info
- `boards:write` — create/remove items
- `identity:read` — user info

---

## Marketplace Submission

See [APP_SUBMISSION.md](./APP_SUBMISSION.md) for checklist and requirements.

**Review timeline:** 6–8 weeks after submission.
