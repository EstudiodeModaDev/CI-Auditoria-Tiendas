import type { causal } from '../../../models/database/causal'
import type { auditoria, auditoriaDetalle } from '../../../models/database/auditoria'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'

export type LegacyChecklistBlock = {
  id: string
  keywords: string[]
  headers: string[]
  extra?: 'imperfectos' | 'etiquetas' | 'novedades'
}

export const LEGACY_CHECKLIST_BLOCKS: LegacyChecklistBlock[] = [
  {
    id: 'arqueo',
    keywords: ['arqueo'],
    headers: ['Arqueo de caja, movimientos diarios y recaudos', 'Observacion'],
  },
  {
    id: 'tr_vi',
    keywords: ['tr/vi', 'tr vi', 'transporte de valores'],
    headers: ['Manejo de TR/VI', 'Observacion'],
  },
  {
    id: 'online',
    keywords: ['online', 'en linea', 'en línea'],
    headers: ['Manejo de unidades online', 'Observacion'],
  },
  {
    id: 'sx_ajf',
    keywords: ['sx', 'ajf'],
    headers: ['Reporte de SX /AJF fuera- de tiempo ', 'Observacion'],
  },
  {
    id: 'imperfectos',
    keywords: ['imperfect'],
    headers: ['Imperfectos en prendas nuevas', 'Cantidad imperfectos', 'Porcentaje - Calidad ', 'Observacion'],
    extra: 'imperfectos',
  },
  {
    id: 'garantias',
    keywords: ['garant'],
    headers: ['Garantias', 'Observacion'],
  },
  {
    id: 'etiquetas',
    keywords: ['etiqueta'],
    headers: ['Prendas sin etiquetas y/o precio', 'Observacion', 'Cantidad Prendas sin etiqueta'],
    extra: 'etiquetas',
  },
  {
    id: 'novedades',
    keywords: [],
    headers: [
      'Novedades presentadas en la lectura, todo lo relacionado al inventario y auditorias',
      'Observacion 1',
      'Observacion 2',
      'Observacion 3',
      'Si selecciona "Otras"',
    ],
    extra: 'novedades',
  },
  {
    id: 'prestamos',
    keywords: ['prestamo', 'préstamo'],
    headers: ['Control a prestamos', 'Observacion'],
  },
  {
    id: 'planes_accion',
    keywords: ['planes de acci'],
    headers: ['Planes de acción (Tiempo de respuesta)', 'Observacion'],
  },
  {
    id: 'vestiers',
    keywords: ['vestier', 'vestidor'],
    headers: ['Estado de vestiers', 'Observacion'],
  },
]

export function matchItemByKeywords(items: item_evaluacion[], keywords: string[]): item_evaluacion | null {
  if (keywords.length === 0) {
    return null
  }

  const normalize = (value: string) => value.toLowerCase()

  return items.find((item) => {
    const nombre = normalize(item.nombre ?? '')
    return keywords.some((keyword) => nombre.includes(normalize(keyword)))
  }) ?? null
}

function getDetalleForItem(detalle: auditoriaDetalle[] | null, itemId: number | undefined) {
  if (!detalle || itemId == null) {
    return null
  }

  return detalle.find((row) => row.id_item === itemId) ?? null
}

function getCausalDescripcion(causales: causal[], idCausal: number | null) {
  if (!idCausal) {
    return ''
  }

  return causales.find((item) => item.id_causal === idCausal)?.descripcion ?? ''
}

export function buildChecklistBlockValues(
  block: LegacyChecklistBlock,
  items: item_evaluacion[],
  detalle: auditoriaDetalle[] | null,
  causales: causal[],
  auditoriaRecord: auditoria | null,
): (string | number)[] {
  if (block.extra === 'novedades') {
    return block.headers.map(() => '')
  }

  const matchedItem = matchItemByKeywords(items, block.keywords)
  const detalleRow = getDetalleForItem(detalle, matchedItem?.id_item_evaluacion)

  if (!matchedItem || !detalleRow) {
    return block.headers.map(() => '')
  }

  const cumpleValue = detalleRow.cumple ? 1 : 0
  const observacion = detalleRow.id_causal
    ? getCausalDescripcion(causales, detalleRow.id_causal)
    : detalleRow.observacion || 'Sin Novedad'

  if (block.extra === 'imperfectos') {
    const porcentajeCalidad = auditoriaRecord
      ? `${auditoriaRecord.porcentaje_calidad}% - ${auditoriaRecord.resultado_calidad}`
      : ''

    return [cumpleValue, detalleRow.cantidad_afectada ?? 0, porcentajeCalidad, observacion]
  }

  if (block.extra === 'etiquetas') {
    return [cumpleValue, observacion, detalleRow.cantidad_afectada ?? 0]
  }

  return [cumpleValue, observacion]
}
