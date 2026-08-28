import './form.css'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import type { causal } from '../../models/database/causal'
import type { FormEvent } from 'react'
import { FistPartForm } from './first-part'
import { SecondPartForm } from './second-part'
import { ThirdPartForm } from './third-part'
import { useAuditoriaForm } from '../../Funcionalidades/form/hooks/useAuditoriaForm'
import toast from 'react-hot-toast'
import type { tienda } from '../../models/database/tienda'
import React from 'react'
import { mapCausalesOption, mapTiendaOption } from '../../Funcionalidades/shared/react-select'
import type { bodega } from '../../models/database/bodega'
import { PlanAccionForm } from '../form-plan-accion/plan-accion-form'
import { usePlanAccion } from '../../Funcionalidades/form-plan-accion/hooks/usePlanAccion'
import { ConfirmModal } from '../commons/confirmModal'

type FormProps = {
  auditoriaId?: number | null
  jefe_zonas: SelectOption[]
  zonas: SelectOption[]
  tienda: tienda[]
  bodegas: bodega[]
  tipos_tiendas: SelectOption[]
  auditores: SelectOption[]
  modalidades: SelectOption[]
  estado_invetarios: SelectOption[]
  causales_cancelacion: SelectOption[]
  estados_tienda: SelectOption[]
  causales: causal[]
  tiendas_originales: tienda[]
  areasResponsables: SelectOption[]
}

export function Form(props: FormProps) {
  const {formState, loading, itemsEvaluacion, itemsEvaluacionError, completion, resultsSummary, lastAction, submitError, getItemResult, updateField, updateItemResult, handleReset, handleSubmit, errors,} = useAuditoriaForm({ auditoriaId: props.auditoriaId })
  const auditoria = formState.auditoria
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = React.useState(false)
  const planAccionController = usePlanAccion()
  const [showConfirmation, setShowConfirmation] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const hasNonCompliantItem = formState.detalle.some((detalle) => detalle.cumple === false)

    if (hasNonCompliantItem && planAccionController.plansToCreate.length === 0) {
      toast.error('Debes crear al menos un plan de accion porque hay items que no cumplen.')
      setIsActionPlanModalOpen(true)
      return
    }

    setShowConfirmation(true)
  }

  async function confirmSubmit() {
    setIsSubmitting(true)

    try {
    const result = await handleSubmit()

    if(!result.ok) {
      toast.error(result.errorMessage ?? 'No fue posible enviar el formulario, intente nuevamente.')
      return
    }

    if (planAccionController.plansToCreate.length > 0 && result.data?.id_auditoria) {
      const plansResult = await planAccionController.handleCreate(result.data)

      if (!plansResult.ok) {
        toast.error(plansResult.errorMessage ?? 'La auditoria se creó, pero no fue posible crear los planes de acción.')
        return
      }
    }

    toast.success('Formulario enviado correctamente.')

    setShowConfirmation(false)
    handleReset()
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTiendas = React.useMemo(
    () =>
      props.tienda
        .filter((t : tienda) => t.id_zona === formState.auditoria.id_zona)
        .map((t) => mapTiendaOption(t)),
    [formState.auditoria.id_zona, props.tienda]
  );

  return (
    <main className="audit-form-page">
      <section className="audit-form-page__hero">
        <div className="audit-form-page__hero-copy">
          <span className="audit-form-page__eyebrow">Formulario segmentado</span>
          <h1>Auditoria integral de inventario y control operativo</h1>
          <p>
            Una sola vista para documentar la visita, validar controles, registrar hallazgos
            y dejar el plan de accion listo para seguimiento.
          </p>
          <div className="audit-form-page__hero-tags" aria-label="Resumen rapido">
            <span>Codigo {auditoria.id_auditoria}</span>
          </div>
        </div>

        <aside className="audit-form-page__hero-panel" aria-label="Estado de avance">
          <p className="audit-form-page__hero-label">Avance del registro</p>
          <strong>{completion}%</strong>
          <div className="audit-form-page__progress" aria-hidden="true">
            <span style={{ width: `${completion}%` }} />
          </div>
          <p className="audit-form-page__hero-note">
            {completion >= 85
              ? 'El formulario ya tiene un nivel alto de completitud.'
              : 'Aun faltan datos clave y respuestas por registrar.'}
          </p>
        </aside>
      </section>

      <div className="audit-form-layout">

        <form className="audit-form" onSubmit={onSubmit}>
          <FistPartForm 
            formState={formState}
            updateField={updateField}
            loading={loading}
            jefe_zonas={props.jefe_zonas}
            zonas={props.zonas}
            tienda={filteredTiendas}
            bodegas={props.bodegas}
            tipos_tiendas={props.tipos_tiendas}
            auditores={props.auditores}
            modalidades={props.modalidades}
            estado_invetarios={props.estado_invetarios}
            causales_cancelacion={props.causales_cancelacion}
            estados_tienda={props.estados_tienda}
            formErrors={errors} 
            tiendas_originales={props.tiendas_originales}          />

          <SecondPartForm 
            auditoria={formState.auditoria}
            causales={props.causales}
            getItemResult={getItemResult}
            updateField={updateField}
            updateItemResult={updateItemResult}
            itemsEvaluacion={itemsEvaluacion}
            itemsEvaluacionError={itemsEvaluacionError}
            loading={loading} 
            onOpenActionPlanModal={() => setIsActionPlanModalOpen(true)}          />

          <ThirdPartForm summary={resultsSummary} />

          <footer className="audit-form__footer">
            <div className="audit-form__footer-copy">
              <strong>Formulario listo para uso operativo</strong>
              <p>
                {submitError && submitError}
                {lastAction === 'submit' && 'El formulario se marco como enviado localmente.'}
                {lastAction === null && 'Puedes restablecer valores o dejar el cierre registrado.'}
              </p>
            </div>

            <div className="audit-form__actions">
              <button className="audit-form__button audit-form__button--ghost" type="button" onClick={handleReset}>
                Limpiar
              </button>
              <button className="audit-form__button audit-form__button--primary" type="submit">
                Continuar
              </button>
            </div>
          </footer>
        </form>
      </div>

      <ConfirmModal 
        isOpen={showConfirmation}
        confirmText="Enviar auditoría"
        isLoading={isSubmitting}
        loadingText="Enviando..."
        onSubmit={() => void confirmSubmit()}
        title={"¿Esta seguro de que los datos estan bien?"} 
        description={'Esto no sera reversible'} 
        onClose={() => {setShowConfirmation(false)}} 
          />
      <PlanAccionForm 
        isOpen={isActionPlanModalOpen}
        onClose={() => setIsActionPlanModalOpen(false)}
        zonaOptions={props.zonas}
        causalesOptions={props.causales.map((c) => { return mapCausalesOption(c) })}
        tiendas={props.tiendas_originales}
        areasResponsables={props.areasResponsables}
        controller={planAccionController} 
        auditoria={auditoria}      />
    </main>
  )
}
