import type { AuditoriaDetalleDTO, CreateAuditoriaDTO } from "../../../models/components/DTO/auditoriaForm";
import type { auditoria, auditoriaDetalle } from "../../../models/database/auditoria";

const QUALITY_DETAIL_ITEM_ID = 5

export function getComplianceResult(porcentajeCumplimiento: number) {
  if (porcentajeCumplimiento >= 90) {
    return 'Excelente'
  }

  if (porcentajeCumplimiento >= 80) {
    return 'Bueno'
  }

  if (porcentajeCumplimiento >= 70) {
    return 'Regular'
  }

  return 'Critico'
}


//TODO: CUADRAR CALCULO DE RESULTADOS Y PORCENTAJES CON EL BACKEND, YA QUE NO COINCIDEN
export function getQualityResult(netoInventario: number) {
  if (netoInventario <= 5) {
    return {
      porcentaje_calidad: 100,
      resultado_calidad: 'Inventario Ok',
    }
  }

  if (netoInventario <= 10) {
    return {
      porcentaje_calidad: 90,
      resultado_calidad: 'Refuerzo por correo',
    }
  }

  if (netoInventario <= 15) {
    return {
      porcentaje_calidad: 80,
      resultado_calidad: 'Capacitacion individual',
    }
  }

  return {
    porcentaje_calidad: 70,
    resultado_calidad: 'Capacitacion y seguimiento',
  }
}

export function getQualityBaseQuantity(detalle: AuditoriaDetalleDTO[]) {
  const qualityDetail = detalle.find((item) => item.id_item === QUALITY_DETAIL_ITEM_ID)
  return qualityDetail?.cantidad_afectada ?? 0
}

export function buildSubmitAuditoriaDTO(formState: CreateAuditoriaDTO): CreateAuditoriaDTO {
  const detalleRespondido = formState.detalle.filter((detalle) => detalle.cumple !== null)
  const totalItemsCumplidos = detalleRespondido.filter((detalle) => detalle.cumple).length
  const porcentajeCumplimiento = detalleRespondido.length === 0
    ? 0
    : Math.round((totalItemsCumplidos / detalleRespondido.length) * 100)
  const resultado = getComplianceResult(porcentajeCumplimiento)
  const qualityBaseQuantity = getQualityBaseQuantity(formState.detalle)
  const qualityResult = getQualityResult(qualityBaseQuantity)

  return {
    auditoria: {
      ...formState.auditoria,
      total_items_cumplidos: totalItemsCumplidos,
      porcentaje_cumplimiento: porcentajeCumplimiento,
      resultado,
      porcentaje_calidad: qualityResult.porcentaje_calidad,
      resultado_calidad: qualityResult.resultado_calidad,
    },
    detalle: detalleRespondido,
  }
}

export function createAuditoriaPayload(formState: CreateAuditoriaDTO): auditoria {
  const auditoria = formState.auditoria
  
  return {
    estado_inventario: auditoria.estado_inventario ?? '',
    fecha_auditoria: auditoria.fecha_auditoria,
    id_auditor: auditoria.id_auditor,
    id_bodega: auditoria.id_bodega,
    id_causal_cancelacion: auditoria.id_causal_cancelacion,
    id_jefe_zona: auditoria.id_jefe_zona,
    id_tipo_tienda: auditoria.id_tipo_tienda,
    id_tienda: auditoria.id_tienda,
    id_zona: auditoria.id_zona,
    modalidad: auditoria.modalidad,
    observacion_cancelacion: auditoria.observacion_cancelacion ?? '',
    resultado: auditoria.resultado,
    resultado_calidad: auditoria.resultado_calidad,
    sobrantes: auditoria.sobrantes,
    trocados: auditoria.trocados,
    faltantes: auditoria.faltantes,
    estado_tienda: auditoria.estado_tienda,
    neto_inventario: auditoria.neto_inventario,
    porcentaje_calidad: auditoria.porcentaje_calidad,
    porcentaje_cumplimiento: auditoria.porcentaje_cumplimiento,
    total_items_cumplidos: auditoria.total_items_cumplidos
  }
}

export function createAuditoriaDetallePayload(id_auditoria: number, formState: AuditoriaDetalleDTO): auditoriaDetalle {

  return {
    id_auditoria: id_auditoria,
    cantidad_afectada: formState.cantidad_afectada ?? 0,
    cumple: formState.cumple ?? false,
    id_causal: formState.id_causal ? Number( formState.id_causal) : null,
    id_item: formState.id_item,
    observacion: formState.observacion ?? ''
  }
}
