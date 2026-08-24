export type tienda = {
  id_tienda?: number,
  created_at?: Date,
  nombre: string;
  correo_tienda: string
  activo: boolean
  id_zona:number | null,
  id_marca:number | null
  id_tipo_tienda:number | null,
  id_bodega: number | null
  id_jefe_zona: number | null
}

export type tienda_errors = Partial<Record<keyof tienda, string>>;