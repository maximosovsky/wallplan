# WallPlan Miro App — Architecture

## Overview

WallPlan Miro App is a sidebar plugin that generates multi-year Gantt calendars directly on a Miro board. The calendar is rendered as **native Miro board elements** (text, shapes, frames) via the Miro Web SDK, making all elements fully editable by users.

## Stack

- **Runtime:** Miro Web SDK 2.0
- **UI Framework:** React + TypeScript
- **Build Tool:** Vite
- **Design System:** Mirotone CSS (official Miro UI kit)
- **Fonts:** IBM Plex Sans (`plex_sans` — native Miro font)

---

## Module Map

```
src/
├── app.tsx              # Panel UI — settings form (React)
├── index.ts             # SDK entry point — registers panel
├── generator.ts         # Orchestrator — delegates to native-generator
├── native-generator.ts  # Native Miro elements builder (text, shapes, frames)
├── calendar-engine.ts   # Pure date logic — no DOM, no SVG
├── svg-renderer.ts      # SVG string builder (legacy, kept for reference)
└── assets/
    └── style.css        # Panel style overrides (Mirotone extensions)
```

### Dependency Flow

```
app.tsx → generator.ts → native-generator.ts → calendar-engine.ts
                                ↓
                    miro.board.createText()
                    miro.board.createShape()
                    miro.board.createFrame()
```

---

## Calendar Layout (Rows)

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
│     Week numbers on right                │
└──────────────────────────────────────────┘
```

### Key Layout Constants

All base values are multiplied by `SCALE = 16` to produce Miro dp units:

| Constant     | Base   | Miro dp | Description                              |
|-------------|--------|---------|------------------------------------------|
| `mW`        | 124    | 1984    | Month column width                       |
| `yearH`     | 20     | 320     | R1 height                                |
| `monthH`    | 30     | 480     | R2 height                                |
| `verRowH`   | 11     | 176     | R3 single day row height                 |
| `boxNameH`  | 28     | 448     | R5 header height                         |
| `boxHeaderH`| 8      | 128     | R6 day-of-week header                    |
| `boxCellH`  | 11     | 176     | R6 single week row                       |
| `PAD_L`     | —      | 60      | Left text padding                        |
| `LINE_W`    | —      | 14      | Grid line thickness                      |

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

Native Miro text elements use the built-in `plex_sans` font family (IBM Plex Sans). No font loading or embedding is needed — Miro handles font rendering natively.

> **Note:** Copper Penny DTP (used for WallPlan Day in the web version) is not available in Miro SDK. WallPlan Day labels use `plex_sans` instead.

---

## Generation Pipeline

```
User clicks "Generate ▶"
  1. generateMonths()              — date math, holidays, box weeks
  2. Compute layout dimensions     — totalW, totalH, Y offsets for R1–R6
  3. createFrame()                 — background frame (#FDF6E3)
  4. Full-width horizontal lines   — merged R3 separators (31) + Gantt rows
  5. Month borders (vertical)      — year/quarter/month boundaries
  6. Progressive rendering:
     ├── Phase 1: first 3 months   — generateMonth() × 3
     ├── zoomTo(frame)             — user sees results immediately
     └── Phase 2: remaining months — generateMonth() × (N-3)
  7. Year labels                   — one per year boundary
  8. group({ items: allItems })    — group all elements
  9. Store frame ID in appData     — for future reference
```

### Optimizations

| Technique | Effect |
|-----------|--------|
| No `.sync()` calls | Styles passed in `createText()`/`createShape()` constructor |
| Merged horizontal lines | R3: 360→31 shapes, Gantt: 120→10 shapes |
| `BATCH_SIZE = 50` | 50 parallel `Promise.all()` calls per batch |
| Direct object storage | `allItems[]` stores Miro objects, no `getById()` loop for grouping |
| Progressive rendering | 3 months → zoom → rest. UX feels ~3× faster |
| Per-month batching | Box calendar ~40 elements/month, prevents API overload |

Previous calendars are **not deleted** on re-generate — new calendars are created alongside existing ones.

### Board Data Storage

```typescript
await miro.board.setAppData('wallplanIds', [frame.id]);
```

Stores the frame ID for reference. Previous calendars are preserved.

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

Hosted on Vercel: [wallplan-miro.vercel.app](https://wallplan-miro.vercel.app/)

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
