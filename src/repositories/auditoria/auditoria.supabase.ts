import type { auditoria } from "../../models/database/auditoria";
import { supabase } from "../../services/supabase.service";
import type { AuditoriaFilterOptions, AuditoriaRepository, AuditoriaResult } from "./auditoria.repository";

export class SupabaseAuditoriaRepository implements AuditoriaRepository {
  private readonly tableName = "AUDITORIA"

  async loadAll(filter?: AuditoriaFilterOptions): Promise<AuditoriaResult> {
    try {
      
      let query = supabase.from(this.tableName).select("*", {count: "exact"});

      if (filter?.id_auditor) {
        query = query.eq("id_auditor", filter.id_auditor)
      }

      if (filter?.id_jefe_zona) {
        query = query.eq("id_jefe_zona", filter.id_jefe_zona)
      }

      if (filter?.id_marca) {
        query = query.eq("id_marca", filter.id_marca)
      }

      if (filter?.id_tienda) {
        query = query.eq("id_tienda", filter.id_tienda)
      }

      if (filter?.id_tipo_tienda) {
        query = query.eq("id_tipo_tienda", filter.id_tipo_tienda)
      }

      if (filter?.id_zona) {
        query = query.eq("id_zona", filter.id_zona)
      }

      if (filter?.modalidad) {
        query = query.eq("modalidad", filter.modalidad)
      }

      if (filter?.estado_inventario) {
        query = query.eq("estado_inventario", filter.estado_inventario)
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
  
  async create(payload: Partial<auditoria>): Promise<{ data: auditoria | null; status: boolean; message: string | null }> {
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
        data,
        status: true,
        message: null,
      }
    } catch (error: any) {
      return {
        data: null,
        status: false,
        message: error?.message ?? 'Error creando la auditoria',
      }
    }
  }

  async load(id: string): Promise<{ data: auditoria | null; status: boolean; message: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id_auditoria", id)
        .single()

      if (error) {
        return {
          data: null,
          status: false,
          message: error.message,
        }
      }

      return {
        data,
        status: true,
        message: null,
      }
    } catch (error: any) {
      return {
        data: null,
        status: false,
        message: error?.message ?? 'Error cargando la auditoria',
      }
    }
  }
}
