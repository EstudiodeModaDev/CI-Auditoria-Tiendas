import type { ListItem } from "../../models/components/config";
import type { tienda } from "../../models/database/tienda";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";

export class SupabaseTiendaRepository implements ConfigurationsRepository<tienda> {
  private readonly tableName = "TIENDA";


  async activateOption(id: string): Promise<{ data: tienda | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data: tienda,} = await supabase.from(this.tableName)
      .select("*")
      .eq('id_tienda', id)
      .maybeSingle()

    if(tienda.id_bodega){
      await supabase.from("BODEGA")
        .update({activo: true})
        .eq("id_bodega", tienda.id_bodega)
    }    

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_tienda', id)

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

  async loadOptions(filter?: configurationsFilter): Promise<configResult<tienda>> {
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

  async createOption(payload: Partial<tienda>): Promise<{data: tienda | null, status: boolean, message: string | null}> {
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
        message: e?.message ?? "Error creando la tienda",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<tienda>): Promise<{ data: tienda | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_tienda", id)
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
        message: e?.message ?? "Error actualizando la tienda",
        status: false,
      };
    }   
  }
  

  async getById(id: string): Promise<{ data: tienda | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_tienda", id).single()


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
        message: error?.message ?? "Error cargando la tienda seleccionada",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: tienda | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data: tienda,} = await supabase.from(this.tableName)
      .select("*")
      .eq('id_tienda', id)
      .maybeSingle()

    if(tienda.id_bodega){
      await supabase.from("BODEGA")
        .update({activo: false})
        .eq("id_bodega", tienda.id_bodega)
    }    

    const {data, error} = await supabase.from(this.tableName)
      .update({activo: false})
      .eq('id_tienda', id)

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

export function mapTiendaToListItem(tienda: tienda): ListItem {
  return {
    id: String(tienda.id_tienda),
    title: tienda.nombre,
    subtitle: tienda.correo_tienda,
    summary: tienda.activo ? 'Tienda activa en el sistema.' : 'Tienda inactiva.',
    status: tienda.activo,
    values: {
      id_tienda: String(tienda.id_tienda),
      nombre: tienda.nombre,
      correo_tienda: tienda.correo_tienda,
      activo: tienda.activo ? 'true' : 'false',
      created_at: String(tienda.created_at),
    },
  }
}

export const mapAuditorToListItem = mapTiendaToListItem;
