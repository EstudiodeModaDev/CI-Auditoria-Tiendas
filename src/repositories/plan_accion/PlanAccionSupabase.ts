import type { planAccion } from "../../models/database/plan_accion";
import { supabase } from "../../services/supabase.service";
import type { PlanAccionRepository, PlanAccionResult, PlanAccionFilterOptions } from "./plan_accion.repository";

export class PlanAccionSupabase implements PlanAccionRepository {
  private readonly tableName = "PLAN_ACCION";

  async update(id: string, payload: Partial<planAccion>): Promise<{ data: planAccion | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_plan_accion", id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          message: error.message,
          status: false,
        };
      }

      return {
        data: data,
        message: null,
        status: true,
      };
    } catch (e: any) {
      return {
        data: null,
        message: e?.message ?? "Error actualizando el plan de acción",
        status: false,
      };
    }   
  }

  async create(payload: Partial<planAccion | planAccion[]>): Promise<{ data: planAccion | null; status: boolean; message: string | null; }> {
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
        message: e?.message ?? "Error creando el area responsable"
      })
    }
  }
  
  async load(id: string): Promise<{ data: planAccion | null; status: boolean; message: string | null; }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id_plan_accion", id)
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
        message: error?.message ?? 'Error cargando el plan de accion',
      }
    }
  }

  async loadAll(filter?: PlanAccionFilterOptions): Promise<PlanAccionResult> {
    try {
      
      let query = supabase.from(this.tableName).select("*", {count: "exact"});

      if (filter?.area_responsable) {
        query = query.eq("area_responsable", filter.area_responsable)
      }

      if (filter?.id_auditoria) {
        query = query.eq("id_auditoria", filter.id_auditoria)
      }

      if (filter?.id_item) {
        query = query.eq("id_item", filter.id_item)
      }

      if (filter?.id_tienda) {
        query = query.eq("id_tienda", filter.id_item)
      }

      if (filter?.id_auditor) {
        query = query.eq("id_auditor", filter.id_item)
      }

      if (filter?.estado) {
        query = query.eq("estado", filter.estado)
      }


      if (filter?.range?.from) {
        query = query.gte("fecha_auditoria", filter.range.from instanceof Date ? filter.range.from.toISOString() : filter.range.from)
      }

      if (filter?.range?.to) {
        query = query.lte("fecha_auditoria", filter.range.to instanceof Date ? filter.range.to.toISOString() : filter.range.to)
      }

      const pageSize = Math.max(1, Number(filter?.pageSize ?? 10));
      const pageIndex = Math.max(1, Number(filter?.pageIndex ?? 1));
      const from = (pageIndex - 1) * pageSize;
      const to = from + pageSize - 1;

      if (filter?.paginated) {
        query = query.range(from, to);
      }


      const { data, error, count } = await query;

      if (error) {
        return {
          data: null,
          message: error.message,
          status: false,
        };
      }

      return {
        data,
        message: null,
        status: true,
        hasNext: filter?.paginated ? from + (data?.length ?? 0) < (count ?? 0) : false,
        total: count ?? data?.length ?? 0,
        pageIndex,
        pageSize,
      };
    } catch (error: any) {
      return {
        data: null,
        message: error?.message ?? "Error cargando auditorias",
        status: false,
      };
    }
  }
  
}