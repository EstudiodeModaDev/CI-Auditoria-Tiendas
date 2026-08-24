import * as React from 'react'
import type { auditoria, auditoriaDetalle } from '../../../models/database/auditoria'
import { useRepositories } from '../../../repositories/repositoriesContext'
import { mapWithConcurrency } from '../../shared/concurrency'
import type { ExportExcelFilters } from './useExportFilters'

const DETALLE_CONCURRENCY = 6

export function useExportAuditoriaData(filters: ExportExcelFilters) {
  const repositories = useRepositories()
  const [auditorias, setAuditorias] = React.useState<auditoria[]>([])
  const [detalleByAuditoria, setDetalleByAuditoria] = React.useState<Map<number, auditoriaDetalle[]>>(new Map())
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadAuditorias = React.useCallback(async () => {
    setLoading(true)

    const response = await repositories.auditoria.loadAll({
      paginated: false,
      id_zona: filters.id_zona ?? undefined,
      id_tienda: filters.id_tienda ?? undefined,
      id_auditor: filters.id_auditor ?? undefined,
      modalidad: filters.modalidad || undefined,
      range: filters.range,
    })

    if (!response.status) {
      setError(response.message ?? 'No fue posible cargar las auditorias.')
      setAuditorias([])
      setDetalleByAuditoria(new Map())
      setLoading(false)
      return
    }

    const auditoriasEncontradas = response.data ?? []

    const detalles = await mapWithConcurrency(auditoriasEncontradas, DETALLE_CONCURRENCY, async (registro) => {
      if (registro.id_auditoria == null) {
        return [] as auditoriaDetalle[]
      }

      const detalleResponse = await repositories.auditoriaDetalle.load(String(registro.id_auditoria))
      return detalleResponse.data
    })

    const detalleMap = new Map<number, auditoriaDetalle[]>()
    auditoriasEncontradas.forEach((registro, index) => {
      if (registro.id_auditoria == null) {
        return
      }

      detalleMap.set(registro.id_auditoria, detalles[index] ?? [])
    })

    setAuditorias(auditoriasEncontradas)
    setDetalleByAuditoria(detalleMap)
    setError(null)
    setLoading(false)
  }, [filters.id_zona, filters.id_tienda, filters.id_auditor, filters.modalidad, filters.range, repositories.auditoria, repositories.auditoriaDetalle])

  React.useEffect(() => {
    void loadAuditorias()
  }, [loadAuditorias])

  return {
    auditorias,
    detalleByAuditoria,
    loading,
    error,
    reload: loadAuditorias,
  }
}
