import type { planAccionSeguimiento } from "../../models/database/plan_accion";
import { supabase } from "../../services/supabase.service";
import type { PlanAccionRespuestaRepository, PlanSeguimientoResult } from "./plan_seguimiento_repository";

export class PlanAccionSeguimientoSupabase implements PlanAccionRespuestaRepository {
  private readonly tableName = "PLAN_SEGUMIENTO";
  
  async create(payload: Partial<planAccionSeguimiento>): Promise<{ data: planAccionSeguimiento | null; status: boolean; message: string | null; }> {
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
        message: e?.message ?? "Error creando el seguimiento"
      })
    }
  }
  
  async load(id: string): Promise<{ data: planAccionSeguimiento | null; status: boolean; message: string | null; }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id_seguimiento", id)
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

    } catch (error: any) {
      return {
        data: null,
        status: false,
        message: error?.message ?? 'Error cargando el seguimiento del plan de acción',
      }
    }
  }
  
  async loadAll(id_plan_accion: string): Promise<PlanSeguimientoResult> {
    try {
      
      let query = supabase.from(this.tableName).select("*", {count: "exact"});

      query.eq("id_plan_accion", id_plan_accion)


      const { data, error, count } = await query;

      if (error) {
        return {
          data: null,
          message: error.message,
          status: false,
          total: 0
        };
      }

      return {
        data,
        message: null,
        status: true,
        total: count ?? data?.length ?? 0,
      };
    } catch (error: any) {
      return {
        data: null,
        message: error?.message ?? "Error cargando auditorias",
        status: false,
        total: 0
      };
    }
  }
  
}