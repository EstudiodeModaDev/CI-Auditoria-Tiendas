import React from 'react'
import './plan-accion-page.css'
import type { auditor } from '../../models/database/auditor'
import type { tienda } from '../../models/database/tienda'
import type { zona } from '../../models/database/zona'
import type { jefe_zona } from '../../models/database/jefe_zona'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { KpiCard } from '../commons/kpiCard'
import { usePlanAccion } from '../../Funcionalidades/form-plan-accion/hooks/usePlanAccion'
import { PlanAccionDetailModal } from './plan-accion-detail-modal'
import type { planAccion } from '../../models/database/plan_accion'
import Select from 'react-select'
import { mapAuditorOption, mapTiendaOption, selectedOption } from '../../Funcionalidades/shared/react-select'
import { buildConfigSelectStyles, buildSelectLayerProps } from '../commons/react-select-styles'

type PlanAccionHomeProps = {
  auditores: auditor[]
  tiendas: tienda[]
  zonas: zona[]
  jefesZona: jefe_zona[]
  modalidades: SelectOption[]
  estadosInventario: SelectOption[]
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === 'cerrado') return 'success'
  if (normalized === 'vencido') return 'danger'
  if (normalized === 'en proceso') return 'info'
  return 'neutral'
}

function formatPercentage(value: number) {
  return `${Math.round(value)}%`
}

function buildRecurringFindings(items: PlanAccionHomeProps['auditores'], rows: ReturnType<typeof usePlanAccion>['planAccionRows']) {
  void items
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.tipo_hallazgo || row.descripcion_hallazgo || 'Sin clasificar'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, total]) => `${label} (${total})`)
}

const estadosOption: SelectOption[] = [
  {label: "Pendiente", value: "Pendiente"},
  {label: "En curso", value: "En curso"},
  {label: "Finalizado", value: "Finalizado"},
  {label: "Vencido", value: "Vencido"},
]

export function PlanAccionHome(props: PlanAccionHomeProps) {
  const planAccionController = usePlanAccion()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = React.useState<planAccion | null>(null)
  const auditoresOption = React.useMemo(() => props.auditores.map((a) => {return mapAuditorOption(a)}), [props.auditores])
  const tiendasOptions = React.useMemo(() => props.tiendas.map((a) => {return mapTiendaOption(a)}), [props.tiendas])

  React.useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const response = await planAccionController.loadPlanAccion()

      if (!active) {
        return
      }

      setError(response.ok ? null : response.errorMessage)
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [planAccionController.loadPlanAccion, planAccionController.auditor, planAccionController.estado, planAccionController.tienda])

  const completionRate = React.useMemo(() => {
    if (planAccionController.total === 0) {
      return 0
    }

    return (planAccionController.viewFinished / planAccionController.total) * 100
  }, [planAccionController.total, planAccionController.viewFinished])

  const kpis = React.useMemo(() => [
    { titulo: 'Pendientes', subtitulo: 'Planes por iniciar', valor: planAccionController.viewWaiting },
    { titulo: 'En proceso', subtitulo: 'Seguimiento activo', valor: planAccionController.viewOnGoing },
    { titulo: 'Vencidos', subtitulo: 'Compromisos atrasados', valor: planAccionController.viewAfterDate },
    { titulo: 'Cerrados', subtitulo: 'Gestion completada', valor: planAccionController.viewFinished },
    { titulo: 'Cumplimiento', subtitulo: 'Cierre del periodo', valor: formatPercentage(completionRate) },
  ], [
    completionRate,
    planAccionController.viewAfterDate,
    planAccionController.viewFinished,
    planAccionController.viewOnGoing,
    planAccionController.viewWaiting,
  ])

  const recurringFindings = React.useMemo(
    () => buildRecurringFindings(props.auditores, planAccionController.planAccionRows),
    [planAccionController.planAccionRows, props.auditores]
  )

  return (
    <main className="plan-accion-page">
      <section className="plan-accion-page__hero">
        <div>
          <span className="plan-accion-page__eyebrow">Seguimiento operativo</span>
          <h1>Gestion de planes de accion</h1>
          <p>Monitorea avances, detecta compromisos vencidos y revisa el estado de cada plan desde un solo tablero.</p>
        </div>
      </section>

      <section className="plan-accion-page__filters" aria-label="Filtros de planes de accion">
        <label>
          <span>Estado</span>
          <Select
            inputId="home-auditor"
            options={estadosOption}
            value={selectedOption(estadosOption, planAccionController.estado)}
            onChange={(selected) => planAccionController.setEstado(selected?.label ?? "")}
            placeholder="Todos los estados"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <label>
          <span>Auditor</span>
          <Select
            inputId="plan-auditor"
            options={auditoresOption}
            value={selectedOption(auditoresOption, planAccionController.auditor)}
            onChange={(selected) => planAccionController.setAuditor(Number(selected?.value) ?? null)}
            placeholder="Todas los auditores"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <label>
          <span>Tiendas</span>
          <Select
            inputId="plan-tienda"
            options={tiendasOptions}
            value={selectedOption(tiendasOptions, planAccionController.tienda)}
            onChange={(selected) => planAccionController.setTienda(Number(selected?.value) ?? "")}
            placeholder="Todas las tiendas"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <button
          className="plan-accion-page__ghost-button plan-accion-page__ghost-button--filters"
          type="button"
          onClick={planAccionController.resetFilters}
        >
          Limpiar filtros
        </button>
      </section>

      <section className="plan-accion-page__kpis" aria-label="Indicadores de gestion">
        {kpis.map((kpi) => (
          <div className="plan-accion-page__kpi-item" key={kpi.titulo}>
            <KpiCard
              titulo={kpi.titulo}
              subtitulo={kpi.subtitulo}
              valor={kpi.valor}
            />
          </div>
        ))}
      </section>

      {error ? <p className="plan-accion-page__message">{error}</p> : null}
      {!error && loading ? <p className="plan-accion-page__message">Cargando planes de accion...</p> : null}

      <section className="plan-accion-page__content">
        <article className="plan-accion-page__plans-card">
          <header className="plan-accion-page__section-header">
            <div>
              <h2>Planes de accion</h2>
              <p>{planAccionController.total} registros encontrados</p>
            </div>
          </header>

          {!loading && !error && planAccionController.planAccionRows.length === 0 ? (
            <p className="plan-accion-page__empty-state">Aun no hay planes de accion registrados.</p>
          ) : null}

          {!error && planAccionController.planAccionRows.length > 0 ? (
            <div className="plan-accion-page__table-shell">
              <table className="plan-accion-page__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hallazgo</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Avance</th>
                    <th>Compromiso</th>
                  </tr>
                </thead>
                <tbody>
                  {planAccionController.planAccionRows.map((plan) => (
                    <tr
                      key={plan.id_plan_accion ?? `${plan.id_auditoria}-${plan.descripcion_hallazgo}`}
                      className="plan-accion-page__row"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <td>PA {plan.id_plan_accion ?? '-'}</td>
                      <td>
                        <div className="plan-accion-page__table-main">
                          <strong>{plan.tipo_hallazgo || 'Sin tipo'}</strong>
                          <span>{plan.descripcion_hallazgo || 'Sin descripcion'}</span>
                        </div>
                      </td>
                      <td>{plan.responsable || 'Sin responsable'}</td>
                      <td>
                        <span className={`plan-accion-page__status plan-accion-page__status--${getStatusTone(plan.estado)}`}>
                          {plan.estado || 'Sin estado'}
                        </span>
                      </td>
                      <td>{formatPercentage(plan.porcentaje_avance ?? 0)}</td>
                      <td>{plan.fecha_compromiso || 'Sin fecha'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <footer className="plan-accion-page__pagination">
            <div className="plan-accion-page__pagination-meta">
              <strong>{planAccionController.total}</strong>
              <span>planes encontrados</span>
            </div>

            <div className="plan-accion-page__pagination-controls">
              <button
                className="plan-accion-page__ghost-button"
                type="button"
                onClick={planAccionController.prevPage}
                disabled={(planAccionController.pageIndex ?? 1) <= 1}
              >
                Anterior
              </button>

              <span className="plan-accion-page__page-indicator">
                Pagina {planAccionController.pageIndex ?? 1}
              </span>

              <button
                className="plan-accion-page__ghost-button"
                type="button"
                onClick={planAccionController.nextPage}
                disabled={!planAccionController.hasNext}
              >
                Siguiente
              </button>
            </div>
          </footer>
        </article>

        <aside className="plan-accion-page__summary-card">
          <header className="plan-accion-page__section-header">
            <div>
              <h2>Resumen ejecutivo</h2>
              <p>Lectura rapida del periodo actual</p>
            </div>
          </header>

          <div className="plan-accion-page__summary-block">
            <strong>Hallazgos recurrentes</strong>

            <ul className="plan-accion-page__summary-list">
              {recurringFindings.length === 0 ? (
                <li>Sin hallazgos recurrentes por ahora.</li>
              ) : recurringFindings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="plan-accion-page__summary-metrics">
            <div>
              <small>Avance promedio</small>
              <strong>{formatPercentage(
                planAccionController.planAccionRows.reduce((acc, item) => acc + (item.porcentaje_avance ?? 0), 0) /
                Math.max(1, planAccionController.planAccionRows.length)
              )}</strong>
            </div>

            <div>
              <small>Registros visibles</small>
              <strong>{planAccionController.viewTotal}</strong>
            </div>
          </div>
        </aside>
      </section>

      <PlanAccionDetailModal
        plan={selectedPlan}
        isOpen={selectedPlan !== null}
        onClose={() => setSelectedPlan(null)}
        onPlanUpdated={(updatedPlan) => {
          setSelectedPlan(updatedPlan)
          void planAccionController.loadPlanAccion()
        } } 
        tiendas={props.tiendas} 
        auditores={props.auditores}      />
    </main>
  )
}
