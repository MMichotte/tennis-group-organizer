type DateLike = { toDate(): Date };

const asDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as DateLike).toDate === 'function'
  ) {
    return (value as DateLike).toDate();
  }
  return new Date(String(value));
};

/** Normalizes a Date, date-like object (e.g. DateObject) or string to a Date. */
export const toDate = (value: unknown): Date => asDate(value);

/** Local date key (YYYY-MM-DD) — avoids the UTC shift of toISOString(). */
export const toDateKey = (value: unknown): string => {
  const d = asDate(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Full weekday name (e.g. "Monday") for a YYYY-MM-DD date key. */
export const toWeekdayName = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return WEEKDAYS[date.getDay()];
};
