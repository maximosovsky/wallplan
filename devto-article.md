---
title: Why the Boston Metro Map Designer Built Me a Calendar
published: false
description: A 14-year journey from hand-printed calendars to a zero-dependency SVG generator — with plotter printing, Miro integration, and a PDF bug that looked correct on screen but printed garbage.
tags: javascript, opensource, webdev, productivity
cover_image: https://raw.githubusercontent.com/maximosovsky/wallplan/main/Cover-Image.jpeg
---

In 2012, I printed my first multi-year calendar. Two years on one sheet — because the publishing industry only makes calendars for the next 12 months, and I needed to plan further.

I gave copies to friends and colleagues. One of them — [Evgeniya Shamis](https://www.linkedin.com/in/evgeniya-shamis-572316/), a generations researcher — [filmed herself using it](https://youtu.be/y7rua9C81Ng?si=wgnVbWqXtwPECbqp). She pinned it to her wall and started marking deadlines across both years. That was the first signal: people actually want to see more than 12 months at a glance.

The calendar was [published](https://app.box.com/s/7yqyh8vfphq9hj2lg1jw) through [Scriber](https://scriber.biz/) in the Russian «Жить интересно!» magazine. But every new year meant manual layout work. I needed a generator.

## The Boston Metro Connection

In 2020, [Michael Kvrivishvili](https://www.linkedin.com/in/michael-kvrivishvili-39ab062/) — the designer of the official Boston Metro map — built a calendar generator specifically for me. His tool used [pdfmake](https://pdfmake.org/) to create PDFs directly in the browser: you set the number of months and Gantt rows, and it rendered a printable document.

It worked. But it was a black box — pdfmake handles all the layout internally, so I couldn't control positioning down to the millimeter. And when I started printing on 914mm engineering paper rolls, millimeters mattered.

So I rewrote it. From scratch. In pure SVG.

## What WallPlan Does

**[WallPlan](https://osovsky.com/wallplan/)** is a browser-based multi-year calendar generator. You choose a duration (1 month to 20 years), a paper format, and a number of Gantt rows — and it renders a printable calendar in three views:

![WallPlan — multi-year calendar generator](https://raw.githubusercontent.com/maximosovsky/wallplan/main/og-image.jpg)

| View | What It Shows |
|------|---------------|
| **Vertical** | Days listed vertically per month — classic planner layout |
| **Gantt** | Horizontal day grid with project rows — timeline planning |
| **Box** | Traditional 7×5 mini-month grids with week numbers |

All three views render as SVG. You export to SVG or PDF for printing.

### Paper Formats

| Format | Use Case |
|--------|----------|
| A4 / A3 | Standard office printing |
| 914mm roll | Engineering plotter — unlimited length, 1m wide |
| 914mm ×2 | Two calendars on one roll |
| 914mm ×4 | Four mini-calendars side by side |

Yes, I print multi-year calendars at copy centers on engineering paper rolls. A 5-year Gantt calendar on a single continuous sheet, pinned to a wall. That's how I use it for [strategic planning](https://osovsky.medium.com/game-5438c730a15e).

## Zero Dependencies, Three Files

```
index.html    — 22 KB (toolbar, modals, mobile UI, welcome carousel)
calendar.js   — 80 KB (SVG renderer, viewport, export, touch support)
style.css     — 20 KB (all styling, responsive, print CSS)
```

No React. No build step. No npm install. One `npx -y serve -l 3456` and you're running.

The SVG renderer calculates every coordinate manually — month column widths, day cell sizes, Gantt row heights, page breaks. It's ~2000 lines of vanilla JavaScript that produce pixel-perfect output for any paper format.

### Why SVG Over Canvas?

1. **Vector output** — PDF stays crisp at any zoom, prints cleanly on plotters
2. **Pan and zoom** — the viewport supports one-finger drag and pinch-to-zoom
3. **Batch path optimization** — thousands of grid lines are merged into 4 `<path>` elements instead of individual `<line>` elements
4. **Lazy PDF export** — jsPDF + svg2pdf.js (~500KB) load only when you click Download

Seven weights of [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) are fetched in parallel and embedded as base64 into the PDF. The visual style is deliberately Moleskine-inspired: warm cream background, thin ink-like lines, condensed typography.

## The PDF That Looked Perfect But Printed Garbage

Here's an engineering horror story.

I generated a PDF — A4, 12 months, 12 Gantt rows. Opened it in Chrome: perfect. Sent it to a colleague via Telegram: preview looked great. Hit Print on a plotter: **complete garbage**. Vertical lines smashed together into an unreadable mess.

![PDF printed as garbage — all lines collapsed into each other](https://raw.githubusercontent.com/maximosovsky/wallplan/main/photo_2026-02-16_17-10-48.jpg)

The culprit: **batch path optimization**.

To keep the SVG lightweight, I merge all grid lines into a few `<path>` elements with thousands of `M`/`V`/`H` draw commands:

```
M150.3 400V520 M150.55 400V520 M150.8 400V520...
```

Chrome's PDF renderer (PDFium/Skia) handles this flawlessly. But the plotter's RIP (Raster Image Processor) — with its limited firmware — chokes on paths with 3000+ commands. Coordinates lose precision after hundreds of operations, and lines collapse into each other.

The PDF was **technically valid** but **too complex** for certain printers. Like a website that works in Chrome but breaks in Internet Explorer.

The fix? Still exploring options — from splitting batch paths into smaller chunks, to canvas rasterization at 300 DPI, to a parallel [PDFKit](https://pdfkit.org/) renderer. The original pdfmake approach from Michael's version never had this problem because pdfmake generates native PDF table elements, not converted SVG paths.

## Month Colors — The Temperature Palette

Each month can be shaded with a seasonal color palette inspired by Johannes Itten's color wheel. Warm months get warm tones, cold months get cool tones. Toggle it with `&c=1` in the URL.

The palette follows a temperature curve: January is deep blue, July is warm amber, and transitions flow through greens and oranges. It's subtle — just enough color to visually separate months at a glance without overwhelming the print.

## Custom Entries

Add birthdays, deadlines, or recurring events directly on the calendar:

```
DD.MM  Your text here
```

Entries appear as markers on the corresponding day. Set them to repeat annually, and they show up every year across your entire multi-year span. No login, no cloud — entries live in the URL parameters and localStorage.

## Miro Integration

WallPlan doesn't just live in the browser. It has a full [Miro App](https://github.com/maximosovsky/wallplan-miro) that generates calendars as **native Miro board elements** — not images, but real text objects, shapes, and frames that you can move, edit, and annotate.

The architecture made this possible: WallPlan's SVG renderer calculates explicit `(x, y, width, height)` coordinates for every element. The Miro version reuses the same data layer (`calendar-engine.ts`) and maps coordinates to `miro.board.createText()` / `miro.board.createShape()` calls.

There's also a [Miroverse template](https://miro.com/miroverse/2year-timeline-gantt-calendar-20262027/) — a ready-made 2-year Gantt calendar board that anyone can duplicate.

This is something none of the competitors offer. Calidar.io has beautiful PDF calendars. Kruglendar has elegant circular layouts. Notion Planners sell templated planners on Etsy. But none of them generate native, editable calendar objects inside a collaborative whiteboard.

## The LifeLine Connection

WallPlan shares its rendering engine with [LifeLine](https://github.com/maximosovsky/lifeline), my life timeline visualization tool. Same SVG core, same viewport system, same IBM Plex Sans fonts, same PDF pipeline.

- **WallPlan** → years × months (planning ahead)
- **LifeLine** → decades × life categories (looking back and forward)

The SVG rendering approach proved in WallPlan — manually calculated coordinates, batch path optimization, lazy PDF export — became the foundation for a completely different product.

## From 2012 to Now

| Year | Milestone |
|------|-----------|
| 2012 | First 2-year calendar printed and distributed |
| 2013 | Published in «Жить интересно!» magazine |
| 2017 | Methodology presented at conferences |
| 2020 | Michael Kvrivishvili builds the pdfmake generator |
| 2024 | Full rewrite to SVG — WallPlan is born |
| 2025 | Miro App, month colors, custom entries, mobile UI |
| 2026 | Open source on GitHub |

Fourteen years from a hand-made calendar to a production tool. The core idea never changed: **see more than 12 months at once**.

## Try It

**Live:** [osovsky.com/wallplan](https://osovsky.com/wallplan/)
**GitHub:** [github.com/maximosovsky/wallplan](https://github.com/maximosovsky/wallplan)
**Miro template:** [2-Year Timeline Gantt Calendar](https://miro.com/miroverse/2year-timeline-gantt-calendar-20262027/)

```bash
npx -y serve -l 3456  # Open http://localhost:3456
```

---

*Building in public, one repo at a time. Follow the journey: [LinkedIn](https://www.linkedin.com/in/osovsky/) · [GitHub](https://github.com/maximosovsky)*
