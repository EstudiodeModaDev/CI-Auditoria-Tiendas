import type { tienda, tienda_errors } from "../../../../models/database/tienda";

export function validate(state: tienda): tienda_errors {
    const e: tienda_errors = {};
    if (!state.nombre) e.nombre = "El nombre es requerido";
    if (!state.correo_tienda) e.correo_tienda = "El correo es requerido";
    if (!state.id_bodega) e.id_bodega = "Escoja una bodega";
    if (!state.id_jefe_zona) e.id_jefe_zona = "Escoja un jefe de zona";
    if (!state.id_marca) e.id_marca = "Escoja una marca";
    if (!state.id_tipo_tienda) e.id_tipo_tienda = "Escoja un tipo de tienda";
    if (!state.id_zona) e.id_zona = "Escoja una zona";
    return e
};