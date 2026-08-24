import type { DateRange } from "../../models/commons";
import type { auditoria } from "../../models/database/auditoria";

export type AuditoriaFilterOptions = {
  id_zona? : number,
  id_jefe_zona? : number,
  id_tienda? : number,
  id_marca? : number,
  id_tipo_tienda? : number,
  id_auditor? : number,
  range?: DateRange,
  modalidad?: string,
  estado_inventario?: string,
  paginated: boolean
  pageSize?: number;
  pageNumber?: number;
  pageIndex?: number
}

export type AuditoriaResult = {
  data: auditoria[] | null;
  status: boolean;
  message: string | null;
  hasNext?: boolean;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
}


export interface AuditoriaRepository {
  create(payload: Partial<auditoria>): Promise<{ data: auditoria | null; status: boolean; message: string | null }>
  load(id: string): Promise<{ data: auditoria | null; status: boolean; message: string | null }>
  loadAll(filters?: AuditoriaFilterOptions): Promise<AuditoriaResult>
}
