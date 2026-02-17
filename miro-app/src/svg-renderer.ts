// WallPlan SVG Renderer — generates calendar SVG string (ported from calendar.js)
// Fonts are embedded as base64 @font-face for standalone SVG rendering
import { generateMonths, DAY_NAMES_SHORT } from './calendar-engine';

const C = {
    paper: '#FDF6E3',
    ink: '#2C2C2C',
    inkLight: '#5A5A5A',
    red: '#C41E3A',
    cellLine: '#999999',
    wpDay: '#6B2332',
};

// Line widths (matching calendar.js)
const LW = {
    monthBorder: 0.5,
    quarterBorder: 0.75,
    yearBorder: 1.0,
    weekLine: 0.2,
    dayLine: 0.25,
    ganttLine: 0.15,
};

// Font sizes (matching calendar.js non-914 defaults)
const FS = {
    year: 20,    // R1: year label
    verMonth: 20,    // R2: month name in vertical
    dayNum: 9,     // R3: day number
    dayDow: 5.5,   // R3: day-of-week
    weekNum: 4.5,   // R3: week number
    holiday: 4.5,   // R3: holiday name
    ganttDay: 3,     // R4: gantt day-of-week letter
    ganttNum: 2.5,   // R4: gantt day number
    ganttWk: 2.5,   // R4: gantt week number
    boxMonth: 15,    // R5: box calendar month name
    boxDow: 8,     // R6: box day-of-week header
    boxDay: 7,     // R6: box day numbers
    boxWk: 4,     // R6: box week numbers
};

export interface RenderSettings {
    months: number;
    rows: number;
    weekStart: 'mon' | 'sun';
    hideDays: boolean;
    startYear: number;
    startMonth: number;
}

// Font embedding
interface FontData {
    family: string;
    b64: string;
    weight: number;
    style: string;
}

let _fontsLoaded: FontData[] | null = null;

export async function loadFonts(): Promise<FontData[]> {
    if (_fontsLoaded) return _fontsLoaded;

    _fontsLoaded = [];

    // IBM Plex Sans weights used in calendar
    const plexWeights = [
        { file: 'IBMPlexSans-ExtraLight.ttf', weight: 200 },
        { file: 'IBMPlexSans-Light.ttf', weight: 300 },
        { file: 'IBMPlexSans-Regular.ttf', weight: 400 },
        { file: 'IBMPlexSans-Medium.ttf', weight: 500 },
    ];

    for (const w of plexWeights) {
        try {
            const resp = await fetch(`/fonts/IBMPlexSans/${w.file}`);
            const buf = await resp.arrayBuffer();
            _fontsLoaded.push({
                family: 'IBM Plex Sans',
                b64: arrayBufferToBase64(buf),
                weight: w.weight,
                style: 'normal',
            });
        } catch (e) { console.warn('Font load failed:', w.file, e); }
    }

    // Copper Penny DTP
    try {
        const resp = await fetch('/fonts/cooper/Copper%20Penny%20DTP.ttf');
        console.log('Copper Penny DTP fetch status:', resp.status, resp.ok);
        if (resp.ok) {
            const buf = await resp.arrayBuffer();
            console.log('Copper Penny DTP loaded, size:', buf.byteLength);
            _fontsLoaded.push({
                family: 'Copper Penny DTP',
                b64: arrayBufferToBase64(buf),
                weight: 400,
                style: 'normal',
            });
        } else {
            console.warn('Copper Penny DTP fetch failed:', resp.status);
        }
    } catch (e) { console.warn('Copper Penny DTP load error:', e); }

    return _fontsLoaded;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    const parts: string[] = [];
    for (let i = 0; i < bytes.length; i += 8192) {
        parts.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
    }
    return btoa(parts.join(''));
}

export function renderCalendarSVG(settings: RenderSettings, fonts: FontData[]): string {
    const { months: monthCount, rows, weekStart, hideDays, startYear, startMonth } = settings;
    const monthsData = generateMonths(startYear, startMonth, monthCount, weekStart);

    // Layout (matching calendar.js)
    const mW = 124;     // ~4mm per Gantt day (124/31≈4), matching 914mm original
    const yearH = 20;   // R1
    const monthH = 30;  // R2
    const verRowH = 11; // R3 day row
    const r3H = hideDays ? 0 : 31 * verRowH;
    const ganttBaseH = 31 * verRowH; // base Gantt height = same as R3
    const ganttExpandH = hideDays ? (ganttBaseH * 2) : ganttBaseH; // expand if days hidden
    const ganttRowH = ganttExpandH / rows;
    const r4H = ganttExpandH;
    const boxNameH = 28;  // R5
    const boxHeaderH = 8;
    const boxCellH = 11;
    const boxRows = 6;
    const r5H = boxNameH;
    const r6H = boxHeaderH + boxRows * boxCellH;

    const totalH = yearH + monthH + r3H + r4H + r5H + r6H;
    const totalW = monthsData.length * mW;

    const parts: string[] = [];
    const svgScale = 4; // render at higher resolution for Miro
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW * svgScale}" height="${totalH * svgScale}">`);
    parts.push(`<rect width="${totalW}" height="${totalH}" fill="${C.paper}"/>`);

    // @font-face declarations
    let fontFaces = '';
    for (const f of fonts) {
        fontFaces += `
      @font-face {
        font-family: '${f.family}';
        src: url(data:font/truetype;base64,${f.b64}) format('truetype');
        font-weight: ${f.weight};
        font-style: ${f.style};
      }`;
    }

    parts.push(`<style>
    ${fontFaces}
    text { font-family: 'IBM Plex Sans', 'FreeSans', sans-serif; fill: ${C.ink}; }
    .red { fill: ${C.red}; }
    .light { fill: ${C.inkLight}; }
    .year { fill: #999999; }
    .wpday { font-family: 'IBM Plex Sans', sans-serif; fill: ${C.wpDay}; font-weight: 400; }
  </style>`);

    // Batch path collectors
    let pathDayLines = '';
    let pathWeekLines = '';
    let pathGanttGray = '';
    let pathGanttWeek = '';

    const yVer = yearH + monthH;
    const yGantt = yVer + r3H;
    const yBoxName = yGantt + r4H;
    const yBox = yBoxName + r5H;

    let lastYear = -1;

    for (let mi = 0; mi < monthsData.length; mi++) {
        const m = monthsData[mi];
        const xCol = mi * mW;
        const numDays = m.days.length;
        const cellW = mW / numDays;

        const isYear = m.year !== lastYear;
        const isQuarter = [0, 3, 6, 9].includes(m.month);

        // Month left border
        let borderW = LW.monthBorder;
        let borderColor = C.cellLine;
        if (isYear) { borderW = LW.yearBorder; borderColor = C.ink; }
        else if (isQuarter) { borderW = LW.quarterBorder; borderColor = C.ink; }
        parts.push(`<line x1="${xCol}" y1="0" x2="${xCol}" y2="${totalH}" stroke="${borderColor}" stroke-width="${borderW}"/>`);

        // R1: Year label
        if (isYear) {
            lastYear = m.year;
            parts.push(`<text x="${xCol + 10}" y="${yearH - 2}" font-size="${FS.year}" font-weight="200" letter-spacing="-0.03em" class="year">${m.year}</text>`);
        }

        // R2: Month name
        parts.push(`<text x="${xCol + 10}" y="${yearH + monthH - 10}" font-size="${FS.verMonth}" font-weight="200" letter-spacing="-0.025em">${m.name}</text>`);

        // R3: Day rows
        if (!hideDays) {
            for (const day of m.days) {
                const rowY = yVer + (day.day - 1) * verRowH;
                const isWPDay = day.holiday === 'WALLPLAN DAY';
                const isHoliday = !!day.holiday;
                const cls = isWPDay ? 'wpday' : (isHoliday || day.isWeekend) ? 'red' : '';

                // Day number
                parts.push(`<text x="${xCol + 6}" y="${rowY + verRowH - 2}" font-size="${FS.dayNum}" ${cls ? `class="${cls}"` : ''}>${String(day.day).padStart(2, '\u00A0')}</text>`);

                // Day of week
                const dowNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                parts.push(`<text x="${xCol + 22}" y="${rowY + verRowH - 3}" font-size="${FS.dayDow}" letter-spacing="0.05em" ${cls ? `class="${cls}"` : ''}>${dowNames[day.dow]}</text>`);

                // Week number
                if (day.weekNum !== undefined) {
                    parts.push(`<text x="${xCol + mW - 8}" y="${rowY + verRowH - 3}" font-size="${FS.weekNum}" text-anchor="end" class="light">${day.weekNum}</text>`);
                }

                // Holiday name
                if (day.holiday) {
                    parts.push(`<text x="${xCol + 44}" y="${rowY + (isWPDay ? verRowH / 2 + 2.5 : verRowH - 3)}" font-size="${FS.holiday}" ${isWPDay ? 'class="wpday"' : 'class="red"'}>${day.holiday}</text>`);
                }

                // Day separator line
                pathDayLines += `M${xCol} ${rowY + verRowH}H${xCol + mW}`;

                // Week separator (Monday, not first day)
                if (day.dow === 0 && day.day > 1) {
                    pathWeekLines += `M${xCol} ${rowY}H${xCol + mW}`;
                }
            }
        }

        // R4: Gantt grid
        if (!hideDays) {
            for (let di = 0; di < numDays; di++) {
                const d = m.days[di];
                const cx = xCol + di * cellW;
                pathGanttGray += `M${cx} ${yGantt}V${yGantt + r4H}`;
                if (d.dow === 0 && di > 0) {
                    pathGanttWeek += `M${cx} ${yGantt}V${yGantt + r4H}`;
                }
            }
        }

        // Gantt horizontal lines (always shown)
        for (let r = 0; r <= rows; r++) {
            const ly = yGantt + r * ganttRowH;
            pathGanttGray += `M${xCol} ${ly}H${xCol + mW}`;
        }

        // Gantt header: day-of-week letters + day numbers (only when days visible)
        if (!hideDays) {
            for (let di = 0; di < numDays; di++) {
                const d = m.days[di];
                const cx = xCol + di * cellW + cellW / 2;
                const dowLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                const cls = d.isWeekend ? 'class="red"' : 'class="light"';

                // Day letter
                parts.push(`<text x="${cx}" y="${yGantt + 5}" font-size="${FS.ganttDay}" text-anchor="middle" font-weight="300" letter-spacing="-0.05em" ${cls}>${dowLetters[d.dow]}</text>`);

                // Day number
                parts.push(`<text x="${cx}" y="${yGantt + 10}" font-size="${FS.ganttNum}" text-anchor="middle" font-weight="300" letter-spacing="-0.05em" ${cls}>${d.day}</text>`);
            }
        }

        // R5: Box month name
        parts.push(`<text x="${xCol + 10}" y="${yBoxName + r5H - 12}" font-size="${FS.boxMonth}" font-weight="300" letter-spacing="-0.02em">${m.name}</text>`);

        // R6: Box calendar
        const boxGridW = mW * 0.85;
        const boxCellW = boxGridW / 7;
        const boxLeft = xCol + 6;

        // Day-of-week headers
        const names = weekStart === 'mon' ? DAY_NAMES_SHORT : ['Su', ...DAY_NAMES_SHORT.slice(0, 6)];
        for (let d = 0; d < 7; d++) {
            const hx = boxLeft + d * boxCellW + boxCellW / 2;
            const isWE = weekStart === 'mon' ? d >= 5 : (d === 0 || d === 6);
            parts.push(`<text x="${hx}" y="${yBox + boxHeaderH - 2}" font-size="${FS.boxDow}" text-anchor="middle" font-weight="500" ${isWE ? 'class="red"' : ''}>${names[d]}</text>`);
        }

        // Box days
        for (let w = 0; w < m.weeks.length; w++) {
            for (let d = 0; d < 7; d++) {
                const dayNum = m.weeks[w][d];
                if (dayNum === 0) continue;
                const cx = boxLeft + d * boxCellW + boxCellW / 2;
                const cy = yBox + boxHeaderH + w * boxCellH + boxCellH - 2;
                const isWE = weekStart === 'mon' ? d >= 5 : (d === 0 || d === 6);
                parts.push(`<text x="${cx}" y="${cy}" font-size="${FS.boxDay}" text-anchor="middle" ${isWE ? 'class="red"' : ''}>${dayNum}</text>`);
            }
        }

        // Box week numbers
        const seenBoxWeeks = new Set<number>();
        const firstDayDow = m.days[0].dow;
        for (let di = 0; di < numDays; di++) {
            const d = m.days[di];
            const gridPos = firstDayDow + di;
            const row = Math.floor(gridPos / 7);
            if (!seenBoxWeeks.has(row) && d.weekNum !== undefined) {
                seenBoxWeeks.add(row);
                const wnX = boxLeft + 7 * boxCellW + 2;
                const wnY = yBox + boxHeaderH + row * boxCellH + boxCellH - 3;
                parts.push(`<text x="${wnX}" y="${wnY}" font-size="${FS.boxWk}" class="light">${d.weekNum}</text>`);
            }
        }
    }

    // Emit batched paths
    if (pathDayLines) parts.push(`<path d="${pathDayLines}" fill="none" stroke="${C.cellLine}" stroke-width="${LW.dayLine}"/>`);
    if (pathWeekLines) parts.push(`<path d="${pathWeekLines}" fill="none" stroke="${C.ink}" stroke-width="${LW.weekLine}"/>`);
    if (pathGanttGray) parts.push(`<path d="${pathGanttGray}" fill="none" stroke="${C.cellLine}" stroke-width="${LW.ganttLine}"/>`);
    if (pathGanttWeek) parts.push(`<path d="${pathGanttWeek}" fill="none" stroke="${C.ink}" stroke-width="${LW.weekLine}"/>`);

    // Right border
    parts.push(`<line x1="${totalW}" y1="0" x2="${totalW}" y2="${totalH}" stroke="${C.ink}" stroke-width="0.75"/>`);

    parts.push('</svg>');
    return parts.join('\n');
}

export function svgToDataUrl(svg: string): string {
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
}
