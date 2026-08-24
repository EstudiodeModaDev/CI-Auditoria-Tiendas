import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { jefe_zona } from "../../../../models/database/jefe_zona";

export function useJefeZonaLists() {
  const {jefeZona} = useRepositories()
  const [jefeZonaRows, setJefeZonaRows] = React.useState<jefe_zona[]>([])

  const loadJefesZona = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: jefe_zona[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await jefeZona?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando los jefes de zona",
          ok: false,
          data: []
        }
      }
      
      setJefeZonaRows(response.data)
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

  const loadJefeZona = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: jefe_zona | null,}> => {      
    try{
      const response = await jefeZona?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando el jefe de zona",
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
    loadJefesZona, jefeZonaRows, loadJefeZona
  };
}
