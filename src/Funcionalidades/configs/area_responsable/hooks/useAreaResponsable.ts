import toast from "react-hot-toast";
import React from "react";
import { validate } from "../utils/validateBodega";
import { useAreaResponsableList } from "./useAreaReponsableList";
import { useAreaResponsableActions } from "./useAreaResponsableActions";
import type { areas_responsables } from "../../../../models/database/areas_responsables";

export function useBodega() {
  const list = useAreaResponsableList()
  const actions = useAreaResponsableActions()
  const [loading, setLoading] = React.useState<boolean>(false)

  const createAreaResponsable = async (payload: areas_responsables): Promise<boolean> => {
    try{
      setLoading(true)

      if (Object.keys(validate(payload)).length > 0) {
        toast.error("Por favor llene todos los campos obligatorios")
        return false
      }

      const actionResult = await actions.handleCreate(payload)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha creado con éxito el área responsable")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const editAreaResponsable = async (id: string, payload: areas_responsables): Promise<boolean> => {
    try{
      setLoading(true)

      if (Object.keys(validate(payload)).length > 0) {
        toast.error("Por favor llene todos los campos obligatorios")
        return false
      }

      const actionResult = await actions.handleEdit(payload, id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha editado con éxito el área responsable")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const desactivateAreaResponsable = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleDesactivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha desactivado con éxito el área responsable")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const activateAreaResponsable = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleActivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha activando con éxito el área responsable")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }
    
  return {
    createAreaResponsable,
    editAreaResponsable,
    desactivateAreaResponsable,
    activateAreaResponsable,
    createBodega: createAreaResponsable,
    editBodega: editAreaResponsable,
    desactivateBodega: desactivateAreaResponsable,
    activateBodega: activateAreaResponsable,
    loading,
    ...list
  };
}

export const useAreaResponsable = useBodega;
export const useAuditor = useBodega;
