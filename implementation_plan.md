# Implementation Plan: Multi-Page Calendar (v2 — Page Navigation)

## Approach
**Keep the single table. Add page navigation on screen.**

Instead of splitting into separate HTML tables (rejected), we:
1. Keep the existing single `<table>` that `generateCalendar` produces.
2. On screen, use CSS `translateX` to **shift** the table horizontally, showing only the columns for the current "page".
3. Add **Page ◀ ▶** buttons + **"Page 1/2"** indicator.
4. `autoFitViewport` sizes columns so that `monthsPerPage` columns always fit the paper width.
5. The paper sheet + guides stay fixed; the calendar contents slide left/right.

## Changes

### `calendar.js`
- Add `currentPage = 0` state variable.
- In `applyViewport()`: offset `cal.style.left` by `-(currentPage * pageWidthPx)` to shift the view.
- `nextPage()` / `prevPage()` functions: increment/decrement `currentPage`, call `applyViewport()`.
- Add page indicator text to the UI (e.g., near the print menu).
- `updateCalendar()`: reset `currentPage = 0`.
- Calculate `totalPages = Math.ceil(totalMonths / monthsPerPage)`.

### `index.html`
- Add `◀` / `▶` buttons + `<span id="page-indicator">` inside the controls panel.

### `style.css`
- Style the page navigation buttons to match Moleskine aesthetic.
- Add `overflow: hidden` to paper-sheet or calendar wrapper to clip content outside the current page.

## Why This Is Better
- **No HTML restructuring** — `generateCalendar` stays untouched.
- **Simple**: Just a horizontal offset + clipping.
- **Print**: For now, prints current page. Future: can loop through pages for full print.
- **Reversible**: Easy to remove if a different approach is preferred.
