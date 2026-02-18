# 📖 WallPlan — User Manual

## What is WallPlan?

WallPlan is a browser-based calendar generator for long-term planning. It creates printable multi-year calendars with three views: vertical day lists, Gantt-style planning grids, and mini month boxes — all on a single wall poster.

**No login. No data collection. Everything stays in your browser.**

---

## 🚀 Getting Started

Open [osovsky.com/wallplan](https://osovsky.com/wallplan/) in any modern browser. The calendar renders immediately with default settings (12 months, A4, 10 Gantt rows, Monday week start).

### Local Development

```bash
npx -y serve -l 3456
# Open http://localhost:3456
```

---

## 🖥️ Desktop Controls

The desktop interface has two control panels at the top:

### Top Panel (Settings)

| Control | How to Use |
|---------|-----------|
| **Duration** | Type number of months (1–240). `12` = 1 year, `60` = 5 years, `120` = 10 years |
| **Paper format** | Click `A4`, `A3`, `914`, `914×2`, or `914×4` to select paper size. Hover to see page count or roll length |
| **Gantt rows** | Click `6`, `8`, `10`, or `12` to set the number of planning rows |
| **Week start** | Toggle between `Mon` (Monday) and `Sun` (Sunday) |

### Bottom Panel (Actions)

| Control | How to Use |
|---------|-----------|
| **W** | Cherry-red logo button — opens the custom entry modal to add text annotations on any date |
| **Hide Days** | Toggle to hide day-level details, leaving only year/quarter/month divisions |
| **🎨 Colors** | Toggle month color palette — concentric circles (off) / Itten wheel (on). See [COLORS.md](./COLORS.md) |
| **⬇ SVG** | Download calendar as SVG file(s) |
| **🖨 PDF** | Generate and download PDF with embedded fonts |

### Navigation

| Action | How |
|--------|-----|
| **Zoom in/out** | Mouse wheel |
| **Pan** | Click and drag on the calendar |
| **Reset view** | The calendar auto-fits when you change settings |

---

## 📱 Mobile Controls

On screens narrower than 768px, WallPlan switches to a mobile-optimized interface with a bottom toolbar.

### Bottom Toolbar (6 buttons, left to right)

| Button | What it Shows | What it Does |
|--------|--------------|-------------|
| **W** | Cherry-red logo | Opens custom entry modal |
| **Duration** | e.g. `1 YR` or `16 MO` | Tap to open settings sheet |
| **Rows** | e.g. `10 ROWS` | Tap to cycle: 6 → 8 → 10 → 12 |
| **Format** | e.g. `A4 2 pg` or `914 1.8 m` | Tap to cycle paper formats |
| **Grid icon** | Calendar grid with slash | Tap to toggle Hide Days mode |
| **⬇** | Download arrow | Tap to show SVG/PDF options |

### Settings Sheet

Tap the **duration** button to open the settings sheet. It slides up from the bottom and contains:

1. **Duration Picker** — Two scroll wheels:
   - **Years** (0–20): flick to scroll, snaps to values
   - **Months** (0–11): same scroll behavior
   
2. **Paper Format** — Tap to select: `A4`, `A3`, `914`, `914×2`, `914×4`
   - Roll formats show the estimated roll length (e.g. `· 1.5 m`)

3. **Gantt Rows** — Choose 6, 8, 10, or 12

4. **Week Start** — Toggle Monday / Sunday

**To close the sheet**: tap anywhere outside the sheet area.

### Touch Gestures

| Gesture | Action |
|---------|--------|
| **One finger drag** | Pan the calendar |
| **Pinch** | Zoom in/out, centered on your fingers |

---

## 📄 Paper Formats

| Format | Size | Layout | Best For |
|--------|------|--------|----------|
| **A4** | 297 × 210 mm | 7–8 months per page, multiple pages | Home/office printing |
| **A3** | 420 × 297 mm | 7–8 months per page, fewer pages | Larger wall posters |
| **914** | 914mm tall × unlimited | Everything on one continuous roll | Professional copy centers |
| **914×2** | 914mm tall, 2 copies stacked | Two identical calendars | Share with a colleague |
| **914×4** | 914mm tall, 4 copies stacked | Four identical calendars | Team distribution |

> 💡 **Roll formats** (914mm) show the estimated roll length in the toolbar. Typical lengths:
> - 12 months ≈ 1.5m
> - 5 years ≈ 7m
> - 10 years ≈ 14m

---

## ✏️ Custom Entries

Add your own text annotations on any date — birthdays, deadlines, milestones.

### How to Add

1. Click/tap the **W** button (cherry-red letter in Copper Penny DTP font)
2. Enter your text (e.g. "Project launch")
3. Enter the date in `DD.MM` format (e.g. `15.03` for March 15)
   - Supported separators: `.` `/` `-` or just 4 digits (`1503`)
4. Check **Repeat yearly** if you want it to appear every year
5. Click **Add**

### Important Notes

- Entries exist only during your current session — **not saved** between page reloads
- Entries appear alongside holidays in the calendar
- Entries are included in SVG and PDF exports
- To remove an entry, click the **×** next to it in the entry modal

---

## 📥 Export

### SVG Export

- **A4/A3**: Each page exported as a separate `.svg` file
- **914×2/×4**: Copies combined into a single tall SVG
- Filename: `wallplan_{format}_{months}mo_{rows}rows_{date}.svg`

### PDF Export

- Vector PDF with embedded IBM Plex Sans fonts
- Exact reproduction of the on-screen calendar
- Filename: `wallplan_{format}_{months}mo_{rows}rows_{date}.pdf`

> 💡 PDF export requires a brief download of font files on first use (~2 seconds).

---

## 🖨️ Printing Tips

### At Home (A4/A3)

1. Select `A4` or `A3` format
2. Export to PDF
3. Print with "Actual size" (100%) — no scaling
4. Tape pages together for a multi-page wall calendar

### At a Copy Center (914mm roll)

1. Select `914` format (or `914×2` / `914×4` for multiple copies)
2. Export to PDF or SVG
3. Bring the file on a USB drive
4. Ask for **engineering paper** (914mm / 36" wide roll)
5. Print at 100% scale

> 📏 The on-screen rulers show exact centimeters/meters to help estimate the printed size.

---

## 🔗 URL Parameters

Share a specific configuration by adding parameters to the URL:

| Parameter | Example | Description |
|-----------|---------|-------------|
| `m` | `?m=60` | Number of months (60 = 5 years) |
| `r` | `?r=12` | Number of Gantt rows |
| `p` | `?p=914mm` | Paper format |
| `w` | `?w=sun` | Week start day |
| `d` | `?d=1` | Hide days mode (1 = on) |
| `c` | `?c=1` | Month color palette (1 = on) |

**Example**: `osovsky.com/wallplan/?m=120&r=10&p=914mm` — 10-year calendar on roll paper.

---

## 🎨 Calendar Anatomy

Each month column contains three sections, top to bottom:

1. **Year & Month Labels** — Year shown only at transitions, month name always visible
2. **Vertical Calendar** — 31 rows with day number, day of week, holidays, and week numbers
3. **Gantt Grid** — Day letters + numbers header, followed by empty planning rows
4. **Box Calendar** — Traditional 7×6 mini calendar with week numbers

### Visual Hierarchy

| Feature | Appearance |
|---------|-----------|
| Week separators | Thick lines between weeks |
| Month borders | Medium gray lines |
| Quarter borders | Thick black lines |
| Year borders | Thickest black lines |
| Holidays | Red text with holiday name |
| Custom entries | Alongside holidays |
| Month colors | Temperature-based palette when enabled — names and day numbers tinted by season |

---

## 🧩 Miro App

WallPlan is also available as a **Miro plugin** at [wallplan-miro.vercel.app](https://wallplan-miro.vercel.app/). It generates the same calendar layout directly on a Miro board as native elements (text, shapes, frames) — fully editable by any Miro user.

### How to Use

1. Install the WallPlan app from the Miro panel
2. Open the sidebar → configure duration, Gantt rows, week start
3. Click **Generate ▶**
4. First 3 months appear immediately, then the viewport zooms to the calendar
5. Remaining months generate in the background

### Key Differences from Web Version

| Feature | Web | Miro App |
|---------|-----|----------|
| Output | SVG / PDF file | Native Miro board elements |
| Editable | No (static image) | Yes — move, recolor, resize any element |
| Export | Download SVG/PDF | Miro's built-in export |
| Paper sizes | A4, A3, 914mm | N/A (infinite Miro canvas) |
| Colors toggle | Yes | No (temperature colors always on) |
| Re-generate | Replaces calendar | Creates new calendar alongside existing |

### Development

```bash
cd miro-app
npm install
npm run start    # localhost:3000
```

Set `http://localhost:3000` as App URL in [Miro Developer Dashboard](https://developers.miro.com).

---

## 🌐 Languages

- **English**: [osovsky.com/wallplan](https://osovsky.com/wallplan/)

---

## ❓ FAQ

**Q: Will my calendar be saved?**
A: No. WallPlan generates calendars on-the-fly. Export to SVG or PDF to save your calendar.

**Q: Can I add events?**
A: Yes, use the **W** button. Entries exist only during your session — export before closing the page.

**Q: What's the maximum duration?**
A: 240 months (20 years).

**Q: Can I use it offline?**
A: Once loaded, the calendar works offline. PDF export requires font files that need internet on first use.

**Q: Is my data sent anywhere?**
A: No. Everything runs locally in your browser. No server, no tracking (except anonymous GA4 page views).

**Q: What are the month colors?**
A: A temperature-based color palette (Material Design) that tints month names and day numbers by season — from black (January) through red (July) to gray (December). Toggle with the color button in the toolbar, or add `&c=1` to the URL. See [COLORS.md](./COLORS.md) for the full palette.
