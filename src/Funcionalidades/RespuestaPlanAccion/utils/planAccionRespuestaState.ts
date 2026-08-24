import type { planAccionSeguimiento } from "../../../models/database/plan_accion";

export function cleanAccionRespuesta(id_plan_accion: number, usuario?: string | null): planAccionSeguimiento{
  return{
    fecha_seguimiento: new Date(),
    id_plan_accion,
    comentario: "",
    usuario: usuario ?? "",
  }
}
