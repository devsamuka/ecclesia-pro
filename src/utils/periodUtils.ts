export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Formats YYYY-MM into readable string e.g. "Julho 2026" or "Julho/2026"
 */
export function formatPeriodLabel(period: string, delimiter: string = ' '): string {
  if (!period || !period.includes('-')) return period;
  const [yearStr, monthStr] = period.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return period;
  return `${MONTH_NAMES_PT[monthIdx]}${delimiter}${year}`;
}

/**
 * Returns previous period YYYY-MM
 */
export function getPrevPeriod(period: string): string {
  const [yearStr, monthStr] = period.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return '2026-07';

  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Returns next period YYYY-MM
 */
export function getNextPeriod(period: string): string {
  const [yearStr, monthStr] = period.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return '2026-07';

  if (month === 12) {
    month = 1;
    year += 1;
  } else {
    month += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Checks if a date string (YYYY-MM-DD or YYYY-MM) falls into period YYYY-MM
 */
export function isDateInPeriod(dateStr: string | undefined, period: string): boolean {
  if (!dateStr || !period) return true;
  return dateStr.startsWith(period);
}

/**
 * Formats a Date object to "DD/MM/AAAA às HH:mm"
 */
export function formatCurrentDateTime(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

/**
 * Identifies the latest transaction date from mock data and formats as "DD/MM/AAAA às HH:mm"
 */
export function getInitialLastUpdatedTimestamp(transactions: Array<{ date: string }>): string {
  if (!transactions || transactions.length === 0) {
    return formatCurrentDateTime(new Date());
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const latestDateStr = sorted[0].date;

  if (latestDateStr) {
    const parts = latestDateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} às 16:45`;
    }
  }

  return formatCurrentDateTime(new Date());
}

