import type { auditor } from "../../../../models/database/auditor";
import { useRepositories } from "../../../../repositories/repositoriesContext";

export function useAuditorActions() {
  const {auditores} = useRepositories()

  const handleCreate = async (payload: auditor): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await auditores?.createOption(payload);
      
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

  const handleEdit = async (payload: Partial<auditor>, id: string): Promise<{ok: boolean, errorMessage: string | null}> => {      
    try{
      const response = await auditores?.updateOption(id, payload);
      
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
      const response = await auditores?.inactivateOption(id);
      
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
      const response = await auditores?.activateOption(id);
      
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