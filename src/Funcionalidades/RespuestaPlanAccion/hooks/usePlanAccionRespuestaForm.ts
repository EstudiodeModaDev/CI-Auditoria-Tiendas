import React from "react";
import type { User } from "@supabase/supabase-js";
import type { planAccionSeguimiento, planAccionSeguimientoErrors } from "../../../models/database/plan_accion";
import { cleanAccionRespuesta } from "../utils/planAccionRespuestaState";
import { useSupabaseSession } from "../../../auth/hooks/useSupabaseSession";

function getUserName(sessionUser?: User | null) {
  if (!sessionUser) {
    return ""
  }

  return String(
    sessionUser.user_metadata?.nombre ??
    sessionUser.user_metadata?.name ??
    sessionUser.user_metadata?.full_name ??
    sessionUser.email ??
    ""
  )
}

export function usePlanAccionRespuestaForm(id_plan_accion: number){
  const { session } = useSupabaseSession()
  const userName = getUserName(session?.user)
  const [state, setState] = React.useState<planAccionSeguimiento>(cleanAccionRespuesta(id_plan_accion, userName))
  const [loading, setLoading] = React.useState<boolean>(false)
  const [planErrors, setPlanErrors] = React.useState<planAccionSeguimientoErrors>({})

  React.useEffect(() => {
    setState((current) => {
      const nextUser = current.usuario || userName

      if (current.id_plan_accion === id_plan_accion && current.usuario === nextUser) {
        return current
      }

      return {
        ...current,
        id_plan_accion,
        usuario: nextUser,
      }
    })
  }, [id_plan_accion, userName])

  const setField = <K extends keyof planAccionSeguimiento>(k: K, v: planAccionSeguimiento[K]) => setState((s) => ({ ...s, [k]: v }));

  return {
    state, loading, setLoading, setField,
    resetState: () => setState(cleanAccionRespuesta(id_plan_accion, userName)),
    planErrors,
    setPlanErrors
  }

}
