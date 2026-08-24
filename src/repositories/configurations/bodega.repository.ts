import type { ListItem } from "../../models/components/config";
import type { bodega } from "../../models/database/bodega";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";

export class SupabaseBodegaRepository implements ConfigurationsRepository<bodega> {
  private readonly tableName = "BODEGA";


  async activateOption(id: string): Promise<{ data: bodega | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_bodega', id)

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

  async loadOptions(filter?: configurationsFilter): Promise<configResult<bodega>> {
    try {
      
      let query = supabase.from(this.tableName).select("*", {count: "exact"});

      if (filter?.nombre) {
        query = query.eq("codigo", filter.nombre)
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
        message: error?.message ?? "Error cargando las bodegas registradas",
      };
    }
  }

  async createOption(payload: Partial<bodega>): Promise<{data: bodega | null, status: boolean, message: string | null}> {
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
        message: e?.message ?? "Error creando la bodega",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<bodega>): Promise<{ data: bodega | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_bodega", id)
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
        message: e?.message ?? "Error actualizando la bodega",
        status: false,
      };
    }   
  }
  

  async getById(id: string): Promise<{ data: bodega | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_bodega", id).single()


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
        message: error?.message ?? "Error cargando la bodega seleccionada",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: bodega | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: false}).eq('id_bodega', id)

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

export function mapBodegaToItemList(bodega: bodega): ListItem {
  return {
    id: String(bodega.id_bodega),
    title: bodega.codigo,
    subtitle:"CO: " + bodega.codigo_co,
    summary: bodega.activo ? 'Bodega activa en el sistema.' : 'Bodega inactiva.',
    status: bodega.activo,
    values: {
      id_jefe_zona: String(bodega.id_bodega),
      nombre: bodega.codigo,
      co: bodega.codigo_co,
      activo: bodega.activo ? 'true' : 'false',
      created_at: String(bodega.created_at),
    },
  }
}

export const mapAuditorToListItem = mapBodegaToItemList;
