// WallPlan Native Miro Generator — optimized with progressive rendering
// Optimizations: no .sync(), merged h-lines, batch=50, progressive zoom, direct grouping
import { generateMonths, DAY_NAMES_SHORT } from './calendar-engine';

// ISO week number helper
function getWeekNum(y: number, m: number, d: number): number {
    const date = new Date(y, m, d);
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ─── Colors ───
const C = {
    paper: '#FDF6E3',
    ink: '#2C2C2C',
    inkLight: '#5A5A5A',
    red: '#C41E3A',
    cellLine: '#999999',
    wpDay: '#6B2332',
};

const MONTH_COLORS = [
    '#212121', '#3F51B5', '#9C27B0', '#2196F3',
    '#4CAF50', '#8BC34A', '#F44336', '#FF9800',
    '#FFC107', '#A1887F', '#795548', '#9E9E9E',
];

// ─── Layout (Miro dp units) ───
const SCALE = 16;
const mW = 124 * SCALE;   // 1984
const yearH = 20 * SCALE;   // 320
const monthH = 30 * SCALE;   // 480
const verRowH = 11 * SCALE;   // 176
const PAD_L = 60;
const LINE_W = 14;

// ─── Batching (conservative for multi-year calendars) ───
const BATCH_SIZE = 10;
const BATCH_DELAY = 500; // ms between batches — keeps us well under 100K credits/min

async function batchCreate<T>(items: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(fn => fn()));
        results.push(...batchResults);
        if (i + BATCH_SIZE < items.length) {
            await new Promise(r => setTimeout(r, BATCH_DELAY));
        }
    }
    return results;
}

export interface NativeGeneratorSettings {
    months: number;
    rows: number;
    weekStart: 'mon' | 'sun';
    hideDays: boolean;
    startYear: number;
    startMonth: number;
    onProgress?: (current: number, total: number) => void;
}

// ─── Layout context shared between functions ───
interface LayoutCtx {
    OX: number; OY: number;
    mW: number; totalW: number; totalH: number;
    yVer: number; yGantt: number; yBoxName: number; yBox: number;
    r3H: number; r4H: number; r5H: number;
    ganttRowH: number; boxHeaderH: number; boxCellH: number;
    rows: number; weekStart: 'mon' | 'sun'; hideDays: boolean;
    txtW: number;
    allItems: any[];
    txt: (props: any) => () => Promise<any>;
    shp: (props: any) => () => Promise<any>;
}

// ─── Generate all content for a single month column ───
async function generateMonth(mi: number, m: any, ctx: LayoutCtx): Promise<void> {
    const { OX, OY, mW, yVer, yGantt, yBoxName, yBox, r4H, r5H,
        boxHeaderH, boxCellH, hideDays, weekStart, txtW, txt, shp } = ctx;
    const xCol = OX + mi * mW;
    const mc = MONTH_COLORS[m.month] || C.ink;
    const tasks: (() => Promise<any>)[] = [];

    // ── R1: Year label (only on first month of each year) ──
    // Handled externally to avoid duplicate year labels

    // ── R2: Month name ──
    tasks.push(txt({
        content: `<p>${m.name}</p>`,
        x: xCol + PAD_L + txtW / 2, y: OY + yearH + monthH / 2,
        width: txtW,
        style: { textAlign: 'left', fontSize: 192, color: mc, fontFamily: 'plex_sans' },
    }));

    // ── R3: Day rows ──
    if (!hideDays) {
        const dowNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (const day of m.days) {
            const ry = OY + yVer + (day.day - 1) * verRowH;
            const isWP = day.holiday === 'WALLPLAN DAY';
            const col = isWP ? C.wpDay
                : (day.holiday || day.isWeekend) ? C.red : mc;

            let s = `${String(day.day).padStart(2, '\u00A0')}  ${dowNames[day.dow]}`;
            if (day.weekNum !== undefined) s += `  ${day.weekNum}`;
            if (day.holiday) s += `  ${day.holiday}`;

            tasks.push(txt({
                content: `<p>${s}</p>`,
                x: xCol + PAD_L + txtW / 2, y: ry + verRowH / 2,
                width: txtW,
                style: { textAlign: 'left', fontSize: 80, color: col, fontFamily: 'plex_sans' },
            }));

            // Week separator (bold line on Monday, not day 1)
            if (day.dow === 0 && day.day > 1) {
                tasks.push(shp({
                    shape: 'rectangle',
                    x: xCol + mW / 2, y: ry,
                    width: mW, height: LINE_W,
                    style: { fillColor: C.ink, borderOpacity: 0 },
                }));
            }
        }
    }

    // ── R4: Gantt headers + vertical day lines ──
    const numDays = m.days.length;
    const cellW = mW / numDays;
    if (!hideDays) {
        const dowL = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        for (let di = 0; di < numDays; di++) {
            const d = m.days[di];
            const cx = xCol + di * cellW + cellW / 2;
            const tc = d.isWeekend ? C.red : C.inkLight;

            tasks.push(txt({
                content: `<p>${dowL[d.dow]}<br>${d.day}</p>`,
                x: cx, y: OY + yGantt + 80,
                width: Math.max(cellW, 10),
                style: { textAlign: 'center', fontSize: 40, color: tc, fontFamily: 'plex_sans' },
            }));

            if (d.weekNum !== undefined) {
                tasks.push(txt({
                    content: `<p>${d.weekNum}</p>`,
                    x: cx, y: OY + yGantt + 200,
                    width: Math.max(cellW * 3, 160),
                    style: { textAlign: 'left', fontSize: 40, color: C.inkLight, fontFamily: 'plex_sans' },
                }));
            }

            if (di > 0) {
                const lc = (d.dow === 0) ? C.ink : C.cellLine;
                tasks.push(shp({
                    shape: 'rectangle',
                    x: xCol + di * cellW, y: OY + yGantt + r4H / 2,
                    width: LINE_W, height: r4H,
                    style: { fillColor: lc, fillOpacity: (d.dow === 0) ? 1 : 0.3, borderOpacity: 0 },
                }));
            }
        }
    }

    // ── R5–R6: Box calendar ──
    const boxGridW = mW * 0.85;
    const boxCellW = boxGridW / 7;
    const boxLeft = xCol + mW * 0.05;

    tasks.push(txt({
        content: `<p>${m.name}</p>`,
        x: xCol + PAD_L + txtW / 2, y: OY + yBoxName + r5H / 2,
        width: txtW,
        style: { textAlign: 'left', fontSize: 144, color: mc, fontFamily: 'plex_sans' },
    }));

    const dayNames = weekStart === 'mon' ? DAY_NAMES_SHORT : ['Su', ...DAY_NAMES_SHORT.slice(0, 6)];
    for (let d = 0; d < 7; d++) {
        const hx = boxLeft + d * boxCellW + boxCellW / 2;
        const isWE = weekStart === 'mon' ? d >= 5 : (d === 0 || d === 6);
        tasks.push(txt({
            content: `<p>${dayNames[d]}</p>`,
            x: hx, y: OY + yBox + boxHeaderH / 2,
            width: boxCellW,
            style: { textAlign: 'center', fontSize: 72, color: isWE ? C.red : C.ink, fontFamily: 'plex_sans' },
        }));
    }

    for (let w = 0; w < m.weeks.length; w++) {
        const fd = m.weeks[w].find((v: number) => v > 0);
        if (fd) {
            try {
                const wn = getWeekNum(m.year, m.month, fd);
                tasks.push(txt({
                    content: `<p>${wn}</p>`,
                    x: boxLeft + 7 * boxCellW + boxCellW * 0.4,
                    y: OY + yBox + boxHeaderH + w * boxCellH + boxCellH / 2,
                    width: boxCellW * 0.8,
                    style: { textAlign: 'left', fontSize: 40, color: C.cellLine, fontFamily: 'plex_sans' },
                }));
            } catch (_) { /* skip */ }
        }

        for (let d = 0; d < 7; d++) {
            const dn = m.weeks[w][d];
            if (dn === 0) continue;
            const isWE = weekStart === 'mon' ? d >= 5 : (d === 0 || d === 6);
            tasks.push(txt({
                content: `<p>${dn}</p>`,
                x: boxLeft + d * boxCellW + boxCellW / 2,
                y: OY + yBox + boxHeaderH + w * boxCellH + boxCellH / 2,
                width: boxCellW,
                style: { textAlign: 'center', fontSize: 64, color: isWE ? C.red : C.ink, fontFamily: 'plex_sans' },
            }));
        }
    }

    await batchCreate(tasks);
}

// ═══════════════════════════════════════════
// Main entry point
// ═══════════════════════════════════════════
export async function generateNativeCalendar(settings: NativeGeneratorSettings): Promise<string[]> {
    const { months: monthCount, rows, weekStart, hideDays, startYear, startMonth, onProgress } = settings;

    onProgress?.(0.5, 4);

    // ══ 1. Generate data & compute layout ══
    const monthsData = generateMonths(startYear, startMonth, monthCount, weekStart);

    const r3H = hideDays ? 0 : 31 * verRowH;
    const ganttBaseH = 31 * verRowH;
    const ganttExpandH = hideDays ? ganttBaseH * 2 : ganttBaseH;
    const ganttRowH = ganttExpandH / rows;
    const r4H = ganttExpandH;
    const boxNameH = 28 * SCALE;
    const boxHeaderH = 8 * SCALE;
    const boxCellH = 11 * SCALE;
    const r5H = boxNameH;
    const r6H = boxHeaderH + 6 * boxCellH;
    const totalH = yearH + monthH + r3H + r4H + r5H + r6H;
    const totalW = monthsData.length * mW;

    const yVer = yearH + monthH;
    const yGantt = yVer + r3H;
    const yBoxName = yGantt + r4H;
    const yBox = yBoxName + r5H;

    const OX = 0;
    const OY = 0;
    const allItems: any[] = [];

    const txt = (props: any) => async () => {
        const t = await miro.board.createText(props);
        allItems.push(t);
        return t;
    };
    const shp = (props: any) => async () => {
        const s = await miro.board.createShape(props);
        allItems.push(s);
        return s;
    };

    const txtW = mW - PAD_L;

    const ctx: LayoutCtx = {
        OX, OY, mW, totalW, totalH,
        yVer, yGantt, yBoxName, yBox,
        r3H, r4H, r5H,
        ganttRowH, boxHeaderH, boxCellH,
        rows, weekStart, hideDays, txtW,
        allItems, txt, shp,
    };

    // ══ 2. Frame ══
    onProgress?.(1, 4);
    const first = monthsData[0];
    const last = monthsData[monthsData.length - 1];
    const title = first.year === last.year
        ? `WallPlan ${first.year}`
        : `WallPlan ${first.year}–${last.year}`;
    const frame = await miro.board.createFrame({
        title,
        x: OX + totalW / 2, y: OY + totalH / 2,
        width: totalW, height: totalH,
        style: { fillColor: C.paper },
    });
    allItems.push(frame);

    // ══ 3. Full-width horizontal lines (merged) ══
    onProgress?.(1.2, 4);
    const hLines: (() => Promise<any>)[] = [];

    if (!hideDays) {
        for (let i = 0; i <= 31; i++) {
            const ly = OY + yVer + i * verRowH;
            const isBorder = i === 0 || i === 31;
            hLines.push(shp({
                shape: 'rectangle',
                x: OX + totalW / 2, y: ly,
                width: totalW, height: LINE_W,
                style: { fillColor: C.cellLine, fillOpacity: isBorder ? 1 : 0.3, borderOpacity: 0 },
            }));
        }
    }

    for (let r = 0; r <= rows; r++) {
        const ly = OY + yGantt + r * ganttRowH;
        const isBorder = r === 0 || r === rows;
        hLines.push(shp({
            shape: 'rectangle',
            x: OX + totalW / 2, y: ly,
            width: totalW, height: LINE_W,
            style: { fillColor: C.cellLine, fillOpacity: isBorder ? 1 : 0.5, borderOpacity: 0 },
        }));
    }
    await batchCreate(hLines);

    // ══ 4. Month borders (vertical) ══
    onProgress?.(1.4, 4);
    let lastYear = -1;
    const vLines: (() => Promise<any>)[] = [];

    for (let mi = 0; mi < monthsData.length; mi++) {
        const m = monthsData[mi];
        const xCol = OX + mi * mW;
        const isYear = m.year !== lastYear;
        if (isYear) lastYear = m.year;
        const isQ = [0, 3, 6, 9].includes(m.month);
        const color = (isYear || isQ) ? C.ink : C.cellLine;
        vLines.push(shp({
            shape: 'rectangle',
            x: xCol, y: OY + totalH / 2,
            width: isYear ? 10 : LINE_W, height: totalH,
            style: { fillColor: color, borderOpacity: 0 },
        }));
    }
    vLines.push(shp({
        shape: 'rectangle',
        x: OX + totalW, y: OY + totalH / 2,
        width: LINE_W, height: totalH,
        style: { fillColor: C.ink, borderOpacity: 0 },
    }));
    await batchCreate(vLines);

    // ══ 5. Year labels ══
    onProgress?.(1.6, 4);
    lastYear = -1;
    const yearLabels: (() => Promise<any>)[] = [];
    for (let mi = 0; mi < monthsData.length; mi++) {
        const m = monthsData[mi];
        if (m.year !== lastYear) {
            lastYear = m.year;
            const xCol = OX + mi * mW;
            yearLabels.push(txt({
                content: `<p>${m.year}</p>`,
                x: xCol + PAD_L + txtW / 2, y: OY + yearH / 2,
                width: txtW,
                style: { textAlign: 'left', fontSize: 192, color: C.cellLine, fontFamily: 'plex_sans' },
            }));
        }
    }
    await batchCreate(yearLabels);

    // ══ 6. PROGRESSIVE RENDERING ══
    // Phase 1: First 3 months → immediate zoom
    const PREVIEW_COUNT = Math.min(3, monthsData.length);

    onProgress?.(2, 4);
    for (let mi = 0; mi < PREVIEW_COUNT; mi++) {
        await generateMonth(mi, monthsData[mi], ctx);
        onProgress?.(2 + (mi / monthsData.length) * 1.8, 4);
    }

    // Early zoom — user sees results immediately!
    await miro.board.viewport.zoomTo(frame);

    // Phase 2: Remaining months (user already sees the board)
    for (let mi = PREVIEW_COUNT; mi < monthsData.length; mi++) {
        await generateMonth(mi, monthsData[mi], ctx);
        onProgress?.(2 + (mi / monthsData.length) * 1.8, 4);
    }

    // ══ 7. Store frame ID ══
    onProgress?.(3.8, 4);
    await miro.board.setAppData('wallplanIds', [frame.id]);

    // ══ 8. Group all (with rate-limit retry) ══
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    await delay(30000); // 30s — wait for rate limit to fully recover
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            if (allItems.length >= 2) await miro.board.group({ items: allItems });
            break;
        } catch (e: any) {
            const msg = String(e?.message || e);
            // If items are already grouped (partial success), stop retrying
            if (msg.includes('ungrouped')) { console.log('Items already grouped'); break; }
            console.warn(`Group attempt ${attempt}/3 failed:`, e);
            if (attempt < 3) await delay(20000); // 20s before retry
        }
    }

    // ══ 9. Final zoom ══
    await miro.board.viewport.zoomTo(frame);
    onProgress?.(4, 4);
    return allItems.map((it: any) => it.id);
}
