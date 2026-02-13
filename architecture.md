# Project Architecture: WallPlan Calendar Generator

## Overview
Web-based tool generating printable SVG calendars with a Moleskine-inspired aesthetic. Precision layout for A4, A3, and engineering 914mm paper with three calendar types: Vertical, Gantt, and Box. Supports durations from 6 months to 20 years.

## Technology Stack
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Rendering**: Pure SVG (no canvas/HTML tables)
- **PDF Export**: `jspdf` + `svg2pdf.js` (CDN) with embedded IBM Plex Sans fonts
- **Mobile**: Touch pan/pinch-to-zoom, iOS-like bottom toolbar

## Core Components

### 1. SVG Calendar Renderer (`calendar.js`)

#### `generateCalendarSVG(months, emptyRows, weekStart, startOffset, maxMonthsPerPage)`
Generates a complete SVG element with three calendar sections per month column:

**R1–R2: Year & Month Labels**
- Year label shown only at actual year transitions (not repeated on page breaks)
- Font sizes: year 20pt (gray `#999`), month 20pt (ink), 914(1) month 16pt

**R3: Vertical Calendar** — 31 rows × (day number + day-of-week + holiday + week number)
- Row height: `verRowH = 11pt`
- Week separators: thicker horizontal lines at week boundaries
- Holidays: positioned dynamically per format (914(1): x+38, others: x+44)

**R4: Gantt Grid** — Day letters + day numbers header, then `emptyRows` planning rows
- Cell width = `mW / numDays` (equal distribution within month column)
- Cell lines: `0.15pt` gray (`#999`), week separators: `0.2pt` black
- Week numbers: placed only under Monday (week start)

**R5–R6: Box Calendar** — Traditional 7×6 mini grid with week numbers

#### P3: Batch Path Optimization
Grid lines are collected as path data strings during the month loop and emitted as 4 batched `<path>` elements (vertical gray/week, Gantt gray/week) instead of thousands of individual `<line>` elements, significantly reducing DOM count.

#### Width Calculation — Two Modes

| Paper Type | Strategy | mW Formula |
|-----------|----------|-----------|
| **A4/A3** (fixed width) | Aspect ratio fitting | `totalH × printAspect / mpp` |
| **Roll** (914mm) | Cell-width-driven | `minCellMm × 31 × totalH / printH_mm` |

**Roll paper minimum cell widths:**
- 914(1): **4mm** → ~1.5m roll length
- 914(2): **2.7mm** → ~1m roll length
- 914(3): **1.7mm** → ~0.6m roll length

#### Format-Specific Font Scaling
914(1) uses smaller fonts via `F` object overrides:

| Element | Standard | 914(1) |
|---------|----------|--------|
| Vertical month | 20 | 16 |
| Gantt day letters | 3 | 2 |
| Gantt day numbers | 2.5 | 1.8 |
| Box all fonts | 7-15 | 5.5-12 |
| Year border | 1pt | 0.5pt |

#### Border Hierarchy

| Type | Width | Color |
|------|-------|-------|
| Day cells | 0.15pt | gray `#999` |
| Week separator | 0.2pt | black |
| Month | 0.5pt | gray `#999` |
| Quarter | 0.75pt | black |
| Year | 1pt | black |

### 2. Page Building & Copies

**`buildPages(totalMonths, emptyRows, weekStart)`**
- A4/A3: splits months into 7-8 per page (based on rows slider ≥12 → 8mpp)
- Roll paper: all months on single page (`mpp = 999`)
- Copies (914×2, 914×4): clones SVG via `cloneNode(true)`, positions vertically

**Rows slider**: 6/8/10/12 (step 2), controls number of Gantt planning rows

### 3. Viewport System

**`autoFitViewport()`** — Calculates `calendarScale` to fit SVG into printable area:
- Uses `copyH` (paper height / copies) for scaling, not full paper height
- `printH = copyH - 14mm` (7mm margins each side)
- For fixed paper: also constrains by width
- Mobile (<768px): skips ruler gap, adjusts left margin

**`applyViewport()`** — Positions SVG pages on screen:
- Pages side by side (X axis)
- Copies stacked vertically (Y axis) within same page
- Roll paper: trims paper div width to actual content

### 4. Export System

**`downloadSVG()`** — Multi-format SVG export:
- A4/A3: each page as separate `.svg` file
- 914×2/×4: copies combined into single tall SVG using `<g>` offsets
- Filename: `wallplan_{format}_{months}mo_{rows}rows_{DD-MM-YYYY}.svg`

**`printPDF()`** — Programmatic PDF generation:
- Uses `jspdf` + `svg2pdf.js` for vector PDF
- IBM Plex Sans fonts (Light/Regular/Medium) fetched from `fonts/`, cached as base64, registered on each new document
- Falls back to `window.print()` if libraries unavailable
- Filename: `wallplan_{format}_{months}mo_{rows}rows_{DD-MM-YYYY}.pdf`

### 5. Touch & Mobile Support

**Touch events** (capture phase on `window`):
- Single finger: pan (drag viewport)
- Two fingers: pinch-to-zoom (centered on gesture midpoint)
- `requestAnimationFrame` batching for smooth 60fps
- Excludes controls, rulers, toolbar, bottom sheet

**Mobile UI** (`@media max-width: 768px`):
- Desktop controls hidden
- Bottom toolbar (52px, frosted glass `backdrop-filter: blur(16px)`)
- Bottom sheet (slide-up, cubic-bezier animation) with:
  - Duration: two scroll-wheel pickers (years 0–20, months 0–11) with snap-scroll
  - Paper format chips + roll length display (e.g. `· 1.5 m`) for 914mm formats
  - Gantt rows: chip buttons (6 / 8 / 10 / 12)
  - Week start toggle
- Download popup (SVG/PDF) on toolbar icon

### 6. Styling System (`style.css`)
- CSS variables: `--mol-paper`, `--mol-ink`, `--mol-ink-light`
- Typography: IBM Plex Sans (calendar + UI)
- Print: `@media print` ensures WYSIWYG
- `touch-action: none` globally, `auto` on controls
- `pointer-events: none` on `#calendar` (touches pass through to handler)

### 7. Rulers & Guides
- Horizontal/vertical rulers with cm/m switching
- Vertical guides at printable area edges
- Paper sheet visualization (white rectangles)
- Hidden on mobile (<768px)

## Paper Sizes

| Key | Dimensions | Pages | Copies |
|-----|-----------|-------|--------|
| `a4` | 297×210mm | 7-8 months/page | 1 |
| `a3` | 420×297mm | 7-8 months/page | 1 |
| `914mm` | ∞×914mm | all on 1 page | 1 |
| `914x2` | ∞×914mm | all on 1 page | 2 (457mm each) |
| `914x4` | ∞×914mm | all on 1 page | 4 (228mm each) |

## File Structure
- `index.html` — Entry point, UI shell (desktop + mobile)
- `calendar.js` — SVG renderer, viewport, export, touch, mobile UI logic
- `style.css` — Themes, mobile toolkit, print optimization
- `fonts/` — Local font assets (IBM Plex Sans, 14 weights)
