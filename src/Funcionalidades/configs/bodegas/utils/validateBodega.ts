import type { bodega, bodegaErrors } from "../../../../models/database/bodega";

export function validate(state: bodega): bodegaErrors {
    const e: bodegaErrors = {};
    if (!state.codigo_co) e.codigo_co = "El co a la que esta relacionada es obligatorio";
    if (!state.codigo) e.codigo = "El codigo de la bodega es obligatorio";

    return e
};
