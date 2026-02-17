<div align="center">

# 📅 WallPlan

**Print years on paper — plan decades ahead**

[![Live Demo](https://img.shields.io/badge/demo-osovsky.com/wallplan-81D8D0?style=for-the-badge)](https://osovsky.com/wallplan/)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-lightgrey?style=for-the-badge)](https://creativecommons.org/licenses/by-sa/4.0/)

A browser-based multi-year calendar generator with Gantt-style grid, vertical day lists, and mini month boxes. Configure duration, paper size, export to SVG or PDF, and print on large format paper.

**Zero dependencies · No login · 100% private**

<img src="og-image.png" alt="WallPlan Preview" width="600">

</div>

---

## 💡 Concept

> Twelve years ago, in October 2014, I [released](https://app.box.com/s/7yqyh8vfphq9hj2lg1jw) the first multi-year calendar covering two years. The publishing industry mostly makes calendars for just the next year, limiting our ability to plan in detail many years ahead. In 2020, [Michael Kvrivishvili](https://wayfinding.pro/cal/?l=6) — the designer of the official Boston Metro map — developed a service specifically for me to generate a calendar for any number of months, with any number of Gantt rows.

### Purpose
- **📏 Long-term planning** — see months and years at a glance on a single paper roll
- **📊 Gantt-style tracking** — horizontal rows for projects, goals, habits, and deadlines
- **🖨️ Wall printing** — designed for large format printing at copy centers (up to 1m wide, unlimited length)
- **🎯 Strategic thinking** — ideal for working on [strategies](https://osovsky.medium.com/game-5438c730a15e)

### Target Audience
- **Managers & strategists** — roadmap planning, project timelines, OKR tracking
- **Entrepreneurs** — business milestones, fundraising timelines, product launches
- **Personal planners** — life goals, habit tracking, family calendars
- **Teams & offices** — shared wall calendars for departments and projects

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **SVG Renderer** | Pure SVG output — Vertical (days list), Gantt (planning grid), Box (mini months) |
| **Duration** | From 1 month to 20 years. Mobile scroll-wheel picker, desktop number input |
| **Hide Days mode** | Toggle to hide day-level details — only year/quarter/month divisions remain. URL: `&d=1` |
| **Paper sizes** | A4, A3, 914mm (single), 914mm ×2 (dual), 914mm ×4 (quad). Roll length displayed |
| **Precision layout** | Auto-fits 7–8 months per page on A4/A3. Roll paper uses cell-width-driven calculation |
| **Format tuning** | Optimized cell widths per format — 4mm (single), 2.7mm (×2), 1.7mm (×4) |
| **PDF & SVG export** | Embedded IBM Plex Sans fonts, parallel font loading |
| **Custom entries** | Add annotations via T button: `DD.MM` format, yearly repeat, exported to SVG/PDF |
| **Holidays** | US Federal Holidays, WallPlan Day (Jan 11) in Copper Penny DTP font |
| **Week start** | Monday or Sunday toggle |
| **Gantt rows** | 6, 8, 10, or 12 configurable rows |
| **Mobile-first** | Bottom toolbar with frosted glass, settings sheet, scroll-wheel pickers |
| **Touch gestures** | Pan, pinch-to-zoom on mobile |
| **Rulers & guides** | Measurement rulers with cm/m labels, vertical guides for printable area |
| **Print optimized** | Custom print CSS — what you see is what you get |
| **Private** | All data stays in browser, never sent anywhere |
| **Zero dependencies** | No npm, no framework, pure vanilla JS |

---

## 🚀 Quick Start

```bash
npx -y serve -l 3456
# Open http://localhost:3456
```

Or visit the live version:
- [osovsky.com/wallplan](https://osovsky.com/wallplan/) — primary
- [wallplan on GitHub Pages](https://maximosovsky.github.io/wallplan/) — mirror

---

## 🎛️ Controls

### Desktop

| Control | Action |
|---------|--------|
| **Months input** | Set calendar duration (1–240 months) |
| **A4 / A3 / 914mm** | Paper format selector |
| **6 / 8 / 10 / 12** | Number of Gantt rows |
| **Mon / Sun** | Week start toggle |
| **Hide Days** | Toggle day-level details on/off |
| **T button** | Add custom entry modal |
| **⬇ SVG / 🖨 PDF** | Export |
| **Mouse wheel** | Zoom in/out |
| **Click + drag** | Pan canvas |

### Mobile

| Control | Action |
|---------|--------|
| **Duration label** | Shows current yr/mo, tap for settings |
| **Paper button** | Paper format toggle with roll length |
| **T** | Add custom entry |
| **⬇** | SVG/PDF download popup |
| **⚙** | Settings sheet (duration picker, format, rows, week start) |

---

## 🖨️ Printing

📌 Long multi-year calendars can be printed at copy centers on **engineering paper up to 1m wide** with virtually infinite length.

🚀 Ideal for working on [strategies](https://osovsky.medium.com/game-5438c730a15e)!

---

## 📱 Mobile

Bottom toolbar with frosted glass effect shows current duration (smart yr/mo label), rows count, and paper format. Tap to open settings sheet with scroll-wheel duration picker (years + months), paper format selector with roll length display, Gantt rows chips (6/8/10/12), and week start toggle. Download icon opens SVG/PDF popup.

---

## 🏗️ Tech Stack

| File | Purpose |
|------|---------|
| `calendar.js` | SVG renderer, viewport, pan/zoom, export (EN) |
| `style.css` | Miro-style UI, Moleskine palette, responsive layout |
| `index.html` | Main app shell + GA4 tracking |
| `for-kirill-specially-ru/` | Russian locale (separate JS + HTML, shared CSS/fonts, noindex) |
| `fonts/` | IBM Plex Sans (7 weights) + Copper Penny DTP |
| `og-image.png` | OG social preview image (1200×630) |

See [architecture.md](./architecture.md) for full technical details.

---

## 📐 Architecture

See [architecture.md](./architecture.md) for detailed technical documentation on the SVG layout engine, export system, touch support, and mobile UI.

---

<details>
<summary>📚 Publications</summary>

- [Expanding Planning Horizons](https://osowski.medium.com/calendar-392272c97af3) — how multi-year calendars changed the way I plan
- [Game: Strategy Visualization](https://osovsky.medium.com/game-5438c730a15e) — using wall calendars for strategic thinking

</details>

---

## 📄 License

© 2014–2026 [Michael Kvrivishvili](https://www.linkedin.com/in/michael-kvrivishvili-39ab062/) & [Maxim Osovsky](https://www.wikidata.org/wiki/Q107189449).
Licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
