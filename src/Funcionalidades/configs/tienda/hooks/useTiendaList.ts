import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { tienda } from "../../../../models/database/tienda";

export function useTiendaList() {
  const {tienda} = useRepositories()
  const [tiendaRows, setiendaRows] = React.useState<tienda[]>([])

  const loadTiendas = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: tienda[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await tienda?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando las tiendas",
          ok: false,
          data: []
        }
      }
      
      setiendaRows(response.data)
      return {
        errorMessage: null,
        ok: true,
        data: response.data
      }
      
    } catch(e: any){
      return {
        errorMessage: e,
        ok: false,
        data: []
      }
    }
  }

  const loadTienda = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: tienda | null,}> => {      
    try{
      const response = await tienda?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando las tiendas",
          ok: false,
          data: null
        }
      }
    
      return {
        errorMessage: null,
        ok: true,
        data: response.data
      }
      
    } catch(e: any){
      return {
        errorMessage: e,
        ok: false,
        data: null
      }
    }
  }

  return {
    loadTiendas, tiendaRows, loadTienda
  };
}