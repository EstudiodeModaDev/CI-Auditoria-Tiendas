import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { tipo_tienda } from "../../../../models/database/tipo_tienda";

export function useTipoTiendaList() {
  const {tipo_tienda} = useRepositories()
  const [tipoTiendaRows, setTipoTiendas] = React.useState<tipo_tienda[]>([])

  const loadTipoTiendas = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: tipo_tienda[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await tipo_tienda?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando los tipos de tienda",
          ok: false,
          data: []
        }
      }
      
      setTipoTiendas(response.data)
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

  const loadTipoTienda = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: tipo_tienda | null,}> => {      
    try{
      const response = await tipo_tienda?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando el tipo de tienda seleccionado",
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
    loadTipoTiendas, tipoTiendaRows, loadTipoTienda
  };
}