import * as React from 'react'
import toast from 'react-hot-toast'
import type { areas_responsables } from '../../../models/database/areas_responsables'
import type { auditor } from '../../../models/database/auditor'
import type { bodega } from '../../../models/database/bodega'
import type { causal } from '../../../models/database/causal'
import type { jefe_zona } from '../../../models/database/jefe_zona'
import type { tienda } from '../../../models/database/tienda'
import type { tipo_tienda } from '../../../models/database/tipo_tienda'
import type { zona } from '../../../models/database/zona'
import { buildExportWorkbook } from '../utils/buildWorkbook'
import { downloadWorkbook } from '../utils/downloadWorkbook'
import { enumerateMonthsInRange } from '../utils/monthNames'
import { useExportAuditoriaData } from './useExportAuditoriaData'
import { useExportCatalog } from './useExportCatalog'
import { useExportFilters } from './useExportFilters'
import { useExportPlanAccionData } from './useExportPlanAccionData'

export type UseExportExcelDeps = {
  zonas: zona[]
  jefeZona: jefe_zona[]
  tiendas: tienda[]
  bodegas: bodega[]
  tiposTienda: tipo_tienda[]
  auditores: auditor[]
  causales: causal[]
  areasResponsables: areas_responsables[]
}

export function useExportExcel(deps: UseExportExcelDeps) {
  const filterController = useExportFilters()
  const catalogController = useExportCatalog()
  const dataController = useExportAuditoriaData(filterController.filters)
  const planAccionDataController = useExportPlanAccionData(dataController.auditorias)
  const [exporting, setExporting] = React.useState(false)

  const months = React.useMemo(
    () => enumerateMonthsInRange(filterController.filters.range.from, filterController.filters.range.to),
    [filterController.filters.range.from, filterController.filters.range.to],
  )

  const tiendasFiltradas = React.useMemo(() => {
    return deps.tiendas.filter((tiendaItem) => {
      if (filterController.filters.id_tienda != null && tiendaItem.id_tienda !== filterController.filters.id_tienda) {
        return false
      }

      if (filterController.filters.id_zona != null && tiendaItem.id_zona !== filterController.filters.id_zona) {
        return false
      }

      return true
    })
  }, [deps.tiendas, filterController.filters.id_tienda, filterController.filters.id_zona])

  const handleExport = React.useCallback(async () => {
    if (months.length === 0) {
      toast.error('Selecciona un rango de fechas valido antes de exportar.')
      return
    }

    setExporting(true)

    try {
      const workbook = buildExportWorkbook({
        tiendas: tiendasFiltradas,
        zonas: deps.zonas,
        jefeZona: deps.jefeZona,
        bodegas: deps.bodegas,
        tiposTienda: deps.tiposTienda,
        auditores: deps.auditores,
        causales: deps.causales,
        itemsEvaluacion: catalogController.itemsEvaluacion,
        auditorias: dataController.auditorias,
        detalleByAuditoria: dataController.detalleByAuditoria,
        areasResponsables: deps.areasResponsables,
        planesAccion: planAccionDataController.planes,
        months,
      })

      const primerAnio = months[0].year
      const ultimoAnio = months[months.length - 1].year
      const filename = `Reporte Tiendas ${primerAnio}${ultimoAnio !== primerAnio ? `-${ultimoAnio}` : ''}.xlsx`

      await downloadWorkbook(workbook, filename)
      toast.success('Excel generado correctamente.')
    } catch (error: any) {
      toast.error(error?.message ?? 'No fue posible generar el Excel.')
    } finally {
      setExporting(false)
    }
  }, [
    months,
    tiendasFiltradas,
    deps,
    catalogController.itemsEvaluacion,
    dataController.auditorias,
    dataController.detalleByAuditoria,
    planAccionDataController.planes,
  ])

  return {
    filters: filterController.filters,
    updateFilter: filterController.updateFilter,
    updateRange: filterController.updateRange,
    resetFilters: filterController.resetFilters,
    itemsEvaluacion: catalogController.itemsEvaluacion,
    auditorias: dataController.auditorias,
    planesAccion: planAccionDataController.planes,
    tiendasFiltradas,
    months,
    loading: catalogController.loading || dataController.loading || planAccionDataController.loading,
    exporting,
    error: dataController.error ?? catalogController.error ?? planAccionDataController.error,
    handleExport,
  }
}
