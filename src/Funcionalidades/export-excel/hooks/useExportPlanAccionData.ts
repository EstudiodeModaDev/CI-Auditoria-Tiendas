import * as React from 'react'
import type { auditoria } from '../../../models/database/auditoria'
import type { planAccion, planAccionSeguimiento } from '../../../models/database/plan_accion'
import { useRepositories } from '../../../repositories/repositoriesContext'
import { mapWithConcurrency } from '../../shared/concurrency'

const CONCURRENCY = 6

export type PlanAccionExportRow = {
  plan: planAccion
  ultimaRespuesta: planAccionSeguimiento | null
}

function getLatestRespuesta(respuestas: planAccionSeguimiento[]): planAccionSeguimiento | null {
  return respuestas.reduce<planAccionSeguimiento | null>((latest, current) => {
    if (!latest) {
      return current
    }

    const fechaActual = new Date(latest.fecha_seguimiento).getTime()
    const fechaCandidata = new Date(current.fecha_seguimiento).getTime()

    return fechaCandidata >= fechaActual ? current : latest
  }, null)
}

export function useExportPlanAccionData(auditorias: auditoria[]) {
  const repositories = useRepositories()
  const [planes, setPlanes] = React.useState<PlanAccionExportRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadPlanes = React.useCallback(async () => {
    const auditoriaIds = auditorias
      .map((registro) => registro.id_auditoria)
      .filter((id): id is number => id != null)

    if (auditoriaIds.length === 0) {
      setPlanes([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const planesPorAuditoria = await mapWithConcurrency(auditoriaIds, CONCURRENCY, async (id_auditoria) => {
      const response = await repositories.planAccion.loadAll({
        id_auditoria,
        paginated: false,
        range: { from: null, to: null },
      })

      return response.data ?? []
    })

    const todosLosPlanes = planesPorAuditoria.flat()

    const filas = await mapWithConcurrency(todosLosPlanes, CONCURRENCY, async (plan): Promise<PlanAccionExportRow> => {
      if (plan.id_plan_accion == null) {
        return { plan, ultimaRespuesta: null }
      }

      const response = await repositories.planesSeguimientos.loadAll(String(plan.id_plan_accion))

      return {
        plan,
        ultimaRespuesta: getLatestRespuesta(response.data ?? []),
      }
    })

    setPlanes(filas)
    setError(null)
    setLoading(false)
  }, [auditorias, repositories.planAccion, repositories.planesSeguimientos])

  React.useEffect(() => {
    void loadPlanes()
  }, [loadPlanes])

  return {
    planes,
    loading,
    error,
    reload: loadPlanes,
  }
}
