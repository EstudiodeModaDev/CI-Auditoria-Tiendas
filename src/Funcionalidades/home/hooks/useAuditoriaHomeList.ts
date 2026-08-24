import * as React from 'react'
import type { auditoria } from '../../../models/database/auditoria'
import { useRepositories } from '../../../repositories/repositoriesContext'
import type { ZonaTiendaFilter } from '../../shared/useZonaTiendaFilter'
import type { AuditoriaHomeFilters } from './useAuditoriaHomeFilters'

export function useAuditoriaHomeList(filters: AuditoriaHomeFilters, zonaTienda: ZonaTiendaFilter) {
  const repositories = useRepositories()
  const [auditorias, setAuditorias] = React.useState<auditoria[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasNext, setHasNext] = React.useState(false)
  const [total, setTotal] = React.useState(0)

  const loadAuditorias = React.useCallback(async () => {
    setLoading(true)

    const response = await repositories.auditoria?.loadAll({
      paginated: true,
      pageIndex: filters.pageIndex,
      pageSize: filters.pageSize,
      id_auditor: filters.id_auditor ?? undefined,
      id_jefe_zona: filters.id_jefe_zona ?? undefined,
      id_zona: zonaTienda.id_zona ?? undefined,
      id_tienda: zonaTienda.id_tienda ?? undefined,
      modalidad: filters.modalidad || undefined,
      estado_inventario: filters.estado_inventario || undefined,
    })

    if (!response?.status) {
      setError(response?.message ?? 'No fue posible cargar las auditorias.')
      setAuditorias([])
      setHasNext(false)
      setTotal(0)
      setLoading(false)
      return
    }

    setAuditorias(response.data ?? [])
    setHasNext(response.hasNext ?? false)
    setTotal(response.total ?? response.data?.length ?? 0)
    setError(null)
    setLoading(false)
  }, [filters.estado_inventario, filters.id_auditor, filters.id_jefe_zona, filters.modalidad, filters.pageIndex, filters.pageSize, zonaTienda.id_zona, zonaTienda.id_tienda, repositories.auditoria])

  React.useEffect(() => {
    void loadAuditorias()
  }, [loadAuditorias])

  return {
    auditorias,
    loading,
    error,
    hasNext,
    total,
    reload: loadAuditorias,
  }
}
