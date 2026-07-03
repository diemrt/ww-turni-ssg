/**
 * Returns today's date as a local "YYYY-MM-DD" string (never via
 * toISOString(), which converts to UTC and can shift the day depending on
 * the viewer's timezone). Shift dates in turni.json use this same format,
 * so callers can compare today against `shift.date` with plain string
 * comparison (`===`, `<`, `>=`) instead of constructing Date objects.
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (dateString: string): { dayName: string; dayNumber: string; monthName: string } => {
  const date = new Date(dateString);
  
  const italianDays = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const italianMonths = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                         'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  
  const dayName = italianDays[date.getDay()];
  const dayNumber = date.getDate().toString();
  const monthName = italianMonths[date.getMonth()];
  
  return {
    dayName,
    dayNumber,
    monthName
  };
};
