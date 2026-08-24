import * as React from 'react'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'
import { useRepositories } from '../../../repositories/repositoriesContext'

export function useExportCatalog() {
  const repositories = useRepositories()
  const [itemsEvaluacion, setItemsEvaluacion] = React.useState<item_evaluacion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadCatalog = React.useCallback(async () => {
    setLoading(true)

    const response = await repositories.item_evaluacion?.loadOptions({ paginated: false })

    if (!response?.status) {
      setError(response?.message ?? 'No fue posible cargar los items de evaluacion.')
      setItemsEvaluacion([])
      setLoading(false)
      return
    }

    setItemsEvaluacion(response.data ?? [])
    setError(null)
    setLoading(false)
  }, [repositories.item_evaluacion])

  React.useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  return {
    itemsEvaluacion,
    loading,
    error,
    reload: loadCatalog,
  }
}
