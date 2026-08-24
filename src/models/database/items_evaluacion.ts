export type item_evaluacion = {
  id_item_evaluacion?: number,
  created_at?: Date,
  nombre: string;
  requiere_causal: boolean
  requiere_cantidad: boolean
  activo: boolean
}

export type item_evaluacion_errors = Partial<Record<keyof item_evaluacion, string>>;