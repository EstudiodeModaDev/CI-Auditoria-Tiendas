import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import Select from 'react-select'
import type { tienda } from '../../../models/database/tienda'
import { buildConfigSelectStyles } from '../../commons/react-select-styles'
import type { SelectOption } from '../../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import './auditor-modal.css'
import { selectedOption } from '../../../Funcionalidades/shared/react-select'

type TiendaModalMode = 'create' | 'edit'

type TiendaFormState = Pick<tienda, 'nombre' | 'correo_tienda' | 'activo' | 'id_zona' | 'id_jefe_zona' | 'id_bodega' | 'id_tipo_tienda' | 'id_marca'
>

type TiendaRelationOptions = {
  zonas: SelectOption[]
  jefesZona: SelectOption[]
  bodegas: SelectOption[]
  tiposTienda: SelectOption[]
  marcas: SelectOption[]
}

type TiendaModalProps = {
  isOpen: boolean
  mode: TiendaModalMode
  initialData?: tienda | null
  relationOptions: TiendaRelationOptions
  isLoadingRelations?: boolean
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: TiendaFormState) => Promise<void> | void
}

const defaultFormState: TiendaFormState = {
  nombre: '',
  correo_tienda: '',
  activo: true,
  id_zona: null,
  id_jefe_zona: null,
  id_bodega: null,
  id_tipo_tienda: null,
  id_marca: null,
}

function formatOptionLabel(option: SelectOption) {
  return (
    <div>
      <strong>{option.label}</strong>
      {option.helper ? <div style={{ color: '#64748b', fontSize: '0.86rem', marginTop: 2 }}>{option.helper}</div> : null}
    </div>
  )
}

export function TiendaModal({
  isOpen,
  mode,
  initialData,
  relationOptions,
  isLoadingRelations = false,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
}: TiendaModalProps) {
  const [formState, setFormState] = useState<TiendaFormState>(defaultFormState)
  const inputIdPrefix = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(
      initialData
        ? {
            nombre: initialData.nombre ?? '',
            correo_tienda: initialData.correo_tienda ?? '',
            activo: Boolean(initialData.activo),
            id_zona: initialData.id_zona ?? null,
            id_jefe_zona: initialData.id_jefe_zona ?? null,
            id_bodega: initialData.id_bodega ?? null,
            id_tipo_tienda: initialData.id_tipo_tienda ?? null,
            id_marca: initialData.id_marca ?? null,
          }
        : defaultFormState,
    )
  }, [initialData, isOpen])

  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Crear tienda' : 'Editar tienda'
  const submitLabel = mode === 'create' ? 'Crear tienda' : 'Guardar cambios'

  function updateField<K extends keyof TiendaFormState>(field: K, value: TiendaFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      nombre: formState.nombre.trim(),
      correo_tienda: formState.correo_tienda.trim(),
      activo: formState.activo,
      id_zona: formState.id_zona,
      id_jefe_zona: formState.id_jefe_zona,
      id_bodega: formState.id_bodega,
      id_tipo_tienda: formState.id_tipo_tienda,
      id_marca: formState.id_marca,
    })
  }

  return (
    <div className="auditor-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="tienda-modal-description"
        aria-labelledby="tienda-modal-title"
        aria-modal="true"
        className="auditor-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="auditor-modal__header">
          <div>
            <span className="auditor-modal__eyebrow">Configuracion de tiendas</span>
            <h2 id="tienda-modal-title">{title}</h2>
            <p id="tienda-modal-description">
              Completa la informacion principal de la tienda y relaciona sus catálogos reales para guardarla en la configuracion.
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
              placeholder="Nombre de la tienda"
              required
            />
          </label>

          <label className="auditor-modal__field">
            <span>Correo</span>
            <input
              type="email"
              value={formState.correo_tienda}
              onChange={(event) => updateField('correo_tienda', event.target.value)}
              placeholder="tienda@empresa.com"
              required
            />
          </label>

          <label className="auditor-modal__field">
            <span>Zona</span>
            <Select
              inputId={`${inputIdPrefix}-zona`}
              options={relationOptions.zonas}
              value={selectedOption(relationOptions.zonas, formState.id_zona)}
              onChange={(selected) => updateField('id_zona', Number(selected?.value) ?? null)}
              placeholder="Selecciona una zona"
              noOptionsMessage={() => 'No hay zonas disponibles'}
              isClearable
              isDisabled={isLoadingRelations}
              styles={buildConfigSelectStyles<SelectOption>()}
              formatOptionLabel={formatOptionLabel}
            />
          </label>

          <label className="auditor-modal__field">
            <span>Jefe de zona</span>
            <Select
              inputId={`${inputIdPrefix}-jefe-zona`}
              options={relationOptions.jefesZona}
              value={selectedOption(relationOptions.jefesZona, formState.id_jefe_zona)}
              onChange={(selected) => updateField('id_jefe_zona', Number(selected?.value) ?? null)}
              placeholder="Selecciona un jefe de zona"
              noOptionsMessage={() => 'No hay jefes de zona disponibles'}
              isClearable
              isDisabled={isLoadingRelations}
              styles={buildConfigSelectStyles<SelectOption>()}
              formatOptionLabel={formatOptionLabel}
            />
          </label>

          <label className="auditor-modal__field">
            <span>Bodega</span>
            <Select
              inputId={`${inputIdPrefix}-bodega`}
              options={relationOptions.bodegas}
              value={selectedOption(relationOptions.bodegas, formState.id_bodega)}
              onChange={(selected) => updateField('id_bodega', Number(selected?.value) ?? null)}
              placeholder="Selecciona una bodega"
              noOptionsMessage={() => 'No hay bodegas disponibles'}
              isClearable
              isDisabled={isLoadingRelations}
              styles={buildConfigSelectStyles<SelectOption>()}
              formatOptionLabel={formatOptionLabel}
            />
          </label>

          <label className="auditor-modal__field">
            <span>Tipo de tienda</span>
            <Select
              inputId={`${inputIdPrefix}-tipo-tienda`}
              options={relationOptions.tiposTienda}
              value={selectedOption(relationOptions.tiposTienda, formState.id_tipo_tienda)}
              onChange={(selected) => updateField('id_tipo_tienda', Number(selected?.value) ?? null)}
              placeholder="Selecciona un tipo de tienda"
              noOptionsMessage={() => 'No hay tipos de tienda disponibles'}
              isClearable
              isDisabled={isLoadingRelations}
              styles={buildConfigSelectStyles<SelectOption>()}
              formatOptionLabel={formatOptionLabel}
            />
          </label>

          <label className="auditor-modal__field">
            <span>Marca</span>
            <Select
              inputId={`${inputIdPrefix}-marca`}
              options={relationOptions.marcas}
              value={selectedOption(relationOptions.marcas, formState.id_marca)}
              onChange={(selected) => updateField('id_marca', Number(selected?.value) ?? null)}
              placeholder="Selecciona una marca"
              noOptionsMessage={() => 'No hay marcas disponibles'}
              isClearable
              isDisabled={isLoadingRelations}
              styles={buildConfigSelectStyles<SelectOption>()}
              formatOptionLabel={formatOptionLabel}
            />
          </label>

          <label className="auditor-modal__toggle">
            <input
              type="checkbox"
              checked={formState.activo}
              onChange={(event) => updateField('activo', event.target.checked)}
            />
            <div>
              <strong>Tienda activa</strong>
              <span>Define si la tienda estara disponible en el sistema.</span>
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

export type { TiendaFormState, TiendaModalMode, TiendaModalProps, TiendaRelationOptions }
