import './form.css'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import { selectedOption } from '../../Funcionalidades/shared/react-select'
import Select from 'react-select'
import { buildConfigSelectStyles, buildSelectLayerProps } from '../commons/react-select-styles'
import type { auditoriaFormDTO, CreateAuditoriaDTO } from '../../models/components/DTO/auditoriaForm'
import type { createAuditoriaErrors } from '../../Funcionalidades/form/utils/validateAuditoria'
import type { bodega } from '../../models/database/bodega'
import type { tienda } from '../../models/database/tienda'

export function formatOptionLabel(option: SelectOption) {
  return (
    <div>
      <strong>{option.label}</strong>
      {option.helper ? <div style={{ color: '#64748b', fontSize: '0.86rem', marginTop: 2 }}>{option.helper}</div> : null}
    </div>
  )
}

function formatDateInputValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getNumericOptionValue(option: SelectOption | null) {
  return typeof option?.value === 'number' ? option.value : null
}

type FormProps = {
  formState: CreateAuditoriaDTO
  updateField: <K extends keyof auditoriaFormDTO>(field: K, value: auditoriaFormDTO[K]) => void
  loading: boolean
  jefe_zonas: SelectOption[]
  zonas: SelectOption[]
  tienda: SelectOption[]
  bodegas: bodega[]
  tipos_tiendas: SelectOption[]
  auditores: SelectOption[]
  modalidades: SelectOption[]
  estado_invetarios: SelectOption[]
  causales_cancelacion: SelectOption[]
  estados_tienda: SelectOption[]
  formErrors: createAuditoriaErrors
  tiendas_originales: tienda[]
}

export function FistPartForm({estados_tienda, tiendas_originales, formErrors, estado_invetarios, causales_cancelacion, formState, updateField, loading, zonas, jefe_zonas, tienda, bodegas, tipos_tiendas, auditores, modalidades}: FormProps) {
  const auditoria = formState.auditoria
  const selectLayerProps = buildSelectLayerProps()
  const isCancelled = auditoria.estado_inventario === 'Cancelado'

  const onChangeShop = (option: SelectOption | null) => {
    const selectedShopId = Number(option?.value)
    const tienda_original = tiendas_originales.find((t) => t.id_tienda === selectedShopId)
    const selectedBodega = bodegas.find((b) => b.id_bodega === tienda_original?.id_bodega)
    updateField('id_tienda', selectedShopId)
    updateField('id_bodega', selectedBodega?.id_bodega ?? null)
  }

  const onChangeInventoryStatus = (option: SelectOption | null) => {
    const nextStatus = option?.label ?? ''
    updateField('estado_inventario', nextStatus)

    if (nextStatus !== 'Cancelado') {
      updateField('id_causal_cancelacion', null)
    }
  }

  return (
    <section className="audit-form__section" id="general">
      <div className="audit-form__section-heading">
        <span>01</span>
        <div>
          <h2>Informacion general</h2>
          <p>Datos principales del evento, agenda y responsables.</p>
        </div>
      </div>

      <div className="audit-form__grid audit-form__grid--two">
        <label>
          <span>Jefe de zona</span>
          <Select
            inputId="jefe_zona"
            options={jefe_zonas}
            value={selectedOption(jefe_zonas, auditoria.id_jefe_zona)}
            onChange={(selected) => updateField('id_jefe_zona', getNumericOptionValue(selected))}
            placeholder="Selecciona un jefe de zona"
            noOptionsMessage={() => 'No hay jefes de zona disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.id_jefe_zona && <span className="audit-form__error">{formErrors.auditoria.id_jefe_zona}</span>}
        </label>
        <label>
          <span>Zona</span>
          <Select
            inputId="zona"
            options={zonas}
            value={selectedOption(zonas, auditoria.id_zona)}
            onChange={(selected) => updateField('id_zona', getNumericOptionValue(selected))}
            placeholder="Selecciona una zona"
            noOptionsMessage={() => 'No hay zonas disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.id_zona && <span className="audit-form__error">{formErrors.auditoria.id_zona}</span>}
        </label>
        <label>
          <span>Tienda</span>
          <Select
            inputId="tienda"
            options={tienda}
            value={selectedOption(tienda, auditoria.id_tienda)}
            onChange={(selected) => onChangeShop(selected)}
            placeholder="Selecciona una tienda"
            noOptionsMessage={() => 'No hay tiendas disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.id_tienda && <span className="audit-form__error">{formErrors.auditoria.id_tienda}</span>}
        </label>
        <label>
          <span>Bodega</span>
          <input
            value={bodegas.find((b) => b.id_bodega === auditoria.id_bodega)?.codigo ?? ''}
            type="text"
            readOnly
          />
          {formErrors.auditoria?.id_bodega && <span className="audit-form__error">{formErrors.auditoria.id_bodega}</span>}
        </label>
        <label>
          <span>Tipo de tienda</span>
          <Select
            inputId="tipo-tienda"
            options={tipos_tiendas}
            value={selectedOption(tipos_tiendas, auditoria.id_tipo_tienda)}
            onChange={(selected) => updateField('id_tipo_tienda', getNumericOptionValue(selected))}
            placeholder="Selecciona un tipo de tienda"
            noOptionsMessage={() => 'No hay tipos de tienda disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.id_tipo_tienda && <span className="audit-form__error">{formErrors.auditoria.id_tipo_tienda}</span>}
        </label>
        <label>
          <span>Auditor</span>
          <Select
            inputId="auditor"
            options={auditores}
            value={selectedOption(auditores, auditoria.id_auditor)}
            onChange={(selected) => updateField('id_auditor', getNumericOptionValue(selected))}
            placeholder="Selecciona un auditor"
            noOptionsMessage={() => 'No hay auditores disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.id_auditor && <span className="audit-form__error">{formErrors.auditoria.id_auditor}</span>}
        </label>
        <label>
          <span>Fecha auditoria</span>
          <input
            value={formatDateInputValue(auditoria.fecha_auditoria)}
            onChange={(event) => updateField('fecha_auditoria', new Date(event.target.value))}
            type="date"
          />
        </label>
        <label>
          <span>Modalidad</span>
          <Select
            inputId="modalidad"
            options={modalidades}
            value={selectedOption(modalidades, auditoria.modalidad)}
            onChange={(selected) => updateField('modalidad', selected?.label ?? '')}
            placeholder="Selecciona una modalidad"
            noOptionsMessage={() => 'No hay modalidades disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
        </label>
        <label>
          <span>Estado inventario</span>
          <Select
            inputId="estado-inventario"
            options={estado_invetarios}
            value={selectedOption(estado_invetarios, auditoria.estado_inventario)}
            onChange={(selected) => onChangeInventoryStatus(selected)}
            placeholder="Selecciona un estado para el inventario"
            noOptionsMessage={() => 'No hay estados de inventario disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.estado_inventario && <span className="audit-form__error">{formErrors.auditoria.estado_inventario}</span>}
        </label>
        {isCancelled ? (
          <>
            <label>
              <span>Causal de cancelacion</span>
              <Select
                inputId="causal-cancelacion"
                options={causales_cancelacion}
                value={selectedOption(causales_cancelacion, auditoria.id_causal_cancelacion)}
                onChange={(selected) => updateField('id_causal_cancelacion', getNumericOptionValue(selected))}
                placeholder="Selecciona una causal de cancelacion"
                noOptionsMessage={() => 'No hay causales de cancelacion disponibles'}
                isClearable
                isDisabled={loading}
                {...selectLayerProps}
                styles={buildConfigSelectStyles<SelectOption>()}
                formatOptionLabel={formatOptionLabel}
              />
              {formErrors.auditoria?.id_causal_cancelacion && <span className="audit-form__error">{formErrors.auditoria.id_causal_cancelacion}</span>}
            </label>
            <label className={isCancelled ? '' : 'audit-form__field-span-two'}>
              <span>Observaciones</span>
              <textarea
                value={auditoria.observacion_cancelacion}
                onChange={(event) => updateField('observacion_cancelacion', event.target.value)}
                placeholder={
                  isCancelled
                    ? 'Describe el motivo y contexto de la cancelacion'
                    : 'Ingresa observaciones del estado del inventario'
                }
                rows={4}
                disabled={loading}
                required
              />
              {formErrors.auditoria?.observacion_cancelacion && <span className="audit-form__error">{formErrors.auditoria.observacion_cancelacion}</span>}
            </label>
          </>
        ) : null}

        
        <label>
          <span>Estado tienda</span>
          <Select
            inputId="estado-tienda"
            options={estados_tienda}
            value={selectedOption(estados_tienda, auditoria.estado_tienda)}
            onChange={(selected) => updateField('estado_tienda', selected?.label ?? '')}
            placeholder="Selecciona un estado de tienda"
            noOptionsMessage={() => 'No hay estados de tienda disponibles'}
            isClearable
            isDisabled={loading}
            {...selectLayerProps}
            styles={buildConfigSelectStyles<SelectOption>()}
            formatOptionLabel={formatOptionLabel}
          />
          {formErrors.auditoria?.estado_tienda && <span className="audit-form__error">{formErrors.auditoria.estado_tienda}</span>}
        </label>
      </div>
    </section>

  )
}
