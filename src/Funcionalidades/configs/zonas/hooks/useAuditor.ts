import toast from "react-hot-toast";
import { useAuditorActions } from "./useAuditorActions";
import React from "react";
import { validate } from "../utils/validateAuditor";
import type { zona } from "../../../../models/database/zona";
import { useZonasList } from "./useZonaList";

export function useZona() {
  const list = useZonasList()
  const actions = useAuditorActions()
  const [loading, setLoading] = React.useState<boolean>(false)

  const createZona = async (payload: zona): Promise<boolean> => {
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
      
      toast.success("Se ha creado con éxito la zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const editZona = async (id: string, payload: zona): Promise<boolean> => {
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
      
      toast.success("Se ha editado con éxito la zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const desactivateZona = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleDesactivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha desactivado con éxito la zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const activateZona = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleActivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha activando con éxito la zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }
    
  return {
    createZona, editZona, desactivateZona, activateZona, loading, ...list
  };
}

export const useAuditor = useZona;
