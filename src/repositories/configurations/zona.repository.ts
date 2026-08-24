import type { ListItem } from "../../models/components/config";
import type { zona } from "../../models/database/zona";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";



export class SupabaseZonaRepository implements ConfigurationsRepository<zona> {
  private readonly tableName = "ZONA";


  async activateOption(id: string): Promise<{ data: zona | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_zona', id)

    if(error){
      return{
        data: null,
        message: error.message ?? "Algo ha salido mal",
        status: false
      }
    }

    return{
      data,
      message: null,
      status: true
    }
  }

  async loadOptions(filter?: configurationsFilter): Promise<configResult<zona>> {
    try {
      
      let query = supabase.from(this.tableName).select("*", {count: "exact"});

      if (filter?.nombre) {
        query = query.eq("nombre", filter.nombre)
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
          data: [],
          message: error.message,
          status: false,
        };
      }

      return {
        data: data,
        hasNext: filter?.paginated ? from + (data?.length ?? 0) < (count ?? 0) : false,
        message: null,
        pageIndex,
        pageSize,
        status: true,
        total: count ?? data?.length ?? 0,
      };
    } catch (error: any) {
      return {
        data: [],
        status: false,
        message: error?.message ?? "Error cargando los tickets registrados",
      };
    }
  }

  async createOption(payload: Partial<zona>): Promise<{data: zona | null, status: boolean, message: string | null}> {
    try {

      console.log(payload)

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(payload)
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
        message: e?.message ?? "Error creando la zona",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<zona>): Promise<{ data: zona | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_zona", id)
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
        message: e?.message ?? "Error actualizando el auditor",
        status: false,
      };
    }   
  }
  

  async getById(id: string): Promise<{ data: zona | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_zona", id).single()


      const { data, error } = await query;

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
    } catch (error: any) {
      return {
        data: null,
        status: false,
        message: error?.message ?? "Error cargando la zona seleccionada",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: zona | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: false}).eq('id_zona', id)

    if(error){
      return{
        data: null,
        message: error.message ?? "Algo ha salido mal",
        status: false
      }
    }

    return{
      data,
      message: null,
      status: true
    }
  }

}

export function mapZonaToListItem(zona: zona): ListItem {
  return {
    id: String(zona.id_zona),
    title: zona.nombre,
    subtitle: "",
    summary: zona.activo ? 'Zona activa en el sistema.' : 'zona inactivo.',
    status: zona.activo,
    values: {
      id_auditor: String(zona.id_zona),
      nombre: zona.nombre,
      activo: zona.activo ? 'true' : 'false',
      created_at: String(zona.created_at),
    },
  }
}

export const mapAuditorToListItem = mapZonaToListItem;
