import * as React from 'react'
import type { auditoria, auditoriaDetalle } from '../../../models/database/auditoria'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'
import { useRepositories } from '../../../repositories/repositoriesContext'
import { mapWithConcurrency } from '../../shared/concurrency'

const DETALLE_CONCURRENCY = 6

export function usePanelCumplimientoData() {
  const repositories = useRepositories()
  const [auditorias, setAuditorias] = React.useState<auditoria[]>([])
  const [detalleByAuditoria, setDetalleByAuditoria] = React.useState<Map<number, auditoriaDetalle[]>>(new Map())
  const [itemsEvaluacion, setItemsEvaluacion] = React.useState<item_evaluacion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    setLoading(true)

    const [auditoriasResponse, itemsResponse] = await Promise.all([
      repositories.auditoria.loadAll({ paginated: false }),
      repositories.item_evaluacion?.loadOptions({ paginated: false }),
    ])

    if (!auditoriasResponse.status) {
      setError(auditoriasResponse.message ?? 'No fue posible cargar las auditorias.')
      setAuditorias([])
      setDetalleByAuditoria(new Map())
      setItemsEvaluacion([])
      setLoading(false)
      return
    }

    const auditoriasEncontradas = auditoriasResponse.data ?? []

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
    setItemsEvaluacion(itemsResponse?.data ?? [])
    setError(itemsResponse?.status === false ? itemsResponse.message ?? 'No fue posible cargar los items de evaluacion.' : null)
    setLoading(false)
  }, [repositories.auditoria, repositories.auditoriaDetalle, repositories.item_evaluacion])

  React.useEffect(() => {
    void loadData()
  }, [loadData])

  return {
    auditorias,
    detalleByAuditoria,
    itemsEvaluacion,
    loading,
    error,
    reload: loadData,
  }
}
