import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { marca } from '../../../models/database/marca'
import './auditor-modal.css'

type MarcaModalMode = 'create' | 'edit'

type MarcaFormState = Pick<marca, 'nombre' | 'activo'>

type MarcaModalProps = {
  isOpen: boolean
  mode: MarcaModalMode
  initialData?: marca | null
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: MarcaFormState) => Promise<void> | void
}

const defaultFormState: MarcaFormState = {
  nombre: '',
  activo: true,
}

export function MarcaModal({
  isOpen,
  mode,
  initialData,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: MarcaModalProps) {
  const [formState, setFormState] = useState<MarcaFormState>(defaultFormState)

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

  const title = mode === 'create' ? 'Crear marca' : 'Editar marca'
  const submitLabel = mode === 'create' ? 'Crear marca' : 'Guardar cambios'

  function updateField<K extends keyof MarcaFormState>(field: K, value: MarcaFormState[K]) {
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
        aria-describedby="marca-modal-description"
        aria-labelledby="marca-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de marcas</span>
            <h2 id="marca-modal-title">{title}</h2>
            <p id="marca-modal-description">
              Completa la informacion principal de la marca para guardarla en la configuracion.
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
              placeholder="Nombre de la marca"
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
              <strong>Marca activa</strong>
              <span>Define si la marca estara disponible en el sistema.</span>
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

export type { MarcaFormState, MarcaModalMode, MarcaModalProps }
