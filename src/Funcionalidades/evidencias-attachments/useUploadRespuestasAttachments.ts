import { useRepositories } from "../../repositories/repositoriesContext";

type UploadAttachmentParams = {
  files: File[];
  planId: number;
};

export function useRespuestasAttachmentsActions() {
  const { attachmentEvidencias, attachments } = useRepositories();

  const uploadAttachment = async ({
    files,
    planId,
  }: UploadAttachmentParams): Promise<{ ok: boolean; errorMessage?: string }> => {
    if (!(files.length > 0)) {
      return {
        ok: true,
      };
    }

    try {
      const response = await attachments.uploadAttachment(
        files,
        "Evidencias",
        `/${planId}`
      );

      for (const result of response) {
        if (!result.status || !result.path) {
          return {
            ok: false,
            errorMessage:
              result.message ?? `No se pudo subir el archivo ${result.fileName}`,
          };
        }

        const bridgeResponse = await attachmentEvidencias.createBridge({
          id_plan_accion: planId,
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
