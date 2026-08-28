import type { planAccion } from "../../../models/database/plan_accion";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { usePlanAccionFilters } from "./usePlanAccionFilters";
import { usePlanAccionActions } from "./usePlanAccionActions";
import { usePlanAccionList } from "./usePlanAccionList";
import toast from "react-hot-toast";
import { planAccionForm } from "./usePlanAccionForm";
import { validateActionPlan } from "../util/validateNewPlan";
import type { auditoria } from "../../../models/database/auditoria";

export function usePlanAccion() {
  const { planAccion } = useRepositories()
  const filterController = usePlanAccionFilters()
  const actionsController = usePlanAccionActions()
  const listController = usePlanAccionList(filterController)
  const formController = planAccionForm()

  const handleCreate = async (auditoria: auditoria): Promise<{ ok: boolean; errorMessage?: string }> => {
    formController.setLoading(true)

    try {
      const response = await actionsController.handleCreate(auditoria)

      if (!response.ok) {
        toast.error(response.errorMessage ?? "Algo ha salido mal haciendo la creacion de los planes de accion")
        return {
          ok: false,
          errorMessage: response.errorMessage ?? "No fue posible crear los planes de accion.",
        }
      }

      if (actionsController.plansToCreate.length > 0) {
        toast.success("Planes de accion creados con exito")
      }

      return {
        ok: true,
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Algo ha salido mal creando los planes de accion")
      return {
        ok: false,
        errorMessage: e?.message ?? "No fue posible crear los planes de accion.",
      }
    } finally {
      formController.setLoading(false)
    }
  }

  const addCurrentPlanToQueue = (attachments: File[]): { ok: boolean } => {
    const errors = validateActionPlan(formController.state)
    formController.setPlanErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast.error("Hay algunos campos obligatorios sin llenar")
      return { ok: false }
    }

    actionsController.addNewPlanToCreate(formController.state, attachments, formController.notificarJefeZona)
    formController.resetState()
    formController.setPlanErrors({})
    toast.success("Plan de accion listo para crear")

    return { ok: true }
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
    addCurrentPlanToQueue,
    plansToCreate: actionsController.plansToCreate,
    setPlansToCreate: actionsController.setPlanToCreate,
    ...filterController,
    ...listController,
    ...formController,
  };
}
