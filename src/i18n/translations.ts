export const LOCALES = ['en', 'fr', 'nl'] as const;
export type Locale = (typeof LOCALES)[number];

const en = {
  titlePlaceholder: 'Title *',
  addDescription: 'Add description',
  descriptionTitle: 'Description',
  descriptionPlaceholder: 'Free text description (optional)',
  cancel: 'Cancel',
  save: 'Save',
  playDates: 'Play dates :',
  panelDates: 'Dates',
  playersPerGame: 'N° of players/game :',
  players: 'Players :',
  playerName: "Player's name",
  excludeDates: 'Exclude dates',
  emailOptional: 'Email (optional)',
  phoneOptional: 'Phone (optional)',
  contactDetails: 'Contact details',
  replacements: 'Replacements',
  namePlaceholder: 'Name',
  replacementsHint: 'Not included in the planning — available as a spare list.',
  generatePlanning: 'Generate Planning',
  exportExcel: 'Export to Excel',
  exportPdf: 'Export to PDF',
  importPlanning: 'Import Planning',
  planning: 'Planning',
  dateHeader: 'Date',
  sectionPlayers: 'Players',
  sectionReplacements: 'Replacements',
  columnName: 'Name',
  columnEmail: 'Email',
  columnPhone: 'Phone',
  columnGames: 'Games',
  pdfGeneratedOn: 'Generated on {date}',
  pdfTitleFallback: 'Tennis Planning',
  toastUniqueNames: 'Player names must be unique.',
  toastExportExcelError: 'Could not export the planning to Excel.',
  toastExportPdfError: 'Could not export the planning to PDF.',
  toastImportError:
    'Could not import the file. Use a planning exported by this app (Excel/CSV). {message}',
  toastImportSuccess: 'Imported {dates} dates for {players} players.',
  warningNotEnough:
    'Not enough available players for {date} - {scheduled}/{requested} scheduled',
  errorNoSheet: 'File contains no sheet',
  errorUnrecognizedFormat:
    'Unrecognized format: expected a "Date" column followed by player columns',
  errorDuplicateNames: 'Duplicate player names in the file',
  errorNoPlayDates: 'No play dates found in the file',
  errorMalformedDates:
    'Unrecognized date format for: {dates} (expected YYYY-MM-DD)',
} as const;

export type MessageKey = keyof typeof en;

const fr: Record<MessageKey, string> = {
  titlePlaceholder: 'Titre *',
  addDescription: 'Ajouter une description',
  descriptionTitle: 'Description',
  descriptionPlaceholder: 'Description libre (facultatif)',
  cancel: 'Annuler',
  save: 'Enregistrer',
  playDates: 'Dates de jeu :',
  panelDates: 'Dates',
  playersPerGame: 'N° de joueurs/partie :',
  players: 'Joueurs :',
  playerName: "Nom du joueur",
  excludeDates: "Dates d'exclusion",
  emailOptional: 'Email (facultatif)',
  phoneOptional: 'Téléphone (facultatif)',
  contactDetails: 'Détails de contact',
  replacements: 'Remplaçants',
  namePlaceholder: 'Nom',
  replacementsHint:
    'Non inclus dans le planning — liste de réserve.',
  generatePlanning: 'Générer le planning',
  exportExcel: 'Exporter vers Excel',
  exportPdf: 'Exporter vers PDF',
  importPlanning: 'Importer un planning',
  planning: 'Planning',
  dateHeader: 'Date',
  sectionPlayers: 'Joueurs',
  sectionReplacements: 'Remplaçants',
  columnName: 'Nom',
  columnEmail: 'Email',
  columnPhone: 'Téléphone',
  columnGames: 'Parties',
  pdfGeneratedOn: 'Généré le {date}',
  pdfTitleFallback: 'Planning de tennis',
  toastUniqueNames: 'Les noms des joueurs doivent être uniques.',
  toastExportExcelError: "Impossible d'exporter le planning vers Excel.",
  toastExportPdfError: "Impossible d'exporter le planning vers PDF.",
  toastImportError:
    "Impossible d'importer le fichier. Utilisez un planning exporté depuis cette appli (Excel/CSV). {message}",
  toastImportSuccess: "{dates} dates importées pour {players} joueurs.",
  warningNotEnough:
    "Pas assez de joueurs disponibles pour le {date} — {scheduled}/{requested} programmés",
  errorNoSheet: 'Le fichier ne contient aucune feuille de calcul',
  errorUnrecognizedFormat:
    'Format non reconnu : une colonne « Date » suivie des colonnes de joueurs est attendue',
  errorDuplicateNames: 'Noms de joueurs dupliqués dans le fichier',
  errorNoPlayDates: 'Aucune date de jeu trouvée dans le fichier',
  errorMalformedDates:
    'Format de date non reconnu pour : {dates} (attendu AAAA-MM-JJ)',
};

const nl: Record<MessageKey, string> = {
  titlePlaceholder: 'Titel *',
  addDescription: 'Beschrijving toevoegen',
  descriptionTitle: 'Beschrijving',
  descriptionPlaceholder: 'Vrije tekst (optioneel)',
  cancel: 'Annuleren',
  save: 'Opslaan',
  playDates: 'Speeldagen :',
  panelDates: 'Datums',
  playersPerGame: 'Aantal spelers/wedstrijd :',
  players: 'Spelers :',
  playerName: 'Naam van speler',
  excludeDates: 'Uitsluitingsdata',
  emailOptional: 'E-mail (optioneel)',
  phoneOptional: 'Telefoon (optioneel)',
  contactDetails: 'Contactgegevens',
  replacements: 'Vervangers',
  namePlaceholder: 'Naam',
  replacementsHint: 'Niet in de planning — reserve lijst.',
  generatePlanning: 'Planning genereren',
  exportExcel: 'Exporteren naar Excel',
  exportPdf: 'Exporteren naar PDF',
  importPlanning: 'Planning importeren',
  planning: 'Planning',
  dateHeader: 'Datum',
  sectionPlayers: 'Spelers',
  sectionReplacements: 'Vervangers',
  columnName: 'Naam',
  columnEmail: 'E-mail',
  columnPhone: 'Telefoon',
  columnGames: 'Wedstrijden',
  pdfGeneratedOn: 'Gegenereerd op {date}',
  pdfTitleFallback: 'Tennisplanning',
  toastUniqueNames: 'Spelersnamen moeten uniek zijn.',
  toastExportExcelError: 'Planning kon niet naar Excel worden geëxporteerd.',
  toastExportPdfError: 'Planning kon niet naar PDF worden geëxporteerd.',
  toastImportError:
    'Bestand kon niet worden geïmporteerd. Gebruik een planning die door deze app is geëxporteerd (Excel/CSV). {message}',
  toastImportSuccess: '{dates} datums geïmporteerd voor {players} spelers.',
  warningNotEnough:
    'Niet genoeg beschikbare spelers voor {date} - {scheduled}/{requested} ingepland',
  errorNoSheet: 'Het bestand bevat geen werkblad',
  errorUnrecognizedFormat:
    'Herkenbaar formaat: verwacht een "Datum"-kolom gevolgd door spelerskolommen',
  errorDuplicateNames: 'Dubbele spelersnamen in het bestand',
  errorNoPlayDates: 'Geen speeldatums in het bestand',
  errorMalformedDates:
    'Onbekend datumformaat voor: {dates} (verwacht JJJJ-MM-DD)',
};

export const translations: Record<Locale, Record<MessageKey, string>> = {
  en,
  fr,
  nl,
};

/** Full weekday names indexed by getDay() (0 = Sunday). */
export const weekDays: Record<Locale, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  nl: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
};

export const weekdayFor = (locale: Locale, date: Date): string =>
  weekDays[locale][date.getDay()];

/** Localized section/header markers used by the Excel/CSV import & export. */
export const markersFor = (locale: Locale) => ({
  date: translations[locale].dateHeader,
  players: translations[locale].sectionPlayers,
  replacements: translations[locale].sectionReplacements,
});
