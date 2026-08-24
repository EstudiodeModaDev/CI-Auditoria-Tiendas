import { useRepositories } from "../../../repositories/repositoriesContext";
import type { planAccionSeguimiento } from "../../../models/database/plan_accion";
import { useSeguimientosAttachmentsActions } from "./useUploadSeguimientosAttachments";
import { actionPlanUpdattedNotification } from "../../mails/mailsFunctions";

type Props = {
  state: planAccionSeguimiento
  files: File[]
}

export function usePlanAccionRespuestasActions({state, files}: Props) {
  const { planesSeguimientos, planAccion, auditoria, auditores } = useRepositories()
  const { uploadAttachment } = useSeguimientosAttachmentsActions()

  const handleCreate = async (): Promise<{ ok: boolean; errorMessage: string | null }> => {
    try {
      const created = await planesSeguimientos.create({
        fecha_seguimiento: new Date(),
        id_plan_accion: state.id_plan_accion,
        comentario: state.comentario,
        usuario: state.usuario
      })

      if (!created.status || !created.data?.id_seguimiento) {
        return {
          errorMessage: created.message ?? "No fue posible crear el seguimiento del plan de accion",
          ok: false,
        }
      }

      const uploadResponse = await uploadAttachment({
        files,
        seguimientoid: created.data.id_seguimiento,
      })

      if (!uploadResponse.ok) {
        return {
          errorMessage: uploadResponse.errorMessage ?? "No se pudieron guardar los adjuntos del seguimiento",
          ok: false,
        }
      }

      const planResponse = await planAccion.load(String(state.id_plan_accion))

      if (!planResponse.status || !planResponse.data?.id_auditoria) {
        return {
          errorMessage: planResponse.message ?? "No fue posible cargar el plan de accion para enviar la notificacion",
          ok: false,
        }
      }

      const auditoriaResponse = await auditoria.load(String(planResponse.data.id_auditoria))

      if (!auditoriaResponse.status || !auditoriaResponse.data?.id_auditor) {
        return {
          errorMessage: auditoriaResponse.message ?? "No fue posible cargar la auditoria del plan de accion",
          ok: false,
        }
      }

      const auditorResponse = await auditores?.getById(String(auditoriaResponse.data.id_auditor))

      if (!auditorResponse?.status || !auditorResponse.data) {
        return {
          errorMessage: auditorResponse?.message ?? "No fue posible cargar el auditor para enviar la notificacion",
          ok: false,
        }
      }

      await actionPlanUpdattedNotification(
        planResponse.data,
        auditorResponse.data,
        created.data,
      )

      return {
        errorMessage: null,
        ok: true,
      }
    } catch (e: any) {
      return {
        errorMessage: e?.message ?? "Algo salio mal",
        ok: false,
      }
    }
  }




  return {
    handleCreate,
  };
}
