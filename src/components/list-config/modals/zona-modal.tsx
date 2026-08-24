import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { zona } from '../../../models/database/zona'
import './auditor-modal.css'

type ZonaModalMode = 'create' | 'edit'

type ZonaFormState = Pick<zona, 'nombre' | 'activo'>

type ZonaModalProps = {
  isOpen: boolean
  mode: ZonaModalMode
  initialData?: zona | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: ZonaFormState) => Promise<void> | void
}

const defaultFormState: ZonaFormState = {
  nombre: '',
  activo: true,
}

export function ZonaModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: ZonaModalProps) {
  const [formState, setFormState] = useState<ZonaFormState>(defaultFormState)

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

  const title = mode === 'create' ? 'Crear zona' : 'Editar zona'
  const submitLabel = mode === 'create' ? 'Crear zona' : 'Guardar cambios'

  function updateField<K extends keyof ZonaFormState>(field: K, value: ZonaFormState[K]) {
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
        aria-describedby="zona-modal-description"
        aria-labelledby="zona-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de zonas</span>
            <h2 id="zona-modal-title">{title}</h2>
            <p id="zona-modal-description">
              Completa la informacion principal de la zona para guardarla en la configuracion.
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
              placeholder="Nombre de la zona"
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
              <strong>Zona activa</strong>
              <span>Define si la zona estara disponible en el sistema.</span>
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

export type { ZonaFormState, ZonaModalMode, ZonaModalProps }
