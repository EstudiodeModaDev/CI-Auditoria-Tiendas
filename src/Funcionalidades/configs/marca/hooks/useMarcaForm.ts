import * as React from "react";
import { validate } from "../utils/validateMarca";
import type { marca, marca_errors } from "../../../../models/database/marca";

export function useMarcaForm() {
  const [state, setState] = React.useState<marca>({
    activo: true,
    nombre: "",
  });
  const [errors, setErrors] = React.useState<marca_errors>({});
  const setField = <K extends keyof marca>(k: K, v: marca[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}