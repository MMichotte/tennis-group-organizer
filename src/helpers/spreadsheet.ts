import type { GameDate, Player } from '../types';

const loadXlsx = (): Promise<typeof import('xlsx')> => import('xlsx');

const getTableElement = (htmlTableId: string): HTMLElement => {
  const tableElement = document.getElementById(htmlTableId);
  if (!tableElement) {
    throw new Error(`Could not find table with id "${htmlTableId}"`);
  }
  return tableElement;
};

/**
 * Exports the HTML table identified by `htmlTableId` as an .xlsx file.
 * Cells are written verbatim as text so dates keep their YYYY-MM-DD form and
 * can be re-imported losslessly.
 */
export const exportToExcel = async (
  htmlTableId: string,
  sheetName: string,
  fileName: string,
): Promise<void> => {
  const XLSX = await loadXlsx();
  const table = getTableElement(htmlTableId) as HTMLTableElement;

  const rows = Array.from(table.rows).map((row) =>
    Array.from(row.cells).map((cell) => (cell.textContent ?? '').trim()),
  );
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

export interface ImportedPlanning {
  /** Players with their play counts recomputed from the import. */
  players: Player[];
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

const parseDateRow = (row: unknown[], year: number, month: number, day: number): ParsedRow => ({
  row,
  date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  year,
  month,
  day,
});

/**
 * Parses a planning exported by this app (Excel or CSV) back into players,
 * play dates and the planning table.
 *
 * Expected layout: first column header "Date", then one column per player
 * (✅ = plays, ❌ = does not play).
 */
export const importSpreadsheet = async (file: File): Promise<ImportedPlanning> => {
  const XLSX = await loadXlsx();
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('File contains no sheet');
  }
  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    raw: false,
    defval: '',
  }) as unknown[][];

  const header = rows[0] ?? [];
  if (!/^date$/i.test(String(header[0] ?? '').trim()) || header.length < 2) {
    throw new Error('Unrecognized format: expected a "Date" column followed by player columns');
  }

  const playerNames = header
    .slice(1)
    .map((cell) => String(cell).trim().replace(/\s*\(\d+\)\s*$/, ''))
    .filter((name) => name !== '');
  if (new Set(playerNames).size !== playerNames.length) {
    throw new Error('Duplicate player names in the file');
  }

  const isPlaying = (cell: unknown): boolean =>
    ['✅', '✔', '✓', '1', 'true', 'yes', 'oui', 'x'].includes(
      String(cell ?? '').trim().toLowerCase(),
    );

  const dateRows = rows
    .slice(1)
    .map((row) => {
      const value = String(row[0] ?? '').trim();
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return match
        ? parseDateRow(row, Number(match[1]), Number(match[2]), Number(match[3]))
        : { row, date: value, year: 0, month: 0, day: 0 };
    })
    .filter((entry) => entry.date !== '');

  if (dateRows.length === 0) {
    throw new Error('No play dates found in the file');
  }

  const malformed = dateRows.filter((entry) => entry.year === 0);
  if (malformed.length > 0) {
    throw new Error(
      `Unrecognized date format for: ${malformed.map((entry) => entry.date).join(', ')} (expected YYYY-MM-DD)`,
    );
  }

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
      const player = players.find((candidate) => candidate.id === slot.id);
      if (player && isPlaying(row[playerIdx + 1])) {
        slot.isPlaying = true;
        player.playCount += 1;
      }
    });
  });

  return {
    players,
    playDates: dateRows.map((entry) => new Date(entry.year, entry.month - 1, entry.day)),
    gameDates,
  };
};
