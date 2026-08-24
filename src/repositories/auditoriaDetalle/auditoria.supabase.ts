import type { auditoriaDetalle } from "../../models/database/auditoria";
import { supabase } from "../../services/supabase.service";
import type { AuditoriaDetalleRepository } from "./auditoriaDetalle.repository";

export class SupabaseAuditoriaDetalleRepository implements AuditoriaDetalleRepository {
  private readonly tableName = "AUDITORIA_DETALLE"

  async create(payload: Partial<auditoriaDetalle>[]): Promise<{ data: auditoriaDetalle[]; status: boolean; message: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()

      if (error) {
        return {
          data: [],
          status: false,
          message: error.message,
        }
      }

      return {
        data: data ?? [],
        status: true,
        message: null,
      }
    } catch (error: any) {
      return {
        data: [],
        status: false,
        message: error?.message ?? 'Error creando el detalle de auditoria',
      }
    }
  }

  async load(idAuditoria: string): Promise<{ data: auditoriaDetalle[]; status: boolean; message: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id_auditoria", idAuditoria)

      if (error) {
        return {
          data: [],
          status: false,
          message: error.message,
        }
      }

      return {
        data: data ?? [],
        status: true,
        message: null,
      }
    } catch (error: any) {
      return {
        data: [],
        status: false,
        message: error?.message ?? 'Error cargando el detalle de auditoria',
      }
    }
  }
}