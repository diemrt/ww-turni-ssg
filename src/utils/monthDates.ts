// Pure utilities to derive shift dates and titles from a "YYYY-MM" month string.
// Dates are built with new Date(year, monthIndex, day) and formatted manually
// (never via toISOString()) to avoid timezone-related off-by-one-day shifts.

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const ITALIAN_MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
] as const;

const pad2 = (n: number): string => n.toString().padStart(2, '0');

/**
 * Parses a "YYYY-MM" string into its numeric year and zero-based month index.
 */
const parseMonth = (month: string): { year: number; monthIndex: number } => {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  return { year, monthIndex };
};

/**
 * Formats a year/monthIndex/day triple as "YYYY-MM-DD" without going through
 * any Date-to-string conversion that could be affected by timezone.
 */
const toDateString = (year: number, monthIndex: number, day: number): string =>
  `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;

/**
 * Returns the ordered list of "YYYY-MM-DD" dates in the given month
 * ("YYYY-MM") whose weekday name (e.g. "Friday") is included in
 * validDayOfWeek.
 */
export const monthDates = (month: string, validDayOfWeek: string[]): string[] => {
  const { year, monthIndex } = parseMonth(month);
  const validSet = new Set(validDayOfWeek);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const weekday = WEEKDAY_NAMES[new Date(year, monthIndex, day).getDay()];
    if (validSet.has(weekday)) {
      dates.push(toDateString(year, monthIndex, day));
    }
  }

  return dates;
};

/**
 * Builds the Italian shift title for a month, e.g. "2026-06" -> "Turni di Giugno 2026".
 */
export const monthTitle = (month: string): string => {
  const { year, monthIndex } = parseMonth(month);
  return `Turni di ${ITALIAN_MONTHS[monthIndex]} ${year}`;
};
