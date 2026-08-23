import type { Locale } from '../i18n/translations';
import { translations, weekdayFor } from '../i18n/translations';
import type { GameDate, Player, ReplacementPlayer } from '../types';

import type { UserOptions } from 'jspdf-autotable';

export interface PdfDocument {
  title: string;
  description: string;
  players: Player[];
  replacements: ReplacementPlayer[];
  gameDates: GameDate[];
}

type RGB = [number, number, number];

const BRAND: RGB = [46, 94, 78]; // deep green
const ACCENT: RGB = [232, 197, 71]; // soft yellow
const BRAND_LIGHT: RGB = [240, 245, 241]; // very light green-tinted
const GREEN: RGB = [34, 122, 78];
const RED: RGB = [184, 65, 65];
const TEXT: RGB = [38, 51, 46];
const MUTED: RGB = [115, 131, 123];
const BORDER: RGB = [216, 227, 221];

const MARGIN = 40;

const baseStyles = (footer: (data: { pageNumber: number }) => void): Partial<UserOptions> => ({
  margin: { left: MARGIN, right: MARGIN },
  styles: {
    font: 'helvetica',
    fontSize: 8.5,
    cellPadding: 4,
    textColor: TEXT,
    lineColor: BORDER,
    lineWidth: 0.5,
    valign: 'middle' as const,
  },
  headStyles: {
    fillColor: BRAND,
    textColor: [255, 255, 255] as RGB,
    fontStyle: 'bold',
    halign: 'left' as const,
  },
  alternateRowStyles: { fillColor: BRAND_LIGHT },
  didDrawPage: footer,
});

/** Exports a branded PDF with the planning matrix, players & replacements. */
export const exportToPdf = async (
  document: PdfDocument,
  fileName: string,
  locale: Locale = 'en',
): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const t = translations[locale];

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;

  const titleLines = pdf.splitTextToSize(document.title || t.pdfTitleFallback, contentWidth);
  const descLines = document.description
    ? pdf.splitTextToSize(document.description, contentWidth)
    : [];
  const bandHeight =
    78 + (titleLines.length - 1) * 22 + (descLines.length ? descLines.length * 14 + 12 : 0);

  // Header band: deep green block with a thin yellow accent stripe
  pdf.setFillColor(...BRAND);
  pdf.rect(0, 0, pageWidth, bandHeight, 'F');
  pdf.setFillColor(...ACCENT);
  pdf.rect(0, bandHeight - 3, pageWidth, 3, 'F');

  pdf
    .setTextColor(255, 255, 255)
    .setFontSize(24)
    .setFont('helvetica', 'bold');
  pdf.text(titleLines, MARGIN, 44);
  pdf
    .setFontSize(9)
    .setFont('helvetica', 'normal')
    .setTextColor(245, 250, 247);
  pdf.text(
    t.pdfGeneratedOn.replace('{date}', new Date().toLocaleDateString(locale)),
    MARGIN,
    44 + titleLines.length * 22,
  );
  if (descLines.length) {
    pdf.setTextColor(255, 255, 255).setFontSize(10);
    pdf.text(descLines, MARGIN, 44 + titleLines.length * 22 + 16);
  }

  const footer = (data: { pageNumber: number }): void => {
    pdf.setFontSize(8).setFont('helvetica', 'normal').setTextColor(...MUTED);
    pdf.text(
      `Tennis Group Organizer — ${document.title || t.pdfTitleFallback}`,
      MARGIN,
      pageHeight - 22,
    );
    pdf.text(String(data.pageNumber), pageWidth - MARGIN, pageHeight - 22, { align: 'right' });
  };

  let startY = bandHeight + 24;

  // Planning matrix: ✅/❌ drawn as vector glyphs (emoji not available in PDF fonts)
  const playing = new Map<string, boolean>();
  const planHead = [t.dateHeader, ...document.players.map((player) => player.name || '')];
  const planBody = document.gameDates.map((gd, rowIdx) => [
    `${gd.date} (${weekdayFor(locale, new Date(`${gd.date}T00:00:00`))})`,
    ...gd.players.map((slot, colIdx) => {
      playing.set(`${rowIdx}-${colIdx}`, slot.isPlaying);
      return '';
    }),
  ]);

  autoTable(pdf, {
    ...baseStyles(footer),
    startY,
    head: [planHead],
    body: planBody,
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 130, halign: 'left' } },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index === 0) return;
      const isPlaying = playing.get(`${data.row.index}-${data.column.index - 1}`);
      if (isPlaying === undefined) return;
      const cx = data.cell.x + data.cell.width / 2;
      const cy = data.cell.y + data.cell.height / 2;

      // Emoji-styled icon: green circle with white check / red circle with white cross.
      const radius = 5;
      pdf.setFillColor(...(isPlaying ? GREEN : RED));
      pdf.circle(cx, cy, radius, 'F');
      pdf.setDrawColor(255, 255, 255).setLineWidth(1.2).setLineCap('round');
      if (isPlaying) {
        pdf.lines(
          [
            [1.6, 1.6],
            [3.6, -3.7],
          ],
          cx - 2.8,
          cy - 0.2,
        );
      } else {
        pdf.line(cx - 1.8, cy - 1.8, cx + 1.8, cy + 1.8);
        pdf.line(cx - 1.8, cy + 1.8, cx + 1.8, cy - 1.8);
      }
    },
  });
  startY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;

  autoTable(pdf, {
    ...baseStyles(footer),
    startY,
    head: [[t.sectionPlayers, t.columnEmail, t.columnPhone, t.columnGames]],
    body: document.players.map((player) => [
      player.name || '',
      player.email ?? '',
      player.phone ?? '',
      String(player.playCount),
    ]),
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 110 },
      3: { halign: 'center', cellWidth: 50 },
    },
  });
  startY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;

  if (document.replacements.length > 0) {
    autoTable(pdf, {
      ...baseStyles(footer),
      startY,
      head: [[t.sectionReplacements, t.columnEmail, t.columnPhone]],
      body: document.replacements.map((replacement) => [
        replacement.name || '',
        replacement.email ?? '',
        replacement.phone ?? '',
      ]),
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 130 },
      },
    });
  }

  pdf.save(fileName);
};
