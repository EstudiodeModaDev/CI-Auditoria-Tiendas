import React from "react";
import {type planesErrors, type planAccion } from "../../../models/database/plan_accion";
import { cleanPlanAccionState } from "../util/planAccionState";

export function planAccionForm(){
  const [state, setState] = React.useState<planAccion>(cleanPlanAccionState())
  const [loading, setLoading] = React.useState<boolean>(false)
  const [planErrors, setPlanErrors] = React.useState<planesErrors>({})
  const [notificarJefeZona, setNotificarJefeZona] = React.useState<boolean>(false)

  const setField = <K extends keyof planAccion>(k: K, v: planAccion[K]) => setState((s) => ({ ...s, [k]: v }));

  return {
    state, loading, setLoading, setField,
    resetState: () => {
      setState(cleanPlanAccionState())
      setNotificarJefeZona(true)
    },
    planErrors, setPlanErrors,
    notificarJefeZona, setNotificarJefeZona,
  }

}
