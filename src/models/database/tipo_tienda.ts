export type tipo_tienda = {
  id_tipo_tienda?: number,
  created_at?: Date,
  nombre: string;
  activo: boolean
}

export type tipo_tienda_errors = Partial<Record<keyof tipo_tienda, string>>;