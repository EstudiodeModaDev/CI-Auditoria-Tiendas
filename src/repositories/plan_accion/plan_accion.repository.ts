import type { DateRange } from "../../models/commons";
import type { planAccion } from "../../models/database/plan_accion";

export type PlanAccionFilterOptions = {
  id_auditoria?: number | null,
  id_item?: number | null,
  area_responsable?: number | null,
  id_tienda?: number | null,
  id_auditor?: number | null, 
  estado?: string | null,
  paginated: boolean,
  pageIndex?: number,
  pageSize?: number,
  range: DateRange
}

export type PlanAccionResult = {
  data: planAccion[] | null;
  status: boolean;
  message: string | null;
  hasNext?: boolean;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
}


export interface PlanAccionRepository {
  create(payload: Partial<planAccion | planAccion[]>): Promise<{ data: planAccion | null; status: boolean; message: string | null }>
  load(id: string): Promise<{ data: planAccion | null; status: boolean; message: string | null }>
  loadAll(filters?: PlanAccionFilterOptions): Promise<PlanAccionResult>
  update(id: string, payload: Partial<planAccion>): Promise<{ data: planAccion | null; status: boolean; message: string | null }>
}
