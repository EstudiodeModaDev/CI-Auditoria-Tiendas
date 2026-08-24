import type { item_evaluacion, item_evaluacion_errors } from "../../../../models/database/items_evaluacion";

export function validate(state: item_evaluacion): item_evaluacion_errors {
    const e: item_evaluacion_errors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";

    return e
};
