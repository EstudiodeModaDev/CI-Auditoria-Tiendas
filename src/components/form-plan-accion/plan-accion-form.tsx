import './plan-accion-form.css'
import * as React from 'react'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { PlanAccionFirstPartForm } from './plan-accion-first-part'
import type { usePlanAccion } from '../../Funcionalidades/form-plan-accion/hooks/usePlanAccion'
import { PlanAccionSeconPartForm } from './plan-accion-second-part'
import { PlanAccionThirdPartForm } from './plan-accion-third-part'
import type { tienda } from '../../models/database/tienda'
import { mapTiendaOption } from '../../Funcionalidades/shared/react-select'
import { useEvidenciasAttachmentsForm } from '../../Funcionalidades/evidencias-attachments/evidenciasAttachmentsForm'
import type { auditoria } from '../../models/database/auditoria'

type PlanAccionFormProps = {
  isOpen: boolean
  onClose: () => void
  zonaOptions: SelectOption[]
  causalesOptions: SelectOption[]
  tiendas: tienda[]
  areasResponsables: SelectOption[]
  controller: ReturnType<typeof usePlanAccion>
  auditoria: auditoria
}

export function PlanAccionForm({ auditoria, isOpen, onClose, causalesOptions, zonaOptions, tiendas, areasResponsables, controller }: PlanAccionFormProps) {
  const {attachments, addAttachment, resetAttachments} = useEvidenciasAttachmentsForm()

  const tiendasOptions = React.useMemo(
    () =>
      tiendas
        .filter((t: tienda) => t.id_zona === controller.state.id_zona)
        .map((t) => mapTiendaOption(t)),
    [controller.state.id_zona, tiendas]
  )

  function handleClose() {
    controller.resetState()
    controller.setPlanErrors({})
    resetAttachments()
    onClose()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = controller.addCurrentPlanToQueue(attachments)

    if (!result.ok) {
      return
    }

    resetAttachments()
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="action-plan-modal__overlay" role="presentation" onClick={handleClose}>
      <section
        aria-describedby="action-plan-modal-description"
        aria-labelledby="action-plan-modal-title"
        aria-modal="true"
        className="action-plan-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <form className="action-plan-form" onSubmit={handleSubmit}>
          <PlanAccionFirstPartForm
            zonaOptions={zonaOptions}
            causalOptions={causalesOptions}
            tiendaOptions={tiendasOptions}
            areasResponsablesOptions={areasResponsables}
            updateField={controller.setField}
            state={controller.state}
            errors={controller.planErrors}
            loading={controller.loading} 
            auditoria={auditoria}/>

          <PlanAccionSeconPartForm
            state={controller.state}
            errors={controller.planErrors}
            evidencias={attachments}
            setFile={addAttachment}
            updateField={controller.setField}
            loading={controller.loading}
          />

          <PlanAccionThirdPartForm
            updateField={controller.setField}
            state={controller.state}
            errors={controller.planErrors}
            loading={controller.loading}
          />

          <label className="action-plan-form__notify">
            <input
              type="checkbox"
              checked={controller.notificarJefeZona}
              onChange={(event) => controller.setNotificarJefeZona(event.target.checked)}
              disabled={controller.loading}
            />
            <span>Notificar al jefe de zona al crear el plan de accion</span>
          </label>

          <footer className="action-plan-form__footer">
            <div>
              <strong>Plan listo para anexarse</strong>
              <p>
                Tienes {controller.plansToCreate.length} plan{controller.plansToCreate.length === 1 ? '' : 'es'} pendiente
                {controller.plansToCreate.length === 1 ? '' : 's'} por crear con la auditoria.
              </p>
            </div>
            <div className="action-plan-form__footer-actions">
              <button className="action-plan-form__cancel" type="button" onClick={handleClose}>
                Cancelar
              </button>
              <button className="action-plan-form__submit" type="submit" disabled={controller.loading}>
                Agregar plan a la auditoria
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}
