import type { planAccion } from '../../models/database/plan_accion'
import React from 'react'
import { useRepositories } from '../../repositories/repositoriesContext'
import './plan-accion-detail-modal.css'
import { usePlanAccionRespuestasList } from '../../Funcionalidades/RespuestaPlanAccion/hooks/usePlanAccionRespuestasList'
import toast from 'react-hot-toast'
import { actionPlanApprovedNotification, actionPlanReturnedNotification } from '../../Funcionalidades/mails/mailsFunctions'
import type { tienda } from '../../models/database/tienda'
import type { auditor } from '../../models/database/auditor'

type PlanAccionDetailModalProps = {
  plan: planAccion | null
  isOpen: boolean
  onClose: () => void
  onPlanUpdated?: (updatedPlan: planAccion) => void
  currentName: string
  tiendas: tienda[]
  auditor?: auditor
}

type PlanStatusOption = 'Abierto' | 'Cerrado'

export function ChangeActionPlanStatus({
  plan,
  isOpen,
  onClose,
  onPlanUpdated,
  currentName,
  tiendas,
  auditor,
}: PlanAccionDetailModalProps) {
  const { planAccion, planesSeguimientos } = useRepositories()
  const [currentPlan, setCurrentPlan] = React.useState<planAccion | null>(plan)
  const [isReasonModalOpen, setIsReasonModalOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<PlanStatusOption>('Abierto')
  const [reason, setReason] = React.useState('')
  const [reasonError, setReasonError] = React.useState<string | null>(null)
  const [statusLoading, setStatusLoading] = React.useState(false)
  const { loadPlanAccionResponses } = usePlanAccionRespuestasList(String(plan?.id_plan_accion ?? ''))
  const visiblePlan = currentPlan ?? plan
  const selectedTienda = React.useMemo(() => {
    return tiendas.find((t) => t.id_tienda === visiblePlan?.id_tienda)
  }, [tiendas, visiblePlan?.id_tienda])

  React.useEffect(() => {
    setCurrentPlan(plan)
    setSelectedStatus(plan?.estado?.toLowerCase() === 'cerrado' ? 'Cerrado' : 'Abierto')
    setIsReasonModalOpen(false)
    setReason('')
    setReasonError(null)
  }, [plan, isOpen])

  async function applyStatusUpdate(nextStatus: PlanStatusOption, nextReason: string) {
    if (!visiblePlan?.id_plan_accion) {
      toast.error('No fue posible identificar el plan de accion')
      return
    }

    const trimmedReason = nextReason.trim()

    if (!trimmedReason) {
      setReasonError(
        nextStatus === 'Cerrado'
          ? 'Debes escribir el motivo del cierre'
          : 'Debes escribir el motivo de la devolucion'
      )
      return
    }

    setStatusLoading(true)

    try {
      const seguimientoResponse = await planesSeguimientos.create({
        fecha_seguimiento: new Date(),
        id_plan_accion: visiblePlan.id_plan_accion,
        comentario: nextStatus === 'Cerrado'
          ? `Cierre del plan: ${trimmedReason}`
          : `Devolucion del plan: ${trimmedReason}`,
        usuario: currentName,
      })

      if (!seguimientoResponse.status) {
        toast.error(
          seguimientoResponse.message ??
          (nextStatus === 'Cerrado'
            ? 'No fue posible registrar el motivo del cierre'
            : 'No fue posible registrar el motivo de la devolucion')
        )
        return
      }

      const updateResponse = await planAccion.update(String(visiblePlan.id_plan_accion), {
        estado: nextStatus,
      })

      if (!updateResponse.status || !updateResponse.data) {
        toast.error(updateResponse.message ?? 'No fue posible actualizar el estado del plan')
        return
      }

      setCurrentPlan(updateResponse.data)
      onPlanUpdated?.(updateResponse.data)
      setSelectedStatus(nextStatus)
      setIsReasonModalOpen(false)
      setReason('')
      setReasonError(null)
      onClose()
      toast.success('Estado del plan actualizado con exito')

      await loadPlanAccionResponses()

      console.log(nextStatus)
      console.log(plan)
      console.log(selectedTienda)
      console.log(auditor)
    
    } finally {
      setStatusLoading(false)
      if (nextStatus === 'Abierto' && plan && selectedTienda && auditor) {
        await actionPlanReturnedNotification(plan, trimmedReason, selectedTienda, auditor)
      }

      if (nextStatus === 'Cerrado' && plan && selectedTienda && auditor) {
        await actionPlanApprovedNotification(plan, selectedTienda, auditor)
      }
    }
  }

  function handleStatusContinue() {
    setReasonError(null)
    setIsReasonModalOpen(true)
  }

  if (!isOpen || !visiblePlan) {
    return null
  }

  return (
    <div className="plan-accion-detail-modal__overlay" role="presentation" onClick={onClose}>
      <div className="plan-accion-detail-modal__nested-overlay" role="presentation" onClick={() => !statusLoading && onClose()}>
        <section
          aria-labelledby="plan-accion-status-modal-title"
          aria-modal="true"
          className="plan-accion-detail-modal__nested-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <header className="plan-accion-detail-modal__nested-header">
            <div>
              <span className="plan-accion-detail-modal__eyebrow">Estado del plan</span>
              <h3 id="plan-accion-status-modal-title">Actualizar estado</h3>
              <p>Selecciona el estado que quieres dejar para este plan de accion.</p>
            </div>
          </header>

          <label className="plan-accion-detail-modal__field">
            <span>Nuevo estado</span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as PlanStatusOption)}
              disabled={statusLoading}
            >
              <option value="Abierto">Abierto</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </label>

          <footer className="plan-accion-detail-modal__nested-footer">
            <button
              className="plan-accion-detail-modal__button plan-accion-detail-modal__button--secondary"
              type="button"
              onClick={onClose}
              disabled={statusLoading}
            >
              Cancelar
            </button>
            <button
              className="plan-accion-detail-modal__button"
              type="button"
              onClick={handleStatusContinue}
              disabled={statusLoading}
            >
              {statusLoading ? 'Guardando...' : 'Continuar'}
            </button>
          </footer>
        </section>
      </div>

      {isReasonModalOpen ? (
        <div className="plan-accion-detail-modal__nested-overlay" role="presentation" onClick={() => !statusLoading && setIsReasonModalOpen(false)}>
          <section
            aria-labelledby="plan-accion-close-modal-title"
            aria-modal="true"
            className="plan-accion-detail-modal__nested-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="plan-accion-detail-modal__nested-header">
              <div>
                <span className="plan-accion-detail-modal__eyebrow">Confirmacion</span>
                <h3 id="plan-accion-close-modal-title">
                  {selectedStatus === 'Cerrado' ? 'Motivo del cierre' : 'Motivo de la devolucion'}
                </h3>
                <p>
                  {selectedStatus === 'Cerrado'
                    ? 'Antes de cerrar el plan, registra por que se debe marcar como cerrado.'
                    : 'Antes de reabrir el plan, registra el motivo de la devolucion.'}
                </p>
              </div>
            </header>

            <label className="plan-accion-detail-modal__field">
              <span>{selectedStatus === 'Cerrado' ? 'Motivo del cierre' : 'Motivo de la devolucion'}</span>
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value)
                  if (reasonError) {
                    setReasonError(null)
                  }
                }}
                disabled={statusLoading}
                placeholder={
                  selectedStatus === 'Cerrado'
                    ? 'Describe el motivo del cierre'
                    : 'Describe el motivo de la devolucion'
                }
                rows={4}
              />
              {reasonError ? <small className="plan-accion-detail-modal__error">{reasonError}</small> : null}
            </label>

            <footer className="plan-accion-detail-modal__nested-footer">
              <button
                className="plan-accion-detail-modal__button plan-accion-detail-modal__button--secondary"
                type="button"
                onClick={() => setIsReasonModalOpen(false)}
                disabled={statusLoading}
              >
                Volver
              </button>
              <button
                className="plan-accion-detail-modal__button"
                type="button"
                onClick={() => void applyStatusUpdate(selectedStatus, reason)}
                disabled={statusLoading}
              >
                {statusLoading ? 'Guardando...' : selectedStatus === 'Cerrado' ? 'Confirmar cierre' : 'Confirmar devolucion'}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export type { PlanAccionDetailModalProps }
