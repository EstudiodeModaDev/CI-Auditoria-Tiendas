import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { marca } from "../../../../models/database/marca";

export function useMarcaList() {
  const {marcas} = useRepositories()
  const [marcaRows, setMarcaRows] = React.useState<marca[]>([])

  const loadMarcas = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: marca[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await marcas?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando las marcas",
          ok: false,
          data: []
        }
      }
      
      setMarcaRows(response.data)
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

  const loadMarca = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: marca | null,}> => {      
    try{
      const response = await marcas?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando la marca",
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
    loadMarcas, loadMarca, marcaRows
  };
}
