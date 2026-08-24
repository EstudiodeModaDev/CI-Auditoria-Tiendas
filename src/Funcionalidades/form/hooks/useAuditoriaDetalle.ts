import * as React from "react";
import type { AuditoriaDetalleDTO } from "../../../models/components/DTO/auditoriaForm";
import type { item_evaluacion } from "../../../models/database/items_evaluacion";
import { getDetalleItem, syncDetalleWithItems, updateDetalleItem } from "../utils/auditoriaDetalle";

export function useAuditoriaDetalle(
  detalle: AuditoriaDetalleDTO[],
  setDetalle: React.Dispatch<React.SetStateAction<AuditoriaDetalleDTO[]>>,
) {
  const syncWithItems = React.useCallback((itemsEvaluacion: item_evaluacion[]) => {
    setDetalle((current) => syncDetalleWithItems(current, itemsEvaluacion))
  }, [setDetalle])

  const updateItemResult = React.useCallback((itemId: number, patch: Partial<AuditoriaDetalleDTO>) => {
    setDetalle((current) => updateDetalleItem(current, itemId, patch))
  }, [setDetalle])

  const getItemResult = React.useCallback((itemId: number | undefined) => {
    return getDetalleItem(detalle, itemId)
  }, [detalle])

  return {
    syncWithItems,
    updateItemResult,
    getItemResult,
  }
}
