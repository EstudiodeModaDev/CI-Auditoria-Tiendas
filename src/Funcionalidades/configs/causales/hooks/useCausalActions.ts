import type { causal } from '../../../../models/database/causal'
import { useRepositories } from '../../../../repositories/repositoriesContext'

export function useCausalActions() {
  const { causales } = useRepositories()

  const handleCreate = async (payload: causal): Promise<{ ok: boolean; errorMessage: string | null }> => {
    try {
      const response = await causales?.createOption(payload)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? 'Algo salio mal',
          ok: false,
        }
      }

      return {
        errorMessage: null,
        ok: true,
      }
    } catch (e: any) {
      return {
        errorMessage: e,
        ok: false,
      }
    }
  }

  const handleEdit = async (
    payload: Partial<causal>,
    id: string,
  ): Promise<{ ok: boolean; errorMessage: string | null }> => {
    try {
      const response = await causales?.updateOption(id, payload)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? 'Algo salio mal',
          ok: false,
        }
      }

      return {
        errorMessage: null,
        ok: true,
      }
    } catch (e: any) {
      return {
        errorMessage: e,
        ok: false,
      }
    }
  }

  const handleDesactivate = async (id: string): Promise<{ ok: boolean; errorMessage: string | null }> => {
    try {
      const response = await causales?.inactivateOption(id)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? 'Algo salio mal',
          ok: false,
        }
      }

      return {
        errorMessage: null,
        ok: true,
      }
    } catch (e: any) {
      return {
        errorMessage: e,
        ok: false,
      }
    }
  }

  const handleActivate = async (id: string): Promise<{ ok: boolean; errorMessage: string | null }> => {
    try {
      const response = await causales?.activateOption(id)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? 'Algo salio mal',
          ok: false,
        }
      }

      return {
        errorMessage: null,
        ok: true,
      }
    } catch (e: any) {
      return {
        errorMessage: e,
        ok: false,
      }
    }
  }

  return {
    handleEdit,
    handleCreate,
    handleDesactivate,
    handleActivate,
  }
}
