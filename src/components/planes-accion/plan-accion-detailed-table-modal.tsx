import React from 'react'
import './plan-accion-detailed-table-modal.css'
import type { planAccion } from '../../models/database/plan_accion'
import type { tienda } from '../../models/database/tienda'
import { usePlanAccionLatestRespuestas } from '../../Funcionalidades/RespuestaPlanAccion/hooks/usePlanAccionLatestRespuestas'
import type { auditor } from '../../models/database/auditor'

type PlanAccionDetailedTableModalProps = {
  isOpen: boolean
  onClose: () => void
  planes: planAccion[]
  tiendas: tienda[]
  auditores: auditor[]
}

function formatFecha(value?: string | Date | null) {
  if (!value) {
    return 'Sin fecha'
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date)
}

export function PlanAccionDetailedTableModal({ isOpen, onClose, planes, tiendas, auditores }: PlanAccionDetailedTableModalProps) {
  const { rows, loading, error, load } = usePlanAccionLatestRespuestas(planes)

  const tiendaById = React.useMemo(() => new Map(tiendas.map((item) => [item.id_tienda, item.nombre])), [tiendas])
  const auditorById = React.useMemo(
    () => new Map(auditores.map((item) => [item.id_auditor, item.nombre])),
    [auditores]
  )

  React.useEffect(() => {
    if (isOpen) {
      void load()
    }
  }, [isOpen, load])

  if (!isOpen) {
    return null
  }

  return (
    <div className="plan-accion-detailed-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-labelledby="plan-accion-detailed-modal-title"
        aria-modal="true"
        className="plan-accion-detailed-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="plan-accion-detailed-modal__header">
          <div>
            <span className="plan-accion-detailed-modal__eyebrow">Vista detallada</span>
            <h2 id="plan-accion-detailed-modal-title">Planes de accion</h2>
            <p>Informacion completa de cada plan junto con la ultima respuesta registrada.</p>
          </div>

          <button className="plan-accion-detailed-modal__close" type="button" onClick={onClose} aria-label="Cerrar vista detallada">
            X
          </button>
        </header>

        {error ? <p className="plan-accion-detailed-modal__message">{error}</p> : null}
        {!error && loading ? <p className="plan-accion-detailed-modal__message">Cargando informacion detallada...</p> : null}
        {!error && !loading && rows.length === 0 ? (
          <p className="plan-accion-detailed-modal__message">No hay planes de accion para mostrar.</p>
        ) : null}

        {!error && !loading && rows.length > 0 ? (
          <div className="plan-accion-detailed-modal__table-shell">
            <table className="plan-accion-detailed-modal__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo de hallazgo</th>
                  <th>Descripcion hallazgo</th>
                  <th>Fecha de creación</th>
                  <th>Fecha de compromiso</th>
                  <th>Auditor</th>
                  <th>Impacto</th>
                  <th>Tienda</th>
                  <th>Respuesta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ plan, ultimaRespuesta }) => (
                  <tr key={plan.id_plan_accion ?? `${plan.id_auditoria}-${plan.descripcion_hallazgo}`}>
                    <td>PA {plan.id_plan_accion ?? '-'}</td>
                    <td>{plan.tipo_hallazgo?.length ? plan.tipo_hallazgo.join(', ') : 'Sin tipo'}</td>
                    <td>{plan.descripcion_hallazgo}</td>
                    <td>{formatFecha(plan.fecha_creacion)}</td>
                    <td>{formatFecha(plan.fecha_compromiso)}</td>
                    <td>{plan.responsable != null ? auditorById.get(plan.responsable) ?? "Sin auditor" : "Sin auditor"}</td>
                    <td>{plan.impacto || 'Sin impacto'}</td>
                    <td>{plan.id_tienda != null ? tiendaById.get(plan.id_tienda) ?? '-' : '-'}</td>
                    <td>{ultimaRespuesta?.comentario || 'Sin respuestas registradas'}</td>
                    <td>{plan.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}
