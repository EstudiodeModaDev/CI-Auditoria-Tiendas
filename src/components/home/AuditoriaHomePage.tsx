import React from 'react'
import { useNavigate } from 'react-router'
import './auditoria-home.css'
import type { auditor } from '../../models/database/auditor'
import type { tienda } from '../../models/database/tienda'
import type { zona } from '../../models/database/zona'
import type { jefe_zona } from '../../models/database/jefe_zona'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import Select from 'react-select'
import { buildConfigSelectStyles } from '../commons/react-select-styles'
import { mapJefeZonaOption, mapTiendaOption, selectedOption } from '../../Funcionalidades/shared/react-select'
import { useZonaTiendaFilter } from '../../Funcionalidades/shared/useZonaTiendaFilter'
import { useAuditoriaHomeFilters } from '../../Funcionalidades/home/hooks/useAuditoriaHomeFilters'
import { useAuditoriaHomeList } from '../../Funcionalidades/home/hooks/useAuditoriaHomeList'
import { PanelCumplimientoSection } from '../panel-cumplimiento/panel-cumplimiento-section'

type AuditoriaHomePageProps = {
  auditores: auditor[]
  tiendas: tienda[]
  zonas: zona[]
  jefesZona: jefe_zona[]
  modalidades: SelectOption[]
  estadosInventario: SelectOption[]
}

function formatDate(value: Date | number | undefined) {
  if (!value) {
    return 'Sin fecha'
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getAuditorName(auditores: auditor[], id: number | null) {
  return auditores.find((item) => item.id_auditor === id)?.nombre ?? 'Sin auditor'
}

function getTiendaName(tiendas: tienda[], id: number | null) {
  return tiendas.find((item) => item.id_tienda === id)?.nombre ?? 'Sin tienda'
}

function getZonaName(zonas: zona[], id: number | null) {
  return zonas.find((item) => item.id_zona === id)?.nombre ?? 'Sin zona'
}

function getJefeZonaName(jefesZona: jefe_zona[], id: number | null) {
  return jefesZona.find((item) => item.id_jefe_zona === id)?.nombre ?? 'Sin jefe de zona'
}

function mapAuditorFilterOption(item: auditor): SelectOption {
  return {
    value: Number(item.id_auditor),
    label: item.nombre,
  }
}

function mapZonaFilterOption(item: zona): SelectOption {
  return {
    value: Number(item.id_zona),
    label: item.nombre,
  }
}

function getNumericOptionValue(option: SelectOption | null) {
  return typeof option?.value === 'number' ? option.value : null
}

export function AuditoriaHomePage({ auditores, tiendas, zonas, jefesZona, modalidades, estadosInventario }: AuditoriaHomePageProps) {
  const navigate = useNavigate()
  const { filters, updateFilter, resetPageIndex, resetFilters } = useAuditoriaHomeFilters()
  const zonaTiendaController = useZonaTiendaFilter(tiendas)
  const { auditorias, loading, error, hasNext, total } = useAuditoriaHomeList(filters, zonaTiendaController.filters)
  const auditorOptions = React.useMemo(() => auditores.map(mapAuditorFilterOption), [auditores])
  const jefeZonaOptions = React.useMemo(() => jefesZona.map(mapJefeZonaOption), [jefesZona])
  const zonaOptions = React.useMemo(() => zonas.map(mapZonaFilterOption), [zonas])
  const tiendaOptions = React.useMemo(() => zonaTiendaController.tiendasDisponibles.map(mapTiendaOption), [zonaTiendaController.tiendasDisponibles])
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))

  function handleZonaChange(id_zona: number | null) {
    zonaTiendaController.updateZona(id_zona)
    resetPageIndex()
  }

  function handleTiendaChange(id_tienda: number | null) {
    zonaTiendaController.updateTienda(id_tienda)
    resetPageIndex()
  }

  function handleResetFilters() {
    resetFilters()
    zonaTiendaController.resetFilters()
  }

  return (
    <main className="auditoria-home-page">
      <section className="auditoria-home-page__filters" aria-label="Filtros de auditorias">
        <label>
          <span>Auditor</span>
          <Select
            inputId="home-auditor"
            options={auditorOptions}
            value={selectedOption(auditorOptions, filters.id_auditor)}
            onChange={(selected) => updateFilter('id_auditor', getNumericOptionValue(selected))}
            placeholder="Todos los auditores"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
          />
        </label>

        <label>
          <span>Jefe de zona</span>
          <Select
            inputId="home-jefe-zona"
            options={jefeZonaOptions}
            value={selectedOption(jefeZonaOptions, filters.id_jefe_zona)}
            onChange={(selected) => updateFilter('id_jefe_zona', getNumericOptionValue(selected))}
            placeholder="Todos los jefes de zona"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
          />
        </label>

        <label>
          <span>Zona</span>
          <Select
            inputId="home-zona"
            options={zonaOptions}
            value={selectedOption(zonaOptions, zonaTiendaController.filters.id_zona)}
            onChange={(selected) => handleZonaChange(getNumericOptionValue(selected))}
            placeholder="Todas las zonas"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
          />
        </label>

        <label>
          <span>Tienda</span>
          <Select
            inputId="home-tienda"
            options={tiendaOptions}
            value={selectedOption(tiendaOptions, zonaTiendaController.filters.id_tienda)}
            onChange={(selected) => handleTiendaChange(getNumericOptionValue(selected))}
            placeholder="Todas las tiendas"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
          />
        </label>

        <label>
          <span>Modalidad</span>
          <Select
            inputId="home-modalidad"
            options={modalidades}
            value={selectedOption(modalidades, filters.modalidad)}
            onChange={(selected) => updateFilter('modalidad', String(selected?.value ?? ''))}
            placeholder="Todas las modalidades"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
          />
        </label>

        <label>
          <span>Estado</span>
          <Select
            inputId="home-estado"
            options={estadosInventario}
            value={selectedOption(estadosInventario, filters.estado_inventario)}
            onChange={(selected) => updateFilter('estado_inventario', String(selected?.value ?? ''))}
            placeholder="Todos los estados"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
          />
        </label>

        <button
          className="auditoria-home-page__ghost-button"
          type="button"
          onClick={handleResetFilters}
        >
          Limpiar filtros
        </button>
      </section>

      <PanelCumplimientoSection
        tiendas={tiendas}
        zonas={zonas}
        filters={zonaTiendaController.filters}
        onSelectTienda={handleTiendaChange}
      />

      <h2 className="auditoria-home-page__section-title">Historial de auditorias</h2>

      {error ? <p className="auditoria-home-page__message">{error}</p> : null}
      {!error && loading ? <p className="auditoria-home-page__message">Cargando auditorias...</p> : null}
      {!error && !loading && auditorias.length === 0 ? (
        <p className="auditoria-home-page__message">Aun no hay auditorias registradas.</p>
      ) : null}

      <section className="auditoria-home-page__grid" aria-label="Listado de auditorias">
        {auditorias.map((item) => (
          <article
            className="auditoria-home-page__card"
            key={item.id_auditoria}
            onClick={() => navigate(`/auditoria/${item.id_auditoria}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/auditoria/${item.id_auditoria}`)
              }
            }}
          >
            <div className="auditoria-home-page__card-top">
              <span className="auditoria-home-page__code">#{item.id_auditoria}</span>
              <span className="auditoria-home-page__status">
                {item.estado_inventario || 'Sin estado'}
              </span>
            </div>

            <strong>{getTiendaName(tiendas, item.id_tienda)}</strong>
            <p>{getZonaName(zonas, item.id_zona)}</p>

            <div className="auditoria-home-page__meta">
              <span>{getAuditorName(auditores, item.id_auditor)}</span>
              <span>{formatDate(item.fecha_auditoria)}</span>
            </div>

            <div className="auditoria-home-page__summary">
              <div>
                <small>Jefe de zona</small>
                <strong>{getJefeZonaName(jefesZona, item.id_jefe_zona)}</strong>
              </div>
              <div>
                <small>% Cumplimiento</small>
                <strong>{item.porcentaje_cumplimiento}%</strong>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="auditoria-home-page__pagination">
        <div className="auditoria-home-page__pagination-meta">
          <strong>{total}</strong>
          <span>auditorias encontradas</span>
        </div>

        <div className="auditoria-home-page__pagination-controls">
          <button
            className="auditoria-home-page__ghost-button"
            type="button"
            onClick={() => updateFilter('pageIndex', Math.max(1, filters.pageIndex - 1))}
            disabled={filters.pageIndex === 1}
          >
            Anterior
          </button>

          <span className="auditoria-home-page__page-indicator">
            Pagina {filters.pageIndex} de {totalPages}
          </span>

          <button
            className="auditoria-home-page__ghost-button"
            type="button"
            onClick={() => updateFilter('pageIndex', filters.pageIndex + 1)}
            disabled={!hasNext}
          >
            Siguiente
          </button>
        </div>
      </footer>
    </main>
  )
}
