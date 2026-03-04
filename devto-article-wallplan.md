---
title: "I Built a 6-Language PWA Calendar Generator With Zero Dependencies"
published: false
description: "How I added Chinese, Hebrew, Arabic, and Italian calendars — with national holidays, algorithmic date conversion, and offline support — to a vanilla JS app."
tags: opensource, javascript, webdev, pwa
series: "Building WallPlan"
cover_image: https://raw.githubusercontent.com/maximosovsky/wallplan/master/Cover-Image.jpeg
---

<!-- 
  STATUS: DRAFT TEMPLATE — fill in screenshots and personal details before publishing
  CHECKLIST: see c:\100star\.agent\workflows\devto-article.md
-->

## The Problem Nobody Talks About

Every calendar app shows you **one year**. But if you're planning a business, a 3-year roadmap, or just trying to see where your life is going — you need to see **years at a glance, on paper**.

I've been building [WallPlan](https://wallplan.osovsky.com) — a browser-based calendar generator that creates printable multi-year Gantt timelines. Zero npm packages. Zero frameworks. Zero logins. Everything runs in the browser and never leaves your machine.

Recently, I shipped three features that changed the project entirely:

1. 🌍 **6 languages** with real calendar systems (not just translated labels)
2. 📱 **PWA with offline support** (Lighthouse 90+)
3. 🎌 **Holiday overlay** (compare Russian vs US holidays on any calendar)

Here's what I learned building each one.

---

## 1. Six Languages, Six Calendar Systems

Adding locales wasn't about translating strings. Each locale has its own **calendar logic**:

| Locale | Calendar | Challenge |
|--------|----------|-----------|
| 🇺🇸 English | Gregorian | Baseline |
| 🇷🇺 Russian | Gregorian | Different holiday system |
| 🇨🇳 Chinese | Gregorian + Zodiac | 补班 makeup workdays, zodiac animal years |
| 🇮🇱 Hebrew | Hebrew lunisolar | Algorithmic month calculation, Tishrei boundary |
| 🇸🇦 Arabic | Hijri lunar | Muharram boundary, Islamic holidays |
| 🇮🇹 Italian | Gregorian + Easter | Venice-specific festivals (Carnevale, Sensa, Redentore) |

### The Hebrew Calendar Problem

The Hebrew calendar is lunisolar — months don't map to Gregorian months. I wrote an algorithmic converter covering 2024–2045 that calculates Hebrew month boundaries, handles leap years (7 out of every 19 years), and places Israeli holidays correctly.

<!-- TODO: add screenshot of Hebrew calendar view -->

### Chinese Calendar: Zodiac + Makeup Workdays

China has "补班" — if a holiday falls on Tuesday, Monday becomes a workday to compensate. These special workdays are manually defined each year and need to appear on the calendar. Plus there's zodiac animal years shown at year boundaries.

<!-- TODO: add screenshot of Chinese calendar with zodiac -->

---

## 2. PWA: Works Offline, Lighthouse 90+

WallPlan is a **zero-dependency** vanilla JS app. No React, no Vite, no build step. Adding PWA support meant:

```javascript
// sw.js — versioned cache, network-first for HTML
const CACHE = 'wallplan-v3';
const ASSETS = [
  '/', '/calendar.js', '/style.css', 
  '/fonts/IBMPlexSans-Regular.woff2',
  // ... all locale files and fonts
];
```

### What actually moved the Lighthouse score:

| Fix | Before | After |
|-----|--------|-------|
| `manifest.json` with correct icon sizes | 72 | 85 |
| ARIA labels on all toolbar buttons | 85 | 92 |
| Service Worker with precaching | 92 | 95 |
| `<meta name="theme-color">` | 95 | 96 |

The key insight: **Lighthouse cares more about ARIA labels than fancy optimizations.** Adding `aria-label="Export PDF"` to icon-only buttons was the single biggest score jump.

---

## 3. Holiday Overlay: Compare Countries

The most requested feature. When viewing the Chinese calendar, you can overlay Russian or US holidays to compare. The overlay switches based on language:

- 🇷🇺 Russian language → shows Russian holidays
- 🇺🇸 English language → shows US holidays

This works across all three calendar views (Gantt, Box, Vertical) with weekend highlighting.

<!-- TODO: add screenshot of holiday overlay -->

---

## The Zero-Dependency Bet

WallPlan has **no npm packages**. The entire app is:

```
calendar.js  — SVG renderer, viewport, pan/zoom, export
style.css    — Miro-style UI, responsive layout
locales/*.js — 6 locale files with holidays and labels
sw.js        — Service Worker
```

No bundler. No transpiler. `npx serve` and you're running.

### Why this matters:

- 🚀 **Cold start: 0ms build** — there's no build
- 📦 **No `node_modules`** — git clone and you're done
- 🔒 **No supply chain risk** — zero dependencies = zero CVEs
- ⏰ **Works in 5 years** — no framework migrations needed

---

## What's Next

- [ ] Product Hunt launch
- [ ] Custom stickers (drag onto calendar)
- [ ] Google Calendar import
- [ ] Print-as-a-Service (Gelato/Printful integration)

---

## Try It

🌐 **Live demo**: [wallplan.osovsky.com](https://wallplan.osovsky.com)
📂 **Source**: [github.com/maximosovsky/wallplan](https://github.com/maximosovsky/wallplan)

Available in: [English](https://wallplan.osovsky.com) · [Русский](https://wallplan.osovsky.com/ru/) · [中文](https://wallplan.osovsky.com/zh/) · [עברית](https://wallplan.osovsky.com/he/) · [العربية](https://wallplan.osovsky.com/ar/) · [Italiano](https://wallplan.osovsky.com/it/)

---

*What calendar period do you plan with? One year? Five? Drop a comment 👇*

Follow me: [LinkedIn](https://www.linkedin.com/in/osovsky/) · [dev.to](https://dev.to/osovsky)
