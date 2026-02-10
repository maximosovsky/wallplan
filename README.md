# Moleskine-Inspired Calendar Generator

A precise, beautiful web tool for generating printable calendars with a premium aesthetic. Designed for **A4, A3, and Engineering 914mm** paper sizes with multi-page support and wide-format plotter output.

## 🌟 Key Features

- **Precision Layout**: Automatically fits 7 or 8 months per page perfectly on any paper width (A4/A3). Multi-page output shown side-by-side.
- **Flexible Modes**:
  - **Vertical**: Classic month view.
  - **Gantt**: Horizontal timeline view.
  - **Years**: Multi-year planning.
- **Paper Sizes**:
  - **A4 / A3**: Paginated layout with page count display.
  - **914mm**: Single roll format with compact 3–4mm Gantt cells. Width shown in meters.
  - **914mm ×2**: Two copies stacked for cutting.
  - **914mm ×4**: Four copies at 200mm each, bottom-aligned.
- **Customizable**:
  - **Week Start**: Monday (Mon) or Sunday (Sun).
  - **Holidays**: US Federal Holidays (auto-calculated).
  - **Rows**: Adjustable empty rows for notes (slider 5–15).
- **Print Optimized**: Custom print CSS ensures what you see is exactly what you get.
- **Rulers & Guides**: Measurement rulers with cm/m labels, vertical guides marking printable area.

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd calendar-generator
   ```

2. **Run locally**:
   ```bash
   npx serve .
   ```
   Open `http://localhost:3000` in your browser.

## 🛠️ Usage

### URL Parameters
You can configure the calendar via URL for easy sharing:

| Param | Description | Values | Example |
|-------|-------------|--------|---------|
| `l` | Number of months/years | `1` - `120` | `/?l=12` |
| `u` | Mode | `y` (Years) | `/?u=y` |
| `w` | Week Start | `mon`, `sun` | `/?w=mon` |
| `g` | Rows (slider) | `5` - `15` | `/?g=12` |

### Interface Controls
- **Months/Years Toggle**: Click the label to switch modes. Default: 12 months (1 year).
- **Rows Slider**: Adjust the number of empty rows below each month.
- **Paper Size**: Select from A4, A3, 914mm, 914mm ×2, 914mm ×4. Shows page count or roll width.
- **Print Mode**: Optimization toggle for cleaner output.

## 📐 Architecture
See [architecture.md](./architecture.md) for detailed technical documentation on the layout engine and codebase structure.

## © Credits
**2026 Anton Sokolnikov, Maxim Osowsky**.
This work is licensed under the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**.
