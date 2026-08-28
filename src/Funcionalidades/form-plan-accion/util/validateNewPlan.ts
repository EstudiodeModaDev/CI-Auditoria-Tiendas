import type { planAccion, planesErrors } from "../../../models/database/plan_accion";

export function validateActionPlan(state: planAccion): planesErrors {
  const actionPlanErrors: planesErrors = {}

  if (!state.actividad_correctiva) actionPlanErrors.actividad_correctiva = 'La activadad correctiva es obligatoria'
  if (!state.descripcion_hallazgo) actionPlanErrors.descripcion_hallazgo = 'La descripción es obligatoria'
  if (!state.fecha_compromiso) actionPlanErrors.fecha_compromiso = 'Debe seleccionar la fecha de compromiso'
  //if (!state.id_area_responsable) actionPlanErrors.id_area_responsable = 'Debe seleccionar un área responsable'
  if (!state.id_tienda) actionPlanErrors.id_tienda = 'Debe seleccionar una tienda'
  if (!state.id_zona) actionPlanErrors.id_zona = 'Debe seleccionar una zona'
  if (!state.impacto) actionPlanErrors.impacto = 'Debe seleccionar el impacto de la tarea'
  if (!state.prioridad) actionPlanErrors.prioridad = 'Debe seleccionar la prioridad'
  if (!state.recursos_requeridos) actionPlanErrors.recursos_requeridos = 'Debe indicar que recursos requiere para realizarse'
  if (!state.tipo_hallazgo || state.tipo_hallazgo.length === 0) actionPlanErrors.tipo_hallazgo = 'Debe seleccionar al menos un tipo de hallazgo'

  console.log(actionPlanErrors)

  return actionPlanErrors
}
