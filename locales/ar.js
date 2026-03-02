// ─── WallPlan Locale: UAE/Dubai (AR/RU/EN toggle) ───
// UAE public holidays. Hijri dates precomputed (lunar, no formula).
// Hijri year ≈ Gregorian × 33/32 from 622 CE epoch.
// Weekend: Sat + Sun (since 2022).

window.LOCALE = {
    // ─── Current display language (toggled by user) ───
    _lang: 'en', // 'ar' | 'ru' | 'en'

    _strings: {
        en: {
            months: ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            weekDaysNarrow: ['U', 'M', 'T', 'W', 'R', 'F', 'S'],
            monLabel: 'MO', sunLabel: 'SU',
        },
        ru: {
            months: ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            weekDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            weekDaysNarrow: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
            monLabel: 'ПН', sunLabel: 'ВС',
        },
        ar: {
            months: ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
            weekDays: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
            weekDaysNarrow: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
            monLabel: 'ن', sunLabel: 'ح',
        },
    },

    get months() { return this._strings[this._lang].months; },
    get weekDays() { return this._strings[this._lang].weekDays; },
    get weekDaysNarrow() { return this._strings[this._lang].weekDaysNarrow; },
    get monLabel() { return this._strings[this._lang].monLabel; },
    get sunLabel() { return this._strings[this._lang].sunLabel; },
    defaultWeekStart: 'mon',

    // ─── Hijri year calculation ───
    // Approximate: floor((Gregorian - 622) × 33 / 32) + 1
    getHijriYear(gregYear) {
        const hijri1 = Math.floor((gregYear - 622) * 33 / 32) + 1;
        const muharram = this._muharramDates[gregYear];
        return {
            yearBefore: hijri1 - 1,       // Jan 1 → 1 Muharram
            yearAfter: hijri1,             // 1 Muharram → Dec 31
            boundary: muharram || null,    // {month, day} of 1 Muharram
        };
    },

    // 1 Muharram (Hijri New Year) Gregorian dates — precomputed
    _muharramDates: {
        2024: { month: 7, day: 8 }, 2025: { month: 6, day: 27 },
        2026: { month: 6, day: 17 }, 2027: { month: 6, day: 6 },
        2028: { month: 5, day: 25 }, 2029: { month: 5, day: 15 },
        2030: { month: 5, day: 4 }, 2031: { month: 4, day: 24 },
        2032: { month: 4, day: 12 }, 2033: { month: 4, day: 1 },
        2034: { month: 3, day: 22 }, 2035: { month: 3, day: 12 },
    },

    // ─── Hijri month start dates in Gregorian (1st of each Hijri month) ───
    // Covers parts of both Hijri years that fall within the Gregorian year.
    _hijriMonthStarts: {
        2026: [
            // Rajab 1447 started Dec 21, 2025 → continues in Jan 2026
            { m: 1, d: 1, name: { ar: 'رجب', en: 'Rajab', ru: 'Раджаб' }, continues: true },
            { m: 1, d: 20, name: { ar: 'شعبان', en: "Sha'ban", ru: 'Шаабан' } },
            { m: 2, d: 18, name: { ar: 'رمضان', en: 'Ramadan', ru: 'Рамадан' } },
            { m: 3, d: 20, name: { ar: 'شوّال', en: 'Shawwal', ru: 'Шавваль' } },
            { m: 4, d: 18, name: { ar: 'ذو القعدة', en: 'Dhul Qi\'dah', ru: 'Зуль-Каада' } },
            { m: 5, d: 18, name: { ar: 'ذو الحجة', en: 'Dhul Hijjah', ru: 'Зуль-Хиджа' } },
            // 1448 starts:
            { m: 6, d: 16, name: { ar: 'محرّم', en: 'Muharram', ru: 'Мухаррам' } },
            { m: 7, d: 16, name: { ar: 'صفر', en: 'Safar', ru: 'Сафар' } },
            { m: 8, d: 14, name: { ar: 'ربيع الأول', en: "Rabi' al-Awwal", ru: 'Раби аль-Авваль' } },
            { m: 9, d: 12, name: { ar: 'ربيع الثاني', en: "Rabi' al-Thani", ru: 'Раби ас-Сани' } },
            { m: 10, d: 12, name: { ar: 'جمادى الأولى', en: "Jumada al-Ula", ru: 'Джумада аль-Уля' } },
            { m: 11, d: 11, name: { ar: 'جمادى الثانية', en: "Jumada al-Thani", ru: 'Джумада ас-Сани' } },
            { m: 12, d: 10, name: { ar: 'رجب', en: 'Rajab', ru: 'Раджаб' } },
        ],
    },

    // ─── Full Hijri months as calendar columns ───
    getAlternateMonths(year) {
        const starts = this._hijriMonthStarts[year];
        if (!starts) return null;

        const months = [];
        for (let i = 0; i < starts.length; i++) {
            const cur = starts[i];
            let endDate;
            if (i + 1 < starts.length) {
                endDate = new Date(year, starts[i + 1].m - 1, starts[i + 1].d - 1);
            } else {
                endDate = new Date(year, 11, 31);
            }
            const startDate = new Date(year, cur.m - 1, cur.d);
            const numDays = Math.round((endDate - startDate) / 86400000) + 1;

            months.push({
                name: cur.name,
                startYear: year,
                startMonth: cur.m,
                startDay: cur.d,
                endMonth: endDate.getMonth() + 1,
                endDay: endDate.getDate(),
                numDays: numDays,
            });
        }
        return months;
    },

    // ─── Holiday names in 3 languages ───
    _holidayNames: {
        newYear: { ar: '🎆 رأس السنة الميلادية', ru: '🎆 Новый год', en: "🎆 New Year's Day" },
        ramadanStart: { ar: '🌙 بداية رمضان', ru: '🌙 Начало Рамадана', en: '🌙 Ramadan Start' },
        ramadan: { ar: '🌙 رمضان', ru: '🌙 Рамадан', en: '🌙 Ramadan' },
        eidFitr: { ar: '🎉 عيد الفطر', ru: '🎉 Ид аль-Фитр', en: '🎉 Eid al-Fitr' },
        eidFitrH: { ar: '🎉 عطلة عيد الفطر', ru: '🎉 Ид аль-Фитр', en: '🎉 Eid al-Fitr Holiday' },
        arafat: { ar: '🕋 يوم عرفة', ru: '🕋 День Арафат', en: '🕋 Day of Arafat' },
        eidAdha: { ar: '🐏 عيد الأضحى', ru: '🐏 Ид аль-Адха', en: '🐏 Eid al-Adha' },
        eidAdhaH: { ar: '🐏 عطلة عيد الأضحى', ru: '🐏 Ид аль-Адха', en: '🐏 Eid al-Adha Holiday' },
        hijriNY: { ar: '🕌 رأس السنة الهجرية', ru: '🕌 Исламский Новый год', en: '🕌 Islamic New Year' },
        mawlid: { ar: '🕌 المولد النبوي', ru: '🕌 Маулид ан-Наби', en: '🕌 Prophet\'s Birthday' },
        isra: { ar: '🕌 الإسراء والمعراج', ru: '🕌 Исра и Мирадж', en: '🕌 Isra & Mi\'raj' },
        commemoration: { ar: '🇦🇪 يوم الشهيد', ru: '🇦🇪 День памяти', en: '🇦🇪 Commemoration Day' },
        nationalDay: { ar: '🇦🇪 اليوم الوطني', ru: '🇦🇪 Национальный день ОАЭ', en: '🇦🇪 UAE National Day' },
        nationalDayH: { ar: '🇦🇪 عطلة اليوم الوطني', ru: '🇦🇪 День ОАЭ', en: '🇦🇪 National Day Holiday' },
    },

    _h(key) { return this._holidayNames[key][this._lang]; },

    // ─── Switch language and re-render ───
    switchLang() {
        const weekBtn = document.getElementById('week-start-btn');
        const oldMonLabel = this.monLabel;
        const isMon = weekBtn && weekBtn.textContent === oldMonLabel;

        const order = ['ar', 'ru', 'en'];
        const idx = order.indexOf(this._lang);
        this._lang = order[(idx + 1) % 3];

        window.MONTHS = this.months;
        window.WEEK_DAYS_BASE = this.weekDays;
        window.WEEK_DAYS_NARROW_BASE = this.weekDaysNarrow;

        if (window._holidayCache) {
            for (const k in window._holidayCache) delete window._holidayCache[k];
        }

        const btn = document.getElementById('lang-toggle-btn');
        if (btn) btn.textContent = this._lang === 'ar' ? 'ع' : this._lang === 'ru' ? 'RU' : 'EN';

        if (weekBtn) {
            weekBtn.textContent = isMon ? this.monLabel : this.sunLabel;
        }

        if (typeof updateCalendar === 'function') updateCalendar();
        if (typeof refreshOverlayStats === 'function') refreshOverlayStats();
    },

    // ─── Ramadan & Islamic holiday dates (Gregorian) — precomputed ───
    // Source: approximate astronomical calculations. Actual dates confirmed by moon sighting.
    _ramadanDates: {
        // [startMonth, startDay, durationDays] — Ramadan (29 or 30 days)
        2024: [3, 12, 30], 2025: [3, 1, 30], 2026: [2, 18, 30],
        2027: [2, 8, 29], 2028: [1, 28, 30], 2029: [1, 16, 30],
        2030: [1, 6, 29], 2031: [12, 27, 30], 2032: [12, 15, 30],
        2033: [12, 4, 30], 2034: [11, 24, 29], 2035: [11, 13, 30],
    },

    _eidFitrDates: {
        // Eid al-Fitr (1 Shawwal) — day after Ramadan
        2024: [4, 10], 2025: [3, 31], 2026: [3, 20],
        2027: [3, 10], 2028: [2, 27], 2029: [2, 15],
        2030: [2, 5], 2031: [1, 26], 2032: [1, 14],
        2033: [1, 3], 2034: [12, 23], 2035: [12, 12],
    },

    _eidAdhaDates: {
        // Eid al-Adha (10 Dhul Hijjah) — Day of Arafat = day before
        2024: [6, 17], 2025: [6, 7], 2026: [5, 27],
        2027: [5, 16], 2028: [5, 5], 2029: [4, 24],
        2030: [4, 14], 2031: [4, 3], 2032: [3, 22],
        2033: [3, 12], 2034: [3, 1], 2035: [2, 19],
    },

    _mawlidDates: {
        // Mawlid (12 Rabi al-Awal) — Prophet's Birthday
        2024: [9, 16], 2025: [9, 5], 2026: [8, 26],
        2027: [8, 15], 2028: [8, 4], 2029: [7, 24],
        2030: [7, 14], 2031: [7, 3], 2032: [6, 21],
        2033: [6, 11], 2034: [5, 31], 2035: [5, 21],
    },

    _israDates: {
        // Isra & Mi'raj (27 Rajab)
        2024: [2, 8], 2025: [1, 28], 2026: [1, 17],
        2027: [1, 6], 2028: [12, 26], 2029: [12, 16],
        2030: [12, 5], 2031: [11, 24], 2032: [11, 13],
        2033: [11, 2], 2034: [10, 23], 2035: [10, 12],
    },

    getHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };
        const addDate = (date, name) => { add(date.getMonth() + 1, date.getDate(), name); };

        // Fixed holidays
        add(1, 1, this._h('newYear'));
        add(1, 11, 'WALLPLAN DAY');
        add(12, 1, this._h('commemoration'));
        add(12, 2, this._h('nationalDay'));
        add(12, 3, this._h('nationalDayH'));

        // ── Ramadan (full month highlight) ──
        const ram = this._ramadanDates[year];
        if (ram) {
            const [rm, rd, duration] = ram;
            // Day 1: Ramadan Start label
            add(rm, rd, this._h('ramadanStart'));
            // Days 2+: Ramadan label
            for (let i = 1; i < duration; i++) {
                const d = new Date(year, rm - 1, rd + i);
                addDate(d, this._h('ramadan'));
            }
        }

        // ── Eid al-Fitr (3 days) ──
        const ef = this._eidFitrDates[year];
        if (ef) {
            const [em, ed] = ef;
            add(em, ed, this._h('eidFitr'));
            for (let i = 1; i < 3; i++) {
                const d = new Date(year, em - 1, ed + i);
                addDate(d, this._h('eidFitrH'));
            }
        }

        // ── Eid al-Adha (3 days) + Day of Arafat ──
        const ea = this._eidAdhaDates[year];
        if (ea) {
            const [am, ad] = ea;
            // Day of Arafat = day before Eid
            const arafat = new Date(year, am - 1, ad - 1);
            addDate(arafat, this._h('arafat'));
            // Eid al-Adha (3 days)
            add(am, ad, this._h('eidAdha'));
            for (let i = 1; i < 3; i++) {
                const d = new Date(year, am - 1, ad + i);
                addDate(d, this._h('eidAdhaH'));
            }
        }

        // ── Islamic New Year (1 Muharram) ──
        const muh = this._muharramDates[year];
        if (muh) add(muh.month, muh.day, this._h('hijriNY'));

        // ── Prophet's Birthday (Mawlid) ──
        const maw = this._mawlidDates[year];
        if (maw) add(maw[0], maw[1], this._h('mawlid'));

        // ── Isra & Mi'raj ──
        const isra = this._israDates[year];
        if (isra) add(isra[0], isra[1], this._h('isra'));

        return h;
    },

    // ─── Weekend override: Sat + Sun (UAE since 2022) ───
    getWeekendDays() {
        return [0, 6]; // Sunday = 0, Saturday = 6
    },

    // ─── Overlay: Russian holidays for RU/AE contrast ───
    _overlayTooltip: { ar: 'أعياد روسية/أمريكية', ru: 'Праздники РФ/ОАЭ', en: 'US/AE holidays' },
    get overlayTooltip() { return this._overlayTooltip[this._lang]; },

    _ruHolidayNames: {
        newYear: { ar: '🎄 رأس السنة (روسيا)', ru: '🎄 Новый год', en: '🎄 New Year (RU)' },
        newYearH: { ar: '🎄 عطلة رأس السنة (روسيا)', ru: '🎄 Новогодние каникулы', en: '🎄 New Year Holiday (RU)' },
        christmas: { ar: '⛪ عيد الميلاد (روسيا)', ru: '⛪ Рождество Христово', en: '⛪ Christmas (RU)' },
        defender: { ar: '🎖️ يوم المدافع (روسيا)', ru: '🎖️ День защитника Отечества', en: '🎖️ Defender Day (RU)' },
        women: { ar: '💐 يوم المرأة (روسيا)', ru: '💐 Международный женский день', en: '💐 Women\'s Day (RU)' },
        spring: { ar: '🌸 عيد الربيع (روسيا)', ru: '🌸 Праздник Весны и Труда', en: '🌸 Spring & Labour (RU)' },
        victory: { ar: '🎗️ يوم النصر (روسيا)', ru: '🎗️ День Победы', en: '🎗️ Victory Day (RU)' },
        russia: { ar: '🏛️ يوم روسيا', ru: '🏛️ День России', en: '🏛️ Russia Day' },
        unity: { ar: '🤝 يوم الوحدة (روسيا)', ru: '🤝 День народного единства', en: '🤝 Unity Day (RU)' },
        transfer: { ar: '🎄 عطلة (تحويل)', ru: '🎄 Выходной (перенос)', en: '🎄 Holiday (transfer)' },
    },

    _rh(key) { return this._ruHolidayNames[key][this._lang]; },

    getRussianHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };

        add(1, 1, this._rh('newYear'));
        for (let d = 2; d <= 6; d++) add(1, d, this._rh('newYearH'));
        add(1, 7, this._rh('christmas'));
        add(1, 8, this._rh('newYearH'));

        add(2, 23, this._rh('defender'));
        add(3, 8, this._rh('women'));
        add(5, 1, this._rh('spring'));
        add(5, 9, this._rh('victory'));
        add(6, 12, this._rh('russia'));
        add(11, 4, this._rh('unity'));

        if (year === 2026) {
            add(1, 9, this._rh('transfer'));
            add(12, 31, this._rh('transfer'));
        }

        return h;
    },
};
