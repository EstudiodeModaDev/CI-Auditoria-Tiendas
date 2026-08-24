import type { attachments } from "../../models/database/attachments";
import { supabase } from "../../services/supabase.service";
import type { AttachmentBridgeFilters, AttachmentBridgeRepository } from "./AttachmentsBridgeRepository";

export class AttachmentBridgeSupabase implements AttachmentBridgeRepository {
  private readonly tableName = "PLAN_ACCION_ATTACHMENTS";

  async createBridge(payload: Partial<attachments>): Promise<{ data: attachments | null; status: boolean; message: string | null; }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          status: false,
          message: error.message,
        }
      }

      return {
        data: data ?? null,
        status: true,
        message: null,
      }
    } catch(e: any){
      return Promise.resolve({
        data: null,
        status: false,
        message: e?.message ?? "Error creando la relación con la evidencia"
      })
    }
  }
  
  async loadRelation(loadArguments: AttachmentBridgeFilters): Promise<{ data: attachments[] | null; status: boolean; message: string | null; }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id_plan_accion", loadArguments.id_plan_accion)

      if (error) {
        return {
          data: null,
          status: false,
          message: error.message,
        }
      }

      return {
        data: data ?? null,
        status: true,
        message: null,
      }

    } catch (error: any) {
      return {
        data: null,
        status: false,
        message: error?.message ?? 'Error cargando el plan de accion',
      }
    }
  }
}