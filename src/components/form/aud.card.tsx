import './form.css'
import Select from 'react-select'
import type { item_evaluacion } from '../../models/database/items_evaluacion'
import type { AuditoriaDetalleDTO } from '../../models/components/DTO/auditoriaForm'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { selectedOption } from '../../Funcionalidades/shared/react-select'
import { buildConfigSelectStyles, buildSelectLayerProps } from '../commons/react-select-styles'

type AuditItemCardProps = {
  item: item_evaluacion
  itemResult: AuditoriaDetalleDTO | null
  causales: SelectOption[]
  loading: boolean
  onChange: (patch: Partial<AuditoriaDetalleDTO>) => void
  onOpenActionPlanModal: () => void
}

function formatOptionLabel(option: SelectOption) {
  return (
    <div>
      <strong>{option.label}</strong>
      {option.helper ? <div style={{ color: '#64748b', fontSize: '0.86rem', marginTop: 2 }}>{option.helper}</div> : null}
    </div>
  )
}

function getNumericOptionValue(option: SelectOption | null) {
  return typeof option?.value === 'number' ? option.value : null
}

export function AuditItemCard({ item, itemResult, causales, loading, onChange, onOpenActionPlanModal }: AuditItemCardProps) {
  const itemStatus = itemResult?.cumple === true ? 'cumple' : itemResult?.cumple === false ? 'no-cumple' : null
  const shouldShowCausal = item.requiere_causal && itemStatus === 'no-cumple'
  const shouldShowQuantity = item.requiere_cantidad && itemStatus === 'no-cumple'
  const selectLayerProps = buildSelectLayerProps()

  return (
    <article className="audit-form__item-card">
      <div className="audit-form__item-card-head">
        <strong>{item.nombre}</strong>
        <span className={item.activo ? 'audit-form__item-status audit-form__item-status--active' : 'audit-form__item-status'}>
          {item.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="audit-form__item-actions">
        <button
          className={
            itemStatus === 'cumple'
              ? 'audit-form__item-action audit-form__item-action--pass audit-form__item-action--active'
              : 'audit-form__item-action audit-form__item-action--pass'
          }
          type="button"
          onClick={() => onChange({ cumple: true, observacion: '' })}
          disabled={loading}
        >
          Cumple
        </button>
        <button
          className={
            itemStatus === 'no-cumple'
              ? 'audit-form__item-action audit-form__item-action--fail audit-form__item-action--active'
              : 'audit-form__item-action audit-form__item-action--fail'
          }
          type="button"
          onClick={() => onChange({ cumple: false })}
          disabled={loading}
        >
          No cumple
        </button>
      </div>

      {shouldShowCausal ? (
        <label>
          <span>Causal</span>
          <Select
            inputId={`causal-${item.id_item_evaluacion ?? item.nombre}`}
            options={causales}
            value={selectedOption(causales, itemResult?.id_causal ?? null)}
            onChange={(selected) => onChange({ id_causal: getNumericOptionValue(selected) })}
            placeholder="Selecciona una causal"
            noOptionsMessage={() => 'No hay causales disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
        </label>
      ) : null}

      {shouldShowQuantity ? (
        <label>
          <span>Cantidad</span>
          <input
            type="number"
            min={0}
            value={itemResult?.cantidad_afectada ?? ""}
            onChange={(event) => {
              const value = event.target.value;

              onChange({
                cantidad_afectada: value === "" ? undefined : Number(value),
              });
            }}
            onBlur={(event) => {
              const value = event.target.value;

              if (Number(value) < 0) {
                onChange({
                  cantidad_afectada: undefined,
                });
              }
            }}
            placeholder="Ingresa la cantidad"
            disabled={loading}
          />
        </label>
      ) : null}

      { itemStatus === 'no-cumple' &&
        <label className="audit-form__item-observation">
          <span>Observacion</span>
          <textarea
            rows={3}
            value={itemResult?.observacion ?? ''}
            onChange={(event) => onChange({ observacion: event.target.value })}
            placeholder={
              itemStatus === 'no-cumple'
                ? 'Describe la novedad encontrada'
                : 'La observacion se habilita cuando el item no cumple'
            }
            disabled={itemStatus !== 'no-cumple'}
            required={itemStatus === 'no-cumple'}
          />
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
        </label>
      }
    </article>
  )
}
