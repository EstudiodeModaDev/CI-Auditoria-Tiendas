import type { marca, marca_errors } from "../../../../models/database/marca";

export function validate(state: marca): marca_errors {
    const e: marca_errors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";

    return e
};
