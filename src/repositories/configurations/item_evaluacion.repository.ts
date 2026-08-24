import type { ListItem } from "../../models/components/config";
import type { item_evaluacion } from "../../models/database/items_evaluacion";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";

export class SupabaseItemEvaluacionRepository implements ConfigurationsRepository<item_evaluacion> {
  private readonly tableName = "ITEM_EVALUACION";


  async activateOption(id: string): Promise<{ data: item_evaluacion | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_item_evaluacion', id)

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

  async loadOptions(filter?: configurationsFilter): Promise<configResult<item_evaluacion>> {
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
        message: error?.message ?? "Error cargando las bodegas registradas",
      };
    }
  }

  async createOption(payload: Partial<item_evaluacion>): Promise<{data: item_evaluacion | null, status: boolean, message: string | null}> {
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
        message: e?.message ?? "Error creando el item de evaluación",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<item_evaluacion>): Promise<{ data: item_evaluacion | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_item_evaluacion", id)
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
        message: e?.message ?? "Error actualizando el item de evaluación",
        status: false,
      };
    }   
  }
  

  async getById(id: string): Promise<{ data: item_evaluacion | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_item_evaluacion", id).single()


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
        message: error?.message ?? "Error cargando la el item de evaluación seleccionado",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: item_evaluacion | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: false}).eq('id_item_evaluacion', id)

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

export function mapItemEvaluacionToItemList(ie: item_evaluacion): ListItem {
  return {
    id: String(ie.id_item_evaluacion),
    title: ie.nombre,
    subtitle:ie.requiere_cantidad ? "Item tipo cantidad" : "",
    summary: ie.requiere_causal ? 'Item tipo causal' : "",
    status: ie.activo,
    values: {
      id_jefe_zona: String(ie.id_item_evaluacion),
      nombre: ie.nombre,
      activo: ie.activo ? 'true' : 'false',
      created_at: String(ie.created_at),
    },
  }
}

export const mapItemEvaluacionToItemLis = mapItemEvaluacionToItemList;
export const mapAuditorToListItem = mapItemEvaluacionToItemList;
