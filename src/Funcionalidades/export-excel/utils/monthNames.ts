export const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export type MonthKey = {
  month: number
  year: number
  label: string
  sheetName: string
}

export function getMonthLabel(month: number) {
  return MESES_ES[month - 1] ?? ''
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function isInMonth(date: Date | null, month: number, year: number) {
  if (!date) {
    return false
  }

  return date.getMonth() + 1 === month && date.getFullYear() === year
}

export function enumerateMonthsInRange(from: string | Date | null, to: string | Date | null): MonthKey[] {
  const start = toDate(from)
  const end = toDate(to)

  if (!start || !end || start > end) {
    return []
  }

  const multiYear = start.getFullYear() !== end.getFullYear()
  const months: MonthKey[] = []
  let year = start.getFullYear()
  let month = start.getMonth() + 1

  while (year < end.getFullYear() || (year === end.getFullYear() && month <= end.getMonth() + 1)) {
    months.push({
      month,
      year,
      label: getMonthLabel(month),
      sheetName: multiYear ? `${String(month).padStart(2, '0')}-${year}` : String(month).padStart(2, '0'),
    })

    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}
