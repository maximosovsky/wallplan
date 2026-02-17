// WallPlan Miro Generator — creates calendar as a single SVG image on the board
import { renderCalendarSVG, svgToDataUrl, loadFonts } from './svg-renderer';

export interface GeneratorSettings {
    months: number;
    rows: number;
    weekStart: 'mon' | 'sun';
    hideDays: boolean;
    startYear: number;
    startMonth: number;
    onProgress?: (current: number, total: number) => void;
}

export async function generateCalendar(settings: GeneratorSettings) {
    const { onProgress } = settings;

    onProgress?.(1, 5);

    // 1) Load fonts (cached after first call)
    const fonts = await loadFonts();
    onProgress?.(2, 5);

    // 2) Generate SVG with embedded fonts
    const svg = renderCalendarSVG(settings, fonts);
    onProgress?.(3, 5);

    // 3) Convert to data URL
    const dataUrl = svgToDataUrl(svg);
    onProgress?.(4, 5);

    // 4) Place on Miro board as image
    const image = await miro.board.createImage({
        url: dataUrl,
        x: 0,
        y: 0,
        width: settings.months * 200,
        rotation: 0,
    });
    onProgress?.(5, 5);

    // Store ID for cleanup
    await miro.board.setAppData('wallplanIds', [image.id]);

    // Zoom to fit
    await miro.board.viewport.zoomTo(image);

    return [image.id];
}

export async function clearCalendar() {
    const ids = await miro.board.getAppData('wallplanIds') as string[] | undefined;
    if (ids && ids.length) {
        for (const id of ids) {
            try {
                const item = await miro.board.getById(id);
                if (item) await miro.board.remove(item);
            } catch (_e) { /* already deleted */ }
        }
        await miro.board.setAppData('wallplanIds', []);
    }
}
