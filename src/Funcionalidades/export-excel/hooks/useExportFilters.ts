import * as React from 'react'
import type { DateRange } from '../../../models/commons'

export type ExportExcelFilters = {
  id_zona: number | null
  id_tienda: number | null
  id_auditor: number | null
  modalidad: string
  range: DateRange
}

function getDefaultRange(): DateRange {
  const today = new Date()
  const from = new Date(today.getFullYear(), 0, 1)

  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  }
}

function getDefaultFilters(): ExportExcelFilters {
  return {
    id_zona: null,
    id_tienda: null,
    id_auditor: null,
    modalidad: '',
    range: getDefaultRange(),
  }
}

export function useExportFilters() {
  const [filters, setFilters] = React.useState<ExportExcelFilters>(getDefaultFilters)

  const updateFilter = React.useCallback(<K extends keyof ExportExcelFilters>(field: K, value: ExportExcelFilters[K]) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }, [])

  const updateRange = React.useCallback((field: keyof DateRange, value: string) => {
    setFilters((current) => ({ ...current, range: { ...current.range, [field]: value } }))
  }, [])

  const resetFilters = React.useCallback(() => {
    setFilters(getDefaultFilters())
  }, [])

  return {
    filters,
    updateFilter,
    updateRange,
    resetFilters,
  }
}
