import toast from "react-hot-toast";
import React from "react";
import { validate } from "../utils/validateMarca";
import { useMarcaList } from "./useMarcaList";
import { useMarcaActions } from "./useMarcaActions";
import type { marca } from "../../../../models/database/marca";

export function useJefeZona() {
  const list = useMarcaList()
  const actions = useMarcaActions()
  const [loading, setLoading] = React.useState<boolean>(false)

  const createMarca = async (payload: marca): Promise<boolean> => {
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
      
      toast.success("Se ha creado con éxito la marca")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const editMarca = async (id: string, payload: marca): Promise<boolean> => {
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
      
      toast.success("Se ha editado con éxito la marca")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const desactivateMarca = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleDesactivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha desactivado con éxito la marca")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }

  const activateMarca = async (id: string): Promise<boolean> => {      
    try{
      setLoading(true)

      const actionResult = await actions.handleActivate(id)
      
      if(!actionResult?.ok){
        toast.error(actionResult.errorMessage)
        return false
      }
      
      toast.success("Se ha activando con éxito la marca")
      return true

    } catch(e: any){
      toast.error(e ?? "Algo ha salido mal")
      return  false
    } finally {
      setLoading(false)
    }
  }
    
  return {
    createMarca, editMarca, desactivateMarca, activateMarca, loading, ...list
  };
}

export const useAuditor = useJefeZona;
export const useMarca = useJefeZona;
