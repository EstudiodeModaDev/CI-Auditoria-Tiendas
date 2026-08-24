export type zona = {
  id_zona?: number,
  created_at?: Date,
  nombre: string;
  activo: boolean
}

export type zonaErrors = Partial<Record<keyof zona, string>>;