import './form.css'
import type { CSSProperties } from 'react'

type ResultsSummary = {
  statusLabel: string
  statusTone: 'active' | 'warning'
  faltantes: number
  sobrantes: number
  trocados: number
  netoFinal: number
  resultado: string
  porcentajeCalidad: number
  resultadoCalidad: string
  totalItemsCumplidos: number
  totalItemsEvaluados: number
  porcentajeCumplimiento: number
}

type ThirdPartFormProps = {
  summary: ResultsSummary
}

type SummaryRow = {
  label: string
  value: string | number
}

function getComplianceTone(porcentajeCumplimiento: number) {
  if (porcentajeCumplimiento >= 90) return 'excellent'
  if (porcentajeCumplimiento >= 80) return 'good'
  if (porcentajeCumplimiento >= 70) return 'regular'
  return 'critical'
}

export function ThirdPartForm({ summary }: ThirdPartFormProps) {
  const inventoryRows: SummaryRow[] = [
    { label: 'Faltantes', value: summary.faltantes },
    { label: 'Sobrantes', value: summary.sobrantes },
    { label: 'Trocados', value: summary.trocados },
    { label: 'Neto final', value: summary.netoFinal },
  ]
  const complianceTone = getComplianceTone(summary.porcentajeCumplimiento)
  const completionLabel = `${summary.totalItemsCumplidos}/${summary.totalItemsEvaluados || 0}`
  const insightsRows: SummaryRow[] = [
    { label: 'Resultado', value: summary.resultado },
    { label: 'Calidad', value: `${summary.resultadoCalidad} (${summary.porcentajeCalidad}%)` },
    { label: 'Items conformes', value: completionLabel },
  ]

  return (
    <section className="audit-form__section audit-form__section--results" id="resultados">
      <div className="audit-form__section-heading audit-form__section-heading--results">
        <div>
          <h2>Resultados</h2>
        </div>
      </div>

      <div className="audit-form__results-layout">
        <article className={`audit-form__results-hero audit-form__results-hero--${complianceTone}`}>
          <div className="audit-form__results-hero-copy">
            <span className="audit-form__results-kicker">Cumplimiento general</span>
            <strong>{summary.porcentajeCumplimiento}%</strong>
            <h3>{summary.resultado}</h3>
            <p>
              {summary.totalItemsCumplidos} de {summary.totalItemsEvaluados} items quedaron marcados como conformes
              en esta auditoria.
            </p>
          </div>
          <div className="audit-form__results-ring" aria-hidden="true">
            <div className="audit-form__results-ring-track">
              <div
                className="audit-form__results-ring-fill"
                style={{ '--results-progress': `${summary.porcentajeCumplimiento}%` } as CSSProperties}
              />
              <span>{summary.porcentajeCumplimiento}%</span>
            </div>
          </div>
        </article>

        <div className="audit-form__results-side">
          <div className="audit-form__results-cards">
            {inventoryRows.map((row) => (
              <article className="audit-form__result-stat" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </article>
            ))}
          </div>

          <div className="audit-form__results-list">
            {insightsRows.map((row) => (
              <article className="audit-form__result-row" key={row.label}>
                <strong>{row.label}</strong>
                <span>{row.value}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
