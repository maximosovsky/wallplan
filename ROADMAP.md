# WallPlan — Roadmap

Tasks ordered by complexity (easiest first). Each task includes a rationale for why it matters to users and the product.

## ✅ Done

### ~~Timeline Mode 📏~~
Implemented via the **Hide Days** toggle. Calendar without daily grid — only vertical year, quarter, and month divisions. Gantt rows remain for high-level project planning. URL parameter `&d=1`.

### ~~Custom Entries ✏️~~
Session-only text annotations on any date. W button (cherry-red Copper Penny DTP font) opens modal: text + DD.MM date input with auto-formatting (all delimiters, pure digits). Yearly repeat option. Renders alongside holidays, exports to SVG/PDF. Not persisted — lightweight by design. Available on both desktop (gantt-panel) and mobile (bottom toolbar).

### ~~Social Preview 🔗~~
Open Graph + Twitter Card meta tags on both EN and RU versions. App screenshot as OG image for rich link previews in Telegram, Facebook, Twitter.

### ~~Custom Domain 🌐~~
`osovsky.com/wallplan/` via `osovsky-site` Vercel project with rewrites proxy. Root `/` auto-redirects to `/wallplan/`.

### ~~SEO Optimization 🔍~~
Complete technical SEO: meta tags (title, description, keywords), OG + Twitter Card (1200×630), canonical + hreflang, JSON-LD SoftwareApplication + Wikidata sameAs, favicon, apple-touch-icon, PWA manifest, theme-color, noscript fallback, robots.txt (with AI crawlers), sitemap.xml, llms.txt + llms-full.txt, hidden crawler content for SPA, security headers, Google Search Console, GitHub backlink in README.

### ~~GitHub Topics ⚙️~~
Added repository topics: `calendar`, `gantt`, `svg`, `pdf`, `wall-calendar`, `planner`, `javascript`, `planning-tool`.

### ~~Month Color Palette 🌡️~~
Temperature-based color encoding for month names, day numbers, and day-of-week labels. Material Design palette mapped to Northern Hemisphere climate. Toggle button (Itten wheel), URL parameter `&c=1`. Documented in [COLORS.md](./COLORS.md).

### ~~Miro App — Phase 1: Setup ⚙️~~
Scaffolded Miro App project with Vite + React + TypeScript. Registered app in Miro Developer Dashboard. Configured OAuth scopes (`boards:read`, `boards:write`). Local dev environment working.

### ~~Miro App — Phase 2: Calendar Engine 🧮~~
Ported core calendar logic to TypeScript (`calendar-engine.ts`). Pure functions: `generateMonths()`, `buildBoxWeeks()`, `getHolidays()`. Zero DOM dependencies.

### ~~Miro App — Phase 3: Panel UI 🎨~~
React settings panel (`app.tsx`) with Mirotone CSS. Controls: duration (years + months), start date, week start, Gantt rows (6/8/10/12), Hide Days toggle.

### ~~Miro App — Phase 4: SVG Generator 🖼️~~
Complete SVG renderer (`svg-renderer.ts`). 6-row layout (year header → month name → day list → Gantt grid → box header → box calendar). Google Fonts loaded at runtime, embedded as base64 `@font-face`. Month color palette with inline `style="fill:..."`. Hide Days mode with Gantt expansion. Calendar placed on board via `miro.board.createImage()`.

### ~~Miro App — Phase 5: Production Deployment 🚀~~
Built production bundle, deployed to Vercel. App URL configured in Miro Developer Dashboard. Tested on real Miro board.

### ~~Miro App — Phase 6: Miroverse Template 📋~~
Submitted "2-Year Timeline Gantt Calendar 2026–2027" to Miroverse. Categories: Diagramming, Strategy & Planning, Personal. Under review.

### ~~Miro App — Phase 7: Native Generator 🧩~~ *(18 Feb 2026)*
Replaced SVG image approach (`createImage()`) with native Miro board elements (`createShape()` + `createText()`) for full Miroverse template compatibility. SVG images are not editable by Miroverse users — native elements allow template consumers to modify, recolor, and extend the calendar.

**Architecture:**
- New `native-generator.ts` (411 lines) replaces SVG pipeline. Uses `calendar-engine.ts` (unchanged) for pure data generation.
- `generateMonth()` extracted as reusable helper — creates all content for a single month column (R2–R6) in one batch.
- Layout context (`LayoutCtx` interface) shared between main function and per-month helper.
- Helper factories `txt()` and `shp()` wrap `miro.board.createText()` / `createShape()` — store created Miro objects directly in `allItems[]` array (avoids costly `getById()` re-fetching later).

**6-row layout (same as SVG version):**
| Row | Content | Implementation |
|-----|---------|---------------|
| R1 | Year number | `createText()`, fontSize 48, light gray, left-aligned with 15dp padding |
| R2 | Month name | `createText()`, fontSize 48, Material Design month color palette, left-padded |
| R3 | Day list (1–31) | Individual `createText()` per day: `" 5  Mon  5"` format (day, DOW, week number). Weekend/holiday text in red. Week separators = bold `createShape()` lines on Mondays. |
| R4 | Gantt grid | Horizontal row lines (full-width merged shapes). Per-month vertical day dividers. Day-of-week letter + day number header (`M\n1`). Week numbers on Mondays (plain number, no "w" prefix). |
| R5 | Box month name | `createText()`, fontSize 36, month color, left-padded |
| R6 | Box calendar | 7-column grid: DOW headers (fontSize 18), day numbers (fontSize 16, centered), weekend red. Week number column left of grid (fontSize 10, right-aligned, light gray). |

**Frame & grouping:**
- `createFrame()` with title containing year range: `WallPlan 2026` (single year) or `WallPlan 2026–2027` (multi-year).
- Background color: `#FDF6E3` (warm paper).
- All created Miro objects stored in `allItems[]` during creation.
- At the end, `miro.board.group({ items: allItems })` groups everything — no `getById()` loop needed.
- Frame ID stored via `setAppData('wallplanIds', [frame.id])` for cleanup on re-generation.

**Grid lines optimization — merged to full-width:**
- R3 day separator lines: instead of 30 lines × 12 months (360 shapes total) → 31 full-width shapes spanning `totalW`. Borders (top/bottom) at full opacity, inner lines at 0.3 opacity.
- Gantt horizontal row lines: instead of `rows × 12` per-month shapes → `rows + 1` full-width shapes. Top/bottom borders at full opacity, inner lines at 0.5.
- Month borders (vertical): full-height shapes per month boundary. Year boundaries = 10dp width, quarter boundaries = 8dp `C.ink`, regular months = 8dp `C.cellLine`. Right edge = `C.ink`.
- Week separators in R3 remain per-month (Mondays fall on different Y positions in each month — cannot merge).
- Gantt vertical day dividers remain per-month (day column width `mW/numDays` varies with 28/29/30/31 days — X positions don't align across months).

**Performance optimizations (7 applied, 2 rejected):**

*Applied:*
1. **No `.sync()` calls** — text styles (`fontSize`, `color`, `textAlign`, `fontFamily`) passed directly in `createText()` constructor via `style` property. Eliminates ~900 extra API round-trips (each `.sync()` = 1 SDK call).
2. **Merged horizontal lines** — R3: 360 → 31 shapes (-329). Gantt: ~120 → ~10 shapes (-110). Total: **-440 shapes**.
3. **`BATCH_SIZE` tuned to 10 + 500ms delay** — conservative batching (10 parallel calls, 500ms gap) ensures reliable generation for multi-year calendars under Miro's 100K credits/min rate limit. `group()` call has 30s pre-delay + 3× retry.
4. **Per-month box calendar batching** — box calendar (~40 elements/month) processed per-month instead of accumulating all ~500 elements in one giant batch. Prevents Miro API overload and silent failures.
5. **Direct object storage for grouping** — `allItems[]` stores Miro objects returned by `createText()`/`createShape()`. Grouping uses these directly: `miro.board.group({ items: allItems })`. Eliminated `for (id of ids) { getById(id) }` loop that was **500+ sequential API calls** just for grouping.
6. **Progressive rendering** — calendar generated in two phases: Phase 1 creates first 3 months → `zoomTo(frame)` (user sees results immediately). Phase 2 continues generating remaining months in background. UX feels ~3× faster.
7. **`generateMonth()` helper** — all per-month content (R2 month name, R3 days, R4 Gantt, R5–R6 box) generated in one `batchCreate()` call per month, reducing overhead of multiple batch invocations.

*Evaluated and rejected:*
- **`Promise.allSettled`** — rejected because it silently swallows errors. User requirement: all elements must generate completely. With `allSettled`, missing elements would not trigger visible errors. `Promise.all` correctly fails fast.
- **Combining box calendar columns** — rejected because Miro text elements don't support `line-height` CSS. Combined `<br>` text with fontSize 16 would produce ~24dp line spacing vs required 44dp (`boxCellH`). Days would not align with grid. Visual quality unacceptable.

**Debugging journey:**
- Initial error: `Validation error: Number must be greater than or equal to 8 at "width"` — Miro SDK requires ≥8dp for shape width/height. Fixed with `dim()` helper (later replaced by `LINE_W = 8` constant).
- `type MonthData` import syntax failed on TypeScript 4.9.5 — removed type-only import.
- `borderWidth: 0` invalid in Miro SDK — replaced with `borderOpacity: 0`.
- Box calendar not generating — all ~500 elements were in one batch, overwhelming Miro API. Fixed by per-month batching.
- Progress bar stuck at "Generating" — `onProgress(current, total)` callback used fractional `current` values, `steps[2.5]` = undefined. Fixed with range-based progress text.

### ~~Miro App — Phase 8: Production Hardening & Miroverse v2~~ *(18 Feb 2026)*
Deployed to Vercel at [wallplan-miro.vercel.app](https://wallplan-miro.vercel.app/). Made generation robust for large calendars (24+ months): batch=10 with 500ms inter-batch delay, 30s pre-group wait, 3× retry for grouping with "already grouped" detection. Added panel footer (osovsky.com/wallplan · CC BY-SA 4.0). Re-submitted native-elements template to Miroverse: [2-Year Timeline Gantt Calendar 2026–2027](https://miro.com/miroverse/2year-timeline-gantt-calendar-20262027-yznazyvtm0b4kpa7/). Optimized assets: og-image.png→jpg (678KB→163KB), removed unused patchwork.png/webp.

### ~~Weekend & Holiday Highlighting 🩷~~ *(02 Mar 2026)*
Pink (`#FFB6C1`) background highlighting for weekends and holidays across all three calendar sections. Toggle button (pink circle SVG) in gantt-panel, cycles through 3 levels: 0 → Gantt only → +Box → +Vertical → off. URL parameter `&h=1/2/3`. Opacity: weekends 0.3, holidays 0.4 (Gantt), slightly higher in Box. Available on EN, RU, and ZH versions.

### ~~Locale Refactoring 🔧 (6a)~~ *(02 Mar 2026)*
Extracted locale-specific data from duplicated JS files into `locales/*.js`. Single shared `calendar.js` rendering engine reads `window.LOCALE` object. Deleted `calendar-ru.js` copies from `for-kirill-specially-ru/` and `@yka_yka/`. All HTML files now load `<script src="locales/XX.js">` before `calendar.js`.

**Architecture:**
```
calendar.js           → shared rendering engine (reads window.LOCALE)
locales/en.js         → { months, weekDays, holidays, weekStart: 'sun', monLabel, sunLabel }
locales/ru.js         → { months, weekDays, holidays, weekStart: 'mon', monLabel: 'ПН' }
locales/zh.js         → { months, weekDays, holidays, getZodiac(), switchLang(), getWorkdayOverrides() }
```

### ~~Chinese Calendar 🇨🇳 (6b)~~ *(02 Mar 2026)*
English UI with Chinese public holidays and zodiac year labels. Path: `/zh/`. Target: businesses planning around China's work schedule.

**Implemented features:**
- **2026 holidays** from State Council decree: Spring Festival, Qingming, Labour Day, Dragon Boat, Mid-Autumn, National Day
- **补班 workday overrides** — 6 makeup workdays excluded from pink highlighting
- **Chinese Zodiac** — animal + element/color label (e.g. "🐴 Fire Horse") on 2nd visible month of each year
- **EN/RU/中 language toggle** — button on `/zh/` page switches month names, weekdays, and holiday names between 3 languages
- **RU/CN Holiday Overlay** — button (half-gray/half-pink circle) shows Russian holidays in gray on Chinese calendar. Gray highlight on RU-only weekday holidays. Stats popup on hover: `137/365` with breakdown
- **URL params**: `&lang=ru`, `&ov=1` for shareable links
- **CJK PDF support** — Noto Sans SC font loaded locally (`fonts/NotoSansSC/`) for PDF export with Chinese characters. Registered at weights 200/300/400/500
- **Russian transferred holidays 2026** — Government Decree 1466 (Jan 9, Dec 31 as extra days off)
- **WALLPLAN DAY** added to ZH locale (Jan 11)

### ~~Favicon 🔖~~ *(02 Mar 2026)*
Added `favicon.png` to all HTML files (EN, RU, ZH). Replaced inline SVG emoji favicon with PNG. Both `<link rel="icon">` and `<link rel="apple-touch-icon">` updated.

### ~~Welcome Carousel (always) 🎠~~ *(02 Mar 2026)*
Welcome carousel now shows on every mobile visit (removed `localStorage` gate). Added Chinese carousel to `/zh/` with 4 slides in Chinese + philosopher quotes (陈澄, 中庸, 老子, 墨子). Chinese flag PNG on slide 2. Added Chinese SEO keywords to meta tags.

### ~~Lighthouse & Service Worker 🚀~~ *(02 Mar 2026)*
- **Accessibility**: Added `aria-label` to all icon-only buttons and interactive divs, `role="button"` to `<div class="tb-btn">` elements
- **PWA**: Created `sw.js` with versioned cache (`wallplan-v1`), cache-first strategy, `skipWaiting()` + `clients.claim()`. Pre-caches HTML, CSS, JS, favicon, locale files
- **Manifest**: Updated `manifest.json` with `favicon.png` icon (replaced SVG emoji)
- Service Worker registered in all 4 HTML files (EN, RU×2, ZH)

---

## 🟢 Easy (1–2 days)

### 1. Stickers 🟨🩷
Two sticker types (yellow, pink) that stick directly onto the calendar. Click button → click on calendar → sticker appears. Double-click to edit text. Drag to move. Pure SVG (`<rect>` + `<text>`), exports cleanly to SVG and PDF. Persist in localStorage.

**Why:** Users print calendars on the wall for planning. Stickers let them annotate deadlines, milestones, vacations _before_ printing. This is the single most requested feature — it transforms WallPlan from a static calendar into a lightweight planning tool.

### 2. Unified Overlay System
Single `renderOverlays()` function called after every `buildPages()` to re-render stickers and images from a shared data model. Required foundation for stickers + images.

**Why:** Technical prerequisite. Without a shared overlay architecture, each new creative tool (stickers, images, stamps) would duplicate rendering logic and break on rebuild. Build once, reuse for everything.

---

## 🟡 Medium (3–5 days)

### 4. Image Upload 📎
Upload images onto the calendar canvas. Resize on upload (max 800px, JPEG 80%) → embed as base64 `<image>` in SVG. Drag and resize on canvas. Exports to both SVG and PDF. Depends on Overlay System.

**Why:** Corporate users want company logos, project photos, and team avatars on printed calendars. Makes WallPlan viable for branded office calendars and internal planning boards.

### ~~6a. Locale Refactoring 🔧~~ *(done — see ✅ Done section)*

### ~~6b. Chinese Calendar 🇨🇳~~ *(done — see ✅ Done section)*

### 6c. Additional Locales 🌍 *(future, depends on 6a)*

| Locale | Path | Holidays |
|--------|------|----------|
| 🇮🇹 Italian | `/it/` | Capodanno, Ferragosto, Natale, Pasquetta, Liberazione... |
| 🇫🇷 French | `/fr/` | Jour de l'an, Fête nationale, Toussaint, Noël... |
| 🇪🇸 Spanish | `/es/` | Año Nuevo, Día de la Hispanidad, Navidad, Reyes... |
| 🇦🇪 Arabic (UAE) | `/ar/` | عيد الفطر, عيد الأضحى, اليوم الوطني... (RTL layout required) |

**Why:** WallPlan is useful worldwide — calendars are universal. Italian/French/Spanish = EU market (400M people). Chinese = world's largest internet market. Arabic (Dubai) = high-value corporate market. Each locale = new SEO domain, new traffic source, new hreflang cluster.

---

## 🔴 Hard (1–3 weeks)

### 7. GA4 → Telegram Alerts 📲
Real-time notifications about important analytics events sent to Telegram.

**Event tracking (client-side, `calendar.js`):**
- `entry_added` — user added a custom entry (T button)
- `hide_days_toggled` — user toggled Hide Days mode
- `svg_downloaded` / `pdf_downloaded` — export actions
- `paper_changed` — paper format switch (A4/A3/914mm)
- `rows_changed` — Gantt rows adjustment
- `mob_sheet_opened` — mobile settings sheet engagement

**Alert types:**
| Alert | Trigger | Priority |
|-------|---------|----------|
| 🔴 Site down | Traffic drops to 0 for 1h | Critical |
| 🟡 Traffic spike | >3× daily average | High |
| 🟢 New country | First visit from new country | Medium |
| 📥 Export milestone | 100th / 1000th SVG/PDF download | Medium |
| 📊 Daily digest | Key metrics summary at 09:00 | Low |

**Architecture:**
1. GA4 events → GA4 Data API (reporting)
2. Google Cloud Function (Python, runs on cron via Cloud Scheduler)
3. Function queries GA4 Data API → compares with thresholds
4. If alert triggers → sends message via Telegram Bot API
5. Free tier: Cloud Functions (2M invocations/mo) + Cloud Scheduler (3 jobs free)

**Alternative (simpler):** GA4 Custom Insights → email alerts → Zapier/n8n → Telegram Bot.

**Why:** Instant awareness of user engagement without checking dashboards. Critical for catching site outages (traffic = 0) and tracking growth (new countries, traffic spikes). Telegram = always in pocket, zero friction.

### 8. Google Calendar Import
Import birthdays and events from Google Calendar. Display as markers or labels on corresponding dates. Requires Google OAuth + Calendar API + event parsing.

**Why:** Instead of manually placing stickers for every birthday and meeting — pull them automatically. Print a 3-year calendar with all family birthdays already marked. This is the killer feature for personal users.

---

## 🔥 Priority: Miro App — Remaining Phases

See [MIRO_APP_PLAN.md](./MIRO_APP_PLAN.md) for full architecture. Current status: **Phases 1–6 complete** (setup, engine, panel, generator, deployment, Miroverse). Remaining:

### M7. Marketplace Submission 📝 (2–3 days)
Prepare listing: title, description, screenshots (panel UI, generated calendar, close-up). Privacy policy URL, support email, app icon (128×128 SVG). Submit to [Miro Marketplace](https://miro.com/marketplace/).

**Requirements checklist:**
| Requirement | Status |
|-------------|--------|
| OAuth 2.0 authorization | ✅ |
| HTTPS only (Vercel) | ☐ |
| Privacy policy URL | ☐ |
| Support email | ☐ |
| App icon (128×128 SVG) | ☐ |
| Marketplace listing (4 screenshots) | ☐ |
| Mirotone CSS for UI | ✅ |

**Review timeline:** 6–8 weeks after submission.

**Why:** 60M+ Miro users = built-in distribution channel. WallPlan as a native Miro tool for roadmapping and project planning. Different audience (product managers, agile teams).

### M8. Post-Launch Analytics 📊 (ongoing)
Miro App Metrics Dashboard: total installs, daily active users, churn rate, user reviews. Iterate based on feedback.

---

## 🔬 Competitive Analysis

### WallPlan vs Competitors — Feature Comparison

| | **WallPlan** | **Calidar.io** | **Kruglendar** | **Notion Planners** | **Calendar Generators** (SaaS) |
|---|---|---|---|---|---|
| **Concept** | Multi-year wall Gantt calendar on roll paper | InDesign template generator (wall, photo, tri-month) | Circular diary poster on A1 | Digital planners in Notion + PDF for print | Online generators (Venngage, Template.net, etc.) |
| **Horizon** | 1 month – 20 years | 1 year | 1 year | 1 week – 1 year | Usually 1 year |
| **Output** | SVG + PDF | IDML (Adobe InDesign) | PDF (A1) | Notion + PDF | PNG/PDF |
| **Gantt rows** | ✅ 6/8/10/12 | ❌ | ❌ | ❌ | ❌ |
| **Multi-year** | ✅ up to 240 months | ❌ single year only | ❌ | ❌ | ❌ |
| **Paper sizes** | A4, A3, 914mm (×1/×2/×4) | A0–A6 (landscape/portrait) + custom | A1 fixed | Digital-first | Varies |
| **Customization** | Rows, colors, entries, hide days | Fonts (Google Fonts), colors (CMYK/Pantone/HKS), lunar calendar, week numbering | ❌ Fixed design | Notion blocks, fixed layout | Templates with variables |
| **Price** | Free, open-source | Freemium (1 free, Premium = unlimited) | Free (PDF) | $5–$50+ per template pack | Freemium |
| **Technology** | Vanilla JS, SVG, zero deps | Server-side IDML generation | Static PDF | Notion API | Varies (AI-based) |
| **Miro integration** | ✅ Native app + Miroverse template | ❌ | ❌ | ❌ | ❌ |
| **Mobile** | ✅ Touch, bottom sheet, welcome carousel | ✅ Responsive site | ❌ | ✅ Notion mobile | Varies |
| **Open-source** | ✅ CC BY-SA 4.0 | ❌ | ❌ | ❌ | ❌ |

**Unique advantages of WallPlan:**
1. **Only multi-year generator** — all competitors limited to 1 year
2. **Gantt rows** — no competitor offers planning rows on top of calendar
3. **Roll printing** — 914mm engineering paper format is unique
4. **Miro** — only product with native Miro integration (app + Miroverse template)
5. **Zero-dependency** — unlike Calidar (server-side InDesign) and Notion (platform lock-in)

**Where competitors are stronger:**
- **Calidar.io** — professional typography (CMYK, Pantone, HKS, Google Fonts, InDesign format). Deeper print pipeline for designers/print shops
- **Kruglendar** — unique circular year visualization, beautiful "diary poster" concept. Different niche (reflective journaling vs planning)
- **Notion Planners** — Notion ecosystem, digital workflow. Different category (app-first vs print-first)

---

### How Competitors Present Themselves — Landing, SEO, Monetization, Promotion

#### Landing Pages

| | **WallPlan** | **Calidar.io** | **Kruglendar** | **Notion Planners** |
|---|---|---|---|---|
| **Hero** | App = landing (calendar immediately on screen) | Classic marketing landing with sections | Minimalist single-page with use cases | Gumroad/Etsy product card |
| **CTA** | No explicit CTA — user is already in the app | «Kalender erstellen» (Create Calendar) | «Download PDF» | «Buy Now $9.99» |
| **Social proof** | ❌ None | ✅ Trustpilot 4.5★, Google reviews, designer quotes | ❌ | ✅ Etsy/Gumroad reviews |
| **Trust metrics** | ❌ | ✅ «47,000+ templates, 94,000 hours saved, 249 countries, 118 languages» | ❌ | ✅ «500+ products sold» |
| **Audience personas** | Implicit (README only) | ✅ Separate sections: Designers, Agencies, Photographers, Publishers, Developers | ❌ | ✅ Via template categories |
| **Languages** | EN + RU | DE + EN (4 locales) | EN (RU author, EN site) | EN |

**🔑 Takeaways for WallPlan:**
- Add **social proof** section (reviews, download counter)
- Add **"Who is it for"** section (managers, entrepreneurs, teams)
- Show **numbers** (downloads, users, countries)
- Repurpose **welcome carousel** (already exists on mobile) as desktop first-visit intro

#### SEO

| | **WallPlan** | **Calidar.io** | **Kruglendar** | **Notion Planners** |
|---|---|---|---|---|
| **Title/Meta** | ✅ Optimized | ✅ Per-locale optimized | ❌ Basic | ✅ Etsy SEO |
| **JSON-LD** | ✅ SoftwareApplication | Likely yes | ❌ | ❌ (Etsy built-in) |
| **Structured pages** | 1 page (SPA) | ✅ Dozens of pages: each calendar type = separate page | 1 page | Etsy/Gumroad listings |
| **hreflang** | ✅ EN ↔ RU | ✅ DE-DE, DE-AT, DE-CH, EN-GB, EN-US | ❌ | ❌ |
| **llms.txt** | ✅ | ❌ | ❌ | ❌ |
| **AI crawler access** | ✅ GPTBot, ClaudeBot | Unknown | ❌ | ❌ |
| **Keyword coverage** | Narrow niche | ✅ Broad: «Photo calendar», «Desk calendar», «Family planner»… 13+ types | Narrow | Broad (long-tail) |

**🔑 Takeaways for WallPlan:**
- **Calidar** creates a separate page for each calendar type → drives SEO traffic on specific queries. WallPlan can create landing pages:
  - `/gantt-calendar` — «Multi-year Gantt Calendar Generator»
  - `/wall-calendar` — «Printable Wall Calendar for Large Paper»
  - `/roll-calendar` — «914mm Roll Paper Calendar»
- Add **FAQ section** (Google rich snippets)
- Create **`/use-cases`** or **`/for-who`** page (like Calidar: «for managers», «for teams»)

#### Monetization Comparison

| | **WallPlan** | **Calidar.io** | **Kruglendar** | **Notion Planners** | **Calendar Generators** (SaaS) |
|---|---|---|---|---|---|
| **Model** | Free, open-source | **Freemium SaaS**: 1 free → Premium subscription | Free PDF | **Paid product**: $5–50 per pack | Freemium / subscription |
| **What's paid** | — | Unlimited templates, InDesign/Quark/Affinity export | — | Templates + eBook | Customization, formats, logos |
| **Add-on services** | — | ✅ «Complex calendar programming», «Custom design», «Printing» | — | Customization | API, white-label |
| **Marketplaces** | Miroverse (free) | Own website | Own website | Etsy + Gumroad | ProductHunt + own site |

#### Promotion Channels

| Channel | **Calidar** | **Kruglendar** | **Notion Planners** | **WallPlan now** | **WallPlan should** |
|---------|-------------|----------------|---------------------|-----------------|---------------------|
| **ProductHunt** | ❌ | ❌ | ✅ Launch | ❌ | ✅ **Must do** |
| **Miroverse** | ❌ | ❌ | ❌ | ✅ Done | ✅ Already done |
| **Newsletter** | ✅ rapidmail | ❌ | ❌ | ❌ | ✅ Add |
| **Trustpilot/Google** | ✅ 4.5★ | ❌ | ❌ | ❌ | ✅ Create profile |
| **Telegram** | ❌ | ✅ Author's channel | ❌ | ❌ | ✅ Channel or bot |
| **Medium/Blog** | ❌ | ❌ | ❌ | ✅ 2 articles | ✅ Expand |
| **Etsy/Gumroad** | ❌ | ❌ | ❌ | ❌ | 💡 For passive income |
| **GitHub Stars** | ❌ | ❌ | ❌ | Low | ✅ Promote OSS |

---

### Action Plan (derived from competitive analysis)

**Quick wins (1–2 days):**
1. **ProductHunt launch** — main channel for indie tools, free traffic + high-authority backlink
2. Add **social proof** to landing (download counter, embed reviews)
3. Complete **GitHub About section** (Description + Topics + Website)

**Mid-term (1–2 weeks):**
4. Create **SEO landing pages** by type (`/gantt`, `/wall`, `/roll`)
5. Prepare **Etsy/Gumroad listing** with ready-made PDFs for 2026–2027
6. Add **FAQ section** for rich snippets

**Strategic (1–3 months):**
7. **Freemium model**: paid custom branding / white-label (see § Monetization)
8. **Newsletter** for annual updates (like Kruglendar — yearly email notifications)
9. **API** for corporate clients (like Calidar)

---

## 📌 Notes
- Stickers and images use the same SVG-based architecture
- All creative tools work offline (localStorage), cloud sync requires Google Auth
- GA4 alerts require a separate backend (Cloud Function or Zapier)
- **Miro App is the current priority** — deploy → Miroverse template → marketplace submission

---

## 💰 Monetization

### 11. Print-as-a-Service 🖨️
"Order Print & Delivery" button → user creates calendar → WallPlan generates PDF → sends to print API → printed on heavy paper → delivered worldwide. Integration with **Gelato** (130+ print partners, 32 countries, A3/A2/A1 posters) or **Printful**. Payment via Stripe. Margin: $10-30 per calendar.

**Why:** Most natural monetization — user already wants to print. One click from free tool to paid product. No subscription fatigue.

### 12. Freemium 💎
| Free | Pro ($29 one-time) |
|------|--------------------|
| Up to 12 months | Up to 20 years |
| 3 Gantt rows | Unlimited rows |
| Watermark on PDF | Clean PDF |
| Basic holidays | Holidays for all countries |
| — | Cloud save (Google Auth) |
| — | Custom sticker packs |

### 13. Brand Collaborations 🤝
Sponsored calendar templates / themed editions with brands:
- **Monopoly** — calendar with Monopoly property grid aesthetic
- **LEGO** — brick-style calendar blocks, LEGO color palette
- **IKEA** — minimalist Scandinavian calendar design
- **Designers** — limited edition calendars by invited graphic designers
- **Sports teams** — season calendars with club colors and match dates
- **Universities** — academic year calendars with semester dates

Revenue model: licensing fee per template + revenue share on prints. Brands get exposure, WallPlan gets content and distribution.

### 14. Corporate Licensing 🏢
White-label version with company logo, brand colors, internal holidays. Self-hosted option for intranet. $200-500/year per company.

---

## 💡 Improvements (no new features)

### UX
- **Onboarding** — first-visit tooltips (what to scroll, where is Gantt)

### Marketing & Distribution
- **ProductHunt Launch** — free traffic + high-authority backlink
- **Reddit** — posts in r/productivity, r/selfhosted, r/webdev
- **Hacker News** — Show HN post
- **Landing Page** — `/wallplan/about/` with SEO text targeting long-tail keywords

### Technical
- **Error Tracking** — Sentry for JS errors
- **Lazy Font Loading** — load fonts on demand
- **A/B Testing** — experiment with title/description for better CTR
