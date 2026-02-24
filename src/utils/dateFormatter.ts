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
