import { useRepositories } from "../../../repositories/repositoriesContext";


type UploadAttachmentParams = {
  files: File[];
  seguimientoid: number;
};

export function useSeguimientosAttachmentsActions() {
  const { SeguimientosAttachments, attachments } = useRepositories();

  const uploadAttachment = async ({
    files,
    seguimientoid,
  }: UploadAttachmentParams): Promise<{ ok: boolean; errorMessage?: string }> => {
    if (!(files.length > 0)) {
      return {
        ok: true,
      };
    }

    if (!Number.isFinite(seguimientoid) || seguimientoid <= 0) {
      return {
        ok: false,
        errorMessage: "No se pudo identificar el seguimiento para relacionar los adjuntos",
      };
    }

    try {
      const response = await attachments.uploadAttachment(
        files,
        "Seguimientos",
        `/${seguimientoid}`
      );

      for (const result of response) {
        if (!result.status || !result.path) {
          return {
            ok: false,
            errorMessage:
              result.message ?? `No se pudo subir el archivo ${result.fileName}`,
          };
        }

        const bridgeResponse = await SeguimientosAttachments.createBridge({
          id_plan_accion: seguimientoid,
          path: result.path,
          bucket: result.bucket,
          attachment_name: result.fileName,
        });

        if (!bridgeResponse.status) {
          return {
            ok: false,
            errorMessage:
              bridgeResponse.message ?? "No se pudo guardar la relacion del adjunto",
          };
        }
      }

      return {
        ok: true,
      };
    } catch (e: any) {
      return {
        ok: false,
        errorMessage: e?.message ?? "No se pudo guardar la relacion del adjunto",
      };
    }
  };

  return {
    uploadAttachment,
  };
}
