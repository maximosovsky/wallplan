# Project Architecture: WallPlan Calendar Generator

## Overview
Web-based tool generating printable SVG calendars with a Moleskine-inspired aesthetic. Precision layout for A4, A3, and engineering 914mm paper with three calendar types: Vertical, Gantt, and Box.

## Technology Stack
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Rendering**: Pure SVG (no canvas/HTML tables)
- **Backend (Minimal)**: PHP (`index.php`) for optional state persistence
- **Libraries**: `html2canvas`, `jspdf` for export

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

**`applyViewport()`** — Positions SVG pages on screen:
- Pages side by side (X axis)
- Copies stacked vertically (Y axis) within same page
- Roll paper: trims paper div width to actual content

### 4. Styling System (`style.css`)
- CSS variables: `--mol-paper`, `--mol-ink`, `--mol-ink-light`
- Typography: IBM Plex Sans (calendar), Inter (UI), Cinzel (headers)
- Print: `@media print` ensures WYSIWYG

### 5. Rulers & Guides
- Horizontal/vertical rulers with cm/m switching
- Vertical guides at printable area edges
- Paper sheet visualization (white rectangles)

## Paper Sizes

| Key | Dimensions | Pages | Copies |
|-----|-----------|-------|--------|
| `a4` | 297×210mm | 7-8 months/page | 1 |
| `a3` | 420×297mm | 7-8 months/page | 1 |
| `914mm` | ∞×914mm | all on 1 page | 1 |
| `914x2` | ∞×914mm | all on 1 page | 2 (457mm each) |
| `914x4` | ∞×914mm | all on 1 page | 4 (228mm each) |

## File Structure
- `index.html` / `index.php` — Entry point, UI shell
- `calendar.js` — SVG renderer, viewport, state management
- `style.css` — Themes, print optimization
- `fonts/` — Local font assets (IBM Plex Sans)
