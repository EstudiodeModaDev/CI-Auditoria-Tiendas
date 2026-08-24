import type { auditoria } from "../../../models/database/auditoria";

export function initialAuditoriaState(): auditoria{
  return {
    estado_inventario: "",
    faltantes: 0,
    fecha_auditoria: new Date(),
    id_auditor: null,
    id_causal_cancelacion: null,
    id_jefe_zona: null,
    id_tienda: null,
    id_tipo_tienda: null,
    id_zona: null,
    id_bodega: null,
    modalidad: "",
    neto_inventario: 0,
    observacion_cancelacion: "",
    porcentaje_calidad: 0,
    porcentaje_cumplimiento: 0,
    resultado: "",
    resultado_calidad: "",
    sobrantes: 0,
    total_items_cumplidos: 0,
    trocados: 0,
    estado_tienda: ""
  }
}
