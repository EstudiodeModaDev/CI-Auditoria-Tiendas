import toast from "react-hot-toast";
import React from "react";
import { validate } from "../utils/validateJefeZona";
import type { jefe_zona } from "../../../../models/database/jefe_zona";
import { useJefeZonaLists } from "./useJefeZonaList";
import { useJefeZonaActions } from "./useAuditorActions";

export function useJefeZona() {
  const list = useJefeZonaLists()
  const actions = useJefeZonaActions()
  const [loading, setLoading] = React.useState<boolean>(false)

  const createJefeZona = async (payload: jefe_zona): Promise<boolean> => {
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
      
      toast.success("Se ha creado con éxito el jefe de zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const editJefeZona = async (id: string, payload: jefe_zona): Promise<boolean> => {
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
      
      toast.success("Se ha editado con éxito el jefe de zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const desactivateJefeZona = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleDesactivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha desactivado con éxito el jefe de zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const activateJefeZona = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleActivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha activando con éxito el jefe de zona")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }
    
  return {
    createJefeZona, editJefeZona, desactivateJefeZona, activateJefeZona, loading, ...list
  };
}

export const useAuditor = useJefeZona;
