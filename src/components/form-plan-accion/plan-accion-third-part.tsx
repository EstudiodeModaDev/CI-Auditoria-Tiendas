import './plan-accion-form.css'
import type { planAccion, planesErrors } from '../../models/database/plan_accion'

type Props = {
  updateField:  <K extends keyof planAccion>(k: K, v: planAccion[K]) => void
  state: planAccion
  errors: planesErrors
  loading?: boolean
}


export function PlanAccionThirdPartForm({ updateField, errors, state, loading = false}: Props) {
  return (
    <section className="action-plan-form__section">
      <div className="action-plan-form__section-heading">
        <span>03</span>
        <div>
          <h2>Recursos requeridos</h2>
          <p>Los hallazgos deben quedar aterrizados en un listado concreto de recursos necesarios.</p>
        </div>
      </div>

      <div className="action-plan-form__resource-builder">
        <input
          type="text"
          value={state.recursos_requeridos}
          onChange={(event) => updateField("recursos_requeridos", event.target.value)}
          placeholder="Ejemplo: Capacitacion, ajuste de proceso, soporte TI, inventario ciclico"
          disabled={loading}
        />
      </div>
    
      {errors.recursos_requeridos ? <small className="action-plan-form__error">{errors.recursos_requeridos}</small> : null}
    </section>
  )
}
