import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";
import type { item_evaluacion } from "../../../../models/database/items_evaluacion";

export function useItemEvaluacionList() {
  const {item_evaluacion} = useRepositories()
  const [itemEvaluacion, setItemEvaluacion] = React.useState<item_evaluacion[]>([])

  const loadItemsEvaluacion = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: item_evaluacion[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await item_evaluacion?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando los items de evaluación",
          ok: false,
          data: []
        }
      }
      
      setItemEvaluacion(response.data)
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

  const loadItemEvaluacion = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: item_evaluacion | null,}> => {      
    try{
      const response = await item_evaluacion?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando el item de evaluación",
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
    loadItemsEvaluacion, itemEvaluacion, loadItemEvaluacion
  };
}
