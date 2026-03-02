// ─── WallPlan Locale: Chinese Holidays (EN/RU/中 toggle) ───
// Official 2026 schedule from State Council (国务院办公厅 2025-11-04)
// For years beyond 2026, fixed holidays repeat; lunar holidays approximated.

window.LOCALE = {
    // ─── Current display language (toggled by user) ───
    _lang: 'en', // 'en' | 'ru' | 'zh'

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
        zh: {
            months: ['', '一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekDays: ['日', '一', '二', '三', '四', '五', '六'],
            weekDaysNarrow: ['日', '一', '二', '三', '四', '五', '六'],
            monLabel: '一', sunLabel: '日',
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
        newYear: { en: "New Year's Day 元旦", ru: "Новый год 元旦", zh: "元旦" },
        newYearH: { en: "New Year Holiday", ru: "Новогодние каникулы", zh: "元旦假期" },
        springEve: { en: "🧨 Spring Festival Eve 除夕", ru: "🧨 Канун Чуньцзе 除夕", zh: "🧨 除夕" },
        spring: { en: "🧨 Spring Festival 春节", ru: "🧨 Праздник Весны Чуньцзе 春节", zh: "🧨 春节" },
        springH: { en: "🧨 Spring Festival", ru: "🧨 Праздник Весны", zh: "🧨 春节" },
        qingming: { en: "🏮 Qingming Festival 清明节", ru: "🏮 Цинмин 清明节", zh: "🏮 清明节" },
        qingmingH: { en: "🏮 Qingming Holiday", ru: "🏮 Цинмин", zh: "🏮 清明节" },
        labour: { en: "🌸 Labour Day 劳动节", ru: "🌸 День Труда 劳动节", zh: "🌸 劳动节" },
        labourH: { en: "🌸 Labour Day", ru: "🌸 День Труда", zh: "🌸 劳动节" },
        youth: { en: "🌸 Youth Day 青年节", ru: "🌸 День Молодёжи 青年节", zh: "🌸 青年节" },
        dragon: { en: "🐉 Dragon Boat Festival 端午节", ru: "🐉 Праздник Лодок-Драконов 端午节", zh: "🐉 端午节" },
        dragonH: { en: "🐉 Dragon Boat Holiday", ru: "🐉 Праздник Лодок-Драконов", zh: "🐉 端午节" },
        midAutumn: { en: "🥮 Mid-Autumn Festival 中秋节", ru: "🥮 Праздник Середины Осени 中秋节", zh: "🥮 中秋节" },
        midAutumnH: { en: "🥮 Mid-Autumn Holiday", ru: "🥮 Середина Осени", zh: "🥮 中秋节" },
        national: { en: "🇨🇳 National Day 国庆节", ru: "🇨🇳 День Образования КНР 国庆节", zh: "🇨🇳 国庆节" },
        nationalH: { en: "🇨🇳 National Day", ru: "🇨🇳 День КНР", zh: "🇨🇳 国庆节" },
        workday: { en: "⚠️ Workday 补班", ru: "⚠️ Рабочий день 补班", zh: "⚠️ 补班" },
    },

    _h(key) { return this._holidayNames[key][this._lang]; },

    // ─── Switch language and re-render ───
    switchLang() {
        // Remember current week start before switching
        const weekBtn = document.getElementById('week-start-btn');
        const oldMonLabel = this.monLabel;
        const isMon = weekBtn && weekBtn.textContent === oldMonLabel;

        const order = ['en', 'ru', 'zh'];
        const idx = order.indexOf(this._lang);
        this._lang = order[(idx + 1) % 3];

        // Update global constants used by calendar.js
        window.MONTHS = this.months;
        window.WEEK_DAYS_BASE = this.weekDays;
        window.WEEK_DAYS_NARROW_BASE = this.weekDaysNarrow;

        // Clear holiday cache (names changed)
        if (window._holidayCache) {
            for (const k in window._holidayCache) delete window._holidayCache[k];
        }

        // Update language button
        const btn = document.getElementById('lang-toggle-btn');
        if (btn) btn.textContent = this._lang === 'en' ? 'EN' : this._lang === 'ru' ? 'RU' : '中';

        // Preserve week start: update button text to new language's label
        if (weekBtn) {
            weekBtn.textContent = isMon ? this.monLabel : this.sunLabel;
        }

        // Re-render
        if (typeof updateCalendar === 'function') updateCalendar();
    },

    // ─── Chinese Zodiac ───
    _zodiacAnimals: {
        en: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
        ru: ['Крыса', 'Бык', 'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза', 'Обезьяна', 'Петух', 'Собака', 'Свинья'],
        zh: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    },
    // Gender of each animal in Russian (for adjective agreement)
    _animalGender: ['f', 'm', 'm', 'm', 'm', 'f', 'f', 'f', 'f', 'm', 'f', 'f'],
    _zodiacEmoji: ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐴', '🐐', '🐒', '🐓', '🐕', '🐷'],
    _zodiacElements: {
        en: ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'],
        zh: ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'],
        ru_m: ['Деревянный', 'Деревянный', 'Огненный', 'Огненный', 'Земляной', 'Земляной', 'Металлический', 'Металлический', 'Водяной', 'Водяной'],
        ru_f: ['Деревянная', 'Деревянная', 'Огненная', 'Огненная', 'Земляная', 'Земляная', 'Металлическая', 'Металлическая', 'Водяная', 'Водяная'],
    },

    getZodiac(year) {
        const animalIdx = (year - 4) % 12;
        const elementIdx = (year - 4) % 10;
        const lang = this._lang;
        let element;
        if (lang === 'ru') {
            const gender = this._animalGender[animalIdx];
            element = this._zodiacElements['ru_' + gender][elementIdx];
        } else {
            element = this._zodiacElements[lang][elementIdx];
        }
        return {
            animal: this._zodiacAnimals[lang][animalIdx],
            emoji: this._zodiacEmoji[animalIdx],
            element: element,
        };
    },
    // ─── Workday overrides: weekends that are actually working days (补班) ───
    getWorkdayOverrides(year) {
        if (year === 2026) {
            return new Set(['0104', '0214', '0228', '0509', '0920', '1010']);
        }
        return new Set();
    },

    // ─── Spring Festival dates (Lunar Jan 1) ───
    _springFestivalDates: {
        2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
        2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23],
        2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8],
    },

    getHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };

        // ── 2026 Official State Council Schedule ──
        if (year === 2026) {
            add(1, 1, this._h('newYear'));
            add(1, 2, this._h('newYearH'));
            add(1, 3, this._h('newYearH'));

            add(2, 15, this._h('springEve'));
            add(2, 16, this._h('spring'));
            add(2, 17, this._h('springH'));
            add(2, 18, this._h('springH'));
            add(2, 19, this._h('springH'));
            add(2, 20, this._h('springH'));
            add(2, 21, this._h('springH'));
            add(2, 22, this._h('springH'));
            add(2, 23, this._h('springH'));

            add(4, 4, this._h('qingming'));
            add(4, 5, this._h('qingmingH'));
            add(4, 6, this._h('qingmingH'));

            add(5, 1, this._h('labour'));
            add(5, 2, this._h('labourH'));
            add(5, 3, this._h('labourH'));
            add(5, 4, this._h('youth'));
            add(5, 5, this._h('labourH'));

            add(6, 19, this._h('dragon'));
            add(6, 20, this._h('dragonH'));
            add(6, 21, this._h('dragonH'));

            add(9, 25, this._h('midAutumn'));
            add(9, 26, this._h('midAutumnH'));
            add(9, 27, this._h('midAutumnH'));

            add(10, 1, this._h('national'));
            add(10, 2, this._h('nationalH'));
            add(10, 3, this._h('nationalH'));
            add(10, 4, this._h('nationalH'));
            add(10, 5, this._h('nationalH'));
            add(10, 6, this._h('nationalH'));
            add(10, 7, this._h('nationalH'));

            // 补班 Makeup workdays (weekends that are working days)
            add(1, 4, this._h('workday'));   // for New Year
            add(2, 14, this._h('workday'));  // for Spring Festival
            add(2, 28, this._h('workday'));  // for Spring Festival
            add(5, 9, this._h('workday'));   // for Labour Day
            add(9, 20, this._h('workday')); // for National Day
            add(10, 10, this._h('workday'));// for National Day

            return h;
        }

        // ── Other years: algorithmic ──
        add(1, 1, this._h('newYear'));

        const sf = this._springFestivalDates[year];
        if (sf) {
            const [sfm, sfd] = sf;
            const eveDate = new Date(year, sfm - 1, sfd - 1);
            add(eveDate.getMonth() + 1, eveDate.getDate(), this._h('springEve'));
            for (let i = 0; i < 7; i++) {
                const d = new Date(year, sfm - 1, sfd + i);
                const label = i === 0 ? this._h('spring') : this._h('springH');
                add(d.getMonth() + 1, d.getDate(), label);
            }
        }

        add(4, 5, this._h('qingming'));
        add(5, 1, this._h('labour'));
        add(5, 4, this._h('youth'));

        if (sf) {
            const dbDate = new Date(year, sf[0] - 1, sf[1] + 113);
            add(dbDate.getMonth() + 1, dbDate.getDate(), this._h('dragon'));
        }

        if (sf) {
            const maDate = new Date(year, sf[0] - 1, sf[1] + 236);
            add(maDate.getMonth() + 1, maDate.getDate(), this._h('midAutumn'));
        }

        add(10, 1, this._h('national'));
        add(10, 2, this._h('nationalH'));
        add(10, 3, this._h('nationalH'));
        add(10, 4, this._h('nationalH'));
        add(10, 5, this._h('nationalH'));
        add(10, 6, this._h('nationalH'));
        add(10, 7, this._h('nationalH'));

        return h;
    },
};
