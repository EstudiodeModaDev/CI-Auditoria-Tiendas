import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { areas_responsables } from '../../../models/database/areas_responsables'
import './auditor-modal.css'

type AreaResponsableModalMode = 'create' | 'edit'

type AreaResponsableFormState = Pick<areas_responsables, 'nombre' | 'activo'>

type AreaResponsableModalProps = {
  isOpen: boolean
  mode: AreaResponsableModalMode
  initialData?: areas_responsables | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: AreaResponsableFormState) => Promise<void> | void
}

const defaultFormState: AreaResponsableFormState = {
  nombre: '',
  activo: true,
}

export function AreaResponsableModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: AreaResponsableModalProps) {
  const [formState, setFormState] = useState<AreaResponsableFormState>(defaultFormState)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(
      initialData
        ? {
            nombre: initialData.nombre ?? '',
            activo: Boolean(initialData.activo),
          }
        : defaultFormState,
    )
  }, [initialData, isOpen])

  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Crear area responsable' : 'Editar area responsable'
  const submitLabel = mode === 'create' ? 'Crear area' : 'Guardar cambios'

  function updateField<K extends keyof AreaResponsableFormState>(field: K, value: AreaResponsableFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      nombre: formState.nombre.trim(),
      activo: formState.activo,
    })
  }

  return (
    <div className="auditor-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="area-responsable-modal-description"
        aria-labelledby="area-responsable-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de areas responsables</span>
            <h2 id="area-responsable-modal-title">{title}</h2>
            <p id="area-responsable-modal-description">
              Completa la informacion principal del area responsable para guardarla en la configuracion.
            </p>
          </div>

          <button className="auditor-modal__close" type="button" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </button>
        </header>

        <form className="auditor-modal__form" onSubmit={handleSubmit}>
          <label className="auditor-modal__field">
            <span>Nombre del area</span>
            <input
              type="text"
              value={formState.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              placeholder="Nombre del area responsable"
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
              <strong>Area activa</strong>
              <span>Define si el area estara disponible para los planes de accion.</span>
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

export type { AreaResponsableFormState, AreaResponsableModalMode, AreaResponsableModalProps }
