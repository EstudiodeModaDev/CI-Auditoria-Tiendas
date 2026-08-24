export type attachments= {
  id?: number
  id_plan_accion: number,
  path: string,
  bucket: string,
  attachment_name: string
}

export type SeguimientosAttachments= {
  id?: number
  id_plan_seguimiento: number | null,
  path: string,
  bucket: string,
  attachment_name: string
}
