export type areas_responsables = {
  id_area_responsable?: number
  nombre: string
  activo: boolean
}

export type areaResponsableErrors = Partial<Record<keyof areas_responsables, string>>;