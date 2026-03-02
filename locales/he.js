// ─── WallPlan Locale: Israel (HE/RU/EN toggle) ───
// Israeli public holidays: state + religious. Lunar dates via Gauss algorithm.
// Hebrew year = Gregorian + 3760 (before Rosh Hashana) or + 3761 (after).

window.LOCALE = {
    // ─── Current display language (toggled by user) ───
    _lang: 'en', // 'he' | 'ru' | 'en'

    _strings: {
        en: {
            months: ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            weekDays: ['Ris', 'She', 'Shl', 'Rev', 'Cha', 'Shi', 'ש׳'],
            weekDaysNarrow: ['R', 'S', 'L', 'V', 'C', 'I', 'B'],
            monLabel: 'MO', sunLabel: 'SU',
        },
        ru: {
            months: ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            weekDays: ['Риш', 'Шен', 'Шли', 'Рев', 'Хам', 'Шиш', 'ש׳'],
            weekDaysNarrow: ['Р', 'Ш', 'Л', 'В', 'Х', 'И', 'Б'],
            monLabel: 'ПН', sunLabel: 'ВС',
        },
        he: {
            months: ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
            weekDays: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
            weekDaysNarrow: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
            monLabel: 'ב׳', sunLabel: 'א׳',
        },
    },

    get months() { return this._strings[this._lang].months; },
    get weekDays() { return this._strings[this._lang].weekDays; },
    get weekDaysNarrow() { return this._strings[this._lang].weekDaysNarrow; },
    get monLabel() { return this._strings[this._lang].monLabel; },
    get sunLabel() { return this._strings[this._lang].sunLabel; },
    defaultWeekStart: 'sun',

    // ─── Hebrew year calculation ───
    // Before Rosh Hashana: Gregorian + 3760. After: + 3761.
    getHebrewYear(gregYear) {
        // Rosh Hashana dates (1 Tishrei) — precomputed for range
        const rh = this._roshHashanaDates[gregYear];
        return {
            yearBefore: gregYear + 3760,  // Jan 1 → Rosh Hashana
            yearAfter: gregYear + 3761,   // Rosh Hashana → Dec 31
            boundary: rh || null,         // {month, day} of Rosh Hashana
        };
    },

    // Rosh Hashana Gregorian dates (1 Tishrei)
    _roshHashanaDates: {
        2024: { month: 10, day: 3 }, 2025: { month: 9, day: 23 },
        2026: { month: 9, day: 12 }, 2027: { month: 10, day: 2 },
        2028: { month: 9, day: 21 }, 2029: { month: 9, day: 10 },
        2030: { month: 9, day: 28 }, 2031: { month: 9, day: 18 },
        2032: { month: 9, day: 6 }, 2033: { month: 9, day: 24 },
        2034: { month: 9, day: 14 }, 2035: { month: 10, day: 4 },
        2036: { month: 9, day: 22 }, 2037: { month: 9, day: 10 },
        2038: { month: 9, day: 30 }, 2039: { month: 9, day: 19 },
        2040: { month: 9, day: 8 }, 2041: { month: 9, day: 26 },
        2042: { month: 9, day: 15 }, 2043: { month: 10, day: 5 },
        2044: { month: 9, day: 22 }, 2045: { month: 9, day: 11 },
    },

    // Hebrew month names in order (Tishrei → Elul)
    _hebrewMonthNames: [
        { he: 'תשרי', en: 'Tishrei', ru: 'Тишрей' },
        { he: 'חשוון', en: 'Cheshvan', ru: 'Хешван' },
        { he: 'כסלו', en: 'Kislev', ru: 'Кислев' },
        { he: 'טבת', en: 'Tevet', ru: 'Тевет' },
        { he: 'שבט', en: 'Shevat', ru: 'Шват' },
        { he: 'אדר', en: 'Adar', ru: 'Адар' },
        { he: 'אדר א׳', en: 'Adar I', ru: 'Адар I' },
        { he: 'אדר ב׳', en: 'Adar II', ru: 'Адар II' },
        { he: 'ניסן', en: 'Nisan', ru: 'Нисан' },
        { he: 'אייר', en: 'Iyar', ru: 'Ияр' },
        { he: 'סיוון', en: 'Sivan', ru: 'Сиван' },
        { he: 'תמוז', en: 'Tammuz', ru: 'Таммуз' },
        { he: 'אב', en: 'Av', ru: 'Ав' },
        { he: 'אלול', en: 'Elul', ru: 'Элуль' },
    ],

    // Compute Hebrew month lengths for a Hebrew year starting at rh1 and ending before rh2
    _getHebrewMonthLengths(rh1, rh2) {
        // Total days in this Hebrew year
        const totalDays = Math.round((rh2 - rh1) / 86400000);
        // Determine year type from total days:
        // Non-leap: 353 (deficient), 354 (regular), 355 (complete)
        // Leap:     383 (deficient), 384 (regular), 385 (complete)
        const isLeap = totalDays >= 383;
        const yearType = totalDays - (isLeap ? 383 : 353); // 0=deficient, 1=regular, 2=complete

        // Month lengths: Tishrei(30), Cheshvan(29/30), Kislev(30/29), Tevet(29),
        // Shevat(30), Adar(29)/AdarI(30)+AdarII(29), Nisan(30), Iyar(29),
        // Sivan(30), Tammuz(29), Av(30), Elul(29)
        const months = [];
        const names = this._hebrewMonthNames;

        months.push({ name: names[0], days: 30 }); // Tishrei
        months.push({ name: names[1], days: yearType >= 2 ? 30 : 29 }); // Cheshvan
        months.push({ name: names[2], days: yearType >= 1 ? 30 : 29 }); // Kislev
        months.push({ name: names[3], days: 29 }); // Tevet
        months.push({ name: names[4], days: 30 }); // Shevat
        if (isLeap) {
            months.push({ name: names[6], days: 30 }); // Adar I
            months.push({ name: names[7], days: 29 }); // Adar II
        } else {
            months.push({ name: names[5], days: 29 }); // Adar
        }
        months.push({ name: names[8], days: 30 });  // Nisan
        months.push({ name: names[9], days: 29 });  // Iyar
        months.push({ name: names[10], days: 30 }); // Sivan
        months.push({ name: names[11], days: 29 }); // Tammuz
        months.push({ name: names[12], days: 30 }); // Av
        months.push({ name: names[13], days: 29 }); // Elul

        return months;
    },

    // Compute all Hebrew month start dates that fall within a Gregorian year
    _computeHebrewMonthsForGregYear(gregYear) {
        // We need Rosh Hashana of the year before and the year itself
        const rh_prev_prev = this._roshHashanaDates[gregYear - 2];
        const rh_prev = this._roshHashanaDates[gregYear - 1];
        const rh_cur = this._roshHashanaDates[gregYear];
        const rh_next = this._roshHashanaDates[gregYear + 1];
        if (!rh_prev || !rh_cur) return null;

        const result = [];
        const gregStart = new Date(gregYear, 0, 1);
        const gregEnd = new Date(gregYear, 11, 31);

        // Hebrew year starting in gregYear-1, continuing into gregYear
        // Only include months that START within gregYear (no clipping)
        {
            const rhDate = new Date(gregYear - 1, rh_prev.month - 1, rh_prev.day);
            const rhNext = new Date(gregYear, rh_cur.month - 1, rh_cur.day);
            const months = this._getHebrewMonthLengths(rhDate, rhNext);
            let cursor = new Date(rhDate);
            for (const m of months) {
                const mEnd = new Date(cursor);
                mEnd.setDate(mEnd.getDate() + m.days - 1);
                // Only include if month STARTS within gregYear
                if (cursor >= gregStart && cursor <= gregEnd) {
                    result.push({
                        m: cursor.getMonth() + 1,
                        d: cursor.getDate(),
                        name: m.name,
                        endM: mEnd.getMonth() + 1,
                        endD: mEnd.getDate(),
                        numDays: m.days,
                    });
                }
                cursor = new Date(mEnd);
                cursor.setDate(cursor.getDate() + 1);
            }
        }

        // Hebrew year starting in gregYear
        if (rh_next) {
            const rhDate = new Date(gregYear, rh_cur.month - 1, rh_cur.day);
            const rhNext = new Date(gregYear + 1, rh_next.month - 1, rh_next.day);
            const months = this._getHebrewMonthLengths(rhDate, rhNext);
            let cursor = new Date(rhDate);
            for (const m of months) {
                const mEnd = new Date(cursor);
                mEnd.setDate(mEnd.getDate() + m.days - 1);
                if (cursor > gregEnd) break;
                if (mEnd >= gregStart && cursor <= gregEnd) {
                    result.push({
                        m: cursor.getMonth() + 1,
                        d: cursor.getDate(),
                        name: m.name,
                        endM: mEnd.getMonth() + 1,
                        endD: mEnd.getDate(),
                        numDays: m.days,
                    });
                }
                cursor = new Date(mEnd);
                cursor.setDate(cursor.getDate() + 1);
            }
        }

        return result;
    },

    // ─── Full Hebrew months as calendar columns ───
    // Returns array of full Hebrew months with Gregorian date ranges.
    // Each month = one column (29-30 days), crossing Gregorian month boundaries.
    getAlternateMonths(year) {
        const starts = this._computeHebrewMonthsForGregYear(year);
        if (!starts || starts.length === 0) return null;

        const months = [];
        for (let i = 0; i < starts.length; i++) {
            const cur = starts[i];
            const startDate = new Date(year, cur.m - 1, cur.d);
            // Use precomputed end date (handles cross-year months like Tevet Dec→Jan)
            const endM = cur.endM || (i + 1 < starts.length ? starts[i + 1].m : 12);
            const endD = cur.endD || (i + 1 < starts.length ? starts[i + 1].d - 1 : 31);
            const numDays = cur.numDays || 30;

            // Compute endYear — if endMonth < startMonth, it crosses into next year
            const endYear = endM < cur.m ? year + 1 : year;

            months.push({
                name: cur.name,
                startYear: year,
                startMonth: cur.m,
                startDay: cur.d,
                endMonth: endM,
                endDay: endD,
                numDays: numDays,
            });
        }
        return months;
    },

    // ─── Holiday names in 3 languages ───
    _holidayNames: {
        // State holidays
        roshHashana: { he: '🔔 ראש השנה', ru: '🔔 Рош ха-Шана', en: '🔔 Rosh Hashana' },
        roshHashana2: { he: '🔔 ראש השנה ב׳', ru: '🔔 Рош ха-Шана (2-й день)', en: '🔔 Rosh Hashana Day 2' },
        yomKippur: { he: '🕯️ יום כיפור', ru: '🕯️ Йом Кипур', en: '🕯️ Yom Kippur' },
        sukkot: { he: '🌿 סוכות', ru: '🌿 Суккот', en: '🌿 Sukkot' },
        sukkotH: { he: '🌿 חול המועד סוכות', ru: '🌿 Суккот (холь а-моэд)', en: '🌿 Sukkot (Hol HaMoed)' },
        shminiAtzeret: { he: '🌿 שמיני עצרת', ru: '🌿 Шмини Ацерет', en: '🌿 Shmini Atzeret' },
        simchatTorah: { he: '📜 שמחת תורה', ru: '📜 Симхат Тора', en: '📜 Simchat Torah' },
        pesach: { he: '🫓 פסח', ru: '🫓 Песах', en: '🫓 Pesach' },
        pesachH: { he: '🫓 חול המועד פסח', ru: '🫓 Песах (холь а-моэд)', en: '🫓 Pesach (Hol HaMoed)' },
        pesach7: { he: '🫓 שביעי של פסח', ru: '🫓 Седьмой день Песаха', en: '🫓 Pesach Day 7' },
        shavuot: { he: '🌾 שבועות', ru: '🌾 Шавуот', en: '🌾 Shavuot' },
        independence: { he: '🇮🇱 יום העצמאות', ru: '🇮🇱 День Независимости', en: '🇮🇱 Independence Day' },
        memorial: { he: '🕯️ יום הזיכרון', ru: '🕯️ День Памяти', en: '🕯️ Memorial Day' },
        holocaust: { he: '🕯️ יום השואה', ru: '🕯️ День Катастрофы', en: '🕯️ Holocaust Day' },
        // Religious
        hanukkah: { he: '🕎 חנוכה', ru: '🕎 Ханука', en: '🕎 Hanukkah' },
        hanukkahH: { he: '🕎 חנוכה', ru: '🕎 Ханука', en: '🕎 Hanukkah' },
        purim: { he: '🎭 פורים', ru: '🎭 Пурим', en: '🎭 Purim' },
        tuBishvat: { he: '🌳 ט״ו בשבט', ru: '🌳 Ту би-Шват', en: '🌳 Tu BiShvat' },
        lagBaomer: { he: '🔥 ל״ג בעומר', ru: '🔥 Лаг ба-Омер', en: '🔥 Lag BaOmer' },
        tishaBeav: { he: '🕯️ תשעה באב', ru: '🕯️ Тиша бе-Ав', en: '🕯️ Tisha BeAv' },
        newYear: { he: '🎆 ערב השנה האזרחית', ru: '🎆 Новый год', en: "🎆 New Year's Day" },
    },

    _h(key) { return this._holidayNames[key][this._lang]; },

    // ─── Switch language and re-render ───
    switchLang() {
        const weekBtn = document.getElementById('week-start-btn');
        const oldMonLabel = this.monLabel;
        const isMon = weekBtn && weekBtn.textContent === oldMonLabel;

        const order = ['he', 'ru', 'en'];
        const idx = order.indexOf(this._lang);
        this._lang = order[(idx + 1) % 3];

        window.MONTHS = this.months;
        window.WEEK_DAYS_BASE = this.weekDays;
        window.WEEK_DAYS_NARROW_BASE = this.weekDaysNarrow;

        if (window._holidayCache) {
            for (const k in window._holidayCache) delete window._holidayCache[k];
        }

        const btn = document.getElementById('lang-toggle-btn');
        if (btn) btn.textContent = this._lang === 'he' ? 'עב' : this._lang === 'ru' ? 'RU' : 'EN';

        if (weekBtn) {
            weekBtn.textContent = isMon ? this.monLabel : this.sunLabel;
        }

        if (typeof updateCalendar === 'function') updateCalendar();
        if (typeof refreshOverlayStats === 'function') refreshOverlayStats();
    },

    // ─── Pesach dates (15 Nisan in Gregorian) — precomputed ───
    _pesachDates: {
        2024: [4, 23], 2025: [4, 13], 2026: [4, 2], 2027: [4, 22],
        2028: [4, 11], 2029: [3, 31], 2030: [4, 18], 2031: [4, 8],
        2032: [3, 27], 2033: [4, 14], 2034: [4, 4], 2035: [4, 24],
        2036: [4, 12], 2037: [4, 1], 2038: [4, 20], 2039: [4, 10],
        2040: [3, 29], 2041: [4, 16], 2042: [4, 5], 2043: [4, 25],
        2044: [4, 12], 2045: [4, 1],
    },

    // ─── Hanukkah start dates (25 Kislev in Gregorian) — precomputed ───
    _hanukkahDates: {
        2024: [12, 26], 2025: [12, 15], 2026: [12, 5], 2027: [12, 25],
        2028: [12, 13], 2029: [12, 2], 2030: [12, 21], 2031: [12, 10],
        2032: [11, 28], 2033: [12, 17], 2034: [12, 7], 2035: [12, 27],
        2036: [12, 14], 2037: [12, 3], 2038: [12, 22], 2039: [12, 12],
        2040: [11, 30], 2041: [12, 18], 2042: [12, 8], 2043: [12, 27],
        2044: [12, 14], 2045: [12, 4],
    },

    getHolidays(year) {
        const h = {};
        const pad2 = n => String(n).padStart(2, '0');
        const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };
        const addDate = (date, name) => { add(date.getMonth() + 1, date.getDate(), name); };

        add(1, 1, this._h('newYear'));
        add(1, 11, 'WALLPLAN DAY');

        // ── Rosh Hashana (1-2 Tishrei) ──
        const rh = this._roshHashanaDates[year];
        if (rh) {
            add(rh.month, rh.day, this._h('roshHashana'));
            const rh2 = new Date(year, rh.month - 1, rh.day + 1);
            addDate(rh2, this._h('roshHashana2'));

            // Yom Kippur = 10 Tishrei = Rosh Hashana + 9
            const yk = new Date(year, rh.month - 1, rh.day + 9);
            addDate(yk, this._h('yomKippur'));

            // Sukkot = 15 Tishrei = Rosh Hashana + 14
            const sukkot = new Date(year, rh.month - 1, rh.day + 14);
            addDate(sukkot, this._h('sukkot'));
            // Hol HaMoed Sukkot (days 2-6)
            for (let i = 1; i <= 5; i++) {
                const d = new Date(year, rh.month - 1, rh.day + 14 + i);
                addDate(d, this._h('sukkotH'));
            }
            // Shmini Atzeret = 22 Tishrei
            const sa = new Date(year, rh.month - 1, rh.day + 21);
            addDate(sa, this._h('shminiAtzeret'));
            // Simchat Torah = 23 Tishrei (in Israel same as Shmini Atzeret, but next day in diaspora)
            const st = new Date(year, rh.month - 1, rh.day + 22);
            addDate(st, this._h('simchatTorah'));

            // Yom HaZikaron + Yom HaAtzmaut — fixed dates
            // Holocaust Remembrance Day = 27 Nisan
            // Memorial Day = 4 Iyar, Independence Day = 5 Iyar
            // These shift if they fall on certain days of week

            // Tisha BeAv = 9 Av — approximately Rosh Hashana - 54 days
            // (rough: Aug 5-7 area)
        }

        // ── Pesach (15-21 Nisan) ──
        const pesach = this._pesachDates[year];
        if (pesach) {
            const [pm, pd] = pesach;
            add(pm, pd, this._h('pesach'));
            // Days 2-6: Hol HaMoed
            for (let i = 1; i <= 5; i++) {
                const d = new Date(year, pm - 1, pd + i);
                addDate(d, this._h('pesachH'));
            }
            // Day 7
            const p7 = new Date(year, pm - 1, pd + 6);
            addDate(p7, this._h('pesach7'));

            // Shavuot = Pesach + 50 days
            const shavuot = new Date(year, pm - 1, pd + 49);
            addDate(shavuot, this._h('shavuot'));

            // Lag BaOmer = Pesach + 33 days
            const lag = new Date(year, pm - 1, pd + 32);
            addDate(lag, this._h('lagBaomer'));

            // Yom HaShoah = 27 Nisan = Pesach + 12
            const shoah = new Date(year, pm - 1, pd + 12);
            addDate(shoah, this._h('holocaust'));

            // Yom HaZikaron = 4 Iyar = Pesach + 19
            const zikaron = new Date(year, pm - 1, pd + 19);
            addDate(zikaron, this._h('memorial'));

            // Independence Day = 5 Iyar = Pesach + 20
            const atzmaut = new Date(year, pm - 1, pd + 20);
            addDate(atzmaut, this._h('independence'));
        }

        // ── Tu BiShvat = 15 Shvat — approximately Rosh Hashana - 236 days ──
        // Precomputed for accuracy
        const tuBishvat = {
            2024: [1, 25], 2025: [2, 13], 2026: [2, 2], 2027: [1, 22],
            2028: [2, 10], 2029: [1, 30], 2030: [1, 19], 2031: [2, 6],
            2032: [1, 27], 2033: [1, 15], 2034: [2, 3], 2035: [1, 24],
        };
        const tb = tuBishvat[year];
        if (tb) add(tb[0], tb[1], this._h('tuBishvat'));

        // ── Purim = 14 Adar = Pesach - 30 days ──
        if (pesach) {
            const purim = new Date(year, pesach[0] - 1, pesach[1] - 30);
            addDate(purim, this._h('purim'));
        }

        // ── Tisha BeAv (9 Av) — precomputed ──
        const tishaBeav = {
            2024: [8, 13], 2025: [8, 3], 2026: [7, 23], 2027: [8, 12],
            2028: [8, 1], 2029: [7, 22], 2030: [8, 8], 2031: [7, 29],
            2032: [7, 17], 2033: [8, 4], 2034: [7, 25], 2035: [8, 14],
        };
        const tba = tishaBeav[year];
        if (tba) add(tba[0], tba[1], this._h('tishaBeav'));

        // ── Hanukkah (8 days from 25 Kislev) ──
        const hanuk = this._hanukkahDates[year];
        if (hanuk) {
            const [hm, hd] = hanuk;
            add(hm, hd, this._h('hanukkah'));
            for (let i = 1; i < 8; i++) {
                const d = new Date(year, hm - 1, hd + i);
                addDate(d, this._h('hanukkahH'));
            }
        }

        return h;
    },

    // ─── Weekend override: Shabbat (Saturday) ───
    // Israel: work Sun-Thu, Fri half-day, Sat = Shabbat (rest day)
    getWeekendDays() {
        // Returns array of day-of-week indices that are weekends (0=Sun, 6=Sat)
        return [6]; // Only Shabbat
    },

    // ─── Overlay: Russian holidays for RU/IL contrast ───
    _overlayTooltip: { he: 'חגים רוסיים/אמריקאיים', ru: 'Праздники РФ/IL', en: 'US/IL holidays' },
    get overlayTooltip() { return this._overlayTooltip[this._lang]; },

    _ruHolidayNames: {
        newYear: { he: '🎄 שנה חדשה (רוסיה)', ru: '🎄 Новый год', en: '🎄 New Year (RU)' },
        newYearH: { he: '🎄 חופשת שנה חדשה (רוסיה)', ru: '🎄 Новогодние каникулы', en: '🎄 New Year Holiday (RU)' },
        christmas: { he: '⛪ חג המולד (רוסיה)', ru: '⛪ Рождество Христово', en: '⛪ Christmas (RU)' },
        defender: { he: '🎖️ יום המגן (רוסיה)', ru: '🎖️ День защитника Отечества', en: '🎖️ Defender Day (RU)' },
        women: { he: '💐 יום האישה (רוסיה)', ru: '💐 Международный женский день', en: '💐 Women\'s Day (RU)' },
        spring: { he: '🌸 חג האביב (רוסיה)', ru: '🌸 Праздник Весны и Труда', en: '🌸 Spring & Labour (RU)' },
        victory: { he: '🎗️ יום הניצחון (רוסיה)', ru: '🎗️ День Победы', en: '🎗️ Victory Day (RU)' },
        russia: { he: '🏛️ יום רוסיה', ru: '🏛️ День России', en: '🏛️ Russia Day' },
        unity: { he: '🤝 יום האחדות (רוסיה)', ru: '🤝 День народного единства', en: '🤝 Unity Day (RU)' },
        transfer: { he: '🎄 חופשה (העברה)', ru: '🎄 Выходной (перенос)', en: '🎄 Holiday (transfer)' },
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
