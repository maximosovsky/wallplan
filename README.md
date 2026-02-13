# WallPlan — Calendar Generator for Long-Term Planning

![WallPlan](wallplan.webp)

📅 Every year I publish a new version of a multi-year calendar. The publishing industry mostly makes calendars for just the next year, limiting our ability to plan in detail many years ahead.

Twelve years ago, in October 2014 I [released](https://app.box.com/s/7yqyh8vfphq9hj2lg1jw) the first such calendar covering two years.
🚇 For many years we laid out calendars manually, until in 2020, [Michael Kvrivishvili](https://wayfinding.pro/cal/?l=6) — the designer of the official Boston Metro map — developed a service specifically for me to generate a calendar for any number of months, with any number of Gantt rows.


## 🌟 Features

- **SVG Renderer**: Pure SVG output with three calendar types — Vertical (classic days list), Gantt (horizontal planning grid), and Box (traditional mini month grid).
- **Duration**: From 6 months to 20 years (240 months). Preset durations on mobile: 6mo, 1yr, 2yr, 5yr, 7yr, 10yr, 20yr.
- **Precision Layout**: Automatically fits 7–8 months per page on A4/A3. Roll paper uses cell-width-driven calculation for exact physical dimensions.
- **Paper Sizes**: A4, A3, 914mm (single), 914mm ×2 (dual copies), 914mm ×4 (quad copies).
- **Format-Specific Tuning**: Each roll format has optimized cell widths — 4mm (single), 2.7mm (×2), 1.7mm (×4) — and font scaling for readability at each physical size.
- **Export**: Download as vector SVG or PDF with embedded IBM Plex Sans fonts.
- **Customizable**: Week start (Mon/Sun), US Federal Holidays, adjustable Gantt rows (6/8/10/12).
- **Mobile**: Touch pan & pinch-to-zoom, iOS-like bottom toolbar with settings sheet.
- **Performance**: Batch SVG path rendering, holiday caching, rAF-based viewport updates.
- **Print Optimized**: Custom print CSS — what you see is what you get.
- **Rulers & Guides**: Measurement rulers with cm/m labels, vertical guides marking printable area.

## 🖨️ Printing

📌 Long multi-year calendars can be printed at copy centers on **engineering paper up to 1 m wide** with virtually infinite length.

🚀 Ideal for working on [strategies](https://osovsky.medium.com/game-5438c730a15e)!

## 📱 Mobile

Bottom toolbar with frosted glass effect shows current duration, rows count, and paper format. Tap to open settings sheet with duration presets, paper format selector, rows slider, and week start toggle. Download icon opens SVG/PDF selector popup.

## 📐 Architecture

See [architecture.md](./architecture.md) for detailed technical documentation on the SVG layout engine, export system, touch support, and mobile UI.

## 🙏🏻 Credits

**2014-2026 [Michael Kvrivishvili](https://www.linkedin.com/in/michael-kvrivishvili-39ab062/), Maxim Osovsky**.
This work is licensed under the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**.
