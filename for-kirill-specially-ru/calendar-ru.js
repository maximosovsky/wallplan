// ─── WallPlan Calendar — SVG Renderer ───

// Справочники
const MONTHS = [
	'', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
	'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEK_DAYS_BASE = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WEEK_DAYS_NARROW_BASE = ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'];

function getOrderedDays(weekStart) {
	const offset = (weekStart === 'mon') ? 1 : 0;
	const reorder = (arr) => [...arr.slice(offset), ...arr.slice(0, offset)];
	return {
		days: reorder(WEEK_DAYS_BASE),
		narrow: reorder(WEEK_DAYS_NARROW_BASE),
		offset: offset,
	};
}

// Российские государственные праздники
const _holidayCache = {};
const customEntries = [];
function getCustomEntries(year) {
	const h = {};
	for (const e of customEntries) {
		if (e.yearly || e.year === year) {
			const key = pad2(e.month) + pad2(e.day);
			h[key] = e.text;
		}
	}
	return h;
}
function getHolidays(year) {
	if (_holidayCache[year]) return _holidayCache[year];
	const h = {};
	const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };
	// Новогодние каникулы
	add(1, 1, '🎄 Новый год');
	add(1, 2, '🎄 Новогодние каникулы');
	add(1, 3, '🎄 Новогодние каникулы');
	add(1, 4, '🎄 Новогодние каникулы');
	add(1, 5, '🎄 Новогодние каникулы');
	add(1, 6, '🎄 Новогодние каникулы');
	add(1, 7, '⛪ Рождество Христово');
	add(1, 8, '🎄 Новогодние каникулы');
	add(1, 11, '🎂 Максим Осовский д/р');
	// Остальные праздники
	add(2, 23, '🎖️ День защитника Отечества');
	add(3, 8, '💐 Международный женский день');
	add(5, 1, '🌸 Праздник Весны и Труда');
	add(5, 9, '🎗️ День Победы');
	add(6, 12, '🏛️ День России');
	add(11, 4, '🤝 День народного единства');
	_holidayCache[year] = h;
	return h;
}

// Утилиты для дат
function getUSDayOfWeek(date) { return date.getDay(); }
function getLastDayOfMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }

function getWeekNumber(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function pad2(n) { return String(n).padStart(2, '0'); }
function formatIndex(date) { return String(date.getFullYear()).slice(2) + pad2(date.getMonth() + 1); }

// ─── SVG Helper ───
const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs, parent) {
	const el = document.createElementNS(SVG_NS, tag);
	if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
	if (parent) parent.appendChild(el);
	return el;
}

// ─── SVG Layout Constants (in unitless "points", 1pt ≈ on-screen px at scale 1) ───
const LAYOUT = {
	// Month column — all months have equal width
	monthColW: 340,     // width of one month column (equal for all months)

	// Gantt row height
	cellH: 14,          // height of one Gantt row (empty)

	// Day label row
	dayLabelH: 7,       // height of narrow day letter row
	dayNumH: 9,         // day number row height

	// Vertical calendar
	verRowH: 11,        // height per day in vertical section

	// Month names & year
	monthNameH: 30,     // month name row height
	yearH: 20,          // year label row height
	monthBottomPad: 0, // padding below vertical calendar

	// Box calendar (mini month grid)
	boxNameH: 28,       // month name row above box grid
	boxCellH: 11,       // height of one box calendar row
	boxHeaderH: 8,      // day-of-week header row

	// Spacer column (first column, left side)
	spacerW: 0,

	// Borders
	monthBorderW: 0.5,
	quarterBorderW: 0.75,
	yearBorderW: 1,

	// Week separator line within Gantt
	weekLineW: 0.2,

	// Fonts
	fontFamily: "'IBM Plex Sans', FreeSans, sans-serif",
};

// ─── Colors ───
const COLORS = {
	ink: '#2C2C2C',
	inkLight: '#5A5A5A',
	red: '#C41E3A',
	border: '#C8B89A',
	cellLine: '#999999',
};

// ─── SVG Calendar Generator ───
function generateCalendarSVG(months, emptyRows, weekStart, startOffset = 0, maxMonthsPerPage = 0) {
	const { days: WEEK_DAYS, narrow: WEEK_DAYS_NARROW, offset: wsOffset } = getOrderedDays(weekStart);
	const L = LAYOUT;

	// ── Compute calendar data ──
	const now = new Date();
	const startDate = new Date(now.getFullYear(), now.getMonth() + startOffset, 1);
	const totalLength = months - 1;
	const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + totalLength + 1, 0);

	const holidaysByYear = {};
	for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
		holidaysByYear[y] = getHolidays(y);
		const ce = getCustomEntries(y);
		for (const k of Object.keys(ce)) holidaysByYear[y][k] = ce[k];
	}

	// Collect per-month data
	const monthsData = [];
	const curDate = new Date(startDate);
	const loopEnd = new Date(endDate);
	loopEnd.setDate(loopEnd.getDate() + 1);

	let currentMonthDays = [];
	let currentIndex = null;

	while (curDate < loopEnd) {
		const md = pad2(curDate.getMonth() + 1) + pad2(curDate.getDate());
		const yearHolidays = holidaysByYear[curDate.getFullYear()];
		const holiday = yearHolidays[md] || '';
		const rawDow = getUSDayOfWeek(curDate);
		const isWeekend = (rawDow === 0 || rawDow === 6);
		const adjustedDow = (rawDow - wsOffset + 7) % 7;
		const index = formatIndex(curDate);
		const day = curDate.getDate();
		const lastDay = getLastDayOfMonth(curDate);

		if (index !== currentIndex) {
			if (currentIndex !== null) {
				monthsData[monthsData.length - 1].days = currentMonthDays;
			}
			currentIndex = index;
			currentMonthDays = [];
			monthsData.push({
				index,
				name: MONTHS[curDate.getMonth() + 1],
				year: String(curDate.getFullYear()),
				monthNum: curDate.getMonth() + 1,
				days: [],
			});
		}

		currentMonthDays.push({
			day,
			rawDow,
			adjustedDow,
			isWeekend,
			holiday,
			lastDay,
			weekNum: getWeekNumber(curDate),
			isFirstOfMonth: day === 1,
			isWeekStart: adjustedDow === 0,
		});

		curDate.setDate(curDate.getDate() + 1);
	}
	if (currentMonthDays.length > 0 && monthsData.length > 0) {
		monthsData[monthsData.length - 1].days = currentMonthDays;
	}

	// ── Calculate dimensions ──
	const numMonths = monthsData.length;

	// Calculate total height first (needed for aspect ratio)
	const r1H = L.yearH;
	const r2H = L.monthNameH;
	const r3H = 31 * L.verRowH + L.monthBottomPad;
	const ganttHeaderH = L.dayLabelH + L.dayNumH;
	const ganttRowH = L.cellH;
	const r4H = ganttHeaderH + emptyRows * ganttRowH;
	const r5H = L.boxNameH;
	const boxRows = 6; // max weeks in a month
	const r6H = L.boxHeaderH + boxRows * L.boxCellH;
	const totalH = r1H + r2H + r3H + r4H + r5H + r6H;

	// Dynamic month column width
	const MARGIN_MM = 7;
	const copies = currentPaper.copies || 1;
	const copyH = currentPaper.h / copies;
	const colCountForWidth = (currentPaper.w !== null && maxMonthsPerPage > 0) ? maxMonthsPerPage : numMonths;
	let mW;

	if (currentPaper.w === null) {
		// Roll paper: width driven by minimum cell size (mm)
		const printH_mm = copyH - 2 * MARGIN_MM;
		const minCellMm = copies === 1 ? 4 : copies === 2 ? 2.7 : 1.7;
		mW = minCellMm * 31 * totalH / printH_mm;
	} else {
		// Fixed paper (A4/A3): width driven by aspect ratio
		const printAspect = (currentPaper.w - 2 * MARGIN_MM) / (copyH - 2 * MARGIN_MM);
		const targetTotalW = totalH * printAspect;
		mW = Math.max(80, (targetTotalW - L.spacerW) / colCountForWidth);
	}

	// 914mm single: format-specific font/line overrides
	const is914s = (currentPaper.w === null && copies === 1);
	const F = {
		verMonth: is914s ? 16 : 20,       // vertical calendar month name
		ganttDay: is914s ? 2 : 3,          // Gantt day-of-week letters
		ganttNum: is914s ? 1.8 : 2.5,      // Gantt day numbers
		ganttWk: is914s ? 1.8 : 2.5,      // Gantt week numbers
		boxMonth: is914s ? 12 : 15,        // box calendar month name
		boxDow: is914s ? 6 : 8,          // box day-of-week headers
		boxDay: is914s ? 5.5 : 7,        // box day numbers
		boxWk: is914s ? 3 : 4,          // box week numbers
		yearBorderW: is914s ? 0.5 : L.yearBorderW,
	};

	// Total width — use full page capacity so first page fills completely
	const totalContentW = L.spacerW + colCountForWidth * mW;

	// ── Create SVG ──
	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('viewBox', `0 0 ${totalContentW} ${totalH}`);
	svg.setAttribute('xmlns', SVG_NS);
	svg.setAttribute('width', totalContentW);
	svg.setAttribute('height', totalH);
	svg.style.overflow = 'visible';

	// Embedded style for exported SVG
	const styleEl = svgEl('style', {}, svg);
	styleEl.textContent = `
		text { font-family: ${L.fontFamily}; fill: ${COLORS.ink}; }
		.red { fill: ${COLORS.red}; }
		.ink-light { fill: ${COLORS.inkLight}; }
		.year { fill: #999999; }
	`;

	// ── Section Y offsets ──
	const yYear = 0;
	const yMonth = r1H;
	const yVer = r1H + r2H;
	const yGantt = r1H + r2H + r3H;
	const yBoxName = r1H + r2H + r3H + r4H;
	const yBox = r1H + r2H + r3H + r4H + r5H;

	// Track seen weeks for week number labels
	const seenWeeks = new Set();

	// ── Batch path collectors (P3 optimization) ──
	let pathVerGray = '';   // vertical calendar thin gray horizontals (0.25pt cellLine)
	let pathVerWeek = '';   // vertical calendar week separators (weekLineW ink)
	let pathGanttGray = ''; // Gantt cell borders h+v (0.15pt cellLine)
	let pathGanttWeek = ''; // Gantt week separator verticals (weekLineW ink)

	// ── Render each month column ──
	let xCursor = L.spacerW;

	for (let mi = 0; mi < numMonths; mi++) {
		const m = monthsData[mi];
		const numDays = m.days.length;
		const cellW = mW / numDays; // each day cell width within equal-width column
		const isYear = mi > 0
			? monthsData[mi - 1].year !== m.year
			: (startOffset === 0 || new Date(now.getFullYear(), now.getMonth() + startOffset - 1, 1).getFullYear() !== parseInt(m.year));
		const isQuarter = [1, 4, 7, 10].includes(m.monthNum);

		// ── Month left border ──
		let borderW = L.monthBorderW;
		let borderColor = COLORS.cellLine; // month = gray
		if (isYear) { borderW = F.yearBorderW; borderColor = COLORS.ink; }
		else if (isQuarter) { borderW = L.quarterBorderW; borderColor = COLORS.ink; }

		svgEl('line', {
			x1: xCursor, y1: 0, x2: xCursor, y2: totalH,
			'stroke-width': borderW, stroke: borderColor,
		}, svg);

		// ── R1: Year label ──
		if (isYear) {
			svgEl('text', {
				x: xCursor + 10, y: yYear + r1H - 2,
				'font-size': '20', 'font-weight': '200',
				'letter-spacing': '-0.03em', class: 'year',
			}, svg).textContent = m.year;
		}

		// ── R2: Month name ──
		svgEl('text', {
			x: xCursor + 10, y: yMonth + r2H - 10,
			'font-size': F.verMonth, 'font-weight': '200',
			'letter-spacing': '-0.025em',
		}, svg).textContent = m.name;

		// ── R3: Vertical calendar (31 rows) ──
		if (!hideDays) {
			for (let di = 0; di < 31; di++) {
				const rowY = yVer + di * L.verRowH;
				const dayData = m.days[di];

				if (dayData) {
					const textClass = dayData.isWeekend ? 'red' : '';

					// Day number
					svgEl('text', {
						x: xCursor + 6, y: rowY + L.verRowH - 2,
						'font-size': '9',
						class: textClass,
					}, svg).textContent = dayData.day;

					// Day of week
					svgEl('text', {
						x: xCursor + 22, y: rowY + L.verRowH - 3,
						'font-size': '5.5', 'letter-spacing': '0.05em',
						class: textClass,
					}, svg).textContent = WEEK_DAYS_BASE[dayData.rawDow];

					// Bottom border → batch path
					const by = rowY + L.verRowH;
					pathVerGray += `M${xCursor} ${by}H${xCursor + mW}`;

					// First day of month — top border → batch path
					if (dayData.isFirstOfMonth) {
						pathVerGray += `M${xCursor} ${rowY}H${xCursor + mW}`;
					}

					// Week separator → batch path
					if (dayData.isWeekStart && !dayData.isFirstOfMonth) {
						pathVerWeek += `M${xCursor} ${rowY}H${xCursor + mW}`;
					}

					// Week number
					if (dayData.isWeekStart || dayData.isFirstOfMonth) {
						svgEl('text', {
							x: xCursor + mW - 8, y: rowY + L.verRowH - 3,
							'font-size': '4.5', 'text-anchor': 'end',
							class: 'ink-light',
						}, svg).textContent = dayData.weekNum;
					}

					// Holiday name
					if (dayData.holiday) {
						svgEl('text', {
							x: xCursor + (is914s ? 30 : 36), y: rowY + L.verRowH - 3,
							'font-size': is914s ? '3.5' : '4.5', 'text-anchor': 'start',
						}, svg).textContent = dayData.holiday;
					}
				}
			}
		} // end if (!hideDays) R3

		// ── R4: Gantt horizontal grid ──
		// Gantt row horizontal borders — always visible (even with hideDays)
		{
			const hdStart = hideDays ? yVer : yGantt + ganttHeaderH;
			const hdArea = hideDays ? (r3H + r4H) : (ganttRowH * emptyRows);
			const hdRowH = hdArea / emptyRows;
			for (let ri = 0; ri < emptyRows; ri++) {
				const rowY = hdStart + ri * hdRowH;
				const by = rowY + hdRowH;
				pathGanttGray += `M${xCursor} ${by}H${xCursor + mW}`;
			}
			// Top border when hideDays (close the area under month name)
			if (hideDays) {
				pathGanttGray += `M${xCursor} ${yVer}H${xCursor + mW}`;
			}
		}

		if (!hideDays) {
			// Header: day letters + day numbers
			for (let di = 0; di < numDays; di++) {
				const d = m.days[di];
				const cx = xCursor + di * cellW;
				const textClass = d.isWeekend ? 'red' : '';

				// Day letter (narrow)
				svgEl('text', {
					x: cx + cellW / 2, y: yGantt + L.dayLabelH + 3,
					'font-size': F.ganttDay, 'text-anchor': 'middle',
					'font-stretch': 'condensed', 'letter-spacing': '-0.05em',
					class: textClass,
				}, svg).textContent = WEEK_DAYS_NARROW[d.adjustedDow];

				// Day number
				svgEl('text', {
					x: cx + cellW / 2, y: yGantt + ganttHeaderH - 2,
					'font-size': F.ganttNum, 'text-anchor': 'middle',
					'font-stretch': 'condensed', 'letter-spacing': '-0.05em',
					class: textClass,
				}, svg).textContent = d.day;
			}

			// Gantt grid — vertical cell borders + week separators
			for (let ri = 0; ri < emptyRows; ri++) {
				const rowY = yGantt + ganttHeaderH + ri * ganttRowH;
				const by = rowY + ganttRowH;

				for (let di = 0; di < numDays; di++) {
					const d = m.days[di];
					const cx = xCursor + di * cellW;
					pathGanttGray += `M${cx} ${rowY}V${by}`;
					if (d.isWeekStart && !d.isFirstOfMonth) {
						pathGanttWeek += `M${cx} ${rowY}V${by}`;
					}
				}
			}

			// Week numbers in first Gantt row
			for (let di = 0; di < numDays; di++) {
				const d = m.days[di];
				const wnKey = m.year + '-' + d.weekNum;
				if (d.isWeekStart && !seenWeeks.has(wnKey)) {
					seenWeeks.add(wnKey);
					const cx = xCursor + di * cellW;
					svgEl('text', {
						x: cx + cellW / 2, y: yGantt + ganttHeaderH + ganttRowH - 3,
						'font-size': F.ganttWk, 'text-anchor': 'middle',
						class: 'ink-light',
					}, svg).textContent = d.weekNum;
				}
			}
		} // end if (!hideDays) R4

		// ── R5: Box calendar month name ──
		svgEl('text', {
			x: xCursor + 10, y: yBoxName + r5H - 12,
			'font-size': F.boxMonth, 'font-weight': '300',
			'letter-spacing': '-0.02em',
		}, svg).textContent = m.name;

		// ── R6: Box calendar grid ──
		{
			const boxGridW = mW * 0.85; // use 85% of month column
			const boxCellW = boxGridW / 7;
			const boxLeft = xCursor + 6;

			// Day-of-week headers
			for (let dow = 0; dow < 7; dow++) {
				const hx = boxLeft + dow * boxCellW + boxCellW / 2;
				const rawDow = (dow + wsOffset) % 7;
				const isWE = rawDow === 0 || rawDow === 6;
				svgEl('text', {
					x: hx, y: yBox + L.boxHeaderH - 2,
					'font-size': F.boxDow, 'text-anchor': 'middle',
					'font-weight': '500',
					class: isWE ? 'red' : '',
				}, svg).textContent = WEEK_DAYS[dow].substring(0, 2);
			}

			// Fill days into grid
			const firstDayDow = (m.days[0].rawDow - wsOffset + 7) % 7;
			for (let di = 0; di < numDays; di++) {
				const d = m.days[di];
				const gridPos = firstDayDow + di;
				const row = Math.floor(gridPos / 7);
				const col = gridPos % 7;
				const dx = boxLeft + col * boxCellW + boxCellW / 2;
				const dy = yBox + L.boxHeaderH + row * L.boxCellH + L.boxCellH - 2;

				svgEl('text', {
					x: dx, y: dy,
					'font-size': F.boxDay, 'text-anchor': 'middle',
					class: d.isWeekend ? 'red' : '',
				}, svg).textContent = d.day;
			}

			// Week numbers on right side
			const seenBoxWeeks = new Set();
			for (let di = 0; di < numDays; di++) {
				const d = m.days[di];
				const gridPos = firstDayDow + di;
				const row = Math.floor(gridPos / 7);
				if (!seenBoxWeeks.has(row)) {
					seenBoxWeeks.add(row);
					const wnX = boxLeft + 7 * boxCellW + 2;
					const wnY = yBox + L.boxHeaderH + row * L.boxCellH + L.boxCellH - 3;
					svgEl('text', {
						x: wnX, y: wnY,
						'font-size': F.boxWk, 'text-anchor': 'start',
						class: 'ink-light',
					}, svg).textContent = d.weekNum;
				}
			}
		}

		xCursor += mW;
	}

	// ── Emit batched path elements (P3) ──
	if (pathVerGray) svgEl('path', {
		d: pathVerGray, fill: 'none', 'stroke-width': '0.25', stroke: COLORS.cellLine,
	}, svg);
	if (pathVerWeek) svgEl('path', {
		d: pathVerWeek, fill: 'none', 'stroke-width': L.weekLineW, stroke: COLORS.ink,
	}, svg);
	if (pathGanttGray) svgEl('path', {
		d: pathGanttGray, fill: 'none', 'stroke-width': '0.15', stroke: COLORS.cellLine,
	}, svg);
	if (pathGanttWeek) svgEl('path', {
		d: pathGanttWeek, fill: 'none', 'stroke-width': L.weekLineW, stroke: COLORS.ink,
	}, svg);

	// ── Right border ──
	svgEl('line', {
		x1: xCursor, y1: 0, x2: xCursor, y2: totalH,
		'stroke-width': '0.75', stroke: COLORS.ink,
	}, svg);



	// Store dimensions on SVG for viewport calculations
	svg._calW = totalContentW;
	svg._calH = totalH;

	return svg;
}

// ─── Duration helpers ───
let yearsMode = false; // legacy, kept for URL compat
let hideDays = false;

function _syncDialsFromTotal(totalMonths) {
	const yr = Math.floor(totalMonths / 12);
	const mo = totalMonths % 12;
	const yrEl = document.getElementById('tb-val-yr');
	const moEl = document.getElementById('tb-val-mo');
	if (yrEl) yrEl.textContent = yr;
	if (moEl) moEl.textContent = mo;
	document.getElementById('months-input').value = totalMonths;
}

function _totalFromDials() {
	const yr = parseInt(document.getElementById('tb-val-yr').textContent) || 0;
	const mo = parseInt(document.getElementById('tb-val-mo').textContent) || 0;
	return yr * 12 + mo;
}

// (toggleMonthsYears removed — was no-op after dual-dial rewrite)

// ─── Page building ───
let _cachedPages = [];
let _cachedRollW = 0;
function buildPages(totalMonths, emptyRows, weekStart) {
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	const clampedRows = Math.max(6, Math.min(12, rows));
	const mpp = (currentPaper.w !== null && rows >= 12) ? 8 : (currentPaper.w !== null ? 7 : 999);
	const totalM = Math.max(1, Math.min(240, totalMonths));
	const numPages = Math.max(1, Math.ceil(totalM / mpp));

	const cal = document.getElementById('calendar');
	cal.innerHTML = '';

	for (let p = 0; p < numPages; p++) {
		const offset = p * mpp;
		const count = Math.min(mpp, totalM - offset);
		const svg = generateCalendarSVG(count, clampedRows, weekStart, offset, mpp);
		svg.classList.add('cal-page');
		svg.dataset.page = p;
		cal.appendChild(svg);

		// Duplicate SVG for copies (e.g. 914x2)
		const copies = currentPaper.copies || 1;
		for (let c = 1; c < copies; c++) {
			const clone = svg.cloneNode(true);
			clone.classList.add('cal-page', 'cal-copy');
			clone.dataset.page = p;
			clone.dataset.copy = c;
			cal.appendChild(clone);
		}
	}

	_cachedPages = Array.from(cal.querySelectorAll('.cal-page'));
	_cachedRollW = 0; // invalidate roll width cache
	totalPages = numPages;
	autoFitViewport();
}

// ─── Init ───
function init() {
	const params = new URLSearchParams(window.location.search);
	let months = parseInt(params.get('l')) || 12;
	let emptyRows = parseInt(params.get('g')) || 10;
	let weekStart = params.get('w') || 'mon';
	yearsMode = params.get('u') === 'y';
	hideDays = params.get('d') === '1';

	if (emptyRows < 5 || emptyRows > 15) emptyRows = 10;
	if (weekStart !== 'sun') weekStart = 'mon';

	const monthsInput = document.getElementById('months-input');
	const rowsSlider = document.getElementById('rows-slider');
	const rowsValue = document.getElementById('rows-value');
	const weekBtn = document.getElementById('week-start-btn');

	const totalMonths = yearsMode ? months * 12 : months;
	if (monthsInput) monthsInput.value = totalMonths;
	_syncDialsFromTotal(totalMonths);

	if (rowsSlider) rowsSlider.value = emptyRows;
	if (rowsValue) rowsValue.textContent = emptyRows;
	if (weekBtn) {
		weekBtn.textContent = weekStart === 'mon' ? 'ПН' : 'ВС';
		weekBtn.style.color = weekStart === 'mon' ? '' : '#C41E3A';
	}

	buildPages(totalMonths, emptyRows, weekStart);
	// Cache static UI elements for repeated use
	_ui.sizeChips = Array.from(document.querySelectorAll('.tb-btn[data-size], .pm-item[data-size]'));
	_ui.rowsChips = Array.from(document.querySelectorAll('.rows-chip[data-rows], .mob-chip-opt[data-rows]'));
	_ui.mobSizeChips = Array.from(document.querySelectorAll('.mob-chip-opt[data-size]'));
	// Highlight default paper chip
	_ui.sizeChips.forEach(b => {
		b.classList.toggle('active', b.dataset.size === currentPaperKey);
	});
	_syncMobileUI();
}

function updateCalendar() {
	const totalMonths = parseInt(document.getElementById('months-input').value) || 2;
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	const weekBtn = document.getElementById('week-start-btn');
	const weekStart = (weekBtn && weekBtn.textContent === 'ПН') ? 'mon' : 'sun';
	const url = new URL(window.location);
	url.searchParams.set('l', totalMonths);
	url.searchParams.set('g', rows);
	url.searchParams.set('w', weekStart);
	url.searchParams.delete('u');
	if (hideDays) url.searchParams.set('d', '1'); else url.searchParams.delete('d');
	window.history.replaceState({}, '', url);

	buildPages(totalMonths, rows, weekStart);
}

function toggleRowsSlider() {
	const slider = document.getElementById('rows-slider');
	slider.style.display = slider.style.display === 'none' ? '' : 'none';
}

let _rowsTimer;
function onRowsSlider(val) {
	document.getElementById('rows-value').textContent = val;
	// Sync mobile
	const mobRows = document.getElementById('mob-rows');
	if (mobRows) mobRows.textContent = val;
	// Highlight active rows chips (desktop + mobile)
	_ui.rowsChips.forEach(b => {
		b.classList.toggle('active', parseInt(b.dataset.rows) === parseInt(val));
	});
	clearTimeout(_rowsTimer);
	_rowsTimer = setTimeout(updateCalendar, 80);
}

function setRows(val) {
	document.getElementById('rows-slider').value = val;
	document.getElementById('rows-value').textContent = val;
	const mobRows = document.getElementById('mob-rows');
	if (mobRows) mobRows.textContent = val;
	// Highlight chips (desktop + mobile)
	_ui.rowsChips.forEach(b => {
		b.classList.toggle('active', parseInt(b.dataset.rows) === val);
	});
	clearTimeout(_rowsTimer);
	_rowsTimer = setTimeout(updateCalendar, 80);
}

// ─── Viewport state ───
const MM_PX = 96 / 25.4;
const RULER_W = 20;

const viewport = {
	left: 10 * MM_PX,
	top: 10 * MM_PX,
	zoom: 1,
};

const PAPER_SIZES = {
	a4: { w: 297, h: 210 },
	a3: { w: 420, h: 297 },
	'914mm': { w: null, h: 914 },
	'914x2': { w: null, h: 914, copies: 2 },
	'914x4': { w: null, h: 914, copies: 4, copyH: 200 },
};
let currentPaper = PAPER_SIZES.a4;
let currentPaperKey = 'a4';
let totalPages = 1;
let calendarScale = 1;

// ─── Cached UI element references (fix: avoid repeated querySelectorAll) ───
const _ui = {
	sizeChips: [],    // .tb-btn[data-size] + .pm-item[data-size]
	rowsChips: [],    // .rows-chip[data-rows] + .mob-chip-opt[data-rows]
	mobSizeChips: [], // .mob-chip-opt[data-size]
};

// ─── Cached DOM pools ───
const _paperPool = [];
const _guidePool = [];

function _getPooledDiv(pool, index, className, parent) {
	if (index < pool.length) {
		pool[index].style.display = '';
		return pool[index];
	}
	const el = document.createElement('div');
	el.className = className;
	parent.appendChild(el);
	pool.push(el);
	return el;
}

function _hidePoolFrom(pool, startIndex) {
	for (let i = startIndex; i < pool.length; i++) {
		pool[i].style.display = 'none';
	}
}

function updatePageInfo() {
	const el = document.getElementById('page-info');
	const totalM = parseInt(document.getElementById('months-input').value) || 12;
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;

	// Precompute pages for sheet formats
	function _pagesFor(paper) {
		const mpp = (paper.w !== null && rows >= 12) ? 8 : (paper.w !== null ? 7 : 999);
		return Math.max(1, Math.ceil(totalM / mpp));
	}

	// Precompute roll length from SVG intrinsic width
	function _rollLen(paper) {
		const firstPage = document.querySelector('#calendar .cal-page');
		if (!firstPage) return '';
		const svgW = firstPage._calW || parseFloat(firstPage.getAttribute('width')) || 800;
		const svgH = firstPage._calH || parseFloat(firstPage.getAttribute('height')) || 600;
		const MARGIN_MM = 7;
		const copies = paper.copies || 1;
		const copyH = paper.h / copies;
		const printH = copyH - 2 * MARGIN_MM;
		const scale = (printH * MM_PX) / svgH;
		const paperW_mm = svgW * scale / MM_PX + 2 * MARGIN_MM;
		return (paperW_mm / 1000).toFixed(1) + ' m';
	}

	// Build tooltip per button
	_ui.sizeChips.forEach(b => {
		const key = b.dataset.size;
		const paper = PAPER_SIZES[key];
		if (!paper) return;
		let tip = '';
		if (paper.w !== null) {
			const p = _pagesFor(paper);
			tip = p > 1 ? p + ' стр.' : '1 стр.';
		} else {
			tip = _rollLen(paper);
		}
		b.setAttribute('data-tooltip', tip);
	});

	// Keep hidden span for mobile sync
	if (el) {
		const paper = currentPaper;
		if (paper.w === null) el.textContent = _rollLen(paper);
		else if (totalPages > 1) el.textContent = totalPages + ' pages';
		else el.textContent = '';
	}
}

function setPaperSize(key) {
	currentPaper = PAPER_SIZES[key] || PAPER_SIZES.a4;
	currentPaperKey = key;
	// Highlight desktop top-bar + dropdown
	_ui.sizeChips.forEach(b => {
		b.classList.toggle('active', b.dataset.size === key);
	});
	// Sync mobile UI
	const mobFmt = document.getElementById('mob-format');
	if (mobFmt) {
		const labels = { a4: 'A4', a3: 'A3', '914mm': '914', '914x2': '914×2', '914x4': '914×4' };
		mobFmt.textContent = labels[key] || key;
	}
	_ui.mobSizeChips.forEach(b => {
		b.classList.toggle('active', b.dataset.size === key);
	});
	updateCalendar();
}

function togglePrintMenu() {
	const menu = document.getElementById('print-menu');
	const isOpen = menu.style.display !== 'none';
	menu.style.display = isOpen ? 'none' : '';
	if (!isOpen) {
		setTimeout(() => {
			document.addEventListener('click', function closePM(e) {
				if (!e.target.closest('.print-group')) {
					menu.style.display = 'none';
					document.removeEventListener('click', closePM);
				}
			});
		}, 0);
	}
}

// ─── Viewport ───
function autoFitViewport() {
	const cal = document.getElementById('calendar');
	const firstPage = cal.querySelector('.cal-page');
	if (!firstPage) return;

	// SVG has intrinsic dimensions via viewBox
	const svgW = firstPage._calW || parseFloat(firstPage.getAttribute('width')) || 800;
	const svgH = firstPage._calH || parseFloat(firstPage.getAttribute('height')) || 600;

	// 1) calendarScale: fit SVG content into printable area
	const MARGIN_MM = 7;
	const copies = currentPaper.copies || 1;
	const copyH = currentPaper.h / copies;
	const printH = copyH - 2 * MARGIN_MM;
	const printW = currentPaper.w !== null ? currentPaper.w - 2 * MARGIN_MM : Infinity;

	// Scale to fit height (primary constraint)
	const scaleH = (printH * MM_PX) / svgH;
	const scaleW = currentPaper.w !== null ? (printW * MM_PX) / svgW : Infinity;
	calendarScale = Math.min(scaleH, scaleW);

	// 2) viewport.zoom: fit the paper on screen
	const isMobile = window.innerWidth < 768;
	const screenMargin = 10 * MM_PX;
	const rulerGap = isMobile ? 0 : RULER_W + 3 * MM_PX;
	const availableH = window.innerHeight - rulerGap;
	const scaleScreen = (availableH - screenMargin) / (currentPaper.h * MM_PX);
	viewport.zoom = Math.min(scaleScreen, 1);

	const paperScreenH = currentPaper.h * viewport.zoom * MM_PX;
	viewport.top = (availableH - paperScreenH) / 2;

	if (currentPaper.w !== null) {
		const paperScreenW = currentPaper.w * viewport.zoom * MM_PX;
		const leftGap = isMobile ? 10 : RULER_W;
		viewport.left = leftGap + (window.innerWidth - leftGap - paperScreenW) / 2;
	} else {
		viewport.left = (isMobile ? 10 : RULER_W) + screenMargin;
	}

	applyViewport();
	updatePageInfo();
}

function applyViewport() {
	const step = viewport.zoom * MM_PX;
	const marginPx = 7 * step;

	const originScreenX = viewport.left;
	const paperTopY = viewport.top;
	let paperW;
	if (currentPaper.w !== null) {
		paperW = currentPaper.w * step;
	} else {
		paperW = window.innerWidth * 2;
	}
	const paperH = currentPaper.h * step;
	const pageGap = 20;

	// Paper sheet
	const paper = document.getElementById('paper-sheet');
	paper.style.left = originScreenX + 'px';
	paper.style.top = paperTopY + 'px';
	paper.style.width = paperW + 'px';
	paper.style.height = paperH + 'px';

	// Extra paper sheets for multi-page
	for (let p = 1; p < totalPages; p++) {
		const extra = _getPooledDiv(_paperPool, p - 1, 'paper-sheet-extra', document.body);
		extra.style.position = 'fixed';
		extra.style.zIndex = '1';
		extra.style.background = '#FDF6E3';
		extra.style.borderRadius = '8px';
		extra.style.boxShadow = '1px 1px 4px rgba(60,40,20,.15), 3px 3px 12px rgba(60,40,20,.1)';
		extra.style.pointerEvents = 'none';
		extra.style.left = (originScreenX + p * (paperW + pageGap)) + 'px';
		extra.style.top = paperTopY + 'px';
		extra.style.width = paperW + 'px';
		extra.style.height = paperH + 'px';
	}
	_hidePoolFrom(_paperPool, Math.max(0, totalPages - 1));

	const paperBottomY = paperTopY + paperH;
	const totalScale = calendarScale * viewport.zoom;

	// Position SVG pages
	const cal = document.getElementById('calendar');
	cal.style.position = 'fixed';

	const pages = _cachedPages;
	const copies = currentPaper.copies || 1;
	const copyH_px = (currentPaper.h / copies) * step;
	pages.forEach((page) => {
		const pageIdx = parseInt(page.dataset.page) || 0;
		const copyIdx = parseInt(page.dataset.copy) || 0;
		page.style.position = 'fixed';
		page.style.left = (originScreenX + marginPx + pageIdx * (paperW + pageGap)) + 'px';
		page.style.top = (paperTopY + marginPx + copyIdx * copyH_px) + 'px';
		page.style.transformOrigin = 'top left';
		page.style.transform = `scale(${totalScale})`;
	});

	// Trim roll paper (cached to avoid layout thrashing on pan/zoom)
	if (currentPaper.w === null) {
		if (!_cachedRollW) {
			const firstPage = _cachedPages[0];
			if (firstPage) {
				void firstPage.offsetHeight;
				_cachedRollW = firstPage.getBoundingClientRect().width / (calendarScale * viewport.zoom);
			}
		}
		if (_cachedRollW) {
			const trimMargin = 20 * step;
			paperW = _cachedRollW * calendarScale * viewport.zoom + 2 * marginPx + trimMargin;
			paper.style.width = paperW + 'px';
		}
	}

	// Guides
	document.getElementById('guide-h').style.top = (paperBottomY - marginPx) + 'px';
	document.getElementById('guide-v').style.left = originScreenX + 'px';
	const guideH = document.getElementById('guide-h-a4');
	guideH.style.top = (paperTopY + marginPx) + 'px';

	const guideVA4 = document.getElementById('guide-v-a4');
	guideVA4.style.display = 'none';

	let guideIdx = 0;
	for (let p = 0; p < totalPages; p++) {
		const pageLeft = originScreenX + p * (paperW + pageGap);
		const gL = _getPooledDiv(_guidePool, guideIdx++, 'guide guide-v guide-page-v', document.body);
		gL.style.left = (pageLeft + marginPx) + 'px';

		if (currentPaper.w !== null) {
			const gR = _getPooledDiv(_guidePool, guideIdx++, 'guide guide-v guide-page-v', document.body);
			gR.style.left = (pageLeft + paperW - marginPx) + 'px';
		}
	}
	_hidePoolFrom(_guidePool, guideIdx);

	// Hide margin guides
	document.getElementById('guide-margin-bottom').style.display = 'none';
	document.getElementById('guide-margin-top').style.display = 'none';
	document.getElementById('guide-margin-left').style.display = 'none';
	document.getElementById('guide-margin-right').style.display = 'none';

	// Gantt panel position
	const designPanel = document.getElementById('gantt-panel');
	if (designPanel && !designPanel._dragged) {
		const firstPage = document.querySelector('#calendar .cal-page');
		if (firstPage) {
			const pageRect = firstPage.getBoundingClientRect();
			const panelW = designPanel.offsetWidth;
			const panelH = designPanel.offsetHeight;
			designPanel.style.left = (pageRect.left - panelW - 6) + 'px';
			const midY = paperTopY + (paperBottomY - paperTopY) * 0.75 - panelH / 2;
			designPanel.style.top = midY + 'px';
		}
	}

	drawRulers();
}

// ─── Rulers ───
let _rulerLeft, _rulerBottom;
function drawRulers() {
	const tickColor = '#8B7D6B';
	const textColor = '#6B5D4B';
	const bgColor = '#F5ECD7';
	const step = viewport.zoom * MM_PX;

	if (!_rulerLeft) _rulerLeft = document.getElementById('ruler-left');
	if (!_rulerBottom) _rulerBottom = document.getElementById('ruler-bottom');

	const cmPx = step * 10;
	const largeMode = cmPx < 8;
	const tickStep = largeMode ? 100 : 1;
	const majorEvery = largeMode ? 1000 : 10;
	const midEvery = largeMode ? 100 : 5;

	const dpr = window.devicePixelRatio || 1;

	// Left ruler (vertical)
	const lCanvas = _rulerLeft;
	const lh = window.innerHeight;
	lCanvas.width = RULER_W * dpr;
	lCanvas.height = lh * dpr;
	lCanvas.style.width = RULER_W + 'px';
	lCanvas.style.height = lh + 'px';
	const lctx = lCanvas.getContext('2d');
	lctx.scale(dpr, dpr);
	lctx.fillStyle = bgColor;
	lctx.fillRect(0, 0, RULER_W, lh);

	const marginStep = 7 * step;
	const paperH = currentPaper.h * step;
	const zeroY = viewport.top + paperH - marginStep;
	const mmTopV = Math.ceil((zeroY) / step);
	const mmBotV = Math.floor((zeroY - lh) / step);
	const mmStartV = Math.floor(mmBotV / tickStep) * tickStep;
	const mmEndV = Math.ceil(mmTopV / tickStep) * tickStep;
	for (let mm = mmStartV; mm <= mmEndV; mm += tickStep) {
		const y = zeroY - mm * step;
		if (y < 0 || y > lh) continue;
		let tickLen;
		if (mm % majorEvery === 0) tickLen = RULER_W;
		else if (mm % midEvery === 0) tickLen = RULER_W * 0.6;
		else tickLen = RULER_W * 0.3;
		lctx.strokeStyle = tickColor;
		lctx.lineWidth = (mm % majorEvery === 0) ? 0.8 : 0.5;
		lctx.beginPath();
		lctx.moveTo(RULER_W - tickLen, y);
		lctx.lineTo(RULER_W, y);
		lctx.stroke();
		if (mm % majorEvery === 0) {
			lctx.fillStyle = textColor;
			lctx.font = '8px IBM Plex Sans, sans-serif';
			lctx.textAlign = 'center';
			const label = largeMode ? (mm / 1000) + 'm' : (mm / 10);
			lctx.fillText(label, 8, y - 2);
		} else if (largeMode && mm % 100 === 0) {
			lctx.fillStyle = textColor;
			lctx.font = '7px IBM Plex Sans, sans-serif';
			lctx.textAlign = 'center';
			lctx.globalAlpha = 0.6;
			lctx.fillText((mm / 10), 8, y - 2);
			lctx.globalAlpha = 1;
		}
	}

	// Bottom ruler (horizontal)
	const bCanvas = _rulerBottom;
	const bw = window.innerWidth;
	bCanvas.width = bw * dpr;
	bCanvas.height = RULER_W * dpr;
	bCanvas.style.width = bw + 'px';
	bCanvas.style.height = RULER_W + 'px';
	const bctx = bCanvas.getContext('2d');
	bctx.scale(dpr, dpr);
	bctx.fillStyle = bgColor;
	bctx.fillRect(0, 0, bw, RULER_W);

	const firstPage = _cachedPages[0];
	const zeroX = firstPage ? firstPage.getBoundingClientRect().left : viewport.left;
	const mmLeft = Math.floor(-zeroX / step);
	const mmRight = Math.ceil((bw - zeroX) / step);
	const mmStartH = Math.floor(mmLeft / tickStep) * tickStep;
	const mmEndH = Math.ceil(mmRight / tickStep) * tickStep;
	for (let mm = mmStartH; mm <= mmEndH; mm += tickStep) {
		const x = zeroX + mm * step;
		if (x < 0 || x > bw) continue;
		let tickLen;
		if (mm % majorEvery === 0) tickLen = RULER_W;
		else if (mm % midEvery === 0) tickLen = RULER_W * 0.6;
		else tickLen = RULER_W * 0.3;
		bctx.strokeStyle = tickColor;
		bctx.lineWidth = (mm % majorEvery === 0) ? 0.8 : 0.5;
		bctx.beginPath();
		bctx.moveTo(x, 0);
		bctx.lineTo(x, tickLen);
		bctx.stroke();
		if (mm % majorEvery === 0) {
			bctx.fillStyle = textColor;
			bctx.font = '8px IBM Plex Sans, sans-serif';
			bctx.textAlign = 'center';
			const label = largeMode ? (mm / 1000) + 'm' : (mm / 10);
			bctx.fillText(label, x, RULER_W - 4);
		} else if (largeMode && mm % 100 === 0) {
			bctx.fillStyle = textColor;
			bctx.font = '7px IBM Plex Sans, sans-serif';
			bctx.textAlign = 'center';
			bctx.globalAlpha = 0.6;
			bctx.fillText((mm / 10), x, RULER_W - 4);
			bctx.globalAlpha = 1;
		}
	}
}

// ─── Hide days toggle ───
function toggleHideDays() {
	hideDays = !hideDays;
	const btn = document.getElementById('hide-days-btn');
	if (btn) btn.classList.toggle('active', hideDays);
	const mobBtn = document.getElementById('mob-hide-days-btn');
	if (mobBtn) mobBtn.classList.toggle('active', hideDays);
	updateCalendar();
}

function openEntryModal() {
	const dateEl = document.getElementById('entry-date');
	const textEl = document.getElementById('entry-text');
	dateEl.value = '';
	textEl.value = '';
	document.getElementById('entry-yearly').checked = true;
	document.getElementById('entry-overlay').style.display = 'flex';
	setTimeout(() => textEl.focus(), 50);
	dateEl.oninput = () => {
		let v = dateEl.value;
		if (/^\d{2}$/.test(v)) { dateEl.value = v + '.'; }
	};
	textEl.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); dateEl.focus(); } };
	dateEl.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomEntry(); } };
}

function closeEntryModal() {
	document.getElementById('entry-overlay').style.display = 'none';
}

function addCustomEntry() {
	const text = document.getElementById('entry-text').value.trim();
	const dateStr = document.getElementById('entry-date').value.trim();
	const yearly = document.getElementById('entry-yearly').checked;
	if (!text) { document.getElementById('entry-text').focus(); return; }
	let match = dateStr.match(/^(\d{1,2})[.,\/;\-\s\\](\d{1,2})$/);
	if (!match && /^\d{3,4}$/.test(dateStr)) {
		const d = dateStr.slice(0, 2);
		const m = dateStr.length === 4 ? dateStr.slice(2) : dateStr.slice(2);
		match = [null, d, m];
	}
	if (!match) { document.getElementById('entry-date').focus(); return; }
	const day = parseInt(match[1], 10);
	const month = parseInt(match[2], 10);
	if (month < 1 || month > 12 || day < 1 || day > 31) { document.getElementById('entry-date').focus(); return; }
	const now = new Date();
	customEntries.push({ day, month, year: now.getFullYear(), text, yearly });
	for (const k of Object.keys(_holidayCache)) delete _holidayCache[k];
	closeEntryModal();
	updateCalendar();
}

// ─── Helpers ───
function toggleWeekStart() {
	const btn = document.getElementById('week-start-btn');
	const isSun = btn.textContent === 'ВС';
	btn.textContent = isSun ? 'ПН' : 'ВС';
	btn.style.color = isSun ? '' : '#C41E3A';
	// Sync mobile
	const monBtn = document.getElementById('mob-week-mon');
	const sunBtn = document.getElementById('mob-week-sun');
	if (monBtn && sunBtn) {
		monBtn.classList.toggle('active', isSun);
		sunBtn.classList.toggle('active', !isSun);
	}
	updateCalendar();
}

// ─── Mobile toolbar functions ───
function toggleMobSheet() {
	const sheet = document.getElementById('mob-sheet');
	const overlay = document.getElementById('mob-overlay');
	if (!sheet) return;
	const isOpen = sheet.classList.contains('open');
	sheet.classList.toggle('open', !isOpen);
	overlay.classList.toggle('open', !isOpen);
	// Close download popup if open
	const dlPopup = document.getElementById('mob-dl-popup');
	if (dlPopup) dlPopup.style.display = 'none';
}

function toggleMobDL() {
	const popup = document.getElementById('mob-dl-popup');
	if (!popup) return;
	popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
}

function mobSetPaper(key) {
	setPaperSize(key);
	setTimeout(_updateMobRollLen, 200);
}

// ─── Scroll wheels ───
let _wheelYr = 1, _wheelMo = 0;
let _wheelTimer;

function _initMobWheels() {
	const yrEl = document.getElementById('mob-wheel-yr');
	const moEl = document.getElementById('mob-wheel-mo');
	if (!yrEl || !moEl) return;

	_buildWheel(yrEl, 0, 20, _wheelYr);
	_buildWheel(moEl, 0, 11, _wheelMo);

	// Scroll to initial values after layout
	requestAnimationFrame(() => {
		_scrollWheelTo(yrEl, _wheelYr, false);
		_scrollWheelTo(moEl, _wheelMo, false);
	});

	// Scroll listeners (remove old first)
	yrEl.onscroll = () => _onWheelScroll(yrEl, 'yr');
	moEl.onscroll = () => _onWheelScroll(moEl, 'mo');
}

function _buildWheel(el, min, max, activeVal) {
	el.innerHTML = '';
	// Top pad — so first item can reach center
	const padTop = document.createElement('div');
	padTop.className = 'mob-wheel-pad';
	el.appendChild(padTop);

	for (let i = min; i <= max; i++) {
		const d = document.createElement('div');
		d.className = 'mob-wheel-item' + (i === activeVal ? ' active' : '');
		d.textContent = i;
		d.dataset.v = i;
		d.addEventListener('click', () => _scrollWheelTo(el, i));
		el.appendChild(d);
	}

	// Bottom pad — so last item can reach center
	const padBot = document.createElement('div');
	padBot.className = 'mob-wheel-pad';
	el.appendChild(padBot);
}

function _scrollWheelTo(el, val, smooth = true) {
	const items = el.querySelectorAll('.mob-wheel-item');
	const target = Array.from(items).find(d => parseInt(d.dataset.v) === val);
	if (!target) return;
	// Item offsetTop is relative to el (position: relative), center in 120px viewport = 40px from top
	el.scrollTo({ top: target.offsetTop - 40, behavior: smooth ? 'smooth' : 'auto' });
}

function _onWheelScroll(el, type) {
	const items = el.querySelectorAll('.mob-wheel-item');
	// Center of 120px viewport
	const viewCenter = el.scrollTop + 60;
	let closest = null, closestDist = Infinity;
	items.forEach(d => {
		// Item center = offsetTop + 20 (half of 40px), already relative to el
		const itemCenter = d.offsetTop + 20;
		const dist = Math.abs(itemCenter - viewCenter);
		if (dist < closestDist) { closestDist = dist; closest = d; }
	});
	if (!closest) return;
	const val = parseInt(closest.dataset.v);

	// Highlight active
	items.forEach(d => d.classList.toggle('active', d === closest));

	if (type === 'yr') _wheelYr = val;
	else _wheelMo = val;

	// Debounce update
	clearTimeout(_wheelTimer);
	_wheelTimer = setTimeout(_applyWheelDuration, 150);
}

function _applyWheelDuration() {
	const totalMonths = _wheelYr * 12 + _wheelMo;
	if (totalMonths < 1) return; // min 1 month
	document.getElementById('months-input').value = totalMonths;
	_syncDialsFromTotal(totalMonths);
	_updateMobMonthsLabel(totalMonths);
	updateCalendar();
	setTimeout(_updateMobRollLen, 200);
}

// ─── Rows chips ───
function mobSetRows(val) {
	document.getElementById('rows-slider').value = val;
	document.getElementById('rows-value').textContent = val;
	document.getElementById('mob-rows').textContent = val;
	// Highlight chips (desktop + mobile)
	_ui.rowsChips.forEach(b => {
		b.classList.toggle('active', parseInt(b.dataset.rows) === val);
	});
	clearTimeout(_rowsTimer);
	_rowsTimer = setTimeout(updateCalendar, 80);
}

function mobSetWeek(day) {
	const btn = document.getElementById('week-start-btn');
	if (day === 'mon') {
		btn.textContent = 'Пн';
		btn.style.color = '';
	} else {
		btn.textContent = 'Вс';
		btn.style.color = '#C41E3A';
	}
	document.getElementById('mob-week-mon').classList.toggle('active', day === 'mon');
	document.getElementById('mob-week-sun').classList.toggle('active', day === 'sun');
	updateCalendar();
}

// ─── Roll length display ───
function _updateMobRollLen() {
	const el = document.getElementById('mob-roll-len');
	if (!el) return;
	if (currentPaper.w !== null) {
		el.textContent = '';
		return;
	}
	const firstPage = document.querySelector('#calendar .cal-page');
	if (firstPage) {
		const screenW = firstPage.getBoundingClientRect().width;
		const paperW_mm = screenW / (viewport.zoom * MM_PX) + 20;
		const meters = (paperW_mm / 1000).toFixed(1);
		el.textContent = '· ' + meters + ' m';
	} else {
		el.textContent = '';
	}
}

// ─── Smart toolbar label ───
function _updateMobMonthsLabel(months) {
	const mobMonths = document.getElementById('mob-months');
	const mobLabel = document.getElementById('mob-months-label');
	if (!mobMonths || !mobLabel) return;
	if (months >= 12 && months % 12 === 0) {
		mobMonths.textContent = months / 12;
		mobLabel.textContent = 'г';
	} else {
		mobMonths.textContent = months;
		mobLabel.textContent = 'м';
	}
}

let _wheelsInit = false;
function _syncMobileUI() {
	const months = parseInt(document.getElementById('months-input').value) || 12;
	_updateMobMonthsLabel(months);
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	const mobRows = document.getElementById('mob-rows');
	if (mobRows) mobRows.textContent = rows;
	// Highlight active rows chips (desktop + mobile)
	_ui.rowsChips.forEach(b => {
		b.classList.toggle('active', parseInt(b.dataset.rows) === rows);
	});
	// Set wheel values
	_wheelYr = Math.floor(months / 12);
	_wheelMo = months % 12;
	if (!_wheelsInit) {
		_initMobWheels();
		_wheelsInit = true;
	} else {
		// Just scroll to correct position
		const yrEl = document.getElementById('mob-wheel-yr');
		const moEl = document.getElementById('mob-wheel-mo');
		if (yrEl) _scrollWheelTo(yrEl, _wheelYr, false);
		if (moEl) _scrollWheelTo(moEl, _wheelMo, false);
	}
	setTimeout(_updateMobRollLen, 300);
}

// Helper: DD-MM-YYYY date string
function _exportDate() {
	const d = new Date();
	return pad2(d.getDate()) + '-' + pad2(d.getMonth() + 1) + '-' + d.getFullYear();
}

// Font cache for PDF — fetch once, register on every new doc
const _fontCache = []; // [{id, b64, name, style, weight}]
let _fontsFetched = false;

function _arrayBufferToBase64(buf) {
	const bytes = new Uint8Array(buf);
	const CHUNK = 8192;
	const parts = [];
	for (let i = 0; i < bytes.length; i += CHUNK) {
		parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK)));
	}
	return btoa(parts.join(''));
}

async function _loadPDFFonts(doc) {
	const fontName = 'IBM Plex Sans'; // must match SVG font-family

	// Fetch font files only once
	if (!_fontsFetched) {
		const weights = [
			{ file: 'IBMPlexSans-ExtraLight.ttf', style: 'normal', weight: 200 },
			{ file: 'IBMPlexSans-Light.ttf', style: 'normal', weight: 300 },
			{ file: 'IBMPlexSans-Regular.ttf', style: 'normal', weight: 400 },
			{ file: 'IBMPlexSans-Medium.ttf', style: 'normal', weight: 500 },
		];
		for (const w of weights) {
			try {
				const resp = await fetch('../fonts/IBMPlexSans/' + w.file);
				const buf = await resp.arrayBuffer();
				_fontCache.push({
					id: 'IBMPlexSans-' + w.weight + '.ttf',
					b64: _arrayBufferToBase64(buf),
					name: fontName,
					style: w.style,
					weight: w.weight,
				});
			} catch (e) {
				console.warn('Font load failed:', w.file, e);
			}
		}
		_fontsFetched = true;
	}

	// Register cached fonts on this doc
	for (const f of _fontCache) {
		doc.addFileToVFS(f.id, f.b64);
		doc.addFont(f.id, f.name, f.style, f.weight);
	}
	if (_fontCache.length) doc.setFont(fontName);
}

// ─── Lazy-load PDF libraries ───
let _pdfLibsLoaded = false;
let _pdfLibsLoading = false;

function _loadScript(src) {
	return new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = src;
		s.onload = resolve;
		s.onerror = reject;
		document.head.appendChild(s);
	});
}

async function _ensurePDFLibs() {
	if (_pdfLibsLoaded) return true;
	if (_pdfLibsLoading) {
		// Wait for in-progress load
		while (_pdfLibsLoading) await new Promise(r => setTimeout(r, 50));
		return _pdfLibsLoaded;
	}
	_pdfLibsLoading = true;
	try {
		await _loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
		await _loadScript('https://cdn.jsdelivr.net/npm/svg2pdf.js@2.2.4/dist/svg2pdf.umd.min.js');
		_pdfLibsLoaded = true;
	} catch (e) {
		console.warn('Failed to load PDF libraries:', e);
	}
	_pdfLibsLoading = false;
	return _pdfLibsLoaded;
}

async function printPDF() {
	if (!await _ensurePDFLibs() || typeof jspdf === 'undefined') {
		window.print(); // fallback
		return;
	}

	const copies = currentPaper.copies || 1;
	const months = parseInt(document.getElementById('months-input').value) || 12;
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	const fileName = `wallplan_${currentPaperKey}_${months}mo_${rows}rows_${_exportDate()}.pdf`;

	// Group pages by index
	const pageMap = {};
	_cachedPages.forEach(page => {
		const idx = parseInt(page.dataset.page) || 0;
		if (!pageMap[idx]) pageMap[idx] = [];
		pageMap[idx].push(page);
	});
	const pageIndices = Object.keys(pageMap).map(Number).sort((a, b) => a - b);

	// Determine PDF page size
	const first = _cachedPages[0];
	if (!first) return;
	const calW = first._calW || parseFloat(first.getAttribute('width'));
	const calH = first._calH || parseFloat(first.getAttribute('height'));

	let pdfW, pdfH;
	if (currentPaper.w !== null) {
		pdfW = currentPaper.w;
		pdfH = currentPaper.h;
	} else {
		const MARGIN_MM = 7;
		const copyH = currentPaper.h / copies;
		const printH = copyH - 2 * MARGIN_MM;
		const scale = printH / calH;
		const printW = calW * scale;
		pdfW = printW + 2 * MARGIN_MM;
		pdfH = currentPaper.h;
	}

	const orientation = pdfW > pdfH ? 'landscape' : 'portrait';
	const { jsPDF } = jspdf;
	const doc = new jsPDF({
		orientation,
		unit: 'mm',
		format: [Math.min(pdfW, pdfH), Math.max(pdfW, pdfH)],
	});

	// Load IBM Plex Sans into jsPDF
	await _loadPDFFonts(doc);

	for (let i = 0; i < pageIndices.length; i++) {
		const pi = pageIndices[i];
		const group = pageMap[pi];
		if (i > 0) doc.addPage([Math.min(pdfW, pdfH), Math.max(pdfW, pdfH)], orientation);

		const MARGIN = 7;
		const availW = pdfW - 2 * MARGIN;
		const availH = (pdfH / copies) - 2 * MARGIN;

		for (let c = 0; c < copies; c++) {
			const src = group[c] || group[0];
			const clone = src.cloneNode(true);
			clone.removeAttribute('style');
			clone.removeAttribute('class');
			clone.setAttribute('xmlns', SVG_NS);
			// Temporarily add to DOM for svg2pdf
			clone.style.position = 'absolute';
			clone.style.left = '-9999px';
			document.body.appendChild(clone);

			const yOffset = MARGIN + c * (pdfH / copies);
			await doc.svg(clone, {
				x: MARGIN,
				y: yOffset,
				width: availW,
				height: availH,
			});
			document.body.removeChild(clone);
		}
	}

	doc.save(fileName);
}

// ─── SVG Download ───
function _preparePageSVG(page) {
	const clone = page.cloneNode(true);
	clone.removeAttribute('style');
	clone.removeAttribute('class');
	clone.setAttribute('xmlns', SVG_NS);
	return clone;
}

function _downloadBlob(svgNode, filename) {
	const serializer = new XMLSerializer();
	const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(svgNode);
	const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function downloadSVG() {
	const copies = currentPaper.copies || 1;
	const months = parseInt(document.getElementById('months-input').value) || 12;
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	const baseName = `wallplan_${currentPaperKey}_${months}mo_${rows}rows_${_exportDate()}`;

	// Group pages by page index
	const pageMap = {};
	_cachedPages.forEach(page => {
		const idx = parseInt(page.dataset.page) || 0;
		if (!pageMap[idx]) pageMap[idx] = [];
		pageMap[idx].push(page);
	});

	const pageIndices = Object.keys(pageMap).map(Number).sort((a, b) => a - b);

	for (const pi of pageIndices) {
		const group = pageMap[pi];
		const first = group[0];
		if (!first) continue;

		if (copies <= 1) {
			// Single copy — export page as-is
			const clone = _preparePageSVG(first);
			const suffix = pageIndices.length > 1 ? `_page${pi + 1}` : '';
			_downloadBlob(clone, `${baseName}${suffix}.svg`);
		} else {
			// Multi-copy — combine into one tall SVG
			const calW = first._calW || parseFloat(first.getAttribute('width'));
			const calH = first._calH || parseFloat(first.getAttribute('height'));
			const totalCopyH = calH * copies;

			const wrapper = document.createElementNS(SVG_NS, 'svg');
			wrapper.setAttribute('xmlns', SVG_NS);
			wrapper.setAttribute('viewBox', `0 0 ${calW} ${totalCopyH}`);
			wrapper.setAttribute('width', calW);
			wrapper.setAttribute('height', totalCopyH);

			for (let c = 0; c < copies; c++) {
				const src = group[c] || first; // fallback to first if clone missing
				const clone = _preparePageSVG(src);
				const g = document.createElementNS(SVG_NS, 'g');
				g.setAttribute('transform', `translate(0,${c * calH})`);
				// Move all children into the group
				while (clone.firstChild) g.appendChild(clone.firstChild);
				wrapper.appendChild(g);
			}

			const suffix = pageIndices.length > 1 ? `_page${pi + 1}` : '';
			_downloadBlob(wrapper, `${baseName}${suffix}.svg`);
		}
	}
}

// ─── Custom confirm dialog ───
function confirmAction(message, onYes) {
	const overlay = document.getElementById('confirm-overlay');
	const msg = document.getElementById('confirm-msg');
	const yesBtn = document.getElementById('confirm-yes');
	const cancelBtn = document.getElementById('confirm-cancel');
	msg.textContent = message;
	overlay.style.display = 'flex';

	function close() {
		overlay.style.display = 'none';
		yesBtn.removeEventListener('click', onConfirm);
		cancelBtn.removeEventListener('click', close);
		overlay.removeEventListener('click', onOverlay);
	}
	function onConfirm() { close(); onYes(); }
	function onOverlay(e) { if (e.target === overlay) close(); }

	yesBtn.addEventListener('click', onConfirm);
	cancelBtn.addEventListener('click', close);
	overlay.addEventListener('click', onOverlay);
}

// ─── Init & event handlers ───
document.addEventListener('DOMContentLoaded', () => {
	init();

	// ── Dual dial wheel handlers ──
	const dialYr = document.getElementById('tb-dial-yr');
	const dialMo = document.getElementById('tb-dial-mo');
	const valYr = document.getElementById('tb-val-yr');
	const valMo = document.getElementById('tb-val-mo');
	const hiddenInput = document.getElementById('months-input');
	let _dialTimer;

	function _onDialWheel(e, valEl, min, max) {
		e.preventDefault();
		const step = e.deltaY < 0 ? 1 : -1;
		let cur = parseInt(valEl.textContent) || 0;
		cur = Math.max(min, Math.min(max, cur + step));
		valEl.textContent = cur;
		// Sync total
		const total = Math.max(1, _totalFromDials());
		hiddenInput.value = total;
		clearTimeout(_dialTimer);
		_dialTimer = setTimeout(updateCalendar, 120);
	}

	if (dialYr) {
		dialYr.addEventListener('wheel', (e) => _onDialWheel(e, valYr, 0, 20), { passive: false });
	}
	if (dialMo) {
		dialMo.addEventListener('wheel', (e) => _onDialWheel(e, valMo, 0, 240), { passive: false });
	}

	// Click corner to reset viewport
	document.querySelector('.ruler-corner').addEventListener('click', () => {
		const dp = document.getElementById('gantt-panel');
		if (dp) dp._dragged = false;
		autoFitViewport();
	});

	// Drag to pan
	let isPanning = false, panStartX, panStartY, panStartL, panStartT;
	let _rafId = 0;

	document.addEventListener('mousedown', (e) => {
		if (e.target.closest('.controls') || e.target.closest('.ruler') || e.target.closest('.ruler-corner') || e.target.closest('.confirm-overlay')) return;
		isPanning = true;
		panStartX = e.clientX;
		panStartY = e.clientY;
		panStartL = viewport.left;
		panStartT = viewport.top;
		document.body.style.cursor = 'grabbing';
		e.preventDefault();
	});

	document.addEventListener('mousemove', (e) => {
		if (!isPanning) return;
		viewport.left = panStartL + (e.clientX - panStartX);
		viewport.top = panStartT + (e.clientY - panStartY);
		if (!_rafId) _rafId = requestAnimationFrame(() => { applyViewport(); _rafId = 0; });
	});

	document.addEventListener('mouseup', () => {
		if (isPanning) {
			isPanning = false;
			document.body.style.cursor = '';
			if (_rafId) { cancelAnimationFrame(_rafId); _rafId = 0; }
			applyViewport();
		}
	});

	// Ctrl + wheel to zoom
	document.addEventListener('wheel', (e) => {
		if (!e.ctrlKey) return;
		e.preventDefault();
		const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
		const newZoom = Math.max(0.05, Math.min(10, viewport.zoom * factor));
		const mouseX = e.clientX;
		const mouseY = e.clientY;
		const worldPxX = (mouseX - viewport.left) / viewport.zoom;
		const worldPxY = (mouseY - viewport.top) / viewport.zoom;
		viewport.zoom = newZoom;
		viewport.left = mouseX - worldPxX * newZoom;
		viewport.top = mouseY - worldPxY * newZoom;
		if (!_rafId) _rafId = requestAnimationFrame(() => { applyViewport(); _rafId = 0; });
	}, { passive: false });

	// ─── Touch: pan + pinch-to-zoom ───
	let touchPanning = false, touchStartX, touchStartY, touchStartL, touchStartT;
	let pinching = false, pinchStartDist, pinchStartZoom, pinchCenterX, pinchCenterY;

	function _touchDist(t1, t2) {
		return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
	}

	window.addEventListener('touchstart', (e) => {
		if (e.target.closest('.controls') || e.target.closest('.ruler') || e.target.closest('.ruler-corner') || e.target.closest('.print-menu') || e.target.closest('.mob-bar') || e.target.closest('.mob-sheet') || e.target.closest('.mob-overlay') || e.target.closest('.mob-dl-popup') || e.target.closest('.confirm-overlay')) return;
		if (e.touches.length === 1) {
			touchPanning = true;
			pinching = false;
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			touchStartL = viewport.left;
			touchStartT = viewport.top;
			e.preventDefault();
		} else if (e.touches.length === 2) {
			touchPanning = false;
			pinching = true;
			pinchStartDist = _touchDist(e.touches[0], e.touches[1]);
			pinchStartZoom = viewport.zoom;
			pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
			pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
			e.preventDefault();
		}
	}, { passive: false, capture: true });

	window.addEventListener('touchmove', (e) => {
		if (touchPanning && e.touches.length === 1) {
			viewport.left = touchStartL + (e.touches[0].clientX - touchStartX);
			viewport.top = touchStartT + (e.touches[0].clientY - touchStartY);
			if (!_rafId) _rafId = requestAnimationFrame(() => { applyViewport(); _rafId = 0; });
			e.preventDefault();
		} else if (pinching && e.touches.length === 2) {
			const dist = _touchDist(e.touches[0], e.touches[1]);
			const newZoom = Math.max(0.05, Math.min(10, pinchStartZoom * (dist / pinchStartDist)));
			const worldPxX = (pinchCenterX - viewport.left) / viewport.zoom;
			const worldPxY = (pinchCenterY - viewport.top) / viewport.zoom;
			viewport.zoom = newZoom;
			viewport.left = pinchCenterX - worldPxX * newZoom;
			viewport.top = pinchCenterY - worldPxY * newZoom;
			if (!_rafId) _rafId = requestAnimationFrame(() => { applyViewport(); _rafId = 0; });
			e.preventDefault();
		}
	}, { passive: false, capture: true });

	window.addEventListener('touchend', (e) => {
		if (e.touches.length === 0) {
			if (touchPanning || pinching) {
				if (_rafId) { cancelAnimationFrame(_rafId); _rafId = 0; }
				applyViewport();
			}
			touchPanning = false;
			pinching = false;
		} else if (e.touches.length === 1 && pinching) {
			// Transitioned from pinch to single finger — start pan
			pinching = false;
			touchPanning = true;
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			touchStartL = viewport.left;
			touchStartT = viewport.top;
		}
	});

	// Window resize
	let _resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(_resizeTimer);
		_resizeTimer = setTimeout(applyViewport, 150);
	});

	// Draggable panels
	document.querySelectorAll('.controls').forEach(panel => {
		let isDraggingPanel = false, pStartX, pStartY, pStartL, pStartT;

		panel.addEventListener('mousedown', (e) => {
			const isGantt = panel.id === 'gantt-panel';
			if (!isGantt && (['INPUT', 'BUTTON', 'LABEL', 'SELECT'].includes(e.target.tagName) || e.target.closest('button'))) return;
			if (isGantt && e.target.tagName === 'INPUT') return;
			isDraggingPanel = true;
			if (panel.id === 'gantt-panel') panel._dragged = true;
			if (!panel.style.left) {
				panel.style.left = panel.offsetLeft + 'px';
				panel.style.right = 'auto';
			}
			pStartX = e.clientX;
			pStartY = e.clientY;
			pStartL = panel.offsetLeft;
			pStartT = panel.offsetTop;
			e.stopPropagation();
		});

		document.addEventListener('mousemove', (e) => {
			if (!isDraggingPanel) return;
			panel.style.left = (pStartL + e.clientX - pStartX) + 'px';
			panel.style.top = (pStartT + e.clientY - pStartY) + 'px';
		});

		document.addEventListener('mouseup', () => {
			isDraggingPanel = false;
		});
	});
});
