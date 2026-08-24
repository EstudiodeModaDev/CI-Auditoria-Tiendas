import type { auditoriaDetalle } from "../../models/database/auditoria";

export interface AuditoriaDetalleRepository {
  create(payload: Partial<auditoriaDetalle>[]): Promise<{ data: auditoriaDetalle[]; status: boolean; message: string | null }>
  load(idAuditoria: string): Promise<{ data: auditoriaDetalle[]; status: boolean; message: string | null }>
}


