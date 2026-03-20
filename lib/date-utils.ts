import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns'

/**
 * Format date as "March 20, 2026"
 */
export function formatDate (date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

/**
 * Format date as "Mar 20"
 */
export function formatDateShort (date: Date): string {
  return format(date, 'MMM d')
}

/**
 * Get today's date as "YYYY-MM-DD"
 */
export function getTodayString (): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Format Date as "YYYY-MM-DD"
 */
export function getDateString (date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse "YYYY-MM-DD" to Date, returns current date if invalid
 */
export function parseDate (dateString: string): Date {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return new Date()
    }
    return date
  } catch {
    return new Date()
  }
}

/**
 * Get start of day for a date (00:00:00)
 */
export function getStartOfDay (date: Date): Date {
  return startOfDay(date)
}

/**
 * Get end of day for a date (23:59:59.999)
 */
export function getEndOfDay (date: Date): Date {
  return endOfDay(date)
}
