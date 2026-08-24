import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import Select from 'react-select'
import type { causal } from '../../../models/database/causal'
import { buildConfigSelectStyles } from '../../commons/react-select-styles'
import type { CausalSelectOption } from '../../../Funcionalidades/configs/causales/hooks/useCausalRelations'
import './auditor-modal.css'

type CausalModalMode = 'create' | 'edit'

type CausalFormState = Pick<causal, 'id_item' | 'descripcion' | 'activo'>

type CausalModalProps = {
  isOpen: boolean
  mode: CausalModalMode
  initialData?: causal | null
  itemOptions: CausalSelectOption[]
  isLoadingRelations?: boolean
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: CausalFormState) => Promise<void> | void
}

const defaultFormState: CausalFormState = {
  id_item: '',
  descripcion: '',
  activo: true,
}

export function CausalModal({
  isOpen,
  mode,
  initialData,
  itemOptions,
  isLoadingRelations = false,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: CausalModalProps) {
  const [formState, setFormState] = useState<CausalFormState>(defaultFormState)
  const inputIdPrefix = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(
      initialData
        ? {
            id_item: String(initialData.id_item ?? ''),
            descripcion: initialData.descripcion ?? '',
            activo: Boolean(initialData.activo),
          }
        : defaultFormState,
    )
  }, [initialData, isOpen])

  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Crear causal' : 'Editar causal'
  const submitLabel = mode === 'create' ? 'Crear causal' : 'Guardar cambios'

  function updateField<K extends keyof CausalFormState>(field: K, value: CausalFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      id_item: formState.id_item,
      descripcion: formState.descripcion.trim(),
      activo: formState.activo,

    })
  }

  return (
    <div className="auditor-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="causal-modal-description"
        aria-labelledby="causal-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de causales</span>
            <h2 id="causal-modal-title">{title}</h2>
            <p id="causal-modal-description">
              Completa la informacion principal de la causal y relacionala con un item de evaluacion.
            </p>
          </div>

          <button className="auditor-modal__close" type="button" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </button>
        </header>

        <form className="auditor-modal__form" onSubmit={handleSubmit}>
          <label className="auditor-modal__field">
            <span>Item de evaluacion</span>
            <Select
              inputId={`${inputIdPrefix}-item`}
              options={itemOptions}
              value={itemOptions.find((option) => option.value === String(formState.id_item ?? '')) ?? null}
              onChange={(selected) => updateField('id_item', selected?.value ?? '')}
              placeholder="Selecciona un item"
              noOptionsMessage={() => 'No hay items disponibles'}
              isClearable
              isDisabled={isLoadingRelations}
              styles={buildConfigSelectStyles<CausalSelectOption>()}
            />
          </label>

          <label className="auditor-modal__field">
            <span>Descripcion</span>
            <input
              type="text"
              value={formState.descripcion}
              onChange={(event) => updateField('descripcion', event.target.value)}
              placeholder="Descripcion de la causal"
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
              <strong>Causal activa</strong>
              <span>Define si la causal estara disponible en el sistema.</span>
            </div>
          </label>

          {errorMessage ? <p className="auditor-modal__error">{errorMessage}</p> : null}

          <div className="auditor-modal__actions">
            <button className="auditor-modal__button auditor-modal__button--secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="auditor-modal__button auditor-modal__button--primary"
              type="submit"
              disabled={isSaving || isLoadingRelations}
            >
              {isSaving ? 'Guardando...' : isLoadingRelations ? 'Cargando relaciones...' : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export type { CausalFormState, CausalModalMode, CausalModalProps }
