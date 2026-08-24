import type { ListItem } from "../../models/components/config";
import type { tipo_tienda } from "../../models/database/tipo_tienda";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";


export class SupabaseTipoTiendaRepository implements ConfigurationsRepository<tipo_tienda> {
  private readonly tableName = "TIPO_TIENDA";


  async activateOption(id: string): Promise<{ data: tipo_tienda | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_tipo_tienda', id)

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

  async loadOptions(filter?: configurationsFilter): Promise<configResult<tipo_tienda>> {
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
        message: error?.message ?? "Error cargando los tipos de tienda registrados",
      };
    }
  }

  async createOption(payload: Partial<tipo_tienda>): Promise<{data: tipo_tienda | null, status: boolean, message: string | null}> {
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
        message: e?.message ?? "Error creando el tipo de tienda",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<tipo_tienda>): Promise<{ data: tipo_tienda | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_tipo_tienda", id)
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
        message: e?.message ?? "Error actualizando el tipo de tienda",
        status: false,
      };
    }   
  }
  

  async getById(id: string): Promise<{ data: tipo_tienda | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_tipo_tienda", id).single()


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
        message: error?.message ?? "Error cargando el tipo de tienda seleccionado",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: tipo_tienda | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: false}).eq('id_tipo_tienda', id)

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

export function mapTipoTiendaToListItem(tipo_tienda: tipo_tienda): ListItem {
  return {
    id: String(tipo_tienda.id_tipo_tienda),
    title: tipo_tienda.nombre,
    subtitle: "",
    summary: "",
    status: tipo_tienda.activo,
    values: {
      id_tipo_tienda: String(tipo_tienda.id_tipo_tienda),
      nombre: tipo_tienda.nombre,
      activo: tipo_tienda.activo ? 'true' : 'false',
      created_at: String(tipo_tienda.created_at),
    },
  }
}
