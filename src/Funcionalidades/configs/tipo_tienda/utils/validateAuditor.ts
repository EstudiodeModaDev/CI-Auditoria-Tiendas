import type { tipo_tienda, tipo_tienda_errors } from "../../../../models/database/tipo_tienda";

export function validate(state: tipo_tienda): tipo_tienda_errors {
    const e: tipo_tienda_errors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";
    return e
};