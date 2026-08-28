import type { areas_responsables } from '../../../models/database/areas_responsables'
import type { auditor } from '../../../models/database/auditor'
import type { auditoria, auditoriaDetalle } from '../../../models/database/auditoria'
import type { bodega } from '../../../models/database/bodega'
import type { causal } from '../../../models/database/causal'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'
import type { jefe_zona } from '../../../models/database/jefe_zona'
import type { planAccionSeguimiento } from '../../../models/database/plan_accion'
import type { tienda } from '../../../models/database/tienda'
import type { tipo_tienda } from '../../../models/database/tipo_tienda'
import type { zona } from '../../../models/database/zona'
import type { PlanAccionExportRow } from '../hooks/useExportPlanAccionData'
import { buildChecklistBlockValues, LEGACY_CHECKLIST_BLOCKS } from './legacyChecklistColumns'
import { isInMonth, toDate } from './monthNames'

export type SheetCellValue = string | number | Date
export type SheetRow = SheetCellValue[]

export function computeVerticalMerges(values: string[], startRow: number) {
  const merges: { startRow: number; endRow: number }[] = []
  let runStart = 0

  for (let i = 1; i <= values.length; i += 1) {
    const continuesRun = i < values.length && values[i] === values[runStart] && values[runStart] !== ''

    if (!continuesRun) {
      if (i - runStart > 1 && values[runStart] !== '') {
        merges.push({ startRow: startRow + runStart, endRow: startRow + i - 1 })
      }
      runStart = i
    }
  }

  return merges
}

export type TiendaCatalogDeps = {
  tiendas: tienda[]
  zonas: zona[]
  jefeZona: jefe_zona[]
  bodegas: bodega[]
  auditores: auditor[]
  auditorias: auditoria[]
}

export function buildTiendaCatalogRows(deps: TiendaCatalogDeps) {
  const zonaById = new Map(deps.zonas.map((item) => [item.id_zona, item.nombre]))
  const jefeZonaById = new Map(deps.jefeZona.map((item) => [item.id_jefe_zona, item.nombre]))
  const bodegaById = new Map(deps.bodegas.map((item) => [item.id_bodega, item]))
  const auditorById = new Map(deps.auditores.map((item) => [item.id_auditor, item.nombre]))

  const ultimaAuditoriaPorTienda = new Map<number, auditoria>()
  deps.auditorias.forEach((registro) => {
    if (registro.id_tienda == null) {
      return
    }

    const actual = ultimaAuditoriaPorTienda.get(registro.id_tienda)
    const fechaActual = actual ? toDate(actual.fecha_auditoria)?.getTime() ?? -Infinity : -Infinity
    const fechaCandidata = toDate(registro.fecha_auditoria)?.getTime() ?? -Infinity

    if (fechaCandidata >= fechaActual) {
      ultimaAuditoriaPorTienda.set(registro.id_tienda, registro)
    }
  })

  const rows: SheetRow[] = deps.tiendas
    .filter((item) => item.activo)
    .map((item) => {
      const bodegaInfo = item.id_bodega != null ? bodegaById.get(item.id_bodega) : undefined
      const ultimaAuditoria = item.id_tienda != null ? ultimaAuditoriaPorTienda.get(item.id_tienda) : undefined
      const auditorNombre = ultimaAuditoria?.id_auditor != null ? auditorById.get(ultimaAuditoria.id_auditor) ?? '' : ''

      return [
        bodegaInfo?.codigo ?? '',
        bodegaInfo?.codigo_co ?? '',
        item.nombre,
        item.id_jefe_zona != null ? jefeZonaById.get(item.id_jefe_zona) ?? '' : '',
        item.id_zona != null ? zonaById.get(item.id_zona) ?? '' : '',
        auditorNombre,
      ]
    })

  return {
    headers: ['IdTienda', 'C.O', 'descripcion', 'jefe_zona', 'zona', 'Auditor'],
    rows,
  }
}

export type ParametrosDeps = {
  itemsEvaluacion: item_evaluacion[]
  causales: causal[]
}

export type MonthlyAuditoriaDeps = {
  tiendas: tienda[]
  zonas: zona[]
  jefeZona: jefe_zona[]
  bodegas: bodega[]
  tiposTienda: tipo_tienda[]
  auditores: auditor[]
  causales: causal[]
  itemsEvaluacion: item_evaluacion[]
  auditorias: auditoria[]
  detalleByAuditoria: Map<number, auditoriaDetalle[]>
  month: number
  year: number
  monthLabel: string
}

export function buildMonthlyAuditoriaRows(deps: MonthlyAuditoriaDeps) {
  const zonaById = new Map(deps.zonas.map((item) => [item.id_zona, item.nombre]))
  const jefeZonaById = new Map(deps.jefeZona.map((item) => [item.id_jefe_zona, item.nombre]))
  const bodegaById = new Map(deps.bodegas.map((item) => [item.id_bodega, item.codigo]))
  const tipoTiendaById = new Map(deps.tiposTienda.map((item) => [item.id_tipo_tienda, item.nombre]))
  const auditorById = new Map(deps.auditores.map((item) => [item.id_auditor, item.nombre]))

  const auditoriaMasRecientePorTienda = new Map<number, auditoria>()
  deps.auditorias
    .filter((registro) => isInMonth(toDate(registro.fecha_auditoria), deps.month, deps.year))
    .forEach((registro) => {
      if (registro.id_tienda == null) {
        return
      }

      const actual = auditoriaMasRecientePorTienda.get(registro.id_tienda)
      const fechaActual = actual ? toDate(actual.fecha_auditoria)?.getTime() ?? -Infinity : -Infinity
      const fechaCandidata = toDate(registro.fecha_auditoria)?.getTime() ?? -Infinity

      if (fechaCandidata >= fechaActual) {
        auditoriaMasRecientePorTienda.set(registro.id_tienda, registro)
      }
    })

  const rosterOrdenado = [...deps.tiendas].sort((a, b) => {
    const zonaA = a.id_zona != null ? zonaById.get(a.id_zona) ?? '' : ''
    const zonaB = b.id_zona != null ? zonaById.get(b.id_zona) ?? '' : ''
    if (zonaA !== zonaB) return zonaA.localeCompare(zonaB)

    const jefeA = a.id_jefe_zona != null ? jefeZonaById.get(a.id_jefe_zona) ?? '' : ''
    const jefeB = b.id_jefe_zona != null ? jefeZonaById.get(b.id_jefe_zona) ?? '' : ''
    if (jefeA !== jefeB) return jefeA.localeCompare(jefeB)

    return a.nombre.localeCompare(b.nombre)
  })

  const rows: SheetRow[] = []
  const zonaColumnValues: string[] = []
  const jefeZonaColumnValues: string[] = []

  rosterOrdenado.forEach((tiendaItem) => {
    const zonaNombre = tiendaItem.id_zona != null ? zonaById.get(tiendaItem.id_zona) ?? '' : ''
    const jefeZonaNombre = tiendaItem.id_jefe_zona != null ? jefeZonaById.get(tiendaItem.id_jefe_zona) ?? '' : ''
    const bodegaCodigo = tiendaItem.id_bodega != null ? bodegaById.get(tiendaItem.id_bodega) ?? '' : ''
    const tipoTiendaNombre = tiendaItem.id_tipo_tienda != null ? tipoTiendaById.get(tiendaItem.id_tipo_tienda) ?? '' : ''
    const auditoriaDelMes = tiendaItem.id_tienda != null ? auditoriaMasRecientePorTienda.get(tiendaItem.id_tienda) ?? null : null
    const detalle = auditoriaDelMes?.id_auditoria != null ? deps.detalleByAuditoria.get(auditoriaDelMes.id_auditoria) ?? [] : null
    const fechaAuditoria = auditoriaDelMes ? toDate(auditoriaDelMes.fecha_auditoria) : null

    const generalColumns: SheetRow = auditoriaDelMes
      ? [
          zonaNombre,
          jefeZonaNombre,
          tiendaItem.nombre,
          bodegaCodigo,
          tipoTiendaNombre,
          auditoriaDelMes.id_auditor != null ? auditorById.get(auditoriaDelMes.id_auditor) ?? '' : '',
          fechaAuditoria ?? 'No tuvo inventario',
          deps.monthLabel,
          deps.year,
          auditoriaDelMes.modalidad || '',
          auditoriaDelMes.estado_inventario || '',
          auditoriaDelMes.estado_tienda || '',
        ]
      : [
          zonaNombre,
          jefeZonaNombre,
          tiendaItem.nombre,
          bodegaCodigo,
          tipoTiendaNombre,
          '',
          'No tuvo inventario',
          deps.monthLabel,
          deps.year,
          'N/A',
          'No se programo',
          tiendaItem.activo ? 'Abierta' : 'Cerrada',
        ]

    const checklistColumns: SheetRow = LEGACY_CHECKLIST_BLOCKS.flatMap((block) =>
      buildChecklistBlockValues(block, deps.itemsEvaluacion, detalle, deps.causales, auditoriaDelMes),
    )

    const totalsColumns: SheetRow = auditoriaDelMes
      ? [
          auditoriaDelMes.faltantes ?? 0,
          auditoriaDelMes.sobrantes ?? 0,
          auditoriaDelMes.trocados ?? 0,
          auditoriaDelMes.neto_inventario ?? 0,
          auditoriaDelMes.total_items_cumplidos ?? 0,
          auditoriaDelMes.porcentaje_cumplimiento ?? 0,
        ]
      : [0, 0, 0, 0, 0, 0]

    rows.push([...generalColumns, ...checklistColumns, ...totalsColumns])
    zonaColumnValues.push(zonaNombre)
    jefeZonaColumnValues.push(jefeZonaNombre)
  })

  return {
    generalHeaders: [
      'ZONA', 'JEFE DE ZONA', 'TIENDA', 'Bodega', 'Tipo', 
      'Auditor/Encargado', 'Fecha', 'Mes', 'Año', 'Modalidad', 'Estado Inventario', 'Estado Tienda',
    ],
    checklistHeaders: LEGACY_CHECKLIST_BLOCKS.flatMap((block) => block.headers),
    totalsHeaders: [
      'Faltantes inventario', 'Sobrantes Inventario', 'Trocados inventario (Por referencia)',
      'Neto final', 'Total items cumplidos (11)', '% Cumplimiento',
    ],
    rows,
    zonaColumnValues,
    jefeZonaColumnValues,
  }
}

export type PlanesAccionDeps = {
  planes: PlanAccionExportRow[]
  zonas: zona[]
  tiendas: tienda[]
  areasResponsables: areas_responsables[]
}

function formatUltimaRespuesta(respuesta: planAccionSeguimiento | null): SheetRow {
  if (!respuesta) {
    return ['', '', 'Sin respuestas registradas']
  }

  const fecha = toDate(respuesta.fecha_seguimiento)

  return [fecha ?? '', respuesta.usuario || '', respuesta.comentario || '']
}

function formatPlanFecha(value: string): SheetCellValue {
  return toDate(value) ?? value ?? ''
}

export function buildPlanesAccionRows(deps: PlanesAccionDeps) {
  const zonaById = new Map(deps.zonas.map((item) => [item.id_zona, item.nombre]))
  const tiendaById = new Map(deps.tiendas.map((item) => [item.id_tienda, item.nombre]))
  const areaResponsableById = new Map(deps.areasResponsables.map((item) => [item.id_area_responsable, item.nombre]))

  const rows: SheetRow[] = deps.planes.map(({ plan, ultimaRespuesta }: PlanAccionExportRow) => {
    const generalColumns: SheetRow = [
      plan.id_plan_accion ?? '',
      plan.id_auditoria ?? '',
      plan.id_zona != null ? zonaById.get(plan.id_zona) ?? '' : '',
      plan.id_tienda != null ? tiendaById.get(plan.id_tienda) ?? '' : '',
      plan.id_area_responsable != null ? areaResponsableById.get(plan.id_area_responsable) ?? '' : '',
      plan.responsable || '',
      Array.isArray(plan.tipo_hallazgo) ? plan.tipo_hallazgo.join(', ') : '',
      plan.descripcion_hallazgo || '',
      plan.impacto || '',
      plan.actividad_correctiva || '',
      plan.estado || '',
      plan.prioridad || '',
      plan.porcentaje_avance ?? 0,
      formatPlanFecha(plan.fecha_creacion),
      formatPlanFecha(plan.fecha_compromiso),
    ]

    return [...generalColumns, ...formatUltimaRespuesta(ultimaRespuesta)]
  })

  return {
    headers: [
      'ID Plan', 'Auditoria', 'Zona', 'Tienda', 'Area responsable', 'Responsable',
      'Tipo hallazgo', 'Descripcion hallazgo', 'Impacto', 'Actividad correctiva',
      'Estado', 'Prioridad', '% Avance', 'Fecha creacion', 'Fecha compromiso',
      'Fecha ultima respuesta', 'Usuario ultima respuesta', 'Ultima respuesta',
    ],
    rows,
  }
}
