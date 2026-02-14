# WallPlan — Roadmap

Tasks ordered by complexity (easiest first). Each task includes a rationale for why it matters to users and the product.

## ✅ Done

### ~~Timeline Mode 📏~~
Implemented via the **Hide Days** toggle. Calendar without daily grid — only vertical year, quarter, and month divisions. Gantt rows remain for high-level project planning. URL parameter `&d=1`.

### ~~Custom Entries ✏️~~
Session-only text annotations on any date. T button (Copper Penny font) opens modal: text + DD.MM date input with auto-formatting (all delimiters, pure digits). Yearly repeat option. Renders alongside holidays, exports to SVG/PDF. Not persisted — lightweight by design.

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

### 3. Image Upload 📎
Upload images onto the calendar canvas. Resize on upload (max 800px, JPEG 80%) → embed as base64 `<image>` in SVG. Drag and resize on canvas. Exports to both SVG and PDF. Depends on Overlay System.

**Why:** Corporate users want company logos, project photos, and team avatars on printed calendars. Makes WallPlan viable for branded office calendars and internal planning boards.

### 4. Google Authentication
Sign in with Google to save and load calendar configurations (duration, rows, paper format, stickers, images) to the cloud.

**Why:** Currently state lives in URL params + localStorage — switching browser or device means starting over. Cloud sync = open on any device and everything is there. Also required for Google Calendar Import.

---

## 🔴 Hard (1–3 weeks)

### 5. Google Calendar Import
Import birthdays and events from Google Calendar. Display as markers or labels on corresponding dates. Requires Google Auth + Calendar API + OAuth scopes + event parsing.

**Why:** Instead of manually placing stickers for every birthday and meeting — pull them automatically. Print a 3-year calendar with all family birthdays already marked. This is the killer feature for personal users.

### 6. Custom Sticker Packs 💬
Custom SVG sticker sets — like Telegram sticker packs. Users can create, import, and share themed collections. Needs UI for pack management, import/export format, potential community marketplace.

**Why:** Virality and monetization. Users create and share packs → attract new users. Potential for paid premium packs (project management, education, fitness tracking). Turns WallPlan into a platform.

### 7. Miro App
Publish WallPlan as a Miro App / plugin. Use as a template inside Miro boards — "Universe" template style. Submit to [Miro Marketplace](https://miro.com/marketplace/). Requires Miro SDK, separate codebase, review process.

**Why:** 60M+ Miro users = built-in distribution channel. WallPlan as a native Miro template for roadmapping and project planning. Different audience (product managers, agile teams), different revenue model (Miro ecosystem).

---

## 📌 Notes
- Stickers and images use the same SVG-based architecture
- All creative tools work offline (localStorage), cloud sync requires Google Auth
- Miro App requires separate Miro SDK integration
- Recommended build order: 1 → 2 → 3 → 4 → 5 → 6 → 7
