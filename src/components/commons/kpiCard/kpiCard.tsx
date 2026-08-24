import './kpiCard.css'

type KpiCardProps = {
  titulo: string
  subtitulo: string
  valor: string | number
}

export function KpiCard({ titulo, subtitulo, valor }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <header className="kpi-card__header">
        <p className="kpi-card__title">{titulo}</p>
        <p className="kpi-card__subtitle">{subtitulo}</p>
      </header>

      <strong className="kpi-card__value">{valor}</strong>
    </article>
  )
}

export type { KpiCardProps }
