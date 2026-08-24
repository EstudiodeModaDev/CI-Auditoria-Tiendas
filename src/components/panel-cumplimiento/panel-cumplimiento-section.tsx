import React from 'react'
import './panel-cumplimiento-section.css'
import { usePanelCumplimiento } from '../../Funcionalidades/panel-cumplimiento/hooks/usePanelCumplimiento'
import {
  formatCompliancePct,
  getComplianceTone,
  type StoreCompliance,
} from '../../Funcionalidades/panel-cumplimiento/utils/complianceAggregation'
import type { ZonaTiendaFilter } from '../../Funcionalidades/shared/useZonaTiendaFilter'
import type { tienda } from '../../models/database/tienda'
import type { zona } from '../../models/database/zona'

type PanelCumplimientoSectionProps = {
  tiendas: tienda[]
  zonas: zona[]
  filters: ZonaTiendaFilter
  onSelectTienda: (id_tienda: number | null) => void
}

type ComplianceRankRowProps = {
  store: StoreCompliance
  rank: number
  selected: boolean
  showCriticalBadge: boolean
  onSelect: (id_tienda: number) => void
}

function ComplianceRankRow({ store, rank, selected, showCriticalBadge, onSelect }: ComplianceRankRowProps) {
  const tone = getComplianceTone(store.pct)

  return (
    <div
      className={selected ? 'panel-cumplimiento-section__rank-row panel-cumplimiento-section__rank-row--selected' : 'panel-cumplimiento-section__rank-row'}
      onClick={() => onSelect(store.id_tienda)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(store.id_tienda)
        }
      }}
    >
      <span className="panel-cumplimiento-section__rank-num">{String(rank).padStart(2, '0')}</span>

      <div className="panel-cumplimiento-section__rank-info">
        <p className="panel-cumplimiento-section__rank-name">
          {store.nombre} <span>· {store.zonaNombre}</span>
        </p>
        <div className="panel-cumplimiento-section__bar-bg">
          <div
            className={`panel-cumplimiento-section__bar-fill panel-cumplimiento-section__bar-fill--${tone}`}
            style={{ width: `${store.pct}%` }}
          />
        </div>
      </div>

      {showCriticalBadge && store.critico ? (
        <span className="panel-cumplimiento-section__badge">Critico</span>
      ) : null}

      <span className={`panel-cumplimiento-section__rank-pct panel-cumplimiento-section__rank-pct--${tone}`}>
        {formatCompliancePct(store.pct)}%
      </span>
    </div>
  )
}

export function PanelCumplimientoSection(props: PanelCumplimientoSectionProps) {
  const controller = usePanelCumplimiento({ tiendas: props.tiendas, zonas: props.zonas, filters: props.filters })

  const zonaLabel = React.useMemo(
    () => props.zonas.find((item) => item.id_zona === props.filters.id_zona)?.nombre ?? '',
    [props.zonas, props.filters.id_zona],
  )

  return (
    <section className="panel-cumplimiento-section" aria-label="Panel de cumplimiento">
      <div className="panel-cumplimiento-section__topbar">
        <div>
          <span className="panel-cumplimiento-section__eyebrow">Auditoria operativa · Retail</span>
          <h2>Panel de cumplimiento</h2>
        </div>
      </div>

      {controller.error ? <p className="panel-cumplimiento-section__message">{controller.error}</p> : null}
      {!controller.error && controller.loading ? (
        <p className="panel-cumplimiento-section__message">Cargando auditorias...</p>
      ) : null}

      {!controller.loading && !controller.error && controller.heroStore ? (
        <div className="panel-cumplimiento-section__hero">
          <div className="panel-cumplimiento-section__stamp">
            <span>No<br />cumple</span>
          </div>

          <div className="panel-cumplimiento-section__hero-body">
            <p className="panel-cumplimiento-section__hero-eyebrow">
              <span className="panel-cumplimiento-section__dot" />
              Tienda con mayor incumplimiento
            </p>
            <p className="panel-cumplimiento-section__hero-store">{controller.heroStore.nombre}</p>
            <p className="panel-cumplimiento-section__hero-zone">
              Zona {controller.heroStore.zonaNombre}
              {props.filters.id_zona == null ? ' · comparado entre todas las zonas' : ''}
            </p>

            <div className="panel-cumplimiento-section__hero-stats">
              <div>
                <p className="panel-cumplimiento-section__hero-stat-label">Cumplimiento general</p>
                <p className="panel-cumplimiento-section__hero-stat-value">{formatCompliancePct(controller.heroStore.pct)}%</p>
              </div>
              <div>
                <p className="panel-cumplimiento-section__hero-stat-label">Item mas debil</p>
                <p className="panel-cumplimiento-section__hero-stat-value panel-cumplimiento-section__hero-stat-value--sub">
                  {controller.heroStore.worstItem.nombre} · {controller.heroStore.worstItem.cumple}/{controller.heroStore.worstItem.visitas} cumple
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!controller.loading && !controller.error ? (
        <div className="panel-cumplimiento-section__grid">
          <article className="panel-cumplimiento-section__panel">
            <div className="panel-cumplimiento-section__panel-head">
              <p className="panel-cumplimiento-section__panel-title">
                <span className="panel-cumplimiento-section__dot panel-cumplimiento-section__dot--critical" />
                Top menor cumplimiento
              </p>
              <span className="panel-cumplimiento-section__info-tip">
                i
                <span className="panel-cumplimiento-section__tooltip">
                  Solo incluye tiendas en riesgo critico: al menos 2 visitas &quot;no cumple&quot; en cada uno de los items auditados, no solo el promedio mas bajo.
                </span>
              </span>
            </div>
            <p className="panel-cumplimiento-section__panel-sub">
              {controller.worstPool.length} tienda{controller.worstPool.length === 1 ? '' : 's'} en riesgo critico
              {props.filters.id_zona == null ? '' : ` · zona ${zonaLabel}`}
            </p>

            {controller.worstPool.length === 0 ? (
              <p className="panel-cumplimiento-section__empty-state">Ninguna tienda cumple la regla de criticidad en este filtro.</p>
            ) : (
              controller.worstPool.map((store, index) => (
                <ComplianceRankRow
                  key={store.id_tienda}
                  store={store}
                  rank={index + 1}
                  selected={store.id_tienda === props.filters.id_tienda}
                  showCriticalBadge={false}
                  onSelect={props.onSelectTienda}
                />
              ))
            )}
          </article>

          <article className="panel-cumplimiento-section__panel">
            <div className="panel-cumplimiento-section__panel-head">
              <p className="panel-cumplimiento-section__panel-title">
                <span className="panel-cumplimiento-section__dot panel-cumplimiento-section__dot--good" />
                Top mayor cumplimiento
              </p>
            </div>
            <p className="panel-cumplimiento-section__panel-sub">
              Mejor desempeño{props.filters.id_zona == null ? ' · todas las zonas' : ` · zona ${zonaLabel}`}
            </p>

            {controller.bestPool.length === 0 ? (
              <p className="panel-cumplimiento-section__empty-state">Sin datos para este filtro.</p>
            ) : (
              controller.bestPool.map((store, index) => (
                <ComplianceRankRow
                  key={store.id_tienda}
                  store={store}
                  rank={index + 1}
                  selected={store.id_tienda === props.filters.id_tienda}
                  showCriticalBadge
                  onSelect={props.onSelectTienda}
                />
              ))
            )}
          </article>
        </div>
      ) : null}

      {!controller.loading && !controller.error ? (
        <div className="panel-cumplimiento-section__detail">
          {!controller.selectedStore ? (
            <p className="panel-cumplimiento-section__detail-empty">
              Selecciona una tienda en el filtro superior (o en un ranking) para ver el detalle por item.
            </p>
          ) : (
            <>
              <div className="panel-cumplimiento-section__detail-head">
                <h3>{controller.selectedStore.nombre}</h3>
                <span className="panel-cumplimiento-section__zone-tag">
                  Zona {controller.selectedStore.zonaNombre}
                  {controller.selectedStore.critico ? ' · riesgo critico' : ''}
                </span>
              </div>

              <div className="panel-cumplimiento-section__detail-overall">
                <span className={`panel-cumplimiento-section__detail-overall-num panel-cumplimiento-section__detail-overall-num--${getComplianceTone(controller.selectedStore.pct)}`}>
                  {formatCompliancePct(controller.selectedStore.pct)}%
                </span>
                <span className="panel-cumplimiento-section__detail-overall-lbl">
                  cumplimiento general sobre {controller.selectedStore.items.length} items auditados ({controller.selectedStore.totalAuditorias} auditorias)
                </span>
              </div>

              <div className="panel-cumplimiento-section__items-grid">
                {controller.selectedStore.items.map((item) => {
                  const itemTone = item.noCumple >= 2 ? 'critical' : (item.cumple < item.visitas ? 'warning' : 'good')

                  return (
                    <div className="panel-cumplimiento-section__item-card" key={item.id_item_evaluacion}>
                      <p className="panel-cumplimiento-section__item-name">{item.nombre}</p>
                      <div className="panel-cumplimiento-section__bar-bg panel-cumplimiento-section__bar-bg--item">
                        <div
                          className={`panel-cumplimiento-section__bar-fill panel-cumplimiento-section__bar-fill--${itemTone}`}
                          style={{ width: `${item.visitas > 0 ? (item.cumple / item.visitas) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="panel-cumplimiento-section__item-bottom">
                        <span className="panel-cumplimiento-section__item-counts">{item.cumple}/{item.visitas} cumple</span>
                        <span className={item.noCumple >= 2 ? 'panel-cumplimiento-section__item-counts panel-cumplimiento-section__item-counts--critical' : 'panel-cumplimiento-section__item-counts'}>
                          {item.noCumple} no cumple
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}
