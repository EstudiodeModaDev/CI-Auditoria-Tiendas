import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { jefe_zona } from '../../../models/database/jefe_zona'
import './auditor-modal.css'

type JefeZonaModalMode = 'create' | 'edit'

type JefeZonaFormState = Pick<jefe_zona, 'nombre' | 'correo' | 'activo'>

type JefeZonaModalProps = {
  isOpen: boolean
  mode: JefeZonaModalMode
  initialData?: jefe_zona | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: JefeZonaFormState) => Promise<void> | void
}

const defaultFormState: JefeZonaFormState = {
  nombre: '',
  correo: '',
  activo: true,
}

export function JefeZonaModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: JefeZonaModalProps) {
  const [formState, setFormState] = useState<JefeZonaFormState>(defaultFormState)

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

  const title = mode === 'create' ? 'Crear jefe de zona' : 'Editar jefe de zona'
  const submitLabel = mode === 'create' ? 'Crear jefe de zona' : 'Guardar cambios'

  function updateField<K extends keyof JefeZonaFormState>(field: K, value: JefeZonaFormState[K]) {
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
        aria-describedby="jefe-zona-modal-description"
        aria-labelledby="jefe-zona-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de jefes de zona</span>
            <h2 id="jefe-zona-modal-title">{title}</h2>
            <p id="jefe-zona-modal-description">
              Completa la informacion principal del jefe de zona para guardarla en la configuracion.
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
              <strong>Jefe de zona activo</strong>
              <span>Define si el jefe de zona estara disponible en el sistema.</span>
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

export type { JefeZonaFormState, JefeZonaModalMode, JefeZonaModalProps }
