// Utility functions for formatting and date calculations

// Format number as Brazilian Real currency
export function moneyBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Convert date input to ISO string (uses midday to avoid timezone issues)
export function toISODate(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  // Set to midday to avoid timezone edge cases
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

// Get date at start of day (00:00:00) - returns Date object
export function startOfDay(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Get date at end of day (23:59:59.999) - returns Date object
export function endOfDay(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

// Parse YYYY-MM-DD string to Date (local timezone)
export function parseYYYYMMDDToDate(dateStr) {
  if (!dateStr) return null
  // Use local timezone by creating date with explicit time
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Format Date to Brazilian format (DD/MM/YYYY)
export function formatDateBR(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Format time from HH:MM to display format
export function formatTime(time) {
  if (!time) return ''
  return time
}

// Check if date is between start and end (inclusive)
export function isBetweenInclusive(date, start, end) {
  const d = new Date(date).getTime()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return d >= s && d <= e
}

// Calculate full days between two dates (ignoring time)
export function daysBetween(fromIso, toIso) {
  const from = startOfDay(fromIso)
  const to = startOfDay(toIso)
  const diffMs = to - from
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// Check if date is within last N days (inclusive)
export function isWithinLastDays(dateIso, days) {
  if (!dateIso) return false
  const daysDiff = daysBetween(dateIso, new Date().toISOString())
  return daysDiff >= 0 && daysDiff <= days
}

// Get date string for input[type="date"] (YYYY-MM-DD)
export function toDateInputValue(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Filter appointments by date range (inclusive)
export function filterAppointmentsByRange(appointments, startDate, endDate) {
  const start = startOfDay(startDate).getTime()
  const end = endOfDay(endDate).getTime()
  
  return appointments.filter((apt) => {
    const aptTime = new Date(apt.dateAt).getTime()
    return aptTime >= start && aptTime <= end
  })
}

// Format relative time (e.g., "2h atrás", "3 dias atrás")
export function formatRelativeTime(isoDate) {
  if (!isoDate) return ''
  
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'agora'
  } else if (diffMin < 60) {
    return `${diffMin}min atrás`
  } else if (diffHour < 24) {
    return `${diffHour}h atrás`
  } else if (diffDay === 1) {
    return 'ontem'
  } else if (diffDay < 7) {
    return `${diffDay} dias atrás`
  } else {
    return formatDateBR(date)
  }
}

// Get current time as HH:MM string
export function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
