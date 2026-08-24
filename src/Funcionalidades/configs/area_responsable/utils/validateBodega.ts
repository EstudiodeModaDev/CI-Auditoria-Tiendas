import type { areaResponsableErrors, areas_responsables } from "../../../../models/database/areas_responsables";

export function validate(state: areas_responsables): areaResponsableErrors {
    const e: areaResponsableErrors = {};
    if (!state.nombre) e.nombre = "El nombre es obligatorio";

    return e
};
