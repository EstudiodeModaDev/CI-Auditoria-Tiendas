import * as React from "react";
import type { item_evaluacion } from "../../../models/database/items_evaluacion";
import { useItemEvaluacionList } from "../../configs/item_evaluacion/hooks/useItemEvaluacionList";

export function useItemEvaluacionCatalog() {
  const itemEvaluacionController = useItemEvaluacionList()
  const [itemsEvaluacion, setItemsEvaluacion] = React.useState<item_evaluacion[]>([])
  const [itemsEvaluacionError, setItemsEvaluacionError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const loadItemsEvaluacion = React.useCallback(async () => {
    setLoading(true)

    const response = await itemEvaluacionController.loadItemsEvaluacion('')

    if (!response.ok) {
      setItemsEvaluacionError(response.errorMessage ?? 'No fue posible cargar los items a evaluar.')
      setItemsEvaluacion([])
      setLoading(false)
      return {
        ok: false,
        data: [] as item_evaluacion[],
      }
    }

    setItemsEvaluacion(response.data)
    setItemsEvaluacionError(null)
    setLoading(false)

    return {
      ok: true,
      data: response.data,
    }
  }, [])

  return {
    itemsEvaluacion,
    itemsEvaluacionError,
    loading,
    loadItemsEvaluacion,
  }
}
