import './plan-accion-form.css'
import Select from 'react-select'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { buildConfigSelectStyles, buildSelectLayerProps } from '../commons/react-select-styles'
import { selectedOption } from '../../Funcionalidades/shared/react-select'
import type { planAccion, planesErrors } from '../../models/database/plan_accion'
import React from 'react'
import type { auditoria } from '../../models/database/auditoria'

const impactoOptions: SelectOption[] = [
  { label: 'Bajo', value: 'Bajo' },
  { label: 'Medio', value: 'Medio' },
  { label: 'Alto', value: 'Alto' },
]


function getNumericOptionValue(option: SelectOption | null) {
  return typeof option?.value === 'number' ? option.value : null
}

function formatDateInputValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}


type Props = {
  zonaOptions: SelectOption[]
  causalOptions: SelectOption[]
  tiendaOptions: SelectOption[]
  areasResponsablesOptions: SelectOption[]
  updateField:  <K extends keyof planAccion>(k: K, v: planAccion[K]) => void
  state: planAccion
  errors: planesErrors
  loading: boolean
  auditoria: auditoria
}

export function PlanAccionFirstPartForm({
  state,
  tiendaOptions,
  causalOptions,
  zonaOptions,
  areasResponsablesOptions,
  updateField,
  errors,
  loading,
  auditoria
}: Props) {
  const selectLayerProps = buildSelectLayerProps()

  React.useEffect(() => {
    updateField("fecha_creacion", formatDateInputValue(auditoria.fecha_auditoria))
    updateField("id_zona", auditoria.id_zona)
    updateField("id_tienda", auditoria.id_tienda)
    updateField("responsable", auditoria.id_auditor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditoria])

  return (
    <section className="action-plan-form__section">
    <div className="action-plan-form__section-heading">
      <span>01</span>
      <div>
        <h2>Hallazgo</h2>
        <p>Define el contexto base, ubicacion y la gravedad del hallazgo encontrado.</p>
      </div>
    </div>

    <div className="action-plan-form__grid action-plan-form__grid--two">
      <label className="action-plan-form__field">
        <span>Fecha de creacion</span>
        <input type="date" value={state.fecha_creacion} readOnly />
      </label>

      <label className="action-plan-form__field">
        <span>Tipo de hallazgo</span>
        <Select<SelectOption, true>
          inputId="plan-tipo-hallazgo"
          options={causalOptions}
          value={causalOptions.filter((option) => state.tipo_hallazgo.includes(String(option.label)))}
          onChange={(selected) => updateField('tipo_hallazgo', (selected ?? []).map((option) => String(option.label)))}
          placeholder="Selecciona uno o mas causales del hallazgo"
          isClearable
          isDisabled={loading}
          noOptionsMessage={() => 'No hay causales registradas'}
          {...selectLayerProps}
          styles={buildConfigSelectStyles<SelectOption, true>()}
          isMulti
        />
        {errors.tipo_hallazgo ? <small className="action-plan-form__error">{errors.tipo_hallazgo}</small> : null}
      </label>

      <label className="action-plan-form__field">
        <span>Zona</span>
        <Select
          inputId="plan-zona"
          options={zonaOptions}
          value={selectedOption(zonaOptions, state.id_zona)}
          onChange={(selected) => {
            updateField('id_zona', getNumericOptionValue(selected))
            updateField('id_tienda', null)
          }}
          placeholder="Selecciona una zona"
          isClearable
          isDisabled={loading}
          noOptionsMessage={() => 'No hay zonas registradas'}
          {...selectLayerProps}
          styles={buildConfigSelectStyles<SelectOption>()}
        />
        {errors.id_zona ? <small className="action-plan-form__error">{errors.id_zona}</small> : null}
      </label>

      <label className="action-plan-form__field">
        <span>Tienda</span>
        <Select
          inputId="plan-tienda"
          options={tiendaOptions}
          value={selectedOption(tiendaOptions, state.id_tienda)}
          onChange={(selected) => updateField('id_tienda', getNumericOptionValue(selected))}
          placeholder={state.id_zona ? 'Selecciona una tienda' : 'Primero selecciona una zona'}
          isClearable
          isDisabled={loading || state.id_zona == null}
          noOptionsMessage={() => 'No hay tiendas para la zona seleccionada'}
          {...selectLayerProps}
          styles={buildConfigSelectStyles<SelectOption>()}
        />
        {errors.id_tienda ? <small className="action-plan-form__error">{errors.id_tienda}</small> : null}
      </label>

      <label className="action-plan-form__field">
        <span>Area responsable</span>
        <Select
          inputId="plan-area"
          options={areasResponsablesOptions}
          value={selectedOption(areasResponsablesOptions, state.id_area_responsable)}
          onChange={(selected) => updateField('id_area_responsable', getNumericOptionValue(selected))}
          placeholder="Selecciona el area responsable"
          isClearable
          isDisabled={loading}
          {...selectLayerProps}
          styles={buildConfigSelectStyles<SelectOption>()}
        />
        {errors.id_area_responsable ? <small className="action-plan-form__error">{errors.id_area_responsable}</small> : null}
      </label>

      <label className="action-plan-form__field">
        <span>Impacto</span>
        <Select
          inputId="plan-impacto"
          options={impactoOptions}
          value={selectedOption(impactoOptions, state.impacto)}
          onChange={(selected) => updateField('impacto', String(selected?.value ?? ''))}
          placeholder="Selecciona el impacto"
          isClearable
          isDisabled={loading}
          {...selectLayerProps}
          styles={buildConfigSelectStyles<SelectOption>()}
        />
        {errors.impacto ? <small className="action-plan-form__error">{errors.impacto}</small> : null}
      </label>

      <label className="action-plan-form__field action-plan-form__field--full">
        <span>Descripcion de hallazgos</span>
        <textarea
          rows={5}
          value={state.descripcion_hallazgo}
          onChange={(event) => updateField('descripcion_hallazgo', event.target.value)}
          placeholder="Describe con detalle el hallazgo, contexto, causa visible y comportamiento observado."
          disabled={loading}
        />
        {errors.descripcion_hallazgo ? <small className="action-plan-form__error">{errors.descripcion_hallazgo}</small> : null}
      </label>
    </div>
    </section>
  )
}
