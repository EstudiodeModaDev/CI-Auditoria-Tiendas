import * as React from "react";
import { validate } from "../utils/validateItemEvaluacion";
import type { item_evaluacion, item_evaluacion_errors } from "../../../../models/database/items_evaluacion";

export function useItemEvaluacionForm() {
  const [state, setState] = React.useState<item_evaluacion>({
    activo: true,
    nombre: "",
    requiere_cantidad: true,
    requiere_causal: false,
  });
  const [errors, setErrors] = React.useState<item_evaluacion_errors>({});
  const setField = <K extends keyof item_evaluacion>(k: K, v: item_evaluacion[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}