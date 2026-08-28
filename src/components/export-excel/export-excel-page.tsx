import React from 'react'
import Select from 'react-select'
import './export-excel-page.css'
import { useExportExcel } from '../../Funcionalidades/export-excel/hooks/useExportExcel'
import { mapAuditorOption, mapTiendaOption, mapZonaOption, selectedOption } from '../../Funcionalidades/shared/react-select'
import type { SelectOption } from '../../Funcionalidades/configs/tienda/hooks/useTiendaRelations'
import type { areas_responsables } from '../../models/database/areas_responsables'
import type { auditor } from '../../models/database/auditor'
import type { bodega } from '../../models/database/bodega'
import type { causal } from '../../models/database/causal'
import type { jefe_zona } from '../../models/database/jefe_zona'
import type { tienda } from '../../models/database/tienda'
import type { tipo_tienda } from '../../models/database/tipo_tienda'
import type { zona } from '../../models/database/zona'
import { KpiCard } from '../commons/kpiCard'
import { buildConfigSelectStyles, buildSelectLayerProps } from '../commons/react-select-styles'

type ExportExcelPageProps = {
  auditores: auditor[]
  tiendas: tienda[]
  zonas: zona[]
  jefesZona: jefe_zona[]
  bodegas: bodega[]
  tiposTienda: tipo_tienda[]
  causales: causal[]
  areasResponsables: areas_responsables[]
  modalidades: SelectOption[]
}

export function ExportExcelPage(props: ExportExcelPageProps) {
  const controller = useExportExcel({
    zonas: props.zonas,
    jefeZona: props.jefesZona,
    tiendas: props.tiendas,
    bodegas: props.bodegas,
    tiposTienda: props.tiposTienda,
    auditores: props.auditores,
    causales: props.causales,
    areasResponsables: props.areasResponsables,
  })

  const zonaOptions = React.useMemo(() => props.zonas.map(mapZonaOption), [props.zonas])
  const tiendaOptions = React.useMemo(() => props.tiendas.map(mapTiendaOption), [props.tiendas])
  const auditorOptions = React.useMemo(() => props.auditores.map(mapAuditorOption), [props.auditores])

  const dateFrom = typeof controller.filters.range.from === 'string' ? controller.filters.range.from : ''
  const dateTo = typeof controller.filters.range.to === 'string' ? controller.filters.range.to : ''

  return (
    <main className="export-excel-page">
      <section className="export-excel-page__hero">
        <div>
          <span className="export-excel-page__eyebrow">Reportes</span>
          <h1>Exportar auditorias a Excel</h1>
          <p>Genera el reporte de tiendas por mes, con el catalogo de tiendas y de items de evaluacion, listo para compartir.</p>
        </div>
      </section>

      <section className="export-excel-page__filters" aria-label="Filtros de exportacion">
        <label>
          <span>Desde</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => controller.updateRange('from', event.target.value)}
          />
        </label>

        <label>
          <span>Hasta</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => controller.updateRange('to', event.target.value)}
          />
        </label>

        <label>
          <span>Zona</span>
          <Select
            inputId="export-zona"
            options={zonaOptions}
            value={selectedOption(zonaOptions, controller.filters.id_zona)}
            onChange={(selected) => controller.updateFilter('id_zona', selected ? Number(selected.value) : null)}
            placeholder="Todas las zonas"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <label>
          <span>Tienda</span>
          <Select
            inputId="export-tienda"
            options={tiendaOptions}
            value={selectedOption(tiendaOptions, controller.filters.id_tienda)}
            onChange={(selected) => controller.updateFilter('id_tienda', selected ? Number(selected.value) : null)}
            placeholder="Todas las tiendas"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <label>
          <span>Auditor</span>
          <Select
            inputId="export-auditor"
            options={auditorOptions}
            value={selectedOption(auditorOptions, controller.filters.id_auditor)}
            onChange={(selected) => controller.updateFilter('id_auditor', selected ? Number(selected.value) : null)}
            placeholder="Todos los auditores"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <label>
          <span>Modalidad</span>
          <Select
            inputId="export-modalidad"
            options={props.modalidades}
            value={selectedOption(props.modalidades, controller.filters.modalidad)}
            onChange={(selected) => controller.updateFilter('modalidad', String(selected?.value ?? ''))}
            placeholder="Todas las modalidades"
            isClearable
            styles={buildConfigSelectStyles<SelectOption>()}
            {...buildSelectLayerProps()}
          />
        </label>

        <button className="export-excel-page__ghost-button" type="button" onClick={controller.resetFilters}>
          Limpiar filtros
        </button>
      </section>

      <section className="export-excel-page__kpis" aria-label="Resumen de la exportacion">
        <KpiCard titulo="Tiendas incluidas" subtitulo="Segun filtros aplicados" valor={controller.tiendasFiltradas.length} />
        <KpiCard titulo="Auditorias encontradas" subtitulo="En el rango seleccionado" valor={controller.auditorias.length} />
        <KpiCard titulo="Planes de accion encontrados" subtitulo="En el rango seleccionado" valor={controller.planesAccion.length} />
      </section>

      {controller.error ? <p className="export-excel-page__message">{controller.error}</p> : null}
      {!controller.error && controller.loading ? (
        <p className="export-excel-page__message">Cargando informacion para el reporte...</p>
      ) : null}

      <section className="export-excel-page__summary">
        <div>
          <h2>Contenido del archivo</h2>
          <ul>
            <li><strong>Tiendas</strong>: catalogo de tiendas activas con su zona, jefe de zona y ultimo auditor.</li>
            {controller.months.map((month) => (
              <li key={month.sheetName}>
                <strong>{month.sheetName}</strong>: resultados de auditoria de {month.label} {month.year}.
              </li>
            ))}
            <li><strong>Planes de accion</strong>: planes generados por las auditorias del rango, con la ultima respuesta registrada para cada uno.</li>
          </ul>
        </div>

        <button
          className="export-excel-page__primary-button"
          type="button"
          onClick={controller.handleExport}
          disabled={controller.exporting || controller.loading}
        >
          {controller.exporting ? 'Generando archivo...' : 'Descargar Excel'}
        </button>
      </section>
    </main>
  )
}
