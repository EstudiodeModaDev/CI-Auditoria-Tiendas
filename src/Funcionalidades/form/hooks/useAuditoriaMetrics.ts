import * as React from "react";
import type { CreateAuditoriaDTO } from "../../../models/components/DTO/auditoriaForm";
import { buildSubmitAuditoriaDTO, getComplianceResult, getQualityBaseQuantity, getQualityResult } from "../utils/auditoriaPayload";

export function useAuditoriaMetrics() {
  const buildSubmitState = React.useCallback((formState: CreateAuditoriaDTO) => {
    return buildSubmitAuditoriaDTO(formState)
  }, [])

  const getCompletionScore = React.useCallback((formState: CreateAuditoriaDTO) => {
    const requiredAuditoriaFields = [
      formState.auditoria.id_jefe_zona,
      formState.auditoria.id_zona,
      formState.auditoria.id_tienda,
      formState.auditoria.id_bodega,
      formState.auditoria.id_tipo_tienda,
      formState.auditoria.id_auditor,
      formState.auditoria.modalidad.trim(),
      formState.auditoria.estado_inventario.trim(),
      formState.auditoria.fecha_auditoria instanceof Date && !Number.isNaN(formState.auditoria.fecha_auditoria.getTime()),
    ]

    const completedAuditoriaFields = requiredAuditoriaFields.filter((value) => Boolean(value)).length
    const answeredItems = formState.detalle.filter((detalle) => detalle.cumple !== null).length
    const totalFields = requiredAuditoriaFields.length + formState.detalle.length
    const completedFields = completedAuditoriaFields + answeredItems

    if (totalFields === 0) {
      return 0
    }

    return Math.round((completedFields / totalFields) * 100)
  }, [])

  const getResultsSummary = React.useCallback((formState: CreateAuditoriaDTO) => {
    const totalItemsEvaluados = formState.detalle.length
    const totalItemsCumplidos = formState.detalle.filter((detalle) => detalle.cumple === true).length
    const porcentajeCumplimiento = totalItemsEvaluados === 0
      ? 0
      : Math.round((totalItemsCumplidos / totalItemsEvaluados) * 100)
    const estadoInventario = formState.auditoria.estado_inventario.trim().toLowerCase()
    const qualityBaseQuantity = getQualityBaseQuantity(formState.detalle)
    const qualityResult = getQualityResult(qualityBaseQuantity)

    return {
      statusLabel: estadoInventario === 'cancelado' ? 'Auditoria cancelada' : 'Auditoria activa',
      statusTone: estadoInventario === 'cancelado' ? 'warning' as const : 'active' as const,
      faltantes: formState.auditoria.faltantes,
      sobrantes: formState.auditoria.sobrantes,
      trocados: formState.auditoria.trocados,
      netoFinal: formState.auditoria.neto_inventario,
      resultado: getComplianceResult(porcentajeCumplimiento),
      porcentajeCalidad: qualityResult.porcentaje_calidad,
      resultadoCalidad: qualityResult.resultado_calidad,
      totalItemsCumplidos,
      totalItemsEvaluados,
      porcentajeCumplimiento,
    }
  }, [])

  return {
    buildSubmitState,
    getCompletionScore,
    getResultsSummary,
  }
}
