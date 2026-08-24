import * as React from "react";
import { validate } from "../utils/validateBodega";
import type { bodega, bodegaErrors } from "../../../../models/database/bodega";

export function useBodegaForm() {
  const [state, setState] = React.useState<bodega>({
    activo: true,
    codigo: "",
    codigo_co: "",
  });
  const [errors, setErrors] = React.useState<bodegaErrors>({});
  const setField = <K extends keyof bodega>(k: K, v: bodega[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}

export const useJefeZonaForm = useBodegaForm;
