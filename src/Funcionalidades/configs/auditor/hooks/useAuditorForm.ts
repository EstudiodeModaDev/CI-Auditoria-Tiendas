import * as React from "react";
import type { auditor, auditorErrors } from "../../../../models/database/auditor";
import { validate } from "../utils/validateAuditor";

export function useAuditorForm() {
  const [state, setState] = React.useState<auditor>({
    activo: true,
    correo: "",
    nombre: "",
  });
  const [errors, setErrors] = React.useState<auditorErrors>({});
  const setField = <K extends keyof auditor>(k: K, v: auditor[K]) => setState((s) => ({ ...s, [k]: v }));

  const isValid = () => {
    const validation = validate(state)
    setErrors(validation)
    return Object.keys(validation).length === 0
  };

  return {
    state, errors, isValid, setField
  };
}