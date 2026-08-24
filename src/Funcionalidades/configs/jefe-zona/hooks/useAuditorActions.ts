import type { jefe_zona } from "../../../../models/database/jefe_zona";
import { useRepositories } from "../../../../repositories/repositoriesContext";

export function useJefeZonaActions() {
  const {jefeZona} = useRepositories()

  const handleCreate = async (payload: jefe_zona): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await jefeZona?.createOption(payload);
      
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

  const handleEdit = async (payload: Partial<jefe_zona>, id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await jefeZona?.updateOption(id, payload);
      
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
      const response = await jefeZona?.inactivateOption(id);
      
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
      const response = await jefeZona?.activateOption(id);
      
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
