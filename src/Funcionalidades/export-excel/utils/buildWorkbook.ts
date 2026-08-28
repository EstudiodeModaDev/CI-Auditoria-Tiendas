import ExcelJS from 'exceljs'
import type { areas_responsables } from '../../../models/database/areas_responsables'
import type { auditor } from '../../../models/database/auditor'
import type { auditoria, auditoriaDetalle } from '../../../models/database/auditoria'
import type { bodega } from '../../../models/database/bodega'
import type { causal } from '../../../models/database/causal'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'
import type { jefe_zona } from '../../../models/database/jefe_zona'
import type { tienda } from '../../../models/database/tienda'
import type { tipo_tienda } from '../../../models/database/tipo_tienda'
import type { zona } from '../../../models/database/zona'
import type { PlanAccionExportRow } from '../hooks/useExportPlanAccionData'
import {
  buildMonthlyAuditoriaRows,
  buildPlanesAccionRows,
  buildTiendaCatalogRows,
  computeVerticalMerges,
} from './exportRowBuilders'
import type { MonthKey } from './monthNames'

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1557C8' } }
const TITLE_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D3156' } }
const HEADER_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true }
const TITLE_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true, size: 13 }

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  })
  row.height = 34
}

function autoSizeColumns(worksheet: ExcelJS.Worksheet, headers: string[]) {
  headers.forEach((header, index) => {
    worksheet.getColumn(index + 1).width = Math.max(12, Math.min(38, header.length + 4))
  })
}

export type BuildWorkbookInput = {
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
  areasResponsables: areas_responsables[]
  planesAccion: PlanAccionExportRow[]
  months: MonthKey[]
}

function addTiendasSheet(workbook: ExcelJS.Workbook, input: BuildWorkbookInput) {
  const { headers, rows } = buildTiendaCatalogRows({
    tiendas: input.tiendas,
    zonas: input.zonas,
    jefeZona: input.jefeZona,
    bodegas: input.bodegas,
    auditores: input.auditores,
    auditorias: input.auditorias,
  })

  const worksheet = workbook.addWorksheet('Tiendas', { views: [{ state: 'frozen', ySplit: 1 }] })
  worksheet.addRow(headers)
  styleHeaderRow(worksheet.getRow(1))
  rows.forEach((row) => worksheet.addRow(row))
  autoSizeColumns(worksheet, headers)
}


function addPlanesAccionSheet(workbook: ExcelJS.Workbook, input: BuildWorkbookInput) {
  const { headers, rows } = buildPlanesAccionRows({
    planes: input.planesAccion,
    zonas: input.zonas,
    tiendas: input.tiendas,
    areasResponsables: input.areasResponsables,
  })

  const worksheet = workbook.addWorksheet('Planes de accion', { views: [{ state: 'frozen', ySplit: 1 }] })
  worksheet.addRow(headers)
  styleHeaderRow(worksheet.getRow(1))
  rows.forEach((row) => worksheet.addRow(row))
  autoSizeColumns(worksheet, headers)

  const fechaColumnIndexes = headers.reduce<number[]>((indexes, header, index) => {
    if (header === 'Fecha creacion' || header === 'Fecha compromiso' || header === 'Fecha ultima respuesta') {
      indexes.push(index + 1)
    }

    return indexes
  }, [])

  fechaColumnIndexes.forEach((columnIndex) => {
    worksheet.getColumn(columnIndex).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1 && cell.value instanceof Date) {
        cell.numFmt = 'dd/mm/yyyy'
      }
    })
  })
}

function addMonthlySheet(workbook: ExcelJS.Workbook, input: BuildWorkbookInput, monthKey: MonthKey) {
  const built = buildMonthlyAuditoriaRows({
    tiendas: input.tiendas,
    zonas: input.zonas,
    jefeZona: input.jefeZona,
    bodegas: input.bodegas,
    tiposTienda: input.tiposTienda,
    auditores: input.auditores,
    causales: input.causales,
    itemsEvaluacion: input.itemsEvaluacion,
    auditorias: input.auditorias,
    detalleByAuditoria: input.detalleByAuditoria,
    month: monthKey.month,
    year: monthKey.year,
    monthLabel: monthKey.label,
  })

  const headers = [...built.generalHeaders, ...built.checklistHeaders, ...built.totalsHeaders]
  const generalColumnCount = built.generalHeaders.length
  const checklistColumnCount = built.checklistHeaders.length

  const worksheet = workbook.addWorksheet(monthKey.sheetName, {
    views: [{ state: 'frozen', ySplit: 2, xSplit: 3 }],
  })

  const titleRowValues: (string | number)[] = new Array(headers.length).fill('')
  titleRowValues[generalColumnCount] = 'INVENTARIO FÍSICO'
  worksheet.addRow(titleRowValues)
  worksheet.mergeCells(1, generalColumnCount + 1, 1, generalColumnCount + checklistColumnCount)
  const titleCell = worksheet.getCell(1, generalColumnCount + 1)
  titleCell.fill = TITLE_FILL
  titleCell.font = TITLE_FONT
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 26

  worksheet.addRow(headers)
  styleHeaderRow(worksheet.getRow(2))

  built.rows.forEach((row) => worksheet.addRow(row))

  const fechaColumnIndex = built.generalHeaders.indexOf('Fecha') + 1
  worksheet.getColumn(fechaColumnIndex).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 2 && cell.value instanceof Date) {
      cell.numFmt = 'dd/mm/yyyy'
    }
  })

  const cumplimientoColumnIndex = headers.length
  worksheet.getColumn(cumplimientoColumnIndex).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 2 && typeof cell.value === 'number') {
      cell.numFmt = '0"%"'
    }
  })

  computeVerticalMerges(built.zonaColumnValues, 3).forEach((merge) => {
    worksheet.mergeCells(merge.startRow, 1, merge.endRow, 1)
    worksheet.getCell(merge.startRow, 1).alignment = { vertical: 'middle' }
  })

  computeVerticalMerges(built.jefeZonaColumnValues, 3).forEach((merge) => {
    worksheet.mergeCells(merge.startRow, 2, merge.endRow, 2)
    worksheet.getCell(merge.startRow, 2).alignment = { vertical: 'middle' }
  })

  autoSizeColumns(worksheet, headers)
}

export function buildExportWorkbook(input: BuildWorkbookInput): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Auditorias Control Interno'
  workbook.created = new Date()

  addTiendasSheet(workbook, input)
  input.months.forEach((monthKey) => addMonthlySheet(workbook, input, monthKey))
  addPlanesAccionSheet(workbook, input)

  return workbook
}
