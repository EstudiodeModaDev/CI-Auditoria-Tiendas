import type { tienda } from "../../../../models/database/tienda";
import { useRepositories } from "../../../../repositories/repositoriesContext";

export function useTiendaActions() {
  const {tienda} = useRepositories()

  const handleCreate = async (payload: tienda): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await tienda?.createOption(payload);
      
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

  const handleEdit = async (payload: Partial<tienda>, id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await tienda?.updateOption(id, payload);
      
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
      const response = await tienda?.inactivateOption(id);
      
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
      const response = await tienda?.activateOption(id);
      
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