export type planAccion = {
  id_plan_accion?: number,
  id_auditoria: number | null,
  tipo_hallazgo: string,
  id_zona: number | null,
  id_tienda: number | null,
  id_area_responsable: number | null,
  responsable: string,
  descripcion_hallazgo: string,
  impacto: string,
  actividad_correctiva: string,
  fecha_creacion: string,
  fecha_compromiso: string,
  prioridad: string,
  recursos_requeridos: string,
  estado: string,
  porcentaje_avance: number,
  correo_responsable: string
}

export type planesErrors = Partial<Record<keyof planAccion, string>>


export type planAccionSeguimiento = {
  id_seguimiento?: number
  fecha_seguimiento: Date,
  id_plan_accion: number,
  usuario: string,
  comentario: string
}

export type planAccionSeguimientoErrors = Partial<Record<keyof planAccionSeguimiento, string>>
