import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'
import './auditor-modal.css'

type ItemEvaluacionModalMode = 'create' | 'edit'

type ItemEvaluacionFormState = Pick<item_evaluacion, 'nombre' | 'requiere_cantidad' | 'requiere_causal' | 'activo'>

type ItemEvaluacionModalProps = {
  isOpen: boolean
  mode: ItemEvaluacionModalMode
  initialData?: item_evaluacion | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: ItemEvaluacionFormState) => Promise<void> | void
}

const defaultFormState: ItemEvaluacionFormState = {
  nombre: '',
  requiere_cantidad: true,
  requiere_causal: false,
  activo: true,
}

export function ItemEvaluacionModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: ItemEvaluacionModalProps) {
  const [formState, setFormState] = useState<ItemEvaluacionFormState>(defaultFormState)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(
      initialData
        ? {
            nombre: initialData.nombre ?? '',
            requiere_cantidad: Boolean(initialData.requiere_cantidad),
            requiere_causal: Boolean(initialData.requiere_causal),
            activo: Boolean(initialData.activo),
          }
        : defaultFormState,
    )
  }, [initialData, isOpen])

  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Crear item de evaluacion' : 'Editar item de evaluacion'
  const submitLabel = mode === 'create' ? 'Crear item' : 'Guardar cambios'

  function updateField<K extends keyof ItemEvaluacionFormState>(field: K, value: ItemEvaluacionFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      nombre: formState.nombre.trim(),
      requiere_cantidad: formState.requiere_cantidad,
      requiere_causal: formState.requiere_causal,
      activo: formState.activo,
    })
  }

  return (
    <div className="auditor-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="item-evaluacion-modal-description"
        aria-labelledby="item-evaluacion-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de items de evaluacion</span>
            <h2 id="item-evaluacion-modal-title">{title}</h2>
            <p id="item-evaluacion-modal-description">
              Completa la informacion principal del item para guardarla en la configuracion.
            </p>
          </div>

          <button className="auditor-modal__close" type="button" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </button>
        </header>

        <form className="auditor-modal__form" onSubmit={handleSubmit}>
          <label className="auditor-modal__field">
            <span>Nombre</span>
            <input
              type="text"
              value={formState.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              placeholder="Nombre del item"
              required
            />
          </label>

          <label className="auditor-modal__toggle">
            <input
              type="checkbox"
              checked={formState.requiere_cantidad}
              onChange={(event) => updateField('requiere_cantidad', event.target.checked)}
            />
            <div>
              <strong>Requiere cantidad</strong>
              <span>Activa esta opcion cuando el item deba registrar cantidades.</span>
            </div>
          </label>

          <label className="auditor-modal__toggle">
            <input
              type="checkbox"
              checked={formState.requiere_causal}
              onChange={(event) => updateField('requiere_causal', event.target.checked)}
            />
            <div>
              <strong>Requiere causal</strong>
              <span>Activa esta opcion cuando el item deba solicitar una causal.</span>
            </div>
          </label>

          <label className="auditor-modal__toggle">
            <input
              type="checkbox"
              checked={formState.activo}
              onChange={(event) => updateField('activo', event.target.checked)}
            />
            <div>
              <strong>Item activo</strong>
              <span>Define si el item estara disponible en el sistema.</span>
            </div>
          </label>

          {errorMessage ? <p className="auditor-modal__error">{errorMessage}</p> : null}

          <div className="auditor-modal__actions">
            <button className="auditor-modal__button auditor-modal__button--secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="auditor-modal__button auditor-modal__button--primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export type { ItemEvaluacionFormState, ItemEvaluacionModalMode, ItemEvaluacionModalProps }
