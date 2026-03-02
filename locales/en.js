// ─── WallPlan Locale: English (US) ───
window.LOCALE = {
    months: [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekDaysNarrow: ['U', 'M', 'T', 'W', 'R', 'F', 'S'],
    defaultWeekStart: 'sun',
    monLabel: 'MO',
    sunLabel: 'SU',

    getHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };

        // Helper: nth weekday of month
        const nthWeekday = (yr, month, weekday, n) => {
            const first = new Date(yr, month, 1);
            let day = ((weekday - first.getDay()) + 7) % 7 + 1;
            day += (n - 1) * 7;
            return day;
        };
        // Helper: last weekday of month
        const lastWeekday = (yr, month, weekday) => {
            const last = new Date(yr, month + 1, 0);
            const lastDate = last.getDate();
            const lastDow = last.getDay();
            let diff = ((lastDow - weekday) + 7) % 7;
            return lastDate - diff;
        };

        // US Federal Holidays
        add(1, 1, "New Year's Day");
        add(1, 11, 'WALLPLAN DAY');
        add(6, 19, 'Juneteenth');
        add(7, 4, 'Independence Day');
        add(11, 11, 'Veterans Day');
        add(12, 25, 'Christmas Day');
        add(1, nthWeekday(year, 0, 1, 3), 'Martin Luther King Jr. Day');
        add(2, nthWeekday(year, 1, 1, 3), "Presidents' Day");
        add(5, lastWeekday(year, 4, 1), 'Memorial Day');
        add(9, nthWeekday(year, 8, 1, 1), 'Labor Day');
        add(10, nthWeekday(year, 9, 1, 2), 'Columbus Day');
        add(11, nthWeekday(year, 10, 4, 4), 'Thanksgiving Day');
        return h;
    },
};
