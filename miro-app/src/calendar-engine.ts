// WallPlan Calendar Engine — pure logic, no DOM
// Ported from calendar.js for Miro SDK

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAY_NAMES_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export interface DayData {
    day: number;
    month: number;
    year: number;
    dow: number;       // 0=Mon, 6=Sun
    isWeekend: boolean;
    holiday?: string;
    weekNum?: number;
}

export interface MonthData {
    year: number;
    month: number;      // 0-based
    name: string;
    days: DayData[];
    weeks: number[][];   // box calendar layout (rows of 7)
}

// ISO week number
function getWeekNumber(y: number, m: number, d: number): number {
    const date = new Date(y, m, d);
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// US Federal Holidays
function getHolidays(year: number): Map<string, string> {
    const h = new Map<string, string>();

    // Fixed dates
    h.set(`${year}-0-1`, "New Year's Day");
    h.set(`${year}-6-4`, 'Independence Day');
    h.set(`${year}-10-11`, "Veterans Day");
    h.set(`${year}-11-25`, 'Christmas Day');

    // MLK Day: 3rd Monday of January
    h.set(`${year}-0-${nthWeekday(year, 0, 1, 3)}`, 'MLK Day');
    // Presidents' Day: 3rd Monday of February
    h.set(`${year}-1-${nthWeekday(year, 1, 1, 3)}`, "Presidents' Day");
    // Memorial Day: last Monday of May
    h.set(`${year}-4-${lastWeekday(year, 4, 1)}`, 'Memorial Day');
    // Labor Day: 1st Monday of September
    h.set(`${year}-8-${nthWeekday(year, 8, 1, 1)}`, 'Labor Day');
    // Columbus Day: 2nd Monday of October
    h.set(`${year}-9-${nthWeekday(year, 9, 1, 2)}`, 'Columbus Day');
    // Thanksgiving: 4th Thursday of November
    h.set(`${year}-10-${nthWeekday(year, 10, 4, 4)}`, 'Thanksgiving');

    // WallPlan Day: January 11
    h.set(`${year}-0-11`, 'WALLPLAN DAY');

    return h;
}

function nthWeekday(year: number, month: number, weekday: number, n: number): number {
    const first = new Date(year, month, 1).getDay();
    let day = 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
    return day;
}

function lastWeekday(year: number, month: number, weekday: number): number {
    const last = new Date(year, month + 1, 0);
    const lastDay = last.getDate();
    const lastDow = last.getDay();
    let diff = lastDow - weekday;
    if (diff < 0) diff += 7;
    return lastDay - diff;
}

export function generateMonths(
    startYear: number,
    startMonth: number,
    count: number,
    weekStart: 'mon' | 'sun' = 'mon'
): MonthData[] {
    const months: MonthData[] = [];
    const holidayCache = new Map<number, Map<string, string>>();

    for (let i = 0; i < count; i++) {
        const m = (startMonth + i) % 12;
        const y = startYear + Math.floor((startMonth + i) / 12);

        if (!holidayCache.has(y)) {
            holidayCache.set(y, getHolidays(y));
        }
        const holidays = holidayCache.get(y)!;

        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const days: DayData[] = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(y, m, d);
            let dow = date.getDay(); // 0=Sun
            // Convert to 0=Mon
            dow = dow === 0 ? 6 : dow - 1;

            const key = `${y}-${m}-${d}`;
            days.push({
                day: d,
                month: m,
                year: y,
                dow,
                isWeekend: dow >= 5,
                holiday: holidays.get(key),
                weekNum: dow === 0 ? getWeekNumber(y, m, d) : undefined,
            });
        }

        // Box calendar layout
        const weeks = buildBoxWeeks(y, m, daysInMonth, weekStart);

        months.push({
            year: y,
            month: m,
            name: MONTH_NAMES[m],
            days,
            weeks,
        });
    }

    return months;
}

function buildBoxWeeks(
    year: number,
    month: number,
    daysInMonth: number,
    weekStart: 'mon' | 'sun'
): number[][] {
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    let offset: number;
    if (weekStart === 'mon') {
        offset = firstDow === 0 ? 6 : firstDow - 1;
    } else {
        offset = firstDow;
    }

    const weeks: number[][] = [];
    let week: number[] = new Array(offset).fill(0);

    for (let d = 1; d <= daysInMonth; d++) {
        week.push(d);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(0);
        weeks.push(week);
    }

    return weeks;
}
