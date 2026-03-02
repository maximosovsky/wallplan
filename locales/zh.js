// ─── WallPlan Locale: Chinese Holidays (English UI) ───
// Official 2026 schedule from State Council (国务院办公厅 2025-11-04)
// For years beyond 2026, fixed holidays repeat; lunar holidays approximated.

window.LOCALE = {
    months: [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekDaysNarrow: ['U', 'M', 'T', 'W', 'R', 'F', 'S'],
    defaultWeekStart: 'mon',
    monLabel: 'MO',
    sunLabel: 'SU',

    // ─── Chinese Zodiac ───
    _zodiacAnimals: [
        'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
        'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
    ],
    _zodiacEmoji: ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐴', '🐐', '🐒', '🐓', '🐕', '🐷'],
    _zodiacElements: ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'],
    _zodiacColors: ['🟢', '🟢', '🔴', '🔴', '🟡', '🟡', '⚪', '⚪', '⚫', '⚫'],

    getZodiac(year) {
        const animalIdx = (year - 4) % 12;
        const elementIdx = (year - 4) % 10;
        return {
            animal: this._zodiacAnimals[animalIdx],
            emoji: this._zodiacEmoji[animalIdx],
            element: this._zodiacElements[elementIdx],
        };
    },

    // ─── Approximate Lunar New Year dates (for algorithmic fallback) ───
    // Spring Festival (Lunar Jan 1) dates — known through ~2030
    _springFestivalDates: {
        2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
        2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23],
        2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8],
    },

    getHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };

        // Zodiac label for year header
        const z = this.getZodiac(year);

        // ── 2026 Official State Council Schedule ──
        if (year === 2026) {
            // New Year (元旦): Jan 1–3
            add(1, 1, "New Year's Day 元旦");
            add(1, 2, 'New Year Holiday');
            add(1, 3, 'New Year Holiday');

            // Spring Festival (春节): Feb 15–23 (9 days!)
            add(2, 15, '🧨 Spring Festival Eve 除夕');
            add(2, 16, '🧨 Spring Festival 春节');
            add(2, 17, '🧨 Spring Festival 春节');
            add(2, 18, '🧨 Spring Festival');
            add(2, 19, '🧨 Spring Festival');
            add(2, 20, '🧨 Spring Festival');
            add(2, 21, '🧨 Spring Festival');
            add(2, 22, '🧨 Spring Festival');
            add(2, 23, '🧨 Spring Festival');

            // Qingming (清明节): Apr 4–6
            add(4, 4, '🏮 Qingming Festival 清明节');
            add(4, 5, '🏮 Qingming Holiday');
            add(4, 6, '🏮 Qingming Holiday');

            // Labour Day (劳动节): May 1–5
            add(5, 1, '🌸 Labour Day 劳动节');
            add(5, 2, '🌸 Labour Day');
            add(5, 3, '🌸 Labour Day');
            add(5, 4, '🌸 Youth Day 青年节');
            add(5, 5, '🌸 Labour Day');

            // Dragon Boat (端午节): Jun 19–21
            add(6, 19, '🐉 Dragon Boat Festival 端午节');
            add(6, 20, '🐉 Dragon Boat Holiday');
            add(6, 21, '🐉 Dragon Boat Holiday');

            // Mid-Autumn (中秋节): Sep 25–27
            add(9, 25, '🥮 Mid-Autumn Festival 中秋节');
            add(9, 26, '🥮 Mid-Autumn Holiday');
            add(9, 27, '🥮 Mid-Autumn Holiday');

            // National Day (国庆节): Oct 1–7
            add(10, 1, '🇨🇳 National Day 国庆节');
            add(10, 2, '🇨🇳 National Day');
            add(10, 3, '🇨🇳 National Day');
            add(10, 4, '🇨🇳 National Day');
            add(10, 5, '🇨🇳 National Day');
            add(10, 6, '🇨🇳 National Day');
            add(10, 7, '🇨🇳 National Day');

            return h;
        }

        // ── Other years: algorithmic approximation ──
        // New Year
        add(1, 1, "New Year's Day 元旦");

        // Spring Festival: use lookup table or approximate
        const sf = this._springFestivalDates[year];
        if (sf) {
            const [sfm, sfd] = sf;
            // Eve + 7 days
            const eveDate = new Date(year, sfm - 1, sfd - 1);
            add(eveDate.getMonth() + 1, eveDate.getDate(), '🧨 Spring Festival Eve 除夕');
            for (let i = 0; i < 7; i++) {
                const d = new Date(year, sfm - 1, sfd + i);
                const label = i === 0 ? '🧨 Spring Festival 春节' : '🧨 Spring Festival';
                add(d.getMonth() + 1, d.getDate(), label);
            }
        }

        // Qingming: usually Apr 4 or 5
        add(4, 5, '🏮 Qingming Festival 清明节');

        // Labour Day: May 1
        add(5, 1, '🌸 Labour Day 劳动节');
        add(5, 4, '🌸 Youth Day 青年节');

        // Dragon Boat: ~Lunar May 5, approximate
        // Offset from Spring Festival + ~114 days
        if (sf) {
            const dbDate = new Date(year, sf[0] - 1, sf[1] + 113);
            add(dbDate.getMonth() + 1, dbDate.getDate(), '🐉 Dragon Boat Festival 端午节');
        }

        // Mid-Autumn: ~Lunar Aug 15, approximate
        // Offset from Spring Festival + ~237 days
        if (sf) {
            const maDate = new Date(year, sf[0] - 1, sf[1] + 236);
            add(maDate.getMonth() + 1, maDate.getDate(), '🥮 Mid-Autumn Festival 中秋节');
        }

        // National Day: Oct 1–7
        add(10, 1, '🇨🇳 National Day 国庆节');
        add(10, 2, '🇨🇳 National Day');
        add(10, 3, '🇨🇳 National Day');
        add(10, 4, '🇨🇳 National Day');
        add(10, 5, '🇨🇳 National Day');
        add(10, 6, '🇨🇳 National Day');
        add(10, 7, '🇨🇳 National Day');

        return h;
    },
};
