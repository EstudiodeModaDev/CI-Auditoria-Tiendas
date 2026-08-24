import type { AuditoriaDetalleDTO, CreateAuditoriaDTO, auditoriaFormDTO } from "../../../models/components/DTO/auditoriaForm";

export type auditoriaFormErrors = Partial<Record<keyof auditoriaFormDTO, string>>

export type auditoriaDetalleErrors = {
  id_item: number
  errors: Partial<Record<keyof AuditoriaDetalleDTO, string>>
}

export type createAuditoriaErrors = {
  auditoria: auditoriaFormErrors
  detalle: auditoriaDetalleErrors[]
}

export function validateAuditoria(state: CreateAuditoriaDTO): createAuditoriaErrors {
  const auditoriaErrors: auditoriaFormErrors = {}
  const detalleErrors: auditoriaDetalleErrors[] = []

  if (!state.auditoria.id_jefe_zona) auditoriaErrors.id_jefe_zona = 'El jefe de zona es requerido'
  if (!state.auditoria.id_zona) auditoriaErrors.id_zona = 'La zona es requerida'
  if (!state.auditoria.id_tienda) auditoriaErrors.id_tienda = 'La tienda es requerida'
  if (!state.auditoria.id_bodega) auditoriaErrors.id_bodega = 'La bodega es requerida'
  if (!state.auditoria.id_tipo_tienda) auditoriaErrors.id_tipo_tienda = 'El tipo de tienda es requerido'
  if (!state.auditoria.id_auditor) auditoriaErrors.id_auditor = 'El auditor es requerido'
  if (!state.auditoria.modalidad.trim()) auditoriaErrors.modalidad = 'La modalidad es requerida'
  if (!state.auditoria.estado_inventario.trim()) auditoriaErrors.estado_inventario = 'El estado del inventario es requerido'
  if (state.auditoria.estado_inventario === 'Cancelado' && !state.auditoria.id_causal_cancelacion) {
    auditoriaErrors.id_causal_cancelacion = 'La causal de cancelacion es requerida'
  }
  if (state.auditoria.estado_inventario === 'Cancelado' && !state.auditoria.observacion_cancelacion) {
    auditoriaErrors.observacion_cancelacion = 'Las observaciones son requeridas'
  }
  if (!state.auditoria.estado_tienda.trim()) auditoriaErrors.estado_tienda = 'El estado de la tienda es requerido'

  if (!(state.auditoria.fecha_auditoria instanceof Date) || Number.isNaN(state.auditoria.fecha_auditoria.getTime())) {
    auditoriaErrors.fecha_auditoria = 'La fecha de auditoria es invalida'
  }

  state.detalle.forEach((detalle) => {
    const errors: Partial<Record<keyof AuditoriaDetalleDTO, string>> = {}

    if (detalle.cumple === null) {
      errors.cumple = 'Debes indicar si el item cumple o no cumple'
    }

    if (detalle.cumple === false) {
      if (!detalle.observacion.trim()) {
        errors.observacion = 'La observacion es requerida cuando el item no cumple'
      }

      if (detalle.cantidad_afectada != null && detalle.cantidad_afectada < 0) {
        errors.cantidad_afectada = 'La cantidad afectada no puede ser negativa'
      }
    }

    if (Object.keys(errors).length > 0) {
      detalleErrors.push({
        id_item: detalle.id_item,
        errors,
      })
    }
  })

  return {
    auditoria: auditoriaErrors,
    detalle: detalleErrors,
  }
}

export function hasAuditoriaErrors(errors: createAuditoriaErrors) {
  return Object.keys(errors.auditoria).length > 0 || errors.detalle.length > 0
}
