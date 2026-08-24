import type { zona } from "../../../../models/database/zona";
import { useRepositories } from "../../../../repositories/repositoriesContext";

export function useZonaActions() {
  const {zonas} = useRepositories()

  const handleCreate = async (payload: zona): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await zonas?.createOption(payload);
      
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

  const handleEdit = async (payload: Partial<zona>, id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await zonas?.updateOption(id, payload);
      
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
      const response = await zonas?.inactivateOption(id);
      
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
      const response = await zonas?.activateOption(id);
      
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

export const useAuditorActions = useZonaActions;
