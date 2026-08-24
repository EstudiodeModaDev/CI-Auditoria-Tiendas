import type { tipo_tienda } from "../../../../models/database/tipo_tienda";
import { useRepositories } from "../../../../repositories/repositoriesContext";

export function useTipoTiendaActions() {
  const {tipo_tienda} = useRepositories()

  const handleCreate = async (payload: tipo_tienda): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await tipo_tienda?.createOption(payload);
      
      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo salio mal",
          ok: false
        }
      }
      
      return {
        errorMessage: null,
        ok: true
      }

    } catch(e: any){
      return {
        errorMessage: e,
        ok: false
      }
    }
  }

  const handleEdit = async (payload: Partial<tipo_tienda>, id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await tipo_tienda?.updateOption(id, payload);
      
      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo salio mal",
          ok: false
        }
      }
      
      return {
        errorMessage: null,
        ok: true
      }
      
    } catch(e: any){
      return {
        errorMessage: e,
        ok: false
      }
    }
  }

  const handleDesactivate = async (id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await tipo_tienda?.inactivateOption(id);
      
      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo salio mal",
          ok: false
        }
      }
      
      return {
        errorMessage: null,
        ok: true
      }
      
    } catch(e: any){
      return {
        errorMessage: e,
        ok: false
      }
    }
  }

  const handleActivate = async (id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await tipo_tienda?.activateOption(id);
      
      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo salio mal",
          ok: false
        }
      }
      
      return {
        errorMessage: null,
        ok: true
      }
      
    } catch(e: any){
      return {
        errorMessage: e,
        ok: false
      }
    }
  }
    

  return {
    handleEdit, handleCreate, handleDesactivate, handleActivate
  };
}