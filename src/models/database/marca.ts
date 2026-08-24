export type marca = {
  id_marca?: number
  created_at?: Date
  nombre: string
  activo: boolean
}

export type marca_errors = Partial<Record<keyof marca, string>>
