import type { ListItem } from "../../models/components/config";
import type { jefe_zona } from "../../models/database/jefe_zona";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";

export class SupabaseJefeZonaRepository implements ConfigurationsRepository<jefe_zona> {
  private readonly tableName = "JEFE_ZONA";


  async activateOption(id: string): Promise<{ data: jefe_zona | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_jefe_zona', id)

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

  async loadOptions(filter?: configurationsFilter): Promise<configResult<jefe_zona>> {
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
        message: error?.message ?? "Error cargando los jefes de zona registrados",
      };
    }
  }

  async createOption(payload: Partial<jefe_zona>): Promise<{data: jefe_zona | null, status: boolean, message: string | null}> {
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
        message: e?.message ?? "Error creando el jefe de zona",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<jefe_zona>): Promise<{ data: jefe_zona | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_jefe_zona", id)
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
        message: e?.message ?? "Error actualizando el jefe de zona",
        status: false,
      };
    }   
  }
  

  async getById(id: string): Promise<{ data: jefe_zona | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_jefe_zona", id).single()


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
        message: error?.message ?? "Error cargando el jefe de zona seleccionado",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: jefe_zona | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: false}).eq('id_jefe_zona', id)

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

export function mapJefeZonaToListItem(jefeZona: jefe_zona): ListItem {
  return {
    id: String(jefeZona.id_jefe_zona),
    title: jefeZona.nombre,
    subtitle: jefeZona.correo,
    summary: jefeZona.activo ? 'Jefe de zona activo en el sistema.' : 'Jefe de zona inactivo.',
    status: jefeZona.activo,
    values: {
      id_jefe_zona: String(jefeZona.id_jefe_zona),
      nombre: jefeZona.nombre,
      correo: jefeZona.correo,
      activo: jefeZona.activo ? 'true' : 'false',
      created_at: String(jefeZona.created_at),
    },
  }
}

export const mapAuditorToListItem = mapJefeZonaToListItem;
