import './plan-accion-form.css'
import Select from 'react-select'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { buildConfigSelectStyles, buildSelectLayerProps } from '../commons/react-select-styles'
import { selectedOption } from '../../Funcionalidades/shared/react-select'
import type { planAccion, planesErrors } from '../../models/database/plan_accion'

const prioridadOptions: SelectOption[] = [
  { label: 'Baja', value: 'Baja' },
  { label: 'Media', value: 'Media' },
  { label: 'Alta', value: 'Alta' },
]

type Props = {
  updateField:  <K extends keyof planAccion>(k: K, v: planAccion[K]) => void
  state: planAccion
  errors: planesErrors
  loading: boolean
  evidencias: File[]
  setFile: (file: File[]) => void
}

export function PlanAccionSeconPartForm({ errors, state, evidencias, setFile, updateField, loading }: Props) {
  const selectLayerProps = buildSelectLayerProps()

  return (
    <section className="action-plan-form__section">
      <div className="action-plan-form__section-heading">
        <span>02</span>
        <div>
          <h2>Respuesta correctiva</h2>
          <p>Documenta la accion, prioridad, evidencia y fecha objetivo del compromiso.</p>
        </div>
      </div>

      <div className="action-plan-form__grid action-plan-form__grid--two">
        <label className="action-plan-form__field action-plan-form__field--full">
          <span>Actividad correctiva</span>
          <textarea
            rows={4}
            value={state.actividad_correctiva}
            onChange={(event) => updateField('actividad_correctiva', event.target.value)}
            placeholder="Describe la actividad correctiva que debe ejecutarse para cerrar el hallazgo."
            disabled={loading}
          />
          {errors.actividad_correctiva ? <small className="action-plan-form__error">{errors.actividad_correctiva}</small> : null}
        </label>

        <label className="action-plan-form__field">
          <span>Fecha compromiso</span>
          <input
            type="date"
            value={state.fecha_compromiso}
            min={state.fecha_creacion}
            onChange={(event) => updateField('fecha_compromiso', event.target.value)}
            disabled={loading}
          />
          {errors.fecha_compromiso ? <small className="action-plan-form__error">{errors.fecha_compromiso}</small> : null}
        </label>

        <label className="action-plan-form__field">
          <span>Prioridad</span>
          <Select
            inputId="plan-prioridad"
            options={prioridadOptions}
            value={selectedOption(prioridadOptions, state.prioridad)}
            onChange={(selected) => updateField('prioridad', String(selected?.value ?? ''))}
            placeholder="Selecciona la prioridad"
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
          />
          {errors.prioridad ? <small className="action-plan-form__error">{errors.prioridad}</small> : null}
        </label>

        <label className="action-plan-form__field action-plan-form__field--full">
          <span>Evidencia del hallazgo</span>
          <input
            type="file"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              setFile(files)
            }}
            disabled={loading}
          />
          <div className="action-plan-form__files">
            {evidencias.length === 0 ? <small>No hay archivos seleccionados.</small> : null}
            {evidencias.map((file) => (
              <span className="action-plan-form__file" key={`${file.name}-${file.lastModified}`}>
                {file.name}
              </span>
            ))}
          </div>
        </label>
      </div>
    </section>
  )
}
