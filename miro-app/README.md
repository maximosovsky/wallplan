<div align="center">

# 📅 WallPlan

![Miro](https://img.shields.io/badge/Miro-SDK_2.0-050038?style=for-the-badge&logo=miro&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-CC_BY--SA_4.0-lightgrey?style=for-the-badge)

**Multi-year Gantt calendar generator for Miro — native elements, fully editable**

</div>

> WallPlan creates production-ready Gantt calendars directly on your Miro board as native shapes, text, and frames. No images, no exports — everything is editable right where you plan.

<div align="center">

<img src="https://miro.com/blog/wp-content/uploads/2017/06/gantt-chart-hero.png" width="600" alt="WallPlan calendar preview">

[Quick Start](#-quick-start) · [Features](#-features) · [Tech Stack](#️-tech-stack) · [Docs](#documentation)

</div>

---

## 💡 Concept

Planning across years requires more than a spreadsheet — it needs spatial context. WallPlan generates a complete multi-year calendar on your Miro board: day lists, Gantt rows, box calendars, holidays, and week numbers — all as native Miro elements you can annotate with sticky notes, shapes, and arrows. Generate once, plan forever.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Multi-year span** | 1 month to 20+ years in a single calendar |
| **Custom start date** | Begin from any month and year |
| **Gantt rows** | 6, 8, 10, or 12 configurable horizontal rows |
| **Week start** | Monday or Sunday (Sunday highlighted in red) |
| **Timeline mode** | Hide day-level detail for roadmap-style planning |
| **US Federal Holidays** | Automatically calculated and marked in red |
| **Box calendar** | Mini month grid with ISO week numbers |
| **Progressive rendering** | First 3 months appear instantly, rest loads in background |
| **Rate-limit safe** | Conservative batching (10 calls, 500 ms gap) for large calendars |
| **Non-destructive** | New calendars created alongside existing ones |
| **Miroverse template** | [2-Year Template 2026–2027](https://miro.com/miroverse/2year-timeline-gantt-calendar-20262027/) ready to use |

---

## 🚀 Quick Start

```bash
npm install
npm run start
```

Open [Miro Developer Dashboard](https://developers.miro.com), set **App URL** → `http://localhost:3000`, and open any board.

<details>
<summary>Production deployment</summary>

```bash
npm run build       # Output in dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages).

**Live:** [wallplan-miro.vercel.app](https://wallplan-miro.vercel.app/)

**Required OAuth scopes:** `boards:read`, `boards:write`, `identity:read`

</details>

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Miro Web SDK 2.0 |
| UI | React 18 + TypeScript 4.9 |
| Build | Vite 3 |
| Design | Mirotone CSS (official Miro UI kit) |
| Fonts | IBM Plex Sans (`plex_sans` — native Miro font) |

```
src/
├── app.tsx              # Panel UI — settings form (React)
├── index.ts             # SDK entry point — registers panel
├── generator.ts         # Orchestrator — delegates to native-generator
├── native-generator.ts  # Native Miro elements builder (shapes, text, frames)
├── calendar-engine.ts   # Pure date math — no DOM, no SVG
├── svg-renderer.ts      # SVG string builder (legacy, kept for reference)
└── assets/
    └── style.css        # Mirotone overrides
```

---

## 🗺️ Roadmap

- [x] Native Miro element generation (shapes, text, frames)
- [x] Progressive rendering for fast UX
- [x] Rate-limit safe batching
- [x] US Federal Holidays
- [x] Miroverse template published
- [ ] Miro Marketplace submission
- [ ] Multi-language holiday support
- [ ] Color theme selector
- [ ] Saved presets per board

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Module map, layout system, generation pipeline |
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user guide with settings explanation |
| [APP_SUBMISSION.md](./APP_SUBMISSION.md) | Marketplace submission checklist |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit and push
4. Open a Pull Request

---

## 📄 License

[Maxim Osovsky](https://www.linkedin.com/in/osovsky/). Licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
