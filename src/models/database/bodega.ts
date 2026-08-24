export type bodega = {
  id_bodega?: number,
  created_at?: Date,
  codigo: string;
  codigo_co: string
  activo: boolean
}

export type bodegaErrors = Partial<Record<keyof bodega, string>>;