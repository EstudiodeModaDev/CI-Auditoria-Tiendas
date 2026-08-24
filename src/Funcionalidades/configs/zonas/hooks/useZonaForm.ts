import * as React from "react";
import { validate } from "../utils/validateAuditor";
import type { zona, zonaErrors } from "../../../../models/database/zona";

export function useZonaForm() {
  const [state, setState] = React.useState<zona>({
    activo: true,
    nombre: "",
  });
  const [errors, setErrors] = React.useState<zonaErrors>({});
  const setField = <K extends keyof zona>(k: K, v: zona[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}

export const useAuditorForm = useZonaForm;
