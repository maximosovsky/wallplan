# WallPlan — Miro App Plan

## 🎯 Goal

Publish WallPlan as a **Miro App** in the [Miro Marketplace](https://miro.com/marketplace/).  
User clicks "Use template" → gets a multi-year Gantt calendar generated directly on a Miro board as native board items (shapes, frames, text).

---

## 🧩 Two Products in One

### Product A: Miro App (panel plugin)
- Icon in Miro sidebar → opens WallPlan panel
- User selects: duration, paper size, Gantt rows, week start
- Click "Generate" → calendar is created on the board as native Miro items
- Can be re-generated, updated, deleted

### Product B: Miro Template (Miroverse)
- Pre-built board with a sample 12-month calendar
- Published to [Miroverse](https://miro.com/miroverse/) (community templates, no review needed)
- Free marketing — appears in search results
- Link to the full App for customization

---

## 📐 Architecture

```
wallplan-miro/
├── src/
│   ├── app.tsx              # Panel UI (settings form)
│   ├── index.ts             # SDK entry point
│   ├── generator.ts         # Calendar → Miro board items
│   ├── calendar-engine.ts   # Ported from calendar.js (date math, layout)
│   ├── holidays.ts          # US holidays + WallPlan Day
│   └── styles.css           # Panel styles (Mirotone CSS)
├── public/
│   └── icon.svg             # App icon for sidebar
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**Stack:** TypeScript + React + Vite (official Miro starter)

---

## 🔧 Phase 1: Setup (Day 1)

### 1.1 Create Miro Developer Account
- Go to https://developers.miro.com
- Create a Developer Team (free)
- Register a new App in Developer Dashboard

### 1.2 Scaffold Project
```bash
npx create-miro-app@latest wallplan-miro
# Select: React, TypeScript
```

### 1.3 Configure App Permissions
Required OAuth scopes:
- `boards:read` — read board info
- `boards:write` — create items on board
- `identity:read` — user info (for onboarding)

### 1.4 Local Dev
```bash
cd wallplan-miro
npm run start    # Starts on localhost:3000
# Install app on test board via Developer Dashboard
```

---

## 🗓️ Phase 2: Calendar Engine (Days 2–4)

### 2.1 Port Core Logic from `calendar.js`

Extract pure functions (no DOM/SVG dependencies):

| Function | Purpose |
|----------|---------|
| `calcMonths(startDate, months)` | Generate month metadata array |
| `calcLayout(months, paper, rows)` | Page dimensions, cell sizes |
| `getHolidays(year)` | US Federal Holidays |
| `getDaysInMonth(year, month)` | Day count + day-of-week |
| `getWeekRows(month, weekStart)` | Box-calendar week layout |

### 2.2 Calendar → Miro Items Mapping

| WallPlan Element | Miro Item Type | SDK Method |
|-----------------|----------------|------------|
| Month column | `frame` | `miro.board.createFrame()` |
| Month header | `text` | `miro.board.createText()` |
| Day numbers | `text` | `miro.board.createText()` |
| Gantt grid lines | `shape` (line) | `miro.board.createShape()` |
| Gantt row labels | `text` | `miro.board.createText()` |
| Holiday markers | `shape` (circle) | `miro.board.createShape()` |
| Holiday labels | `text` | `miro.board.createText()` |
| Box calendar grid | `shape` (rect) | `miro.board.createShape()` |
| Page border | `shape` (rect) | `miro.board.createShape()` |

### 2.3 Color Palette (Moleskine)

```typescript
const COLORS = {
  paper:      '#FDF6E3',  // cream background
  ink:        '#2C2C2C',  // main text
  inkLight:   '#5A5A5A',  // secondary text
  red:        '#C41E3A',  // holidays, WallPlan Day
  border:     '#C8B89A',  // grid lines
  ganttBg:    '#F5ECD7',  // gantt row background
  weekend:    '#E8D5B7',  // weekend highlight
};
```

---

## 🎨 Phase 3: Panel UI (Days 5–6)

### 3.1 Settings Panel

The app panel (sidebar) contains:

```
┌─────────────────────┐
│  W  WallPlan        │
├─────────────────────┤
│ Duration            │
│ [2] yr  [6] mo      │
│                     │
│ Gantt Rows          │
│ ○ 6  ○ 8  ● 10  ○ 12│
│                     │
│ Week Start          │
│ ● Mon  ○ Sun        │
│                     │
│ Holidays            │
│ ☑ US Federal        │
│                     │
│ ┌─────────────────┐ │
│ │  Generate ▶     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │  Clear Calendar  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### 3.2 Use Mirotone CSS
- Official Miro design system: https://www.mirotone.xyz/
- Ensures consistent look with native Miro UI
- `npm install mirotone`

---

## ⚡ Phase 4: Generator (Days 7–10)

### 4.1 Generation Flow

```
User clicks "Generate"
  → clearPreviousCalendar()
  → calcLayout(settings)
  → for each month:
      → createFrame(month)       // container
      → createMonthHeader(name)  // "January 2026"
      → createDayColumn(days)    // vertical day list
      → createGanttGrid(rows)    // horizontal lines
      → createBoxCalendar(weeks) // mini month grid
      → createHolidays(holidays) // colored markers
  → zoomToFit()
```

### 4.2 Performance Considerations

- Miro SDK has rate limits (~100 items/sec)
- 12-month calendar ≈ 500–800 items
- Use `Promise.all` batching (groups of 20)
- Show progress bar in panel: "Creating month 3/12..."
- Cache generated item IDs in board metadata for cleanup

### 4.3 Board Metadata

Store calendar config in board app data:
```typescript
await miro.board.setAppData({
  wallplan: {
    version: '1.0',
    months: 12,
    rows: 10,
    weekStart: 'mon',
    generatedAt: Date.now(),
    itemIds: [...] // for cleanup
  }
});
```

---

## 📋 Phase 5: Miroverse Template (Day 11)

### 5.1 Create Template Board
- Generate a beautiful 12-month (Jan–Dec 2026) calendar
- Add instructional frame: "How to use WallPlan"
- Add link to the full Miro App
- Use the Moleskine color palette

### 5.2 Submit to Miroverse
- Go to https://miro.com/miroverse/
- Click "Share template"
- Fill in: title, description, category (Planning & Strategy)
- No review process — published immediately
- **This gives us instant visibility while the App goes through review**

---

## 🔒 Phase 6: Marketplace Submission (Days 12–14)

### 6.1 Requirements Checklist

| Requirement | Status |
|-------------|--------|
| OAuth 2.0 authorization | ☐ |
| HTTPS only | ☐ |
| TLS 1.2+ | ☐ |
| Privacy policy URL | ☐ |
| Support email | ☐ |
| App icon (128×128 SVG) | ☐ |
| Marketplace listing (screenshots, description) | ☐ |
| Mirotone CSS for UI | ☐ |
| No Miro credential storage | ☐ |
| Developer profile on Miro | ☐ |

### 6.2 Hosting

Options:
- **Vercel** (recommended) — free, HTTPS, auto-deploy from GitHub
- Netlify — alternative
- Self-hosted on osovsky.com

### 6.3 Marketplace Listing

**Title:** WallPlan — Multi-Year Calendar Generator

**Short description:** Generate printable multi-year Gantt calendars directly on your Miro board.

**Category:** Planning & Strategy

**Screenshots needed:**
1. Panel UI with settings
2. Generated calendar on board (zoomed in)
3. Generated calendar (full view)
4. Close-up of Gantt rows with stickers

### 6.4 Review Timeline
- Submit → Jira ticket created
- Review takes **6–8 weeks**
- Communication via Jira ticket
- May require iterations based on feedback

---

## 🚀 Phase 7: Post-Launch (Ongoing)

### 7.1 Analytics
- Miro App Metrics Dashboard (built-in):
  - Total installs
  - Daily active users
  - Churn rate
  - User reviews

### 7.2 Future Features
- Russian locale toggle in panel
- Custom entries (user stickers on dates)
- Google Calendar import (via Miro + Google OAuth)
- Multiple calendar styles (Gantt-only, Box-only, Timeline)

---

## 📅 Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Setup | Day 1 | Scaffolded project, dev environment |
| 2. Engine | Days 2–4 | Ported calendar logic (TypeScript) |
| 3. Panel UI | Days 5–6 | Settings form with Mirotone CSS |
| 4. Generator | Days 7–10 | Calendar → Miro board items |
| 5. Template | Day 11 | Miroverse template (instant publish) |
| 6. Submission | Days 12–14 | Marketplace submission |
| 7. Review | +6–8 weeks | Marketplace approval |

**Total active work: ~2 weeks**  
**Time to Marketplace: ~2 months** (including review)

---

## 💰 Monetization

The Miro App itself is **free** (drives WallPlan brand awareness).  
Revenue comes from:
- Brand visibility → users discover osovsky.com/wallplan
- Future: premium features behind paywall (custom sticker packs, cloud sync)
- Corporate licensing for white-label Miro templates

---

## 🔗 Key Links

- Miro Developer Platform: https://developers.miro.com
- Web SDK Docs: https://developers.miro.com/docs/web-sdk-reference
- Mirotone CSS: https://www.mirotone.xyz
- Miroverse (templates): https://miro.com/miroverse
- App Examples: https://github.com/miroapp/app-examples
- Marketplace Guidelines: https://developers.miro.com/docs/app-submission-requirements
