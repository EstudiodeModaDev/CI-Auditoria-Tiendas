import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { zona } from "../../../../models/database/zona";

export function useZonasList() {
  const {zonas} = useRepositories()
  const [zonasRows, setZonasRows] = React.useState<zona[]>([])

  const loadZonas = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: zona[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await zonas?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando las zonas",
          ok: false,
          data: []
        }
      }
      
      setZonasRows(response.data)
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

  const loadAuditor = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: zona | null,}> => {      
    try{
      const response = await zonas?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando la zona seleccionada",
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
    loadZonas, zonasRows, loadAuditor
  };
}
