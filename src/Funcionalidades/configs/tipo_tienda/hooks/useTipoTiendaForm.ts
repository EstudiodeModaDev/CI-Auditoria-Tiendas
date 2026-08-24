import * as React from "react";
import { validate } from "../utils/validateAuditor";
import type { tipo_tienda, tipo_tienda_errors } from "../../../../models/database/tipo_tienda";

export function useTipoTiendaForm() {
  const [state, setState] = React.useState<tipo_tienda>({
    activo: true,
    nombre: "",
  });
  const [errors, setErrors] = React.useState<tipo_tienda_errors>({});
  const setField = <K extends keyof tipo_tienda>(k: K, v: tipo_tienda[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}