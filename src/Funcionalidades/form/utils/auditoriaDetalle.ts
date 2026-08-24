import type { AuditoriaDetalleDTO } from "../../../models/components/DTO/auditoriaForm";
import type { item_evaluacion } from "../../../models/database/items_evaluacion";

export function createDetalleState(itemId: number): AuditoriaDetalleDTO {
  return {
    id_item: itemId,
    cumple: null,
    observacion: '',
    id_causal: null,
    cantidad_afectada: null,
  }
}

export function syncDetalleWithItems(
  detalleActual: AuditoriaDetalleDTO[],
  itemsEvaluacion: item_evaluacion[],
) {
  const detalleMap = new Map(detalleActual.map((detalle) => [detalle.id_item, detalle]))

  return itemsEvaluacion.flatMap((item) => {
    if (item.id_item_evaluacion == null) {
      return []
    }

    return [detalleMap.get(item.id_item_evaluacion) ?? createDetalleState(item.id_item_evaluacion)]
  })
}

export function updateDetalleItem(
  detalleActual: AuditoriaDetalleDTO[],
  itemId: number,
  patch: Partial<AuditoriaDetalleDTO>,
) {
  return detalleActual.map((detalle) => {
    if (detalle.id_item !== itemId) {
      return detalle
    }

    const nextDetalle: AuditoriaDetalleDTO = {
      ...detalle,
      ...patch,
    }

    if (nextDetalle.cumple === true) {
      nextDetalle.observacion = ''
      nextDetalle.id_causal = null
      nextDetalle.cantidad_afectada = null
    }

    return nextDetalle
  })
}

export function getDetalleItem(
  detalleActual: AuditoriaDetalleDTO[],
  itemId: number | undefined,
) {
  if (itemId == null) {
    return null
  }

  return detalleActual.find((detalle) => detalle.id_item === itemId) ?? createDetalleState(itemId)
}
