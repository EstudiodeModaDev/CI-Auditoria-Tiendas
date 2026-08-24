import * as React from 'react'
import type { tienda } from '../../../models/database/tienda'
import type { zona } from '../../../models/database/zona'
import type { ZonaTiendaFilter } from '../../shared/useZonaTiendaFilter'
import { buildStoreCompliance } from '../utils/complianceAggregation'
import { usePanelCumplimientoData } from './usePanelCumplimientoData'

const BEST_POOL_SIZE = 6

export type UsePanelCumplimientoDeps = {
  tiendas: tienda[]
  zonas: zona[]
  filters: ZonaTiendaFilter
}

export function usePanelCumplimiento(deps: UsePanelCumplimientoDeps) {
  const dataController = usePanelCumplimientoData()

  const storeCompliance = React.useMemo(() => buildStoreCompliance({
    tiendas: deps.tiendas,
    zonas: deps.zonas,
    itemsEvaluacion: dataController.itemsEvaluacion,
    auditorias: dataController.auditorias,
    detalleByAuditoria: dataController.detalleByAuditoria,
  }), [deps.tiendas, deps.zonas, dataController.itemsEvaluacion, dataController.auditorias, dataController.detalleByAuditoria])

  const pool = React.useMemo(
    () => storeCompliance.filter((store) => deps.filters.id_zona == null || store.id_zona === deps.filters.id_zona),
    [storeCompliance, deps.filters.id_zona],
  )

  const heroStore = React.useMemo(() => {
    if (pool.length === 0) {
      return null
    }

    return pool.reduce((peor, actual) => (actual.pct < peor.pct ? actual : peor), pool[0])
  }, [pool])

  const worstPool = React.useMemo(
    () => pool.filter((store) => store.critico).sort((a, b) => a.pct - b.pct),
    [pool],
  )

  const bestPool = React.useMemo(
    () => [...pool].sort((a, b) => b.pct - a.pct).slice(0, BEST_POOL_SIZE),
    [pool],
  )

  const selectedStore = React.useMemo(
    () => storeCompliance.find((store) => store.id_tienda === deps.filters.id_tienda) ?? null,
    [storeCompliance, deps.filters.id_tienda],
  )

  return {
    pool,
    heroStore,
    worstPool,
    bestPool,
    selectedStore,
    loading: dataController.loading,
    error: dataController.error,
  }
}
