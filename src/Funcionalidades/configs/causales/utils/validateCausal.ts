import type { causal, causalErrors } from '../../../../models/database/causal'

export function validate(state: causal): causalErrors {
  const e: causalErrors = {}
  if (!state.id_item) e.id_item = 'Escoja un item'
  if (!state.descripcion) e.descripcion = 'La descripcion es requerida'
  return e
}
