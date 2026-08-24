import * as React from "react";
import { useRepositories } from "../../../../repositories/repositoriesContext";
import type { auditor,} from "../../../../models/database/auditor";
import type { configurationsFilter } from "../../../../repositories/configurations/configuration.repository";

export function useAuditorLists() {
  const {auditores} = useRepositories()
  const [auditoresRows, setAuditoresRows] = React.useState<auditor[]>([])

  const loadAuditores = async (search: string): Promise<{ok: boolean, errorMessage: string | null, data: auditor[]}> => {      
    try{
      let filter: configurationsFilter = {
        paginated: false,
        nombre: search
      }
      const response = await auditores?.loadOptions(filter);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando los auditores",
          ok: false,
          data: []
        }
      }
      
      setAuditoresRows(response.data)
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

  const loadAuditor = async (id: string): Promise<{ok: boolean, errorMessage: string | null, data: auditor | null,}> => {      
    try{
      const response = await auditores?.getById(id);

      if(!response?.status){
        return{
          errorMessage: response?.message ?? "Algo ha salido mal cargando los auditores",
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
    loadAuditores, auditoresRows, loadAuditor
  };
}