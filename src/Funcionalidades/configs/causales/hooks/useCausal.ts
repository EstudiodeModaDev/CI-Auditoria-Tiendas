import React from 'react'
import toast from 'react-hot-toast'
import type { causal } from '../../../../models/database/causal'
import { useCausalActions } from './useCausalActions'
import { useCausalList } from './useCausalList'
import { validate } from '../utils/validateCausal'

export function useCausal() {
  const list = useCausalList()
  const actions = useCausalActions()
  const [loading, setLoading] = React.useState<boolean>(false)

  const createCausal = async (payload: causal): Promise<boolean> => {
    try {
      setLoading(true)

      if (Object.keys(validate(payload)).length > 0) {
        toast.error('Por favor llene todos los campos obligatorios')
        return false
      }

      const actionResult = await actions.handleCreate(payload)

      if (!actionResult?.ok) {
        toast.error(actionResult.errorMessage)
        return false
      }

      toast.success('Se ha creado con exito la causal')
      return true
    } catch (e: any) {
      toast.error(e ?? 'Algo ha salido mal')
      return false
    } finally {
      setLoading(false)
    }
  }

  const editCausal = async (id: string, payload: causal): Promise<boolean> => {
    try {
      setLoading(true)

      if (Object.keys(validate(payload)).length > 0) {
        toast.error('Por favor llene todos los campos obligatorios')
        return false
      }

      const actionResult = await actions.handleEdit(payload, id)

      if (!actionResult?.ok) {
        toast.error(actionResult.errorMessage)
        return false
      }

      toast.success('Se ha editado con exito la causal')
      return true
    } catch (e: any) {
      toast.error(e ?? 'Algo ha salido mal')
      return false
    } finally {
      setLoading(false)
    }
  }

  const desactivateCausal = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)

      const actionResult = await actions.handleDesactivate(id)

      if (!actionResult?.ok) {
        toast.error(actionResult.errorMessage)
        return false
      }

      toast.success('Se ha desactivado con exito la causal')
      return true
    } catch (e: any) {
      toast.error(e ?? 'Algo ha salido mal')
      return false
    } finally {
      setLoading(false)
    }
  }

  const activateCausal = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)

      const actionResult = await actions.handleActivate(id)

      if (!actionResult?.ok) {
        toast.error(actionResult.errorMessage)
        return false
      }

      toast.success('Se ha activado con exito la causal')
      return true
    } catch (e: any) {
      toast.error(e ?? 'Algo ha salido mal')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    createCausal,
    editCausal,
    desactivateCausal,
    activateCausal,
    loading,
    ...list,
  }
}
