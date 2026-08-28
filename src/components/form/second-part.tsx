import './form.css'
import type { item_evaluacion } from '../../models/database/items_evaluacion'
import type { AuditoriaDetalleDTO, auditoriaFormDTO } from '../../models/components/DTO/auditoriaForm'
import type { causal } from '../../models/database/causal'
import { AuditItemCard } from './aud.card'
import { getCausalesByItem } from '../../Funcionalidades/form/utils/auditoriaCausales'

type FormProps = {
  auditoria: auditoriaFormDTO
  causales: causal[]
  getItemResult: (itemId: number | undefined) => AuditoriaDetalleDTO | null
  updateField: <K extends keyof auditoriaFormDTO>(field: K, value: auditoriaFormDTO[K]) => void
  updateItemResult: (itemId: number, patch: Partial<AuditoriaDetalleDTO>) => void
  itemsEvaluacion: item_evaluacion[],
  itemsEvaluacionError: string | null
  loading: boolean
  onOpenActionPlanModal: () => void
}

function sanitizeQuantity(value: string) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue) || numericValue < 0) {
    return 0
  }

  return Math.floor(numericValue)
}

export function SecondPartForm({onOpenActionPlanModal, auditoria, causales, getItemResult, updateField, updateItemResult, loading, itemsEvaluacion, itemsEvaluacionError }: FormProps) {
  const netoInventario = auditoria.faltantes - auditoria.sobrantes

  const updateInventoryMetric = (field: 'faltantes' | 'sobrantes' | 'trocados', rawValue: string) => {
    const nextValue = sanitizeQuantity(rawValue)
    const nextFaltantes = field === 'faltantes' ? nextValue : auditoria.faltantes
    const nextSobrantes = field === 'sobrantes' ? nextValue : auditoria.sobrantes

    updateField(field, nextValue)
    updateField('neto_inventario', nextFaltantes + nextSobrantes)
  }

  return (
    <section className="audit-form__section" id="coverage">
      <div className="audit-form__section-heading">
        <span>02</span>
        <div>
          <h2>Listado de items</h2>
          <p>Items a evaluar disponibles para esta auditoria.</p>
        </div>
      </div>

      <div className="audit-form__inventory-cards">
        <label className="audit-form__inventory-card">
          <span>Faltantes</span>
          <input
            type="number"
            min={0}
            value={auditoria.faltantes}
            onChange={(event) => updateInventoryMetric('faltantes', event.target.value)}
            disabled={loading}
          />
        </label>

        <label className="audit-form__inventory-card">
          <span>Sobrantes</span>
          <input
            type="number"
            min={0}
            value={auditoria.sobrantes}
            onChange={(event) => updateInventoryMetric('sobrantes', event.target.value)}
            disabled={loading}
          />
        </label>

        <label className="audit-form__inventory-card">
          <span>Trocados</span>
          <input
            type="number"
            min={0}
            value={auditoria.trocados}
            onChange={(event) => updateInventoryMetric('trocados', event.target.value)}
            disabled={loading}
          />
        </label>

        <div className="audit-form__inventory-card audit-form__inventory-card--readonly">
          <span>Neto inventario</span>
          <strong>{netoInventario}</strong>
        </div>
      </div>

      {itemsEvaluacionError ? <p className="audit-form__items-message">{itemsEvaluacionError}</p> : null}

      {!itemsEvaluacionError && itemsEvaluacion.length === 0 ? (
        <p className="audit-form__items-message">No hay items a evaluar configurados.</p>
      ) : null}

      <div className="audit-form__items-grid">
        {itemsEvaluacion.map((item) => {
          const itemId = item.id_item_evaluacion
          const itemResult = getItemResult(itemId)

          return (
            <AuditItemCard
              key={String(item.id_item_evaluacion ?? item.nombre)}
              item={item}
              itemResult={itemResult}
              causales={getCausalesByItem(causales, itemId)}
              loading={loading || itemId == null}
              onChange={(patch) => itemId != null && updateItemResult(itemId, patch)} 
            />
          )
        })}
      </div>

      <div className="audit-form__item-plan-action">
        <div className="audit-form__item-plan-copy">
          <strong>Plan de accion</strong>
          <p>Registra un seguimiento correctivo para este hallazgo.</p>
        </div>
        <button
          className="audit-form__item-plan-button"
          onClick={onOpenActionPlanModal}
          type="button"
          disabled={loading}
        >
          Crear plan de accion
        </button>
      </div>
    </section>

      
  )
}
