import * as React from "react";
import { validate } from "../utils/validateJefeZona";
import type { jefe_zona, jefe_zonaErrors } from "../../../../models/database/jefe_zona";

export function useJefeZonaForm() {
  const [state, setState] = React.useState<jefe_zona>({
    activo: true,
    correo: "",
    nombre: "",
  });
  const [errors, setErrors] = React.useState<jefe_zonaErrors>({});
  const setField = <K extends keyof jefe_zona>(k: K, v: jefe_zona[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}