import type { auditor, auditorErrors } from "../../../../models/database/auditor";

export function validate(state: auditor): auditorErrors {
    const e: auditorErrors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";
    if (!state.correo) e.correo = "El correo es requerido";

    return e
};