import type { GameDate, Player, ReplacementPlayer } from '../types';
import { toDateKey } from './dates';

const loadXlsx = (): Promise<typeof import('xlsx')> => import('xlsx');

const getTableElement = (htmlTableId: string): HTMLElement => {
  const tableElement = document.getElementById(htmlTableId);
  if (!tableElement) {
    throw new Error(`Could not find table with id "${htmlTableId}"`);
  }
  return tableElement;
};

export interface ExportDocument {
  title: string;
  description: string;
  players: Player[];
  replacements: ReplacementPlayer[];
}

/**
 * Exports the planning as an .xlsx file with the following layout:
 * title row, description row, planning table ("Date" + one column per player),
 * then a "Players" section (Name/Email/Phone/Games) and a "Replacements"
 * section (Name/Email/Phone). Cells are written verbatim as text so dates
 * keep their YYYY-MM-DD form and can be re-imported losslessly.
 */
export const exportToExcel = async (
  htmlTableId: string,
  fileName: string,
  document: ExportDocument,
): Promise<void> => {
  const XLSX = await loadXlsx();
  const table = getTableElement(htmlTableId) as HTMLTableElement;

  const planningRows = Array.from(table.rows).map((row) =>
    Array.from(row.cells).map((cell) => (cell.textContent ?? '').trim()),
  );

  const rows: string[][] = [
    [document.title],
    [document.description],
    [],
    ...planningRows,
    [],
    ['Players'],
    ['Name', 'Email', 'Phone', 'Games'],
    ...document.players.map((player) => [
      player.name,
      player.email ?? '',
      player.phone ?? '',
      String(player.playCount),
    ]),
    ['Replacements'],
    ['Name', 'Email', 'Phone'],
    ...document.replacements.map((replacement) => [
      replacement.name,
      replacement.email ?? '',
      replacement.phone ?? '',
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Planning');
  XLSX.writeFile(workbook, fileName);
};

export interface ImportedPlanning extends ExportDocument {
  /** Play dates of the calendar, re-usable as `playDates` state. */
  playDates: Date[];
  gameDates: GameDate[];
}

interface ParsedRow {
  row: unknown[];
  date: string;
  year: number;
  month: number;
  day: number;
}

const SECTION = /^(players|replacements)$/i;

const parsePlanDate = (value: string): Omit<ParsedRow, 'row'> | null => {
  // Accept "2026-09-01" and "2026-09-01 (Monday)" (weekday suffix from exports).
  const iso = value
    .replace(/\s*\([a-z]+\)\s*$/i, '')
    .match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return {
      date: `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`,
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    };
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: toDateKey(parsed),
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
    };
  }
  return null;
};

/**
 * Parses an exported planning (Excel/CSV) back into the document meta,
 * players (with contacts), replacements and the planning table.
 */
export const importSpreadsheet = async (file: File): Promise<ImportedPlanning> => {
  const XLSX = await loadXlsx();
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('File contains no sheet');
  }
  const rows = (
    XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1,
      raw: false,
      defval: '',
    }) as unknown[][]
  ).map((row) => row.map((cell) => String(cell ?? '').trim()));

  const findRow = (pattern: RegExp, from = 0): number =>
    rows.findIndex(
      (row, idx) => idx >= from && pattern.test(String(row[0] ?? '')),
    );

  const planIdx = findRow(/^date$/i);
  if (planIdx === -1) {
    throw new Error('Unrecognized format: expected a "Date" column followed by player columns');
  }

  const title = planIdx > 0 ? rows[0][0] : '';
  const description = planIdx > 1 ? rows[1][0] : '';

  const playerNames = rows[planIdx]
    .slice(1)
    .map((name) => name.replace(/\s*\(\d+\)\s*$/, '').trim())
    .filter((name) => name !== '');
  if (new Set(playerNames).size !== playerNames.length) {
    throw new Error('Duplicate player names in the file');
  }

  // Planning rows: from the header row until the next marker/blank row.
  const dateRows: ParsedRow[] = [];
  const malformed: string[] = [];
  for (let idx = planIdx + 1; idx < rows.length; idx += 1) {
    const value = String(rows[idx][0] ?? '');
    if (value === '' || SECTION.test(value)) break;
    const parsed = parsePlanDate(value);
    if (parsed) {
      dateRows.push({ row: rows[idx], ...parsed });
    } else {
      malformed.push(value);
    }
  }

  if (dateRows.length === 0) {
    throw new Error('No play dates found in the file');
  }
  if (malformed.length > 0) {
    throw new Error(
      `Unrecognized date format for: ${malformed.join(', ')} (expected YYYY-MM-DD)`,
    );
  }

  const playersIdx = findRow(/^players$/i);
  const replacementsIdx = findRow(/^replacements$/i);

  const players: Player[] = playerNames.map((name, idx) => ({
    id: `import-${idx}`,
    name,
    excludeDates: [],
    playCount: 0,
  }));

  const gameDates: GameDate[] = dateRows.map((entry) => ({
    date: entry.date,
    players: players.map((player) => ({ id: player.id, name: player.name, isPlaying: false })),
  }));

  gameDates.forEach((gd, rowIdx) => {
    const row = dateRows[rowIdx].row;
    gd.players.forEach((slot, playerIdx) => {
      const raw = row[playerIdx + 1];
      if (['✅', '✔', '✓', '1', 'true', 'yes', 'oui', 'x'].includes(
        String(raw ?? '').trim().toLowerCase(),
      )) {
        slot.isPlaying = true;
        const player = players.find((candidate) => candidate.id === slot.id);
        if (player) {
          player.playCount += 1;
        }
      }
    });
  });

  // Players section: Name | Email | Phone | Games
  if (playersIdx > planIdx) {
    const sectionStart = playersIdx + 2;
    for (let idx = sectionStart; idx < rows.length; idx += 1) {
      const row = rows[idx];
      const name = String(row[0] ?? '').trim();
      if (name === '' || SECTION.test(name) || /^date$/i.test(name)) break;
      const player = players.find(
        (candidate) =>
          candidate.name.toLowerCase() === name.toLowerCase() && !candidate.email,
      );
      if (player) {
        player.email = String(row[1] ?? '').trim() || undefined;
        player.phone = String(row[2] ?? '').trim() || undefined;
        const games = Number(row[3]);
        if (Number.isFinite(games) && games > player.playCount) {
          player.playCount = games;
        }
      }
    }
  }

  // Replacements section: Name | Email | Phone
  const replacements: ReplacementPlayer[] = [];
  if (replacementsIdx > planIdx) {
    for (let idx = replacementsIdx + 2; idx < rows.length; idx += 1) {
      const row = rows[idx];
      const name = String(row[0] ?? '').trim();
      if (name === '' || SECTION.test(name)) break;
      replacements.push({
        id: `import-r-${idx}`,
        name,
        email: String(row[1] ?? '').trim() || undefined,
        phone: String(row[2] ?? '').trim() || undefined,
      });
    }
  }

  return {
    title,
    description,
    players,
    replacements,
    playDates: dateRows.map((entry) => new Date(entry.year, entry.month - 1, entry.day)),
    gameDates,
  };
};
