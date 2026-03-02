// ─── WallPlan Locale: Italy / Venice (IT/RU/EN toggle) ───
// Italian public holidays + Venice-specific festivals.
// Weekend: Sat + Sun. Week start: Monday.

window.LOCALE = {
    // ─── Current display language (toggled by user) ───
    _lang: 'it', // 'it' | 'ru' | 'en'

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
        it: {
            months: ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            weekDays: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            weekDaysNarrow: ['D', 'L', 'M', 'X', 'G', 'V', 'S'],
            monLabel: 'LU', sunLabel: 'DO',
        },
    },

    get months() { return this._strings[this._lang].months; },
    get weekDays() { return this._strings[this._lang].weekDays; },
    get weekDaysNarrow() { return this._strings[this._lang].weekDaysNarrow; },
    get monLabel() { return this._strings[this._lang].monLabel; },
    get sunLabel() { return this._strings[this._lang].sunLabel; },
    defaultWeekStart: 'mon',

    // ─── Holiday names in 3 languages ───
    _holidayNames: {
        newYear: { it: '🎆 Capodanno', ru: '🎆 Новый год', en: "🎆 New Year's Day" },
        befana: { it: '👸 Befana', ru: '👸 Бефана (Богоявление)', en: '👸 Epiphany (Befana)' },
        liberation: { it: '🇮🇹 Festa della Liberazione', ru: '🇮🇹 День Освобождения', en: '🇮🇹 Liberation Day' },
        sanMarco: { it: '🦁 Festa di San Marco', ru: '🦁 День Святого Марка', en: '🦁 Feast of St. Mark' },
        labourDay: { it: '✊ Festa dei Lavoratori', ru: '✊ День труда', en: '✊ Labour Day' },
        republic: { it: '🇮🇹 Festa della Repubblica', ru: '🇮🇹 День Республики', en: '🇮🇹 Republic Day' },
        ferragosto: { it: '☀️ Ferragosto', ru: '☀️ Феррагосто', en: '☀️ Assumption (Ferragosto)' },
        allSaints: { it: '✝️ Tutti i Santi', ru: '✝️ День всех святых', en: '✝️ All Saints' },
        salute: { it: '⛪ Madonna della Salute', ru: '⛪ Мадонна делла Салюте', en: '⛪ Madonna della Salute' },
        immacolata: { it: '✝️ Immacolata Concezione', ru: '✝️ Непорочное зачатие', en: '✝️ Immaculate Conception' },
        christmas: { it: '🎄 Natale', ru: '🎄 Рождество', en: '🎄 Christmas Day' },
        santoStefano: { it: '🎄 Santo Stefano', ru: '🎄 День Св. Стефана', en: '🎄 St. Stephen\'s Day' },
        pasquetta: { it: '🐣 Pasquetta', ru: '🐣 Пасхальный понедельник', en: '🐣 Easter Monday' },
        easter: { it: '🐣 Pasqua', ru: '🐣 Пасха', en: '🐣 Easter Sunday' },
        // Venice-specific
        carnevaleStart: { it: '🎭 Carnevale di Venezia', ru: '🎭 Венецианский карнавал', en: '🎭 Venice Carnival' },
        carnevaleEnd: { it: '🎭 Martedì Grasso', ru: '🎭 Жирный вторник', en: '🎭 Shrove Tuesday' },
        sensa: { it: '⚓ Festa della Sensa', ru: '⚓ Праздник Сенса', en: '⚓ Feast of the Sensa' },
        redentore: { it: '🎇 Festa del Redentore', ru: '🎇 Праздник Редентóре', en: '🎇 Feast of the Redeemer' },
        regata: { it: '🚣 Regata Storica', ru: '🚣 Историческая регата', en: '🚣 Historical Regatta' },
    },

    _h(key) { return this._holidayNames[key][this._lang]; },

    // ─── Switch language and re-render ───
    switchLang() {
        const weekBtn = document.getElementById('week-start-btn');
        const oldMonLabel = this.monLabel;
        const isMon = weekBtn && weekBtn.textContent === oldMonLabel;

        const order = ['it', 'ru', 'en'];
        const idx = order.indexOf(this._lang);
        this._lang = order[(idx + 1) % 3];

        window.MONTHS = this.months;
        window.WEEK_DAYS_BASE = this.weekDays;
        window.WEEK_DAYS_NARROW_BASE = this.weekDaysNarrow;

        if (window._holidayCache) {
            for (const k in window._holidayCache) delete window._holidayCache[k];
        }

        const btn = document.getElementById('lang-toggle-btn');
        if (btn) btn.textContent = this._lang === 'it' ? 'IT' : this._lang === 'ru' ? 'RU' : 'EN';

        if (weekBtn) {
            weekBtn.textContent = isMon ? this.monLabel : this.sunLabel;
        }

        if (typeof updateCalendar === 'function') updateCalendar();
        if (typeof refreshOverlayStats === 'function') refreshOverlayStats();
    },

    // ─── Easter Sunday dates (Western/Gregorian) — precomputed ───
    _easterDates: {
        2024: [3, 31], 2025: [4, 20], 2026: [4, 5], 2027: [3, 28],
        2028: [4, 16], 2029: [4, 1], 2030: [4, 21], 2031: [4, 13],
        2032: [3, 28], 2033: [4, 17], 2034: [4, 9], 2035: [3, 25],
        2036: [4, 13], 2037: [4, 5], 2038: [4, 25], 2039: [4, 10],
        2040: [4, 1], 2041: [4, 21], 2042: [4, 6], 2043: [3, 29],
        2044: [4, 17], 2045: [4, 9],
    },

    // ─── Venice Carnival starts ~2 weeks before Shrove Tuesday ───
    // Shrove Tuesday = Easter - 47 days
    // Carnival start ≈ Easter - 58 days (≈11 days before Shrove Tuesday)

    // ─── Festa della Sensa: Ascension Day = Easter + 39 ───

    // ─── Regata Storica: 1st Sunday of September ───
    _getFirstSundayOfSeptember(year) {
        const d = new Date(year, 8, 1); // Sep 1
        const dow = d.getDay(); // 0=Sun
        const offset = dow === 0 ? 0 : 7 - dow;
        return 1 + offset;
    },

    // ─── Festa del Redentore: 3rd Sunday of July ───
    _getThirdSundayOfJuly(year) {
        const d = new Date(year, 6, 1); // Jul 1
        const dow = d.getDay();
        const firstSunday = dow === 0 ? 1 : 8 - dow;
        return firstSunday + 14; // 3rd Sunday
    },

    getHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };
        const addDate = (date, name) => {
            if (date.getFullYear() === year) add(date.getMonth() + 1, date.getDate(), name);
        };

        // ── Fixed national holidays ──
        add(1, 1, this._h('newYear'));
        add(1, 6, this._h('befana'));
        add(1, 11, 'WALLPLAN DAY');
        add(4, 25, this._h('sanMarco'));  // Venice priority: San Marco + Liberation Day
        add(5, 1, this._h('labourDay'));
        add(6, 2, this._h('republic'));
        add(8, 15, this._h('ferragosto'));
        add(11, 1, this._h('allSaints'));
        add(11, 21, this._h('salute'));  // Venice patron: Madonna della Salute
        add(12, 8, this._h('immacolata'));
        add(12, 25, this._h('christmas'));
        add(12, 26, this._h('santoStefano'));

        // ── Easter & Pasquetta (floating) ──
        const easter = this._easterDates[year];
        if (easter) {
            const [em, ed] = easter;
            add(em, ed, this._h('easter'));
            // Pasquetta = Easter Monday
            const pasquetta = new Date(year, em - 1, ed + 1);
            addDate(pasquetta, this._h('pasquetta'));

            // ── Venice Carnival ──
            // Shrove Tuesday (Martedì Grasso) = Easter - 47 days
            const shroveTuesday = new Date(year, em - 1, ed - 47);
            addDate(shroveTuesday, this._h('carnevaleEnd'));
            // Carnival start ≈ 11 days before Shrove Tuesday
            const carnevaleStart = new Date(year, em - 1, ed - 58);
            addDate(carnevaleStart, this._h('carnevaleStart'));

            // ── Festa della Sensa (Ascension) = Easter + 39 ──
            const sensa = new Date(year, em - 1, ed + 39);
            addDate(sensa, this._h('sensa'));
        }

        // ── Regata Storica: 1st Sunday of September ──
        const regataDay = this._getFirstSundayOfSeptember(year);
        add(9, regataDay, this._h('regata'));

        // ── Festa del Redentore: 3rd Sunday of July ──
        const redentoreDay = this._getThirdSundayOfJuly(year);
        add(7, redentoreDay, this._h('redentore'));

        return h;
    },

    // ─── Weekend: Sat + Sun ───
    getWeekendDays() {
        return [0, 6]; // Sunday = 0, Saturday = 6
    },

    // ─── Overlay: RU/US holidays ───
    _overlayTooltip: { it: 'Festività 🇷🇺/🇺🇸', ru: 'Праздники РU/US', en: 'RU/US holidays' },
    get overlayTooltip() { return this._overlayTooltip[this._lang]; },

    _ruHolidayNames: {
        newYear: { it: '🎄 Capodanno (Russia)', ru: '🎄 Новый год', en: '🎄 New Year (RU)' },
        newYearH: { it: '🎄 Vacanze di Capodanno', ru: '🎄 Новогодние каникулы', en: '🎄 New Year Holiday (RU)' },
        christmas: { it: '⛪ Natale ortodosso', ru: '⛪ Рождество Христово', en: '⛪ Christmas (RU)' },
        defender: { it: '🎖️ Giorno del Difensore', ru: '🎖️ День защитника Отечества', en: '🎖️ Defender Day (RU)' },
        women: { it: '💐 Giornata della Donna', ru: '💐 Международный женский день', en: "💐 Women's Day (RU)" },
        spring: { it: '🌸 Festa del Lavoro (RU)', ru: '🌸 Праздник Весны и Труда', en: '🌸 Spring & Labour (RU)' },
        victory: { it: '🎗️ Giorno della Vittoria', ru: '🎗️ День Победы', en: '🎗️ Victory Day (RU)' },
        russia: { it: '🏛️ Giorno della Russia', ru: '🏛️ День России', en: '🏛️ Russia Day' },
        unity: { it: '🤝 Giorno dell\'Unità (RU)', ru: '🤝 День народного единства', en: '🤝 Unity Day (RU)' },
        transfer: { it: '🎄 Festivo (trasferimento)', ru: '🎄 Выходной (перенос)', en: '🎄 Holiday (transfer)' },
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
