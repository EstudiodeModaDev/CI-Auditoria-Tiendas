import * as React from 'react'
import type { causal, causalErrors } from '../../../../models/database/causal'
import { validate } from '../utils/validateCausal'

export function useCausalForm() {
  const [state, setState] = React.useState<causal>({
    activo: true,
    descripcion: '',
    id_item: '',
  })
  const [errors, setErrors] = React.useState<causalErrors>({})
  const setField = <K extends keyof causal>(k: K, v: causal[K]) => setState((s) => ({ ...s, [k]: v }))

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  }

  return {
    state,
    errors,
    isValid,
    setField,
  }
}
