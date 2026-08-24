import type { zona, zonaErrors } from "../../../../models/database/zona";

export function validate(state: zona): zonaErrors {
    const e: zonaErrors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";

    return e
};
