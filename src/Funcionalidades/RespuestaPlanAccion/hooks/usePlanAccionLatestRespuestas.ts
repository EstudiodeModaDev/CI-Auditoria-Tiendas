import * as React from "react";
import type { planAccion, planAccionSeguimiento } from "../../../models/database/plan_accion";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { mapWithConcurrency } from "../../shared/concurrency";

const CONCURRENCY = 6

export type PlanAccionConUltimaRespuesta = {
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

export function usePlanAccionLatestRespuestas(planes: planAccion[]) {
  const { planesSeguimientos } = useRepositories()
  const [rows, setRows] = React.useState<PlanAccionConUltimaRespuesta[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (planes.length === 0) {
      setRows([])
      setError(null)
      return
    }

    setLoading(true)

    try {
      const resultados = await mapWithConcurrency(planes, CONCURRENCY, async (plan): Promise<PlanAccionConUltimaRespuesta> => {
        if (plan.id_plan_accion == null) {
          return { plan, ultimaRespuesta: null }
        }

        const response = await planesSeguimientos.loadAll(String(plan.id_plan_accion))

        return {
          plan,
          ultimaRespuesta: getLatestRespuesta(response.data ?? []),
        }
      })

      setRows(resultados)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? "No fue posible cargar la informacion detallada de los planes de accion")
    } finally {
      setLoading(false)
    }
  }, [planes, planesSeguimientos])

  return {
    rows,
    loading,
    error,
    load,
  }
}
