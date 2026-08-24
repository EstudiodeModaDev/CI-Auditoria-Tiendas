import type { planAccionSeguimiento } from "../../models/database/plan_accion";

export type PlanAccionSeguimientoFilter = {
  id_plan_accion?: number | null,
}

export type PlanSeguimientoResult = {
  data: planAccionSeguimiento[] | null;
  status: boolean;
  message: string | null;
  total: number;
}


export interface PlanAccionRespuestaRepository {
  create(payload: Partial<planAccionSeguimiento>): Promise<{ data: planAccionSeguimiento | null; status: boolean; message: string | null }>
  load(id: string): Promise<{ data: planAccionSeguimiento | null; status: boolean; message: string | null }>
  loadAll(id_plan_accion: string,): Promise<PlanSeguimientoResult>
}
