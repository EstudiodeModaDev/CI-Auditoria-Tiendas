export type jefe_zona = {
  id_jefe_zona?: number,
  created_at?: Date,
  nombre: string;
  correo: string
  activo: boolean
}

export type jefe_zonaErrors = Partial<Record<keyof jefe_zona, string>>;