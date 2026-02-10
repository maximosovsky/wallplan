# Project Architecture: Moleskine-Inspired Calendar Generator

## Overview
This project is a web-based tool designed to generate printable calendars with a premium, Moleskine-like aesthetic. It focuses on precision layout for various paper sizes (A4, A3, Engineering 914mm) and flexible configuration (vertical/horizontal layouts, week start, holidays).

## Technology Stack
- **Frontend**: Vanilla JavaScript, CSS3 (CSS Variables), HTML5.
- **Backend (Minimal)**: PHP (`index.php`) for optional server-side operations (saving states).
- **Libraries**:
    - `html2canvas` (for saving images).
    - `jspdf` (for PDF generation).

## Core Components

### 1. Calendar Logic (`calendar.js`)
The heart of the application.
- **`generateCalendar(months, emptyRows, weekStart, startOffset)`**: 
    - Generates the HTML table structure string.
    - Handles both "Vertical" (classic) and "Gantt" (horizontal days) layouts.
    - Logic for separating years, adding spacers, and calculating holidays.
- **`autoFitViewport()`**: 
    - **Critical Feature**. Dynamically sizes column widths to fit the target paper size.
    - **Algorithm**: 
        1. **Trial**: Sets excessively wide columns to force minimum height.
        2. **Measure**: precise calculation of overhead (borders, spacers, padding).
        3. **Iterate**: Uses a 3-pass loop to converge on the exact column width that fits `N` months into the `printWidth` (minus a 3mm safety buffer) while accounting for the `scale` factor which changes with content height.
    - For **914mm formats** (`w: null`): Skips width fitting, computes `calendarScale` from `printH / contentH`. For copies mode with `copyH`, scales each copy individually.
    - **Compact Gantt cells**: For 914mm single format, dynamically sets cell widths to achieve exact mm-on-paper targets (3mm at rows≥12, 4mm at rows≤6) using `targetMM / calendarScale`.
- **Multi-Page Layout**:
    - Splits months into page-sized chunks (7–8 months per page for A4/A3, unlimited for 914mm).
    - Each chunk rendered as `<div class="cal-page">` via `startOffset` parameter.
    - Pages displayed horizontally side-by-side on separate paper sheets.
- **Deferred Paper Trim** (914mm formats):
    - Roll paper width is initially set wide, content is positioned and scaled, then `getBoundingClientRect()` measures the actual rendered width. Paper sheet is trimmed to content + 2cm margin.
    - Avoids stale measurements from compact cell adjustments.
- **Copies Mode** (914×2, 914×4):
    - Generates N identical copies of the calendar separated by `.cut-line` divs.
    - 914×4 uses `copyH: 200mm` per copy, bottom-aligned.
    - 914×2 scales to fill full paper height, top-aligned.
- **Page Info Display**: Shows paper size + page count (A4) or width in meters (914mm) next to printer icon.
- **State Management**: 
    - URL parameters (`?l=`, `?u=`, `?w=`, `?g=`) for shareable configurations.

### 2. Styling System (`style.css`)
- **Theming**: Uses CSS variables (`--mol-paper`, `--mol-ink`, `--mol-ink-light`) to enforce the color palette.
- **Typography**: *Inter* for UI, *Cinzel* for headers, optimized for legibility at small print sizes.
- **Grid/Layout**:
    - `.br` (Board Room) table mechanism.
    - `.bl` (Block) classes for month columns.
    - `.h` / `.v` classes for horizontal/vertical cells.
- **Print Optimization**:
    - `@media print` ensures WYSIWYG printing.
    - Custom margins and `page-break` handling.

## Key Features

### Paper Size Support
- **Standard**: A4, A3 (Portrait/Landscape logic). Multi-page output with horizontal page layout.
- **Engineering**: 
    - **914mm**: Single roll, compact Gantt cells (3–4mm on paper), width shown in meters.
    - **914mm ×2**: Dual copies stacked vertically with cut line.
    - **914mm ×4**: Four copies at 200mm each, bottom-aligned, 40mm gaps.
- **Fitting Logic**: The `autoFitViewport` function ensures that for any paper size, exactly 7 or 8 months (configurable) fit the width, utilizing the maximum possible scale without overflow.

### Visual Architecture
- **Week Separation**:
    - Vertical View: `.25pt` horizontal line before Start-of-Week (Mon/Sun).
    - Gantt View: `.5pt` vertical solid line at week boundaries.
- **Week Numbers**: 
    - Placed exclusively at the start of weeks.
    - In Gantt view: Absolute positioned at bottom of cells (`.hwn`).

### Rulers & Guides
- **Rulers**: Horizontal (bottom) and vertical (left) measurement rulers.
    - Auto-switch between cm mode and large mode (10cm labels at 60% opacity, 1m labels) based on zoom.
- **Vertical Page Guides**: Dynamic blue guides at printable area edges on each page.
- **Paper Sheet Visualization**: White paper rectangles behind each page.

## File Structure
- `index.html` / `index.php`: Entry point, UI shell.
- `calendar.js`: Logic.
- `style.css`: Styles.
- `fonts/`: Local font assets.
