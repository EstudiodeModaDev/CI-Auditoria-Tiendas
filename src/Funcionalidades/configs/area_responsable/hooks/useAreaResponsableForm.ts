import * as React from "react";
import { validate } from "../utils/validateBodega";
import type { areaResponsableErrors, areas_responsables } from "../../../../models/database/areas_responsables";

export function useAreaResponsableForm() {
  const [state, setState] = React.useState<areas_responsables>({
    activo: true,
    nombre: "",
  });
  const [errors, setErrors] = React.useState<areaResponsableErrors>({});
  const setField = <K extends keyof areas_responsables>(k: K, v: areas_responsables[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}

export const useJefeZonaForm = useAreaResponsableForm;
