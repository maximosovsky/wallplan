// Справочники
const MONTHS = [
	'', 'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS_BASE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_DAYS_NARROW_BASE = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];

function getOrderedDays(weekStart) {
	const offset = (weekStart === 'mon') ? 1 : 0;
	const reorder = (arr) => [...arr.slice(offset), ...arr.slice(0, offset)];
	return {
		days: reorder(WEEK_DAYS_BASE),
		narrow: reorder(WEEK_DAYS_NARROW_BASE),
		offset: offset,
	};
}

// US Federal Holidays — динамическое вычисление
function getNthWeekday(year, month, weekday, n) {
	// weekday: 0=Sun, 1=Mon, ... 6=Sat
	// n: 1=first, 2=second, etc.
	const first = new Date(year, month, 1);
	let day = ((weekday - first.getDay()) + 7) % 7 + 1;
	day += (n - 1) * 7;
	return day;
}

function getLastWeekday(year, month, weekday) {
	const last = new Date(year, month + 1, 0); // last day of month
	const lastDate = last.getDate();
	const lastDow = last.getDay();
	let diff = ((lastDow - weekday) + 7) % 7;
	return lastDate - diff;
}

function getHolidays(year) {
	const h = {};
	const add = (m, d, name) => { h[pad2(m) + pad2(d)] = name; };

	// Fixed-date holidays
	add(1, 1, "New Year's Day");
	add(6, 19, 'Juneteenth');
	add(7, 4, 'Independence Day');
	add(11, 11, 'Veterans Day');
	add(12, 25, 'Christmas Day');

	// Floating holidays (weekday 1 = Monday, 4 = Thursday)
	add(1, getNthWeekday(year, 0, 1, 3), 'Martin Luther King Jr. Day');  // 3rd Mon in Jan
	add(2, getNthWeekday(year, 1, 1, 3), "Presidents' Day");             // 3rd Mon in Feb
	add(5, getLastWeekday(year, 4, 1), 'Memorial Day');                 // Last Mon in May
	add(9, getNthWeekday(year, 8, 1, 1), 'Labor Day');                    // 1st Mon in Sep
	add(10, getNthWeekday(year, 9, 1, 2), 'Columbus Day');                // 2nd Mon in Oct
	add(11, getNthWeekday(year, 10, 4, 4), 'Thanksgiving Day');           // 4th Thu in Nov

	return h;
}

// Утилиты для дат
function getUSDayOfWeek(date) {
	// 0=Sun, 1=Mon, ... 6=Sat (US convention)
	return date.getDay();
}

function getLastDayOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getWeekNumber(date) {
	// ISO 8601 week number
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function pad2(n) {
	return String(n).padStart(2, '0');
}

function formatIndex(date) {
	return String(date.getFullYear()).slice(2) + pad2(date.getMonth() + 1);
}

// Генерация ячейки горизонтального календаря
function calHorCel(day = 0, dayName = ' ', addClasses = '') {
	const isEmptyPrefix = (dayName === ' ') ? 'e-' : '';
	const firstClass = (day === 1) ? ' h-f' : '';
	const classes = isEmptyPrefix + 'h' + firstClass + addClasses;
	const displayDay = (dayName === ' ') ? '' : day;
	return `<td class="${classes}"><div>${dayName}</div>${displayDay}</td>`;
}

// Генерация строки вертикального календаря
function calVerRow(day = '&nbsp;', dayName = ' ', addClasses = '', holidayName = '', weekNum = '') {
	const firstClass = (day === 1) ? ' bt' : '';
	const classes = 'vl bb' + firstClass + addClasses;
	const wn = weekNum ? `<span class="vwn">${weekNum}</span>` : '';
	return `<tr><td class="${classes}"><span class="vd">${day}</span> <span class="vw">${dayName}</span></td><td class="${classes} hd">${wn} ${holidayName}</td></tr>`;
}

// Генерация ячейки сетки (box)
function calBoxCel(day, rawDow, dayLast, weekNum, addClasses, dayNames, weekStartOffset) {
	// rawDow: 0=Sun .. 6=Sat; weekStartOffset: 0 for Sun, 1 for Mon
	const adjustedDow = (rawDow - weekStartOffset + 7) % 7; // 0=first col, 6=last col
	let html = '';
	const isLastCol = (adjustedDow === 6);
	const classes = 'bd' + (isLastCol ? ' b-sun' : '') + addClasses;

	if (adjustedDow === 0 || day === 1) {
		html += '<tr>';
		if (day === 1) {
			for (let key = 0; key < dayNames.length; key++) {
				// Highlight weekend day names
				const origIdx = (key + weekStartOffset) % 7; // map back to 0=Sun
				const isWE = (origIdx === 0 || origIdx === 6);
				html += `<td class="bwd bb${isWE ? ' red' : ''}${key === 6 ? ' b-sun' : ''}">${dayNames[key]}</td>`;
			}
			html += '<td></td></tr><tr>';
			for (let n = 0; n < adjustedDow; n++) {
				html += '<td class="bd"> </td>';
			}
		}
	}

	html += `<td class="${classes}">${day}</td>`;

	if (day === dayLast) {
		let rest = 6 - adjustedDow;
		for (let n = 0; n < rest; n++) {
			html += `<td class="${classes}"> </td>`;
		}
	}

	if (adjustedDow === 6) {
		html += `<td class="bwn">${weekNum}</td></tr>`;
	}

	return html;
}

// Основная функция генерации
function generateCalendar(months, emptyRows, weekStart, startOffset = 0) {
	const { days: WEEK_DAYS, narrow: WEEK_DAYS_NARROW, offset: wsOffset } = getOrderedDays(weekStart);

	const helpers = {
		emp: {}, hor: {}, ver: {}, box: {}, wkn: {},
		index: [],
		iname: [],
		iyear: [],
		imonth: [],
	};
	const seenWeeks = new Set();

	const now = new Date();
	const startDate = new Date(now.getFullYear(), now.getMonth() + startOffset, 1);
	const totalLength = months - 1;
	const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + totalLength + 1, 0);

	const holidaysByYear = {};
	for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
		holidaysByYear[y] = getHolidays(y);
	}

	const curDate = new Date(startDate);
	const loopEnd = new Date(endDate);
	loopEnd.setDate(loopEnd.getDate() + 1);

	while (curDate < loopEnd) {
		const md = pad2(curDate.getMonth() + 1) + pad2(curDate.getDate());
		const yearHolidays = holidaysByYear[curDate.getFullYear()];
		const holiday = yearHolidays[md] || '';
		const rawDow = getUSDayOfWeek(curDate); // 0=Sun, 6=Sat
		const weekend = (rawDow === 0 || rawDow === 6) ? ' red' : '';
		const adjustedDow = (rawDow - wsOffset + 7) % 7; // position in ordered week
		const index = formatIndex(curDate);
		const day = curDate.getDate();
		const lastDay = getLastDayOfMonth(curDate);

		if (!(index in helpers.emp)) {
			helpers.emp[index] = '';
			helpers.wkn[index] = '';
			helpers.hor[index] = '';
			helpers.ver[index] = '';
			helpers.box[index] = '';
		}

		const weekLine = (adjustedDow === 0 && day !== 1) ? ' wk' : '';
		const showWeekNum = (adjustedDow === 0 || day === 1) ? getWeekNumber(curDate) : '';

		// Week number for first Gantt row (unique per year)
		const wn = getWeekNumber(curDate);
		const wnKey = curDate.getFullYear() + '-' + wn;
		let wnLabel = '';
		if ((adjustedDow === 0 || day === 1) && !seenWeeks.has(wnKey)) {
			seenWeeks.add(wnKey);
			wnLabel = `<span class="hwn">${wn}</span>`;
		}
		const wnFirst = (day === 1) ? ' h-f' : '';
		helpers.wkn[index] += `<td class="e-h${wnFirst}${weekLine}"><div>&nbsp;</div>${wnLabel}</td>`;

		helpers.emp[index] += calHorCel(day, ' ', weekLine);
		helpers.hor[index] += calHorCel(day, WEEK_DAYS_NARROW[adjustedDow], weekend + weekLine);
		helpers.ver[index] += calVerRow(day, WEEK_DAYS_BASE[rawDow], weekend + weekLine, holiday, showWeekNum);
		helpers.box[index] += calBoxCel(day, rawDow, lastDay, getWeekNumber(curDate), weekend, WEEK_DAYS, wsOffset);

		if (day === lastDay) {
			// Добить вертикальный до 31 строки
			for (let n = 0; n < 31 - day; n++) {
				helpers.ver[index] += calVerRow();
			}
			helpers.index.push(index);
			helpers.iname.push(MONTHS[curDate.getMonth() + 1]);
			helpers.iyear.push(String(curDate.getFullYear()));
			helpers.imonth.push(curDate.getMonth() + 1);
		}

		curDate.setDate(curDate.getDate() + 1);
	}

	// Сборка HTML (аналог PHP arr r1-r6)
	const arr = {
		r1: '<td></td>',
		r2: '<td></td>',
		r3: '<td></td>',
		r4: '<td></td>',
		r5: '<td></td>',
		r6: '<td></td>',
	};

	for (let i = 0; i <= totalLength; i++) {
		// Determine border class based on month
		const mon = helpers.imonth[i];
		const isYear = i > 0 && helpers.iyear[i - 1] !== helpers.iyear[i];
		const isQuarter = [1, 4, 7, 10].includes(mon);
		let blClass = 'bl';
		if (isYear) blClass += ' bl-year';
		else if (isQuarter) blClass += ' bl-quarter';

		// r4: первый столбец — пустой горизонтальный с заголовком
		if (i === 0) {
			let r4init = '<td><table width="100%" class="m-hor">';
			r4init += '<tr><td class="h"><div>&nbsp;</div>&nbsp;</td></tr>';
			for (let n = 0; n < emptyRows; n++) {
				r4init += '<tr>' + calHorCel(1) + '</tr>';
			}
			r4init += '</table></td>';
			arr.r4 = r4init;
		}

		// r1: Год
		if (i === 0 || isYear) {
			arr.r1 += `<td class="year ${blClass}"><h1>${helpers.iyear[i]}</h1></td>`;
		} else {
			arr.r1 += '<td></td>';
		}

		// r2: Название месяца
		arr.r2 += `<td class="${blClass} pln mv"><h2>${helpers.iname[i]}</h2></td>`;

		// r3: Вертикальный календарь
		arr.r3 += `<td class="${blClass} plr mv-b"><table width="100%">${helpers.ver[helpers.index[i]]}</table></td>`;

		// r4: Горизонтальный + пустые строки
		let r4 = `<td class="${blClass}"><table width="100%" class="m-hor">`;
		r4 += '<tr>' + helpers.hor[helpers.index[i]] + '</tr>';
		r4 += '<tr>' + helpers.wkn[helpers.index[i]] + '</tr>';
		for (let n = 1; n < emptyRows; n++) {
			r4 += '<tr>' + helpers.emp[helpers.index[i]] + '</tr>';
		}
		r4 += '</table></td>';
		arr.r4 += r4;

		// r5: Название месяца для box
		arr.r5 += `<td class="${blClass} mb"><h3>${helpers.iname[i]}</h3></td>`;

		// r6: Box-календарь
		arr.r6 += `<td class="${blClass} plr"><table width="100%">${helpers.box[helpers.index[i]]}</table></td>`;
	}

	const rows = [arr.r1, arr.r2, arr.r3, arr.r4, arr.r5, arr.r6];
	let html = '<table autosize="1" class="br"><tbody>\n';
	html += rows.map(r => '<tr>' + r + '</tr>').join('\n');
	html += '\n</tbody></table>';

	return html;
}

// ─── Months / Years toggle ───
let yearsMode = false;

function toggleMonthsYears() {
	const label = document.getElementById('months-label');
	const input = document.getElementById('months-input');
	const cur = parseInt(input.value) || 2;
	yearsMode = !yearsMode;
	if (yearsMode) {
		label.textContent = 'Years';
		input.value = Math.max(1, Math.round(cur / 12));
		input.max = 10;
	} else {
		label.textContent = 'Months';
		input.value = Math.min(49, cur * 12);
		input.max = 49;
	}
	updateCalendar();
}

// Инициализация
function init() {
	const params = new URLSearchParams(window.location.search);
	let months = parseInt(params.get('l')) || 12;
	let emptyRows = parseInt(params.get('g')) || 10;
	let weekStart = params.get('w') || 'sun';
	yearsMode = params.get('u') === 'y';

	if (emptyRows < 5 || emptyRows > 15) emptyRows = 10;
	if (weekStart !== 'mon') weekStart = 'sun';

	const monthsInput = document.getElementById('months-input');
	const rowsSlider = document.getElementById('rows-slider');
	const rowsValue = document.getElementById('rows-value');
	const weekBtn = document.getElementById('week-start-btn');
	const label = document.getElementById('months-label');
	if (yearsMode) {
		if (label) label.textContent = 'Years';
		if (monthsInput) { monthsInput.value = months; monthsInput.max = 10; }
	} else {
		if (label) label.textContent = 'Months';
		if (monthsInput) { monthsInput.value = months; monthsInput.max = 49; }
	}
	if (rowsSlider) rowsSlider.value = emptyRows;
	if (rowsValue) rowsValue.textContent = emptyRows;
	if (weekBtn) {
		weekBtn.textContent = weekStart === 'mon' ? 'Mon' : 'Sun';
		weekBtn.style.color = weekStart === 'mon' ? '' : '#C41E3A';
	}

	const totalMonths = yearsMode ? months * 12 : months;

	// Calculate pages
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	const mpp = (currentPaper.w !== null && rows >= 12) ? 8 : (currentPaper.w !== null ? 7 : 999);
	const totalM = Math.max(1, Math.min(120, totalMonths));
	const numPages = Math.max(1, Math.ceil(totalM / mpp));

	let pagesHTML = '';
	for (let p = 0; p < numPages; p++) {
		const offset = p * mpp;
		const count = Math.min(mpp, totalM - offset);
		const calHTML = generateCalendar(count, emptyRows, weekStart, offset);
		pagesHTML += `<div class="cal-page" data-page="${p}">${calHTML}</div>`;
	}

	if (currentPaper.copies && currentPaper.copies > 1) {
		let copiesHTML = '';
		for (let c = 0; c < currentPaper.copies; c++) {
			if (c > 0) copiesHTML += '<div class="cut-line"></div>';
			copiesHTML += '<div class="cal-copy">' + pagesHTML + '</div>';
		}
		document.getElementById('calendar').innerHTML = copiesHTML;
	} else {
		document.getElementById('calendar').innerHTML = pagesHTML;
	}
	autoFitViewport();
}

function updateCalendar() {
	const inputVal = parseInt(document.getElementById('months-input').value) || 2;
	const rows = parseInt(document.getElementById('rows-slider').value) || 10;
	// Compact cells for 914mm single format at rows >= 6
	document.body.classList.toggle('paper-914', currentPaperKey === '914mm' && rows >= 6);
	const weekBtn = document.getElementById('week-start-btn');
	const weekStart = (weekBtn && weekBtn.textContent === 'Mon') ? 'mon' : 'sun';
	const totalMonths = yearsMode ? inputVal * 12 : inputVal;
	const url = new URL(window.location);
	url.searchParams.set('l', inputVal);
	url.searchParams.set('g', rows);
	url.searchParams.set('w', weekStart);
	if (yearsMode) url.searchParams.set('u', 'y'); else url.searchParams.delete('u');
	window.history.replaceState({}, '', url);

	// Calculate pages
	const mpp = (currentPaper.w !== null && rows >= 12) ? 8 : (currentPaper.w !== null ? 7 : 999);
	const totalM = Math.max(1, Math.min(120, totalMonths));
	const numPages = Math.max(1, Math.ceil(totalM / mpp));

	let pagesHTML = '';
	for (let p = 0; p < numPages; p++) {
		const offset = p * mpp;
		const count = Math.min(mpp, totalM - offset);
		const calHTML = generateCalendar(count, Math.max(5, Math.min(15, rows)), weekStart, offset);
		pagesHTML += `<div class="cal-page" data-page="${p}">${calHTML}</div>`;
	}

	if (currentPaper.copies && currentPaper.copies > 1) {
		let copiesHTML = '';
		for (let c = 0; c < currentPaper.copies; c++) {
			if (c > 0) copiesHTML += '<div class="cut-line"></div>';
			copiesHTML += '<div class="cal-copy">' + pagesHTML + '</div>';
		}
		document.getElementById('calendar').innerHTML = copiesHTML;
	} else {
		document.getElementById('calendar').innerHTML = pagesHTML;
	}
	autoFitViewport();
}

function toggleRowsSlider() {
	const slider = document.getElementById('rows-slider');
	slider.style.display = slider.style.display === 'none' ? '' : 'none';
}

function onRowsSlider(val) {
	document.getElementById('rows-value').textContent = val;
	updateCalendar();
}

// ─── Viewport state ───
const MM_PX = 96 / 25.4; // ~3.78 px per mm
const RULER_W = 20;

const viewport = {
	left: 10 * MM_PX,               // screen px from left edge to world 0
	top: 10 * MM_PX,                // screen px from top edge to paper top
	zoom: 1,
};

// Paper sizes in landscape: { width_mm, height_mm } — null = infinite
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
let monthsPerPage = 7;
let calendarScale = 1; // how much to shrink calendar to fit paper

function updatePageInfo() {
	const el = document.getElementById('page-info');
	if (!el) return;
	const label = currentPaperKey.toUpperCase().replace('914X4', '914×4').replace('914X2', '914×2').replace('914MM', '914mm');
	if (currentPaper.w === null) {
		// Infinite-width formats: show actual width in meters
		const firstPage = document.querySelector('#calendar .cal-page');
		if (firstPage) {
			const screenW = firstPage.getBoundingClientRect().width;
			// screenW = naturalW * calendarScale * viewport.zoom
			// Paper width = naturalW * calendarScale / MM_PX (calendarScale IS print scale)
			const paperW_mm = screenW / (viewport.zoom * MM_PX) + 20; // +20mm margins
			const meters = (paperW_mm / 1000).toFixed(1);
			el.textContent = label + ' ' + meters + 'm';
		} else {
			el.textContent = label;
		}
	} else if (totalPages > 1) {
		el.textContent = label + ' ' + totalPages + ' pages';
	} else {
		el.textContent = label;
	}
}

function setPaperSize(key) {
	currentPaper = PAPER_SIZES[key] || PAPER_SIZES.a4;
	currentPaperKey = key;
	// Highlight active menu item
	document.querySelectorAll('.pm-item[data-size]').forEach(b => {
		b.classList.toggle('active', b.dataset.size === key);
	});
	// Apply compact cell mode for 914mm single format
	// paper-914 class is managed in updateCalendar (depends on rows slider)
	updateCalendar();
}

function togglePrintMenu() {
	const menu = document.getElementById('print-menu');
	const isOpen = menu.style.display !== 'none';
	menu.style.display = isOpen ? 'none' : '';
	if (!isOpen) {
		// Close on click outside
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

function autoFitViewport() {
	const cal = document.getElementById('calendar');
	// Use first page for measurements
	const firstPage = cal.querySelector('.cal-page') || cal;
	// Render at scale 1 to measure real size
	cal.style.position = 'fixed';
	cal.style.left = '0px';
	cal.style.top = '0px';
	cal.style.bottom = '';
	cal.style.width = '';
	cal.style.transform = 'none';
	// Reset all pages to scale 1
	cal.querySelectorAll('.cal-page').forEach(p => {
		p.style.position = 'relative';
		p.style.transform = 'scale(1)';
		p.style.transformOrigin = 'top left';
	});
	void cal.offsetHeight;
	const rect = firstPage.getBoundingClientRect();
	const contentH = rect.height;
	const contentW = rect.width;

	// 1) calendarScale: fit content into printable area at 1:1
	const MARGIN_MM = 10;
	const printH = currentPaper.h - 2 * MARGIN_MM;
	const printW = currentPaper.w !== null ? currentPaper.w - 2 * MARGIN_MM : Infinity;

	// For fixed-width paper: iteratively find stable column width so N months fit paper
	if (currentPaper.w !== null) {
		const rows = parseInt(document.getElementById('rows-slider').value) || 10;
		monthsPerPage = (rows >= 12) ? 8 : 7;

		// Calculate total pages from actual page divs
		const pageElements = cal.querySelectorAll('.cal-page');
		totalPages = pageElements.length || 1;

		// 1. Measure metrics using trial width (first page only)
		const trialW_mm = printW / monthsPerPage;
		const blCols = cal.querySelectorAll('.bl');
		blCols.forEach(el => el.style.width = trialW_mm + 'mm');
		void cal.offsetHeight;

		const actualW = firstPage.getBoundingClientRect().width;
		// Spacer is the first cell of the table
		const spacerCell = firstPage.querySelector('td:first-child');
		const spacerW = spacerCell ? spacerCell.getBoundingClientRect().width : 0;

		// Derived metrics — use first page's columns for measurement
		const firstPageBl = firstPage.querySelectorAll('.bl');
		const totalMonthW = Math.max(0, actualW - spacerW);
		const unitW = totalMonthW / (firstPageBl.length || 1);
		// Overhead = borders + padding relative to trial
		const colOverhead = unitW - (trialW_mm * MM_PX);

		// 2. Iteratively adjust column width
		for (let i = 0; i < 3; i++) {
			void cal.offsetHeight;
			const h = firstPage.getBoundingClientRect().height;
			const scale = (printH * MM_PX) / h;

			const targetW = (printW * MM_PX) / scale;
			// Safety buffer: 3mm on paper (converted to natural pixels pre-scale)
			const safetyPx = (3 * MM_PX) / scale;

			// We want: Spacer + (monthsPerPage * unitNew) <= targetW - safety
			const targetUnitW = (targetW - spacerW - safetyPx) / monthsPerPage;

			// colNew = targetUnitW - colOverhead
			const colNew = Math.max(1, targetUnitW - colOverhead);
			blCols.forEach(el => el.style.width = colNew + 'px');
		}

		// 3. Final scale
		void cal.offsetHeight;
		calendarScale = (printH * MM_PX) / firstPage.getBoundingClientRect().height;
	} else {
		document.querySelectorAll('.bl').forEach(el => el.style.width = '');
		// For copies mode: scale based on copyH if defined, else use full content height
		if (currentPaper.copies && currentPaper.copies > 1 && currentPaper.copyH) {
			calendarScale = (currentPaper.copyH * MM_PX) / contentH;
		} else if (currentPaper.copies && currentPaper.copies > 1) {
			// 914x2: measure full height (all copies + cut-lines)
			calendarScale = (printH * MM_PX) / cal.getBoundingClientRect().height;
		} else {
			calendarScale = (printH * MM_PX) / contentH;
		}
		totalPages = 1;

		// For 914mm single: set cell widths based on rows slider
		if (document.body.classList.contains('paper-914')) {
			const rows914 = parseInt(document.getElementById('rows-slider').value) || 10;
			// rows=6 → 4mm, rows=12 → 3mm
			const targetMM = rows914 >= 12 ? 3 : 4;
			const cellW_css = targetMM / calendarScale; // mm in CSS → targetMM on paper
			const cellStyle = cellW_css + 'mm';
			cal.querySelectorAll('td.h, td.e-h').forEach(el => {
				el.style.width = cellStyle;
				el.style.minWidth = cellStyle;
				el.style.maxWidth = cellStyle;
			});
			// Recompute scale after width change (height may shift slightly)
			void cal.offsetHeight;
			calendarScale = (printH * MM_PX) / firstPage.getBoundingClientRect().height;
		} else {
			cal.querySelectorAll('td.h, td.e-h').forEach(el => {
				el.style.width = '';
				el.style.minWidth = '';
				el.style.maxWidth = '';
			});
		}
	}

	// 2) viewport.zoom: fit the paper on screen
	const screenMargin = 10 * MM_PX;
	const rulerGap = RULER_W + 3 * MM_PX; // ruler height + 3mm gap
	const availableH = window.innerHeight - rulerGap;
	const scaleScreen = (availableH - screenMargin) / (currentPaper.h * MM_PX);
	viewport.zoom = Math.min(scaleScreen, 1);
	const paperScreenH = currentPaper.h * viewport.zoom * MM_PX;
	viewport.top = (availableH - paperScreenH) / 2;
	if (currentPaper.w !== null) {
		const paperScreenW = currentPaper.w * viewport.zoom * MM_PX;
		viewport.left = RULER_W + (window.innerWidth - RULER_W - paperScreenW) / 2;
	} else {
		viewport.left = RULER_W + screenMargin;
	}
	applyViewport();
	updatePageInfo();
}

function applyViewport() {
	const step = viewport.zoom * MM_PX;
	const marginPx = 7 * step; // 0.7cm margin scaled

	// Paper origin (top-left corner of paper)
	const originScreenX = viewport.left;
	const paperTopY = viewport.top;
	let paperW;
	if (currentPaper.w !== null) {
		paperW = currentPaper.w * step;
	} else {
		// Temporary: set wide, will trim after content is positioned
		paperW = window.innerWidth * 2;
	}
	const paperH = currentPaper.h * step;
	const pageGap = 20; // px gap between pages on screen

	// --- Render paper sheets (1 per page) ---
	const paper = document.getElementById('paper-sheet');
	// Remove old extra sheets
	document.querySelectorAll('.paper-sheet-extra').forEach(el => el.remove());

	// Position page 1
	paper.style.left = originScreenX + 'px';
	paper.style.top = paperTopY + 'px';
	paper.style.width = paperW + 'px';
	paper.style.height = paperH + 'px';

	// Create extra pages
	for (let p = 1; p < totalPages; p++) {
		const extra = document.createElement('div');
		extra.className = 'paper-sheet-extra';
		extra.style.position = 'fixed';
		extra.style.zIndex = '1';
		extra.style.background = 'var(--mol-cream)';
		extra.style.borderRadius = '8px';
		extra.style.boxShadow = '1px 1px 4px rgba(60,40,20,.15), 3px 3px 12px rgba(60,40,20,.1)';
		extra.style.pointerEvents = 'none';
		extra.style.left = (originScreenX + p * (paperW + pageGap)) + 'px';
		extra.style.top = paperTopY + 'px';
		extra.style.width = paperW + 'px';
		extra.style.height = paperH + 'px';
		document.body.insertBefore(extra, paper.nextSibling);
	}

	const paperBottomY = paperTopY + paperH;

	// Calendar pages: position each .cal-page on its paper sheet
	const totalScale = calendarScale * viewport.zoom;
	const cal = document.getElementById('calendar');
	cal.style.position = 'fixed';
	cal.style.bottom = '';

	if (currentPaper.copies && currentPaper.copies > 1) {
		// Copies mode (914x2/x4): position entire calendar as one block, centered vertically
		cal.style.left = (originScreenX + marginPx) + 'px';
		cal.style.transformOrigin = 'top left';
		cal.style.transform = `scale(${totalScale})`;
		// Measure content height after scale to center vertically
		void cal.offsetHeight;
		const scaledH = cal.getBoundingClientRect().height;
		const offsetY = currentPaper.copyH
			? Math.max(0, paperH - scaledH)  // bottom-align for copyH formats (914x4)
			: marginPx;                       // top margin for others (914x2)
		cal.style.top = (paperTopY + offsetY) + 'px';
		// Reset any page-level positioning
		cal.querySelectorAll('.cal-page').forEach(p => {
			p.style.position = '';
			p.style.left = '';
			p.style.top = '';
			p.style.transform = '';
		});
	} else {
		// Multi-page mode: position each page on its paper sheet
		cal.style.left = '0px';
		cal.style.top = '0px';
		cal.style.transform = 'none';

		const pages = cal.querySelectorAll('.cal-page');
		pages.forEach((page, i) => {
			page.style.position = 'fixed';
			page.style.left = (originScreenX + marginPx + i * (paperW + pageGap)) + 'px';
			page.style.top = (paperTopY + marginPx) + 'px';
			page.style.transformOrigin = 'top left';
			page.style.transform = `scale(${totalScale})`;
		});
	}

	// Trim roll paper after content is positioned and scaled
	if (currentPaper.w === null) {
		void cal.offsetHeight;
		const firstPage = cal.querySelector('.cal-page');
		if (firstPage) {
			const renderedW = firstPage.getBoundingClientRect().width;
			const trimMargin = 20 * step; // 20mm after content
			paperW = renderedW + 2 * marginPx + trimMargin;
			paper.style.width = paperW + 'px';
		}
	}

	// Guides at paper edges
	document.getElementById('guide-h').style.top = (paperBottomY - marginPx) + 'px';
	document.getElementById('guide-v').style.left = originScreenX + 'px';
	const guideH = document.getElementById('guide-h-a4');
	guideH.style.top = (paperTopY + marginPx) + 'px';

	// Remove old dynamic guides
	document.querySelectorAll('.guide-page-v').forEach(el => el.remove());

	// Create vertical guide pairs (left + right) for each page
	const guideVA4 = document.getElementById('guide-v-a4');
	guideVA4.style.display = 'none'; // replaced by dynamic guides

	for (let p = 0; p < totalPages; p++) {
		const pageLeft = originScreenX + p * (paperW + pageGap);

		// Left guide (printable area left edge)
		const gL = document.createElement('div');
		gL.className = 'guide guide-v guide-page-v';
		gL.style.left = (pageLeft + marginPx) + 'px';
		document.body.appendChild(gL);

		// Right guide (printable area right edge)
		if (currentPaper.w !== null) {
			const gR = document.createElement('div');
			gR.className = 'guide guide-v guide-page-v';
			gR.style.left = (pageLeft + paperW - marginPx) + 'px';
			document.body.appendChild(gR);
		}
	}

	// Hide old margin guides
	document.getElementById('guide-margin-bottom').style.display = 'none';
	document.getElementById('guide-margin-top').style.display = 'none';
	document.getElementById('guide-margin-left').style.display = 'none';
	document.getElementById('guide-margin-right').style.display = 'none';

	// ── Gantt panel: anchor bottom-left of calendar grid ──
	const designPanel = document.getElementById('gantt-panel');
	if (designPanel && !designPanel._dragged) {
		const firstBl2 = document.querySelector('#calendar .bl');
		if (firstBl2) {
			const blLeft = firstBl2.getBoundingClientRect().left;
			const panelW = designPanel.offsetWidth;
			const panelH = designPanel.offsetHeight;
			designPanel.style.left = (blLeft - panelW - 6) + 'px';
			const midY = paperTopY + (paperBottomY - paperTopY) * 0.75 - panelH / 2;
			designPanel.style.top = midY + 'px';
		}
	}

	drawRulers();
}

// ─── Rulers ───
function drawRulers() {
	const isDark = document.body.classList.contains('dark');
	const tickColor = isDark ? '#6B5D4B' : '#8B7D6B';
	const textColor = isDark ? '#9A8C7A' : '#6B5D4B';
	const bgColor = isDark ? '#252015' : '#F5ECD7';
	const step = viewport.zoom * MM_PX; // screen px per world mm

	// Adaptive scale: if 1 cm < 8 px on screen, switch to meter mode
	const cmPx = step * 10;
	const largeMode = cmPx < 8; // meter + 10 cm ticks
	// In large mode: iterate by 100mm (10cm), label every 1000mm (1m)
	const tickStep = largeMode ? 100 : 1;        // mm per tick iteration
	const majorEvery = largeMode ? 1000 : 10;     // mm for major tick + label
	const midEvery = largeMode ? 100 : 5;         // mm for medium tick

	const dpr = window.devicePixelRatio || 1;

	// ── Left ruler (vertical, 0 at bottom margin, positive up) ──
	const lCanvas = document.getElementById('ruler-left');
	const lh = window.innerHeight;
	lCanvas.width = RULER_W * dpr;
	lCanvas.height = lh * dpr;
	lCanvas.style.width = RULER_W + 'px';
	lCanvas.style.height = lh + 'px';
	const lctx = lCanvas.getContext('2d');
	lctx.scale(dpr, dpr);
	lctx.fillStyle = bgColor;
	lctx.fillRect(0, 0, RULER_W, lh);

	// 0mm is at the bottom margin (guide-h position)
	const marginStep = 7 * step; // 7mm margin in screen px
	const paperH = currentPaper.h * step;
	const zeroY = viewport.top + paperH - marginStep; // screen Y where 0mm is
	// Positive mm goes UP (screen Y decreases), negative goes DOWN
	const mmTopV = Math.ceil((zeroY) / step);
	const mmBotV = Math.floor((zeroY - lh) / step);
	const mmStartV = Math.floor(mmBotV / tickStep) * tickStep;
	const mmEndV = Math.ceil(mmTopV / tickStep) * tickStep;
	for (let mm = mmStartV; mm <= mmEndV; mm += tickStep) {
		const y = zeroY - mm * step; // positive mm goes upward
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
			// Label every 10cm in large mode
			lctx.fillStyle = textColor;
			lctx.font = '7px IBM Plex Sans, sans-serif';
			lctx.textAlign = 'center';
			lctx.globalAlpha = 0.6;
			lctx.fillText((mm / 10), 8, y - 2);
			lctx.globalAlpha = 1;
		}
	}

	// ── Bottom ruler (horizontal, left-to-right) ──
	const bCanvas = document.getElementById('ruler-bottom');
	const bw = window.innerWidth;
	bCanvas.width = bw * dpr;
	bCanvas.height = RULER_W * dpr;
	bCanvas.style.width = bw + 'px';
	bCanvas.style.height = RULER_W + 'px';
	const bctx = bCanvas.getContext('2d');
	bctx.scale(dpr, dpr);
	bctx.fillStyle = bgColor;
	bctx.fillRect(0, 0, bw, RULER_W);

	// 0mm on bottom ruler = first .bl line position
	const firstBlEl = document.querySelector('#calendar .bl');
	const zeroX = firstBlEl ? firstBlEl.getBoundingClientRect().left : viewport.left;
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
			// Label every 10cm in large mode
			bctx.fillStyle = textColor;
			bctx.font = '7px IBM Plex Sans, sans-serif';
			bctx.textAlign = 'center';
			bctx.globalAlpha = 0.6;
			bctx.fillText((mm / 10), x, RULER_W - 4);
			bctx.globalAlpha = 1;
		}
	}
}

// ─── Helpers ───
function toggleWeekStart() {
	const btn = document.getElementById('week-start-btn');
	const isSun = btn.textContent === 'Sun';
	btn.textContent = isSun ? 'Mon' : 'Sun';
	btn.style.color = isSun ? '' : '#C41E3A';
	updateCalendar();
}

function printPDF() {
	window.print();
}

const SUN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const MOON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function toggleTheme() {
	const isDark = document.body.classList.toggle('dark');
	document.getElementById('theme-btn').innerHTML = isDark ? MOON_ICON : SUN_ICON;
	localStorage.setItem('theme', isDark ? 'dark' : 'light');
	drawRulers();
}

function restoreTheme() {
	const saved = localStorage.getItem('theme');
	if (saved === 'dark') {
		document.body.classList.add('dark');
		document.getElementById('theme-btn').innerHTML = MOON_ICON;
	}
}

// ─── Init & event handlers ───
document.addEventListener('DOMContentLoaded', () => {
	init();
	restoreTheme();

	// Enter key on inputs triggers update
	document.getElementById('months-input').addEventListener('keydown', (e) => {
		if (e.key === 'Enter') updateCalendar();
	});

	// ── Click corner to reset viewport ──
	document.querySelector('.ruler-corner').addEventListener('click', () => {
		const dp = document.getElementById('gantt-panel');
		if (dp) dp._dragged = false;
		autoFitViewport();
	});

	// ── Drag to pan the calendar ──
	let isPanning = false, panStartX, panStartY, panStartL, panStartT;

	document.addEventListener('mousedown', (e) => {
		// Don't pan when clicking controls, rulers, or interactive elements
		if (e.target.closest('.controls') || e.target.closest('.ruler') || e.target.closest('.ruler-corner')) return;
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
		applyViewport();
	});

	document.addEventListener('mouseup', () => {
		if (isPanning) {
			isPanning = false;
			document.body.style.cursor = '';
		}
	});

	// ── Ctrl + wheel to zoom ──
	document.addEventListener('wheel', (e) => {
		if (!e.ctrlKey) return;
		e.preventDefault();

		const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
		const newZoom = Math.max(0.05, Math.min(10, viewport.zoom * factor));

		// Zoom toward cursor position
		const mouseX = e.clientX;
		const mouseY = e.clientY;

		// World-space px under cursor (before zoom)
		const worldPxX = (mouseX - viewport.left) / viewport.zoom;
		const worldPxY = (mouseY - viewport.top) / viewport.zoom;

		viewport.zoom = newZoom;

		// Adjust origin so cursor stays over same world point
		viewport.left = mouseX - worldPxX * newZoom;
		viewport.top = mouseY - worldPxY * newZoom;

		applyViewport();
	}, { passive: false });

	// ── Window resize ──
	window.addEventListener('resize', applyViewport);

	// ── Draggable controls panels ──
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
			e.stopPropagation(); // Don't start panning
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
