import type { jefe_zona, jefe_zonaErrors } from "../../../../models/database/jefe_zona";

export function validate(state: jefe_zona): jefe_zonaErrors {
    const e: jefe_zonaErrors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";
    if (!state.correo) e.correo = "El correo es requerido";

    return e
};
