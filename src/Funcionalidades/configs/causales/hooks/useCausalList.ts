import * as React from 'react'
import type { causal } from '../../../../models/database/causal'
import type { configurationsFilter } from '../../../../repositories/configurations/configuration.repository'
import { useRepositories } from '../../../../repositories/repositoriesContext'

export function useCausalList() {
  const { causales } = useRepositories()
  const [causalRows, setCausalRows] = React.useState<causal[]>([])

  const loadCausales = async (
    search: string,
  ): Promise<{ ok: boolean; errorMessage: string | null; data: causal[] }> => {
    try {
      const filter: configurationsFilter = {
        paginated: false,
        nombre: search,
      }
      const response = await causales?.loadOptions(filter)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? 'Algo ha salido mal cargando las causales',
          ok: false,
          data: [],
        }
      }

      setCausalRows(response.data)
      return {
        errorMessage: null,
        ok: true,
        data: response.data,
      }
    } catch (e: any) {
      return {
        errorMessage: e,
        ok: false,
        data: [],
      }
    }
  }

  const loadCausal = async (
    id: string,
  ): Promise<{ ok: boolean; errorMessage: string | null; data: causal | null }> => {
    try {
      const response = await causales?.getById(id)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? 'Algo ha salido mal cargando la causal',
          ok: false,
          data: null,
        }
      }

      return {
        errorMessage: null,
        ok: true,
        data: response.data,
      }
    } catch (e: any) {
      return {
        errorMessage: e,
        ok: false,
        data: null,
      }
    }
  }

  return {
    loadCausales,
    loadCausal,
    causalRows,
  }
}
