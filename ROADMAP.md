# WallPlan — Roadmap

## 🎨 Creative Tools

### Stickers 🟨🩷
Two sticker types (yellow, pink) that stick directly onto the calendar. Click button → click on calendar → sticker appears. Double-click to edit text. Drag to move. Pure SVG (`<rect>` + `<text>`), exports cleanly to SVG and PDF. Persist in localStorage.

### Image Upload 📎
Upload images onto the calendar canvas. Resize on upload (max 800px, JPEG 80%) → embed as base64 `<image>` in SVG. Drag and resize on canvas. Exports to both SVG and PDF without issues.

### Unified Overlay System
Single `renderOverlays()` function called after every `buildPages()` to re-render stickers and images from a shared data model.

### Custom Sticker Packs 💬
Custom SVG sticker sets — like Telegram or WhatsApp sticker packs. Users can create, import, and share themed sticker collections. Each sticker is a standalone SVG that can be placed on the calendar. Potential for community-created packs.

### Timeline Mode 📏
Calendar without daily grid — only vertical year, quarter, and month divisions (optionally weeks). Designed for long timelines (5–20 years) where individual days are not needed. Gantt rows remain for high-level project planning.

---

## 🔗 Integrations

### Google Authentication
Sign in with Google to save and load calendar configurations (duration, rows, paper format, stickers, images) to the cloud.

### Google Calendar Import
Import birthdays and events from Google Calendar. Display as markers or labels on corresponding dates in the calendar grid.

---

## 🧩 Platform

### Miro App
Publish WallPlan as a Miro App / plugin. Use as a template inside Miro boards — "Universe" template style.

---

## 📌 Notes
- Stickers and images use the same SVG-based architecture
- All creative tools work offline (localStorage), cloud sync requires Google Auth
- Miro App requires separate Miro SDK integration
