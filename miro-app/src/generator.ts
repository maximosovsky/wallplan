// WallPlan Miro Generator — creates calendar as native board elements
import { generateNativeCalendar } from './native-generator';

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
    // Don't clear previous calendars — keep them on the board
    return generateNativeCalendar(settings);
}

export async function clearCalendar() {
    let ids: string[] = [];
    try {
        const data = await miro.board.getAppData('wallplanIds') as string[] | undefined;
        if (data && data.length) ids = data;
    } catch (_e) { /* appData may be corrupted or overflowed */ }

    // Always reset appData first (fixes overflow)
    try {
        await miro.board.setAppData('wallplanIds', []);
    } catch (_e) { /* ignore */ }

    for (const id of ids) {
        try {
            const item = await miro.board.getById(id);
            if (item) await miro.board.remove(item);
        } catch (_e) { /* already deleted */ }
    }
}
