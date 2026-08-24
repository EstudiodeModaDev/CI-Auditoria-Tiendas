import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { auditor } from '../../../models/database/auditor'
import './auditor-modal.css'

type AuditorModalMode = 'create' | 'edit'

type AuditorFormState = Pick<auditor, 'nombre' | 'correo' | 'activo'>

type AuditorModalProps = {
  isOpen: boolean
  mode: AuditorModalMode
  initialData?: auditor | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: AuditorFormState) => Promise<void> | void
}

const defaultFormState: AuditorFormState = {
  nombre: '',
  correo: '',
  activo: true,
}

export function AuditorModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: AuditorModalProps) {
  const [formState, setFormState] = useState<AuditorFormState>(defaultFormState)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(
      initialData
        ? {
            nombre: initialData.nombre ?? '',
            correo: initialData.correo ?? '',
            activo: Boolean(initialData.activo),
          }
        : defaultFormState,
    )
  }, [initialData, isOpen])

  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Crear auditor' : 'Editar auditor'
  const submitLabel = mode === 'create' ? 'Crear auditor' : 'Guardar cambios'

  function updateField<K extends keyof AuditorFormState>(field: K, value: AuditorFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      nombre: formState.nombre.trim(),
      correo: formState.correo.trim(),
      activo: formState.activo,
    })
  }

  return (
    <div className="auditor-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="auditor-modal-description"
        aria-labelledby="auditor-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de auditores</span>
            <h2 id="auditor-modal-title">{title}</h2>
            <p id="auditor-modal-description">
              Completa la informacion principal del auditor para guardarla en la configuracion.
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
              placeholder="Nombre completo"
              required
            />
          </label>

          <label className="auditor-modal__field">
            <span>Correo</span>
            <input
              type="email"
              value={formState.correo}
              onChange={(event) => updateField('correo', event.target.value)}
              placeholder="correo@empresa.com"
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
              <strong>Auditor activo</strong>
              <span>Define si el auditor estara disponible en el sistema.</span>
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

export type { AuditorFormState, AuditorModalMode, AuditorModalProps }
