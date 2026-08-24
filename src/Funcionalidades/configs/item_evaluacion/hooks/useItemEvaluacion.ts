import toast from "react-hot-toast";
import React from "react";
import { validate } from "../utils/validateItemEvaluacion";
import { useItemEvaluacionList } from "./useItemEvaluacionList";
import { useItemEvaluacionActions } from "./useItemEvaluacionActions";
import type { item_evaluacion } from "../../../../models/database/items_evaluacion";

export function useItemEvaluacion() {
  const list = useItemEvaluacionList()
  const actions = useItemEvaluacionActions()
  const [loading, setLoading] = React.useState<boolean>(false)

  const createItemEvaluacion = async (payload: item_evaluacion): Promise<boolean> => {
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
      
      toast.success("Se ha creado con éxito el item de evaluación")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const editItemEvaluacion = async (id: string, payload: item_evaluacion): Promise<boolean> => {
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
      
      toast.success("Se ha editado con éxito el item de evaluación")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const desactivateItemValuacion = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleDesactivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha desactivado con éxito el item de evaluación")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const activateItemEvaluacion = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleActivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha activando con éxito el item de evaluación")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }
    
  return {
    createItemEvaluacion, editItemEvaluacion, desactivateItemValuacion, activateItemEvaluacion, loading, ...list
  };
}

export const useAuditor = useItemEvaluacion;
