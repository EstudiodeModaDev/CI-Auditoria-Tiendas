import * as React from "react";
import type { AuditoriaDetalleDTO, auditoriaFormDTO, CreateAuditoriaDTO } from "../../../models/components/DTO/auditoriaForm";
import { initialAuditoriaState } from "../utils/newAuditoria";
import { hasAuditoriaErrors, type createAuditoriaErrors, validateAuditoria } from "../utils/validateAuditoria";
import { useItemEvaluacionCatalog } from "./useItemEvaluacionCatalog";
import { useAuditoriaDetalle } from "./useAuditoriaDetalle";
import { useAuditoriaMetrics } from "./useAuditoriaMetrics";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { createAuditoriaDetallePayload, createAuditoriaPayload } from "../utils/auditoriaPayload";
import type { auditoria } from "../../../models/database/auditoria";

function createDefaultFormState(): CreateAuditoriaDTO {
  return {
    auditoria: initialAuditoriaState(),
    detalle: [],
  }
}

type UseAuditoriaFormOptions = {
  auditoriaId?: number | null
}

export function useAuditoriaForm(options?: UseAuditoriaFormOptions) {
  const repositories = useRepositories()
  const [formState, setFormState] = React.useState<CreateAuditoriaDTO>(createDefaultFormState)
  const [lastAction, setLastAction] = React.useState<'submit' | null>(null)
  const [errors, setErrors] = React.useState<createAuditoriaErrors>({
    auditoria: {},
    detalle: [],
  })
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const {
    itemsEvaluacion,
    itemsEvaluacionError,
    loading: itemsLoading,
    loadItemsEvaluacion,
  } = useItemEvaluacionCatalog()
  const { buildSubmitState, getCompletionScore, getResultsSummary } = useAuditoriaMetrics()

  const setDetalle = React.useCallback((updater: React.SetStateAction<AuditoriaDetalleDTO[]>) => {
    setFormState((current) => ({
      ...current,
      detalle: typeof updater === 'function' ? updater(current.detalle) : updater,
    }))
  }, [])

  const { syncWithItems, updateItemResult, getItemResult } = useAuditoriaDetalle(formState.detalle, setDetalle)

  React.useEffect(() => {
    async function loadCatalog() {
      const response = await loadItemsEvaluacion()

      if (response.ok) {
        syncWithItems(response.data)
      }
    }

    void loadCatalog()
  }, [loadItemsEvaluacion, syncWithItems])

  const loadAuditoria = React.useCallback(async (auditoriaId: number | string) => {
    setSubmitting(true)
    setSubmitError(null)

    const auditoriaResponse = await repositories.auditoria?.load(String(auditoriaId))

    if (!auditoriaResponse?.status || !auditoriaResponse.data) {
      setSubmitError(auditoriaResponse?.message ?? 'No fue posible cargar la auditoria.')
      setSubmitting(false)
      return {
        ok: false,
      }
    }

    const detalleResponse = await repositories.auditoriaDetalle?.load(String(auditoriaId))

    if (!detalleResponse?.status) {
      setSubmitError(detalleResponse?.message ?? 'No fue posible cargar el detalle de la auditoria.')
      setSubmitting(false)
      return {
        ok: false,
      }
    }

    setFormState({
      auditoria: {
        ...auditoriaResponse.data,
        fecha_auditoria: new Date(auditoriaResponse.data.fecha_auditoria),
      },
      detalle: detalleResponse.data.map((detalle) => ({
        id_item: detalle.id_item,
        cumple: detalle.cumple,
        id_causal: detalle.id_causal,
        cantidad_afectada: detalle.cantidad_afectada,
        observacion: detalle.observacion,
      })),
    })
    setLastAction(null)
    setSubmitting(false)

    return {
      ok: true,
    }
  }, [repositories.auditoria, repositories.auditoriaDetalle])

  React.useEffect(() => {
    if (!options?.auditoriaId) {
      return
    }

    void loadAuditoria(options.auditoriaId)
  }, [loadAuditoria, options?.auditoriaId])

  const updateField = React.useCallback(<K extends keyof auditoriaFormDTO>(field: K, value: auditoriaFormDTO[K]) => {
    setFormState((current) => ({
      ...current,
      auditoria: {
        ...current.auditoria,
        [field]: value,
      },
    }))
  }, [])

  const handleReset = React.useCallback(() => {
    setFormState(createDefaultFormState())
    setLastAction(null)
    setSubmitError(null)
    setErrors({
      auditoria: {},
      detalle: [],
    })
  }, [])

  const handleSubmit = React.useCallback(async (): Promise<{ok: boolean, data: auditoria | null, errorMessage?: string}> => {
    setSubmitting(true)
    setSubmitError(null)

    const nextState = buildSubmitState(formState)
    const nextErrors = validateAuditoria(nextState)
    setErrors(nextErrors)

    if (hasAuditoriaErrors(nextErrors)) {
      setSubmitting(false)
      return {
        ok: false,
        data: null,
        errorMessage: 'El formulario tiene errores de validacion.',
      }
    }

    const auditoriaPayload = createAuditoriaPayload(nextState)
    const auditoriaResponse = await repositories.auditoria?.create(auditoriaPayload)

    if (!auditoriaResponse?.status || !auditoriaResponse.data?.id_auditoria) {
      const message = auditoriaResponse?.message ?? 'No fue posible crear la auditoria.'
      setSubmitError(message)
      setSubmitting(false)

      return {
        ok: false,
        data: null,
        errorMessage: message,
      }
    }

    const detallePayload = nextState.detalle.map((detalle) =>
      createAuditoriaDetallePayload(auditoriaResponse.data!.id_auditoria!, detalle),
    )

    const detalleResponse = await repositories.auditoriaDetalle?.create(detallePayload)

    if (!detalleResponse?.status) {
      const message = detalleResponse?.message ?? 'No fue posible crear el detalle de la auditoria.'
      setSubmitError(message)
      setSubmitting(false)

      return {
        ok: false,
        data: null,
        errorMessage: message,
      }
    }

    const persistedState: CreateAuditoriaDTO = {
      ...nextState,
      auditoria: {
        ...nextState.auditoria,
        id_auditoria: auditoriaResponse.data.id_auditoria,
      },
    }

    setFormState(persistedState)
    setLastAction('submit')
    setSubmitting(false)

    return {
      ok: true,
      data: auditoriaResponse.data,
    }
  }, [buildSubmitState, formState, repositories.auditoria, repositories.auditoriaDetalle])

  const completion = React.useMemo(() => getCompletionScore(formState), [formState, getCompletionScore])
  const resultsSummary = React.useMemo(() => getResultsSummary(formState), [formState, getResultsSummary])

  return {
    formState,
    loading: itemsLoading || submitting,
    itemsEvaluacion,
    itemsEvaluacionError,
    completion,
    resultsSummary,
    errors,
    lastAction,
    submitError,
    getItemResult,
    loadAuditoria,
    updateField,
    updateItemResult,
    handleReset,
    handleSubmit,
  }
}
