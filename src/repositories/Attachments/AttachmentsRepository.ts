import type { DateRange } from "../../models/commons";

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

export type UploadAttachmentResult = {
  fileName: string;
  bucket: string;
  path: string | null;
  fullPath: string | null;
  status: boolean;
  message: string | null;
};


export interface AttachmentsRepository {
  uploadAttachment(payload: File[], bucket: string, path: string): Promise<UploadAttachmentResult[]>
  loadAttachment(path: string, bucket: string): Promise<{status: boolean; message: string | null; url: string | null }>
}
