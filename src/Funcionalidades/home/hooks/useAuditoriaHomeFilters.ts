import * as React from 'react'

export type AuditoriaHomeFilters = {
  id_auditor: number | null
  id_jefe_zona: number | null
  modalidad: string
  estado_inventario: string
  pageIndex: number
  pageSize: number
}

export function useAuditoriaHomeFilters() {
  const [filters, setFilters] = React.useState<AuditoriaHomeFilters>({
    id_auditor: null,
    id_jefe_zona: null,
    modalidad: '',
    estado_inventario: '',
    pageIndex: 1,
    pageSize: 30,
  })

  const updateFilter = React.useCallback(<K extends keyof AuditoriaHomeFilters>(field: K, value: AuditoriaHomeFilters[K]) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      pageIndex: field === 'pageIndex' ? Number(value) : 1,
    }))
  }, [])

  const resetPageIndex = React.useCallback(() => {
    setFilters((current) => ({ ...current, pageIndex: 1 }))
  }, [])

  const resetFilters = React.useCallback(() => {
    setFilters({
      id_auditor: null,
      id_jefe_zona: null,
      modalidad: '',
      estado_inventario: '',
      pageIndex: 1,
      pageSize: 6,
    })
  }, [])

  return {
    filters,
    updateFilter,
    resetPageIndex,
    resetFilters,
  }
}
