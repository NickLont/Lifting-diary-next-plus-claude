import { format, parseISO, isValid, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

/**
 * Format date as "March 20, 2026"
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy')
}

/**
 * Format date as "Mar 20"
 */
export const formatDateShort = (date: Date): string => {
  return format(date, 'MMM d')
}

/**
 * Get today's date as "YYYY-MM-DD"
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Format Date as "YYYY-MM-DD"
 */
export const getDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse "YYYY-MM-DD" to Date, returns current date if invalid
 */
export const parseDate = (dateString: string): Date => {
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
export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date)
}

/**
 * Get end of day for a date (23:59:59.999)
 */
export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date)
}

export const getStartOfMonth = (date: Date): Date => startOfMonth(date)

export const getEndOfMonth = (date: Date): Date => endOfMonth(date)
