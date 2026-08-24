import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { bodega } from '../../../models/database/bodega'
import './auditor-modal.css'

type BodegaModalMode = 'create' | 'edit'

type BodegaFormState = Pick<bodega, 'codigo' | 'codigo_co' | 'activo'>

type BodegaModalProps = {
  isOpen: boolean
  mode: BodegaModalMode
  initialData?: bodega | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: BodegaFormState) => Promise<void> | void
}

const defaultFormState: BodegaFormState = {
  codigo: '',
  codigo_co: '',
  activo: true,
}

export function BodegaModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: BodegaModalProps) {
  const [formState, setFormState] = useState<BodegaFormState>(defaultFormState)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(
      initialData
        ? {
            codigo: initialData.codigo ?? '',
            codigo_co: initialData.codigo_co ?? '',
            activo: Boolean(initialData.activo),
          }
        : defaultFormState,
    )
  }, [initialData, isOpen])

  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Crear bodega' : 'Editar bodega'
  const submitLabel = mode === 'create' ? 'Crear bodega' : 'Guardar cambios'

  function updateField<K extends keyof BodegaFormState>(field: K, value: BodegaFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      codigo: formState.codigo.trim(),
      codigo_co: formState.codigo_co.trim(),
      activo: formState.activo,
    })
  }

  return (
    <div className="auditor-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="bodega-modal-description"
        aria-labelledby="bodega-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de bodegas</span>
            <h2 id="bodega-modal-title">{title}</h2>
            <p id="bodega-modal-description">
              Completa la informacion principal de la bodega para guardarla en la configuracion.
            </p>
          </div>

          <button className="auditor-modal__close" type="button" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </button>
        </header>

        <form className="auditor-modal__form" onSubmit={handleSubmit}>
          <label className="auditor-modal__field">
            <span>Codigo</span>
            <input
              type="text"
              value={formState.codigo}
              onChange={(event) => updateField('codigo', event.target.value)}
              placeholder="Codigo de bodega"
              required
            />
          </label>

          <label className="auditor-modal__field">
            <span>Codigo CO</span>
            <input
              type="text"
              value={formState.codigo_co}
              onChange={(event) => updateField('codigo_co', event.target.value)}
              placeholder="Codigo CO relacionado"
              required
            />
          </label>

          <label className="auditor-modal__toggle">
            <input
              type="checkbox"
              checked={formState.activo}
              onChange={(event) => updateField('activo', event.target.checked)}
            />
            <div>
              <strong>Bodega activa</strong>
              <span>Define si la bodega estara disponible en el sistema.</span>
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

export type { BodegaFormState, BodegaModalMode, BodegaModalProps }
