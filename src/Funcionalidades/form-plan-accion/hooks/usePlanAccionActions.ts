import React from "react";
import type { planAccion } from "../../../models/database/plan_accion";
import { useRepositories } from "../../../repositories/repositoriesContext";
import type { auditoria } from "../../../models/database/auditoria";
import { useEvidenciasAttachmentsActtions } from "../../evidencias-attachments/useUploadAttachments";
import { actionPlanCreatedNotification } from "../../mails/mailsFunctions";

type PendingPlan = {
  plan: planAccion;
  attachments: File[];
};

export function usePlanAccionActions() {
  const { planAccion, tienda, auditores, areasResponsables } = useRepositories()
  const { uploadAttachment } = useEvidenciasAttachmentsActtions()
  const [plansToCreate, setPlanToCreate] = React.useState<PendingPlan[]>([])

  const handleCreate = async (auditoria: auditoria): Promise<{ ok: boolean; errorMessage: string | null }> => {
    if (!(plansToCreate.length > 0)) {
      return {
        errorMessage: null,
        ok: true,
      }
    }

    try {
      for (const currentPlan of plansToCreate) {
        if(!auditoria.id_tienda) continue
        const tiendaFounded = await tienda?.getById(String(auditoria.id_tienda))
        const auditorFounded = await auditores?.getById(String(auditoria.id_auditor))
        const areasFounded = await areasResponsables?.getById(String(currentPlan.plan.id_area_responsable))
        const response = await planAccion?.create({
          ...currentPlan.plan,
          id_auditoria: auditoria.id_auditoria,
          responsable: tiendaFounded?.data?.nombre,
          correo_responsable: tiendaFounded?.data?.correo_tienda
        })

        if (!response?.status || !response.data?.id_plan_accion) {
          return {
            errorMessage: response?.message ?? "Algo salio mal",
            ok: false,
          }
        }

        const uploadResponse = await uploadAttachment({
          files: currentPlan.attachments,
          planId: response.data.id_plan_accion,
        })

        await actionPlanCreatedNotification(response.data, tiendaFounded?.data!, auditorFounded?.data!, areasFounded?.data?.nombre!)

        if (!uploadResponse.ok) {
          return {
            errorMessage: uploadResponse.errorMessage ?? "No se pudieron subir los adjuntos del plan",
            ok: false,
          }
        }
      }

      setPlanToCreate([])

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

  const addNewPlanToCreate = (newPlan: planAccion, attachments: File[]): boolean => {
    setPlanToCreate((current) => [...current, { plan: newPlan, attachments }])
    return true
  }

  const handleEdit = async (payload: Partial<planAccion>, id: string): Promise<{ ok: boolean; errorMessage: string | null }> => {
    try {
      const response = await planAccion?.update(id, payload)

      if (!response?.status) {
        return {
          errorMessage: response?.message ?? "Algo salio mal",
          ok: false,
        }
      }

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
    handleEdit,
    handleCreate,
    addNewPlanToCreate,
    plansToCreate,
    setPlanToCreate,
  };
}
