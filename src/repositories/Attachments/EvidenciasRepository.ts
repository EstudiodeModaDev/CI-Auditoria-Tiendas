import { supabase } from "../../services/supabase.service";
import type {
  AttachmentsRepository,
  UploadAttachmentResult,
} from "./AttachmentsRepository";

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function sanitizeFileName(fileName: string): string {
  const withoutAccents = fileName.normalize("NFD").replace(COMBINING_DIACRITICS, "");
  return withoutAccents.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class AttachmentsFromBucket implements AttachmentsRepository {
  async uploadAttachment(files: File[], bucket: string, basePath: string): Promise<UploadAttachmentResult[]> {
    if (!files.length) {
      return [];
    }

    const cleanBasePath = basePath.replace(/^\/+|\/+$/g, "");

    const uploads = files.map(async (file): Promise<UploadAttachmentResult> => {
      const safeFileName = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const path = `${cleanBasePath}/${safeFileName}`;

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          return {
            fileName: file.name,
            bucket,
            path: null,
            fullPath: null,
            status: false,
            message: error.message,
          };
        }

        return {
          fileName: file.name,
          bucket,
          path: data.path,
          fullPath: data.fullPath ?? null,
          status: true,
          message: "Archivo subido correctamente",
        };
      } catch (error) {
        return {
          fileName: file.name,
          bucket,
          path: null,
          fullPath: null,
          status: false,
          message:
            error instanceof Error
              ? error.message
              : "Error desconocido al subir el archivo",
        };
      }
    });

    return Promise.all(uploads);
  }

  async loadAttachment(
    path: string,
    bucket: string
  ): Promise<{ status: boolean; message: string | null; url: string | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60);

      if (error) {
        return {
          status: false,
          message: error.message,
          url: null,
        };
      }

      return {
        status: true,
        message: null,
        url: data.signedUrl,
      };
    } catch (error) {
      return {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al cargar el archivo",
        url: null,
      };
    }
  }
}