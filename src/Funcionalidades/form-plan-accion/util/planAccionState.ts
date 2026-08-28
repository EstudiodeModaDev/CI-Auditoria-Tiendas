import type { planAccion } from "../../../models/database/plan_accion";

export function cleanPlanAccionState(): planAccion {
  const today = new Date().toISOString().slice(0, 10)

  return {
    id_auditoria: null,
    actividad_correctiva: "",
    id_area_responsable: null,
    descripcion_hallazgo: "",
    estado: "Pendiente",
    fecha_compromiso: "",
    fecha_creacion: today,
    id_tienda: null,
    id_zona: null,
    impacto: "",
    porcentaje_avance: 0,
    prioridad: "",
    recursos_requeridos: "",
    responsable: "",
    tipo_hallazgo: [],
    correo_responsable: ""
  }
}
