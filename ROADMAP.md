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

---

## 🟢 Easy (1–2 days)

### 1. Stickers 🟨🩷
Two sticker types (yellow, pink) that stick directly onto the calendar. Click button → click on calendar → sticker appears. Double-click to edit text. Drag to move. Pure SVG (`<rect>` + `<text>`), exports cleanly to SVG and PDF. Persist in localStorage.

**Why:** Users print calendars on the wall for planning. Stickers let them annotate deadlines, milestones, vacations _before_ printing. This is the single most requested feature — it transforms WallPlan from a static calendar into a lightweight planning tool.

### 2. Unified Overlay System
Single `renderOverlays()` function called after every `buildPages()` to re-render stickers and images from a shared data model. Required foundation for stickers + images.

**Why:** Technical prerequisite. Without a shared overlay architecture, each new creative tool (stickers, images, stamps) would duplicate rendering logic and break on rebuild. Build once, reuse for everything.

### 3. Shareable Timeline Links 🔗
Persist custom entries (`customEntries[]`) in URL params so calendars with annotations are shareable via link. Format: `&m=DD.MM:text,DD.MM:text,...` (URI-encoded). Parse in `init()`, serialize in `updateCalendar()`. For large data — compress with `LZString.compressToEncodedURIComponent()` (~5Kb library). Copy-link button in toolbar.

**Why:** Zero-server sharing. Send a link in Slack or Telegram — recipient sees your calendar with all marked dates instantly. Like Excalidraw's URL-based state. Transforms WallPlan from a local tool into a **collaboration primitive**. Makes the existing custom entries feature useful beyond a single session.

---

## 🟡 Medium (3–5 days)

### 4. Image Upload 📎
Upload images onto the calendar canvas. Resize on upload (max 800px, JPEG 80%) → embed as base64 `<image>` in SVG. Drag and resize on canvas. Exports to both SVG and PDF. Depends on Overlay System.

**Why:** Corporate users want company logos, project photos, and team avatars on printed calendars. Makes WallPlan viable for branded office calendars and internal planning boards.

### 5. Google Authentication
Sign in with Google to save and load calendar configurations (duration, rows, paper format, stickers, images) to the cloud.

**Why:** Currently state lives in URL params + localStorage — switching browser or device means starting over. Cloud sync = open on any device and everything is there. Also required for Google Calendar Import.

### 6. Internationalization — 5 New Locales 🌍
Localized calendar versions with translated month/day names and national holidays:

| Locale | Path | Holidays |
|--------|------|----------|
| 🇮🇹 Italian | `/it/` | Capodanno, Ferragosto, Natale, Pasquetta, Liberazione... |
| 🇫🇷 French | `/fr/` | Jour de l'an, Fête nationale, Toussaint, Noël... |
| 🇨🇳 Chinese | `/zh/` | 春节 (Spring Festival), 国庆节, 中秋节, 清明节... |
| 🇪🇸 Spanish | `/es/` | Año Nuevo, Día de la Hispanidad, Navidad, Reyes... |
| 🇦🇪 Arabic (UAE) | `/ar/` | عيد الفطر, عيد الأضحى, اليوم الوطني, رأس السنة الهجرية... |

**Architecture:** Shared `calendar-core.js` with locale config objects (`MONTHS`, `WEEK_DAYS`, `getHolidays()`). Each locale = separate `index.html` + thin `calendar-{lang}.js` wrapper. Arabic requires RTL layout support. Chinese/Islamic holidays need lunar calendar computation.

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
Import birthdays and events from Google Calendar. Display as markers or labels on corresponding dates. Requires Google Auth + Calendar API + OAuth scopes + event parsing.

**Why:** Instead of manually placing stickers for every birthday and meeting — pull them automatically. Print a 3-year calendar with all family birthdays already marked. This is the killer feature for personal users.

### 9. Custom Sticker Packs 💬
Custom SVG sticker sets — like Telegram sticker packs. Users can create, import, and share themed collections. Needs UI for pack management, import/export format, potential community marketplace.

**Why:** Virality and monetization. Users create and share packs → attract new users. Potential for paid premium packs (project management, education, fitness tracking). Turns WallPlan into a platform.

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
- **Favicon.ico** — real `.ico` file (not all browsers support SVG favicon)

### Marketing & Distribution
- **ProductHunt Launch** — free traffic + high-authority backlink
- **Reddit** — posts in r/productivity, r/selfhosted, r/webdev
- **Hacker News** — Show HN post
- **Landing Page** — `/wallplan/about/` with SEO text targeting long-tail keywords

### Technical
- **Lighthouse Audit** — aim for 90+ on Performance/Accessibility/SEO
- **Service Worker** — offline PWA
- **Error Tracking** — Sentry for JS errors
- **Lazy Font Loading** — load fonts on demand
- **A/B Testing** — experiment with title/description for better CTR
