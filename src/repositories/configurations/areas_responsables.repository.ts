import type { ListItem } from "../../models/components/config";
import type { areas_responsables } from "../../models/database/areas_responsables";
import { supabase } from "../../services/supabase.service";
import type { configResult, configurationsFilter, ConfigurationsRepository } from "./configuration.repository";

export class SupabaseAreaResponsableRepository implements ConfigurationsRepository<areas_responsables> {
  private readonly tableName = "AREAS_RESPONSABLES";


  async activateOption(id: string): Promise<{ data: areas_responsables | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: true}).eq('id_area_responsable', id)

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

  async loadOptions(filter?: configurationsFilter): Promise<configResult<areas_responsables>> {
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

  async createOption(payload: Partial<areas_responsables>): Promise<{data: areas_responsables | null, status: boolean, message: string | null}> {
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
        message: e?.message ?? "Error creando el area responsable",
        status: false,
      };
    }
  }

  async updateOption(id: string, payload: Partial<areas_responsables>): Promise<{ data: areas_responsables | null; status: boolean; message: string | null; }> {
     try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq("id_area_responsable", id)
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
  

  async getById(id: string): Promise<{ data: areas_responsables | null; status: boolean; message: string | null; }> {
    try {
      const query = supabase.from(this.tableName).select("*").eq("id_area_responsable", id).single()


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
        message: error?.message ?? "Error cargando el area responsable seleccionada",
      };
    }   
  }

  async inactivateOption(id: string): Promise<{ data: areas_responsables | null; status: boolean; message: string | null; }> {
    if(!id){
      return {
        data: null,
        status: false,
        message: "Debe seleccionar un ID"
      }
    }

    const {data, error} = await supabase.from(this.tableName).update({activo: false}).eq('id_area_responsable', id)

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

export function mapAreaResponsableToListItem(areaResponsable: areas_responsables): ListItem {
  return {
    id: String(areaResponsable.id_area_responsable),
    title: areaResponsable.nombre,
    subtitle: "",
    summary: areaResponsable.activo ? 'Area responsable activa en el sistema.' : 'Area responsable inactiva.',
    status: areaResponsable.activo,
    values: {
      id_area_responsable: String(areaResponsable.id_area_responsable),
      nombre: areaResponsable.nombre,
      activo: areaResponsable.activo ? 'true' : 'false',
    },
  }
}
