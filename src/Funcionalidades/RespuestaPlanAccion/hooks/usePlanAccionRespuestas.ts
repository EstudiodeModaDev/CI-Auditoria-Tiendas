import React from "react";
import toast from "react-hot-toast";
import type { planAccionSeguimientoErrors } from "../../../models/database/plan_accion";
import { usePlanAccionRespuestaForm } from "./usePlanAccionRespuestaForm";
import { usePlanAccionRespuestasActions } from "./usePlanAccionActions";
import { usePlanAccionRespuestasList } from "./usePlanAccionRespuestasList";

function validatePlanAccionRespuesta() {
  return (state: ReturnType<typeof usePlanAccionRespuestaForm>["state"]): planAccionSeguimientoErrors => {
    const errors: planAccionSeguimientoErrors = {}

    if (!state.id_plan_accion) {
      errors.id_plan_accion = "El plan de accion es obligatorio"
    }

    if (!state.comentario.trim()) {
      errors.comentario = "Debes registrar una observacion"
    }

    if (!state.usuario.trim()) {
      errors.usuario = "No fue posible identificar el usuario logeado"
    }

    return errors
  }
}

export function usePlanAccionRespuestas(idPlanAccion: number | null, files: File[]) {
  const safePlanId = idPlanAccion ?? 0
  const formController = usePlanAccionRespuestaForm(safePlanId)
  const listController = usePlanAccionRespuestasList(String(safePlanId))
  const actionsController = usePlanAccionRespuestasActions({
    state: formController.state,
    files,
  })
  const validate = validatePlanAccionRespuesta()

  const handleCreate = async () => {
    const errors = validate(formController.state)
    formController.setPlanErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast.error("Completa los campos requeridos para guardar la respuesta")
      return {
        ok: false,
        errorMessage: "Hay campos pendientes por completar",
      }
    }

    formController.setLoading(true)

    try {
      const response = await actionsController.handleCreate()

      if (!response.ok) {
        toast.error(response.errorMessage ?? "No fue posible guardar la respuesta")
        return response
      }

      await listController.loadPlanAccionResponses()
      formController.resetState()
      formController.setPlanErrors({})
      toast.success("Respuesta del plan guardada con exito")

      return {
        ok: true,
        errorMessage: null,
      }
    } finally {
      formController.setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!idPlanAccion) {
      return
    }

    void listController.loadPlanAccionResponses()
  }, [idPlanAccion, listController.loadPlanAccionResponses])

  return {
    ...formController,
    ...listController,
    handleCreate,
  }
}
