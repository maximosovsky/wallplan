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
