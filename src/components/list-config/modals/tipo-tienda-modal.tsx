import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { tipo_tienda } from '../../../models/database/tipo_tienda'
import './auditor-modal.css'

type TipoTiendaModalMode = 'create' | 'edit'

type TipoTiendaFormState = Pick<tipo_tienda, 'nombre' | 'activo'>

type TipoTiendaModalProps = {
  isOpen: boolean
  mode: TipoTiendaModalMode
  initialData?: tipo_tienda | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: TipoTiendaFormState) => Promise<void> | void
}

const defaultFormState: TipoTiendaFormState = {
  nombre: '',
  activo: true,
}

export function TipoTiendaModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: TipoTiendaModalProps) {
  const [formState, setFormState] = useState<TipoTiendaFormState>(defaultFormState)

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

  const title = mode === 'create' ? 'Crear tipo de tienda' : 'Editar tipo de tienda'
  const submitLabel = mode === 'create' ? 'Crear tipo de tienda' : 'Guardar cambios'

  function updateField<K extends keyof TipoTiendaFormState>(field: K, value: TipoTiendaFormState[K]) {
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
        aria-describedby="tipo-tienda-modal-description"
        aria-labelledby="tipo-tienda-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de tipos de tienda</span>
            <h2 id="tipo-tienda-modal-title">{title}</h2>
            <p id="tipo-tienda-modal-description">
              Completa la informacion principal del tipo de tienda para guardarlo en la configuracion.
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
              placeholder="Nombre del tipo de tienda"
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
              <strong>Tipo de tienda activo</strong>
              <span>Define si este tipo de tienda estara disponible en el sistema.</span>
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

export type { TipoTiendaFormState, TipoTiendaModalMode, TipoTiendaModalProps }
