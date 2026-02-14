# WallPlan — Calendar Generator for Long-Term Planning

![WallPlan](wallplan.webp)

📅 Every year I publish a new version of a multi-year calendar. The publishing industry mostly makes calendars for just the next year, limiting our ability to plan in detail many years ahead.

Twelve years ago, in October 2014 I [released](https://app.box.com/s/7yqyh8vfphq9hj2lg1jw) the first such calendar covering two years.
🚇 For many years we laid out calendars manually, until in 2020, [Michael Kvrivishvili](https://wayfinding.pro/cal/?l=6) — the designer of the official Boston Metro map — developed a service specifically for me to generate a calendar for any number of months, with any number of Gantt rows.


## 🌟 Features

- **SVG Renderer**: Pure SVG output with three calendar types — Vertical (classic days list), Gantt (horizontal planning grid), and Box (traditional mini month grid).
- **Duration**: From 1 month to 20 years. Mobile scroll-wheel picker (years + months), desktop number input.
- **Hide Days Mode**: Toggle to hide day-level details (numbers, names, holidays, grid lines) from Vertical and Gantt views. Gantt horizontal rows redistribute to fill the full height — ideal for long-term strategic planning. Persisted via `&d=1` URL parameter.
- **Precision Layout**: Automatically fits 7–8 months per page on A4/A3. Roll paper uses cell-width-driven calculation for exact physical dimensions.
- **Paper Sizes**: A4, A3, 914mm (single), 914mm ×2 (dual copies), 914mm ×4 (quad copies). Roll length displayed for 914mm formats.
- **Format-Specific Tuning**: Each roll format has optimized cell widths — 4mm (single), 2.7mm (×2), 1.7mm (×4) — and font scaling for readability at each physical size.
- **Export**: Download as vector SVG or PDF with embedded IBM Plex Sans fonts.
- **Customizable**: Week start (Mon/Sun), US Federal Holidays, adjustable Gantt rows (6/8/10/12).
- **WallPlan Day**: January 11 — marked annually in Copper Penny DTP font with a wine-colored accent (#6B2332).
- **Custom Entries**: Add session-only annotations (e.g. "Product launch" on 15.03) via the T button. Supports DD.MM input with auto-formatting, yearly repeat option. Entries render alongside holidays and export to SVG/PDF. Not persisted — cleared on page reload.
- **Russian Edition**: Localized calendar at `/for-kirill-specially-ru/` with Russian holidays and emojis. Hidden from search engines (`noindex`).
- **Google Analytics**: GA4 tracking on both English and Russian versions.
- **Mobile**: Touch pan & pinch-to-zoom, iOS-like bottom toolbar with T (add entry), Hide Days toggle, download (SVG/PDF), and settings sheet.
- **Performance**: Batch SVG path rendering, holiday caching, rAF-based viewport updates.
- **Print Optimized**: Custom print CSS — what you see is what you get.
- **Rulers & Guides**: Measurement rulers with cm/m labels, vertical guides marking printable area.

## 🖨️ Printing

📌 Long multi-year calendars can be printed at copy centers on **engineering paper up to 1 m wide** with virtually infinite length.

🚀 Ideal for working on [strategies](https://osovsky.medium.com/game-5438c730a15e)!

## 📱 Mobile

Bottom toolbar with frosted glass effect shows current duration (smart yr/mo label), rows count, and paper format. Tap to open settings sheet with scroll-wheel duration picker (years + months), paper format selector with roll length display, Gantt rows chips (6/8/10/12), and week start toggle. Download icon opens SVG/PDF popup.

## 📐 Architecture

See [architecture.md](./architecture.md) for detailed technical documentation on the SVG layout engine, export system, touch support, and mobile UI.

| File | Purpose |
|------|--------|
| `calendar.js` | SVG renderer, viewport, pan/zoom, export (EN) |
| `style.css` | Miro-style UI, Moleskine palette, responsive layout |
| `index.html` | Main app shell + GA4 tracking |
| `for-kirill-specially-ru/` | Russian locale (separate JS + HTML, shared CSS/fonts) |
| `fonts/` | IBM Plex Sans (7 weights) + Copper Penny DTP |

## 🙏🏻 Credits

**2014-2026 [Michael Kvrivishvili](https://www.linkedin.com/in/michael-kvrivishvili-39ab062/), Maxim Osovsky**.
This work is licensed under the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**.
