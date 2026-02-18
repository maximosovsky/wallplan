# 🎨 Month Color Palette

WallPlan uses a **temperature-based color palette** to visually encode the time of year.
When enabled (toggle button in toolbar), month names, day numbers, and day-of-week labels
are colored according to the table below.

## Color Map

| #  | Month     | Hex       | Color        | Rationale                          |
|----|-----------|-----------|--------------|-------------------------------------|
| 1  | January   | `#212121` | Black        | Darkest, coldest month              |
| 2  | February  | `#3F51B5` | Indigo       | Deep winter cold                    |
| 3  | March     | `#9C27B0` | Purple       | Transition — still cold, awakening  |
| 4  | April     | `#2196F3` | Blue         | Cool spring, melting snow           |
| 5  | May       | `#4CAF50` | Green        | Nature blooms, warmth arrives       |
| 6  | June      | `#8BC34A` | Lime         | Warm, lush greenery                 |
| 7  | July      | `#F44336` | Red          | Peak heat 🔥                        |
| 8  | August    | `#FF9800` | Orange       | Hot, late summer                    |
| 9  | September | `#FFC107` | Amber        | Warm fading, golden light           |
| 10 | October   | `#A1887F` | Light Brown  | Autumn leaves, cooling              |
| 11 | November  | `#795548` | Brown        | Late autumn, bare trees             |
| 12 | December  | `#9E9E9E` | Gray         | Cold, overcast skies                |

## Visual Cycle

```
Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
 ⬛   🟦   🟪   🔵   🟩   🟢   🔴   🟠   🟡   🟫   🟫   ⬜
cold →→→→→→→→ warm →→→→ HOT →→→→ warm →→→→→→→→ cold
```

## Usage

- **Toggle**: Click the color button in the toolbar (concentric circles → Itten wheel)
- **URL parameter**: `?c=1` enables colors, absence = monochrome
- **SVG/PDF export**: Colors are embedded as inline `style.fill` to override CSS defaults
- **Weekend rule**: Weekend days remain **red** (`#C41E3A`) regardless of month color
- **Miro app**: Colors are always enabled (no toggle UI)

## Design Decisions

1. **Material Design palette** — all colors are from Google's Material Design color set
   for consistency and readability
2. **Inline styles** — `style="fill:..."` is used instead of `fill="..."` attribute
   to ensure colors override the base CSS rule `text { fill: #2C2C2C }`
3. **Temperature metaphor** — the gradient follows the Northern Hemisphere seasonal
   temperature curve, making it intuitive for most users
4. **1-indexed array** — `MONTH_COLORS[0]` is empty; months use natural numbering (1–12)
   in `calendar.js`, and 0-indexed (0–11) in `miro-app/src/svg-renderer.ts`

## Files

| File | Role |
|------|------|
| `calendar.js` | `MONTH_COLORS[]`, `toggleMonthColors()`, `_syncColorIcons()` |
| `index.html` | Toggle button with `icon-mono` / `icon-color` SVGs |
| `for-kirill-specially-ru/calendar-ru.js` | Same palette, RU locale |
| `for-kirill-specially-ru/index.html` | Same toggle button, RU locale |
| `miro-app/src/svg-renderer.ts` | Always-on colors for Miro board SVG |
