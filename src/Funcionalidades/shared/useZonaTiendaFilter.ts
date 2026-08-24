import * as React from 'react'
import type { tienda } from '../../models/database/tienda'

export type ZonaTiendaFilter = {
  id_zona: number | null
  id_tienda: number | null
}

export function useZonaTiendaFilter(tiendas: tienda[]) {
  const [filters, setFilters] = React.useState<ZonaTiendaFilter>({ id_zona: null, id_tienda: null })

  const updateZona = React.useCallback((id_zona: number | null) => {
    setFilters((current) => {
      const tiendaSigueValida = current.id_tienda != null
        && tiendas.some((item) => item.id_tienda === current.id_tienda && (id_zona == null || item.id_zona === id_zona))

      return { id_zona, id_tienda: tiendaSigueValida ? current.id_tienda : null }
    })
  }, [tiendas])

  const updateTienda = React.useCallback((id_tienda: number | null) => {
    setFilters((current) => ({ ...current, id_tienda }))
  }, [])

  const resetFilters = React.useCallback(() => {
    setFilters({ id_zona: null, id_tienda: null })
  }, [])

  const tiendasDisponibles = React.useMemo(() => {
    if (filters.id_zona == null) {
      return tiendas
    }

    return tiendas.filter((item) => item.id_zona === filters.id_zona)
  }, [tiendas, filters.id_zona])

  return { filters, updateZona, updateTienda, resetFilters, tiendasDisponibles }
}
