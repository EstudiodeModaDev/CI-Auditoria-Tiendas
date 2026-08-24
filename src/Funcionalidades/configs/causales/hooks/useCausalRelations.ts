import * as React from 'react'
import type { item_evaluacion } from '../../../../models/database/items_evaluacion'
import { useRepositories } from '../../../../repositories/repositoriesContext'

export type CausalSelectOption = {
  value: string
  label: string
}

function mapItemEvaluacionOption(item: item_evaluacion): CausalSelectOption {
  return {
    value: String(item.id_item_evaluacion ?? ''),
    label: item.nombre,
  }
}

export function useCausalRelations() {
  const { item_evaluacion } = useRepositories()
  const [loading, setLoading] = React.useState(false)

  const loadItemOptions = React.useCallback(async (): Promise<{
    ok: boolean
    errorMessage: string | null
    data: CausalSelectOption[]
  }> => {
    try {
      setLoading(true)
      const response = await item_evaluacion?.loadOptions({ paginated: false })

      if (!response?.status) {
        return {
          ok: false,
          errorMessage: response?.message ?? 'No fue posible cargar los items de evaluacion.',
          data: [],
        }
      }

      return {
        ok: true,
        errorMessage: null,
        data: response.data.map(mapItemEvaluacionOption),
      }
    } catch (error: any) {
      return {
        ok: false,
        errorMessage: error?.message ?? 'No fue posible cargar los items de evaluacion.',
        data: [],
      }
    } finally {
      setLoading(false)
    }
  }, [item_evaluacion])

  return {
    loadItemOptions,
    loading,
  }
}
