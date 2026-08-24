import * as React from "react";
import { validate } from "../utils/validateTienda";
import type { tienda, tienda_errors } from "../../../../models/database/tienda";

export function useTiendaForm() {
  const [state, setState] = React.useState<tienda>({
    activo: true,
    nombre: "",
    correo_tienda: "",
    id_bodega: null,
    id_jefe_zona: null,
    id_marca: null,
    id_tipo_tienda: null,
    id_zona: null,
  });
  const [errors, setErrors] = React.useState<tienda_errors>({});
  const setField = <K extends keyof tienda>(k: K, v: tienda[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}