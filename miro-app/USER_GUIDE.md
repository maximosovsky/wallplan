# WallPlan Miro App — User Guide

## What is WallPlan?

WallPlan generates multi-year Gantt calendars directly on your Miro board. Perfect for project planning, roadmaps, and annual overviews.

---

## Getting Started

1. Open any Miro board
2. Click the **WallPlan** icon in the left sidebar (Apps panel)
3. Configure your calendar settings
4. Click **Generate ▶**
5. Your calendar appears on the board — ready to use!

---

## Settings

### Duration

Set how long your calendar spans.

| Field | Range | Example |
|-------|-------|---------|
| **Years** | 0–20 | `1` |
| **Months** | 0–11 | `6` |

Total duration = Years × 12 + Months. For example, `1 yr 6 mo = 18 months`.

### Start

Choose when your calendar begins.

- **Month** — select from Jan to Dec
- **Year** — type any year (2020–2040)

### Week Start (Mon / Sun)

Toggle between **Monday-first** and **Sunday-first** week layout.

- Click the button to switch
- **Mon** = standard in most countries
- **Sun** = US convention (displayed in red)

This affects:
- Day-of-week order in the Gantt header
- Box calendar column order

### Gantt Rows

Choose how many horizontal rows appear in the Gantt chart area:

| Option | Best for |
|--------|----------|
| **6** | Compact view, few projects |
| **8** | Balanced layout |
| **10** | Default — good for most use cases |
| **12** | Detailed planning, many parallel tracks |

### Hide Days

When checked, the calendar switches to **Timeline mode**:

- Day list (dates 1–31) is hidden
- Gantt chart area expands to double height
- Day grid lines in Gantt are removed
- Only month-level structure remains

Useful for high-level roadmaps where individual dates don't matter.

---

## Calendar Structure

Each month column contains:

```
┌──────────────────────┐
│       2026           │  ← Year (shown at year boundaries)
├──────────────────────┤
│     February         │  ← Month name
├──────────────────────┤
│ 1 Mo                 │
│ 2 Tu                 │  ← Day list with day-of-week
│ 3 We                 │    (hidden in Timeline mode)
│ ...                  │
│ 28 Sa                │
├──────────────────────┤
│ M T W T F S S        │
│ 1 2 3 4 5 ...        │  ← Gantt chart header + grid
│ ─────────────────    │    (rows for your tasks)
│ ─────────────────    │
├──────────────────────┤
│     February         │  ← Mini box calendar
│ Mo Tu We Th Fr Sa Su │
│     1  2  3  4  5  6 │
│  7  8  9 ...         │
└──────────────────────┘
```

---

## Using the Calendar

### Adding Tasks

After generating, use standard Miro tools to add content:

- **Sticky notes** — drag onto Gantt rows for tasks
- **Text** — add labels, milestones, project names
- **Shapes** — draw bars across date ranges
- **Lines & arrows** — connect dependencies

### Holidays

US Federal Holidays are automatically marked in red:
- New Year's Day, MLK Day, Presidents' Day
- Memorial Day, Independence Day, Labor Day
- Columbus Day, Veterans Day, Thanksgiving, Christmas
- **WallPlan Day** (January 11) 🎉

### Weekends

Saturday and Sunday are highlighted with red text throughout the calendar.

---

## Regenerating

To create a new calendar with different settings:

1. Delete the existing calendar image from the board
2. Adjust settings in the WallPlan panel
3. Click **Generate ▶** again

The new calendar will appear at the center of your board.

---

## Tips

- **Zoom in** on specific months for detailed planning
- **Lock the image** (right-click → Lock) to prevent accidental moves
- **Group** sticky notes with the calendar for organized sections
- **Duplicate** the calendar image to create before/after comparisons
- Use **Miro frames** to section off quarters or phases

---

## Color Legend

| Color | Meaning |
|-------|---------|
| Black text | Regular weekdays |
| Red text | Weekends (Sat–Sun) |
| Red bold text | Holidays |
| Cream background | Calendar paper |
| Gray lines | Grid structure |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Calendar looks blurry | Zoom in — it's a high-resolution SVG, detail appears at larger zoom |
| Fonts look wrong | Make sure you have internet access during generation (fonts load from Google) |
| Button doesn't respond | Wait for current generation to finish, check browser console for errors |
| Calendar too small on board | Increase duration (more months = wider image) |
