export type auditoriaFormDTO = {
  id_auditoria?: number,
  created_at?: number,
  id_zona: number | null,
  id_jefe_zona: number | null,
  id_tienda: number | null,
  id_tipo_tienda: number | null,
  id_auditor: number | null,
  id_causal_cancelacion: number | null,
  id_bodega: number | null
  fecha_auditoria: Date,
  modalidad: string,
  estado_inventario: string,
  observacion_cancelacion: string
  total_items_cumplidos: number
  porcentaje_cumplimiento: number
  resultado: string
  porcentaje_calidad: number
  resultado_calidad: string
  faltantes: number,
  sobrantes: number,
  trocados: number,
  neto_inventario: number,
  estado_tienda: string
}

export type AuditoriaDetalleDTO = {
  id_item: number
  cumple: boolean | null
  observacion: string
  id_causal?: number | null
  cantidad_afectada?: number | null
}

export type CreateAuditoriaDTO = {
  auditoria: auditoriaFormDTO
  detalle: AuditoriaDetalleDTO[]
}