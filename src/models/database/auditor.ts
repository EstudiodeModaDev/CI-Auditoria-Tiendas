export type auditor = {
  id_auditor?: number,
  created_at?: Date,
  nombre: string;
  correo: string
  activo: boolean
}

export type auditorErrors = Partial<Record<keyof auditor, string>>;