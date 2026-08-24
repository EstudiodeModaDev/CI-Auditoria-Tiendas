import type { attachments } from "../../models/database/attachments";

export type PlanAccionFilterOptions = {

}

export type AttachmentBridgeFilters = {
  id_plan_accion: number
}


export interface AttachmentBridgeRepository {
  createBridge(payload: Partial<attachments>): Promise<{ data: attachments | null; status: boolean; message: string | null }>
  loadRelation(loadArguments: AttachmentBridgeFilters): Promise<{ data: attachments[] | null; status: boolean; message: string | null }>
}
