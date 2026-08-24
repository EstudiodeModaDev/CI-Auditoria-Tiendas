import type { auditoria, auditoriaDetalle } from '../../../models/database/auditoria'
import type { item_evaluacion } from '../../../models/database/items_evaluacion'
import type { tienda } from '../../../models/database/tienda'
import type { zona } from '../../../models/database/zona'

const CRITICAL_NO_CUMPLE_THRESHOLD = 2

export type ItemCompliance = {
  id_item_evaluacion: number
  nombre: string
  cumple: number
  noCumple: number
  visitas: number
}

export type StoreCompliance = {
  id_tienda: number
  nombre: string
  id_zona: number | null
  zonaNombre: string
  pct: number
  critico: boolean
  worstItem: ItemCompliance
  items: ItemCompliance[]
  totalAuditorias: number
}

export type BuildStoreComplianceDeps = {
  tiendas: tienda[]
  zonas: zona[]
  itemsEvaluacion: item_evaluacion[]
  auditorias: auditoria[]
  detalleByAuditoria: Map<number, auditoriaDetalle[]>
}

export function buildStoreCompliance(deps: BuildStoreComplianceDeps): StoreCompliance[] {
  const zonaById = new Map(deps.zonas.map((item) => [item.id_zona, item.nombre]))
  const itemsActivos = deps.itemsEvaluacion.filter((item) => item.activo)

  const auditoriasPorTienda = new Map<number, auditoria[]>()
  deps.auditorias.forEach((registro) => {
    if (registro.id_tienda == null) {
      return
    }

    const lista = auditoriasPorTienda.get(registro.id_tienda) ?? []
    lista.push(registro)
    auditoriasPorTienda.set(registro.id_tienda, lista)
  })

  const result: StoreCompliance[] = []

  deps.tiendas.forEach((tiendaItem) => {
    if (tiendaItem.id_tienda == null) {
      return
    }

    const auditoriasDeLaTienda = auditoriasPorTienda.get(tiendaItem.id_tienda) ?? []

    if (auditoriasDeLaTienda.length === 0) {
      return
    }

    const detalleDeLaTienda = auditoriasDeLaTienda.flatMap((registro) =>
      registro.id_auditoria != null ? deps.detalleByAuditoria.get(registro.id_auditoria) ?? [] : [],
    )

    if (itemsActivos.length === 0) {
      return
    }

    const items: ItemCompliance[] = itemsActivos.map((item) => {
      const detalleDelItem = detalleDeLaTienda.filter((detalle) => detalle.id_item === item.id_item_evaluacion)
      const cumple = detalleDelItem.filter((detalle) => detalle.cumple).length
      const visitas = detalleDelItem.length

      return {
        id_item_evaluacion: item.id_item_evaluacion ?? 0,
        nombre: item.nombre,
        cumple,
        noCumple: visitas - cumple,
        visitas,
      }
    })

    const totalCumple = items.reduce((acc, item) => acc + item.cumple, 0)
    const totalVisitas = items.reduce((acc, item) => acc + item.visitas, 0)
    const pct = totalVisitas > 0 ? (totalCumple / totalVisitas) * 100 : 0
    const critico = items.every((item) => item.noCumple >= CRITICAL_NO_CUMPLE_THRESHOLD)
    const worstItem = items.reduce((peor, actual) => (actual.noCumple > peor.noCumple ? actual : peor), items[0])

    result.push({
      id_tienda: tiendaItem.id_tienda,
      nombre: tiendaItem.nombre,
      id_zona: tiendaItem.id_zona,
      zonaNombre: tiendaItem.id_zona != null ? zonaById.get(tiendaItem.id_zona) ?? 'Sin zona' : 'Sin zona',
      pct,
      critico,
      worstItem,
      items,
      totalAuditorias: auditoriasDeLaTienda.length,
    })
  })

  return result
}

export type ComplianceTone = 'critical' | 'warning' | 'good'

export function getComplianceTone(pct: number): ComplianceTone {
  if (pct < 45) {
    return 'critical'
  }

  if (pct < 75) {
    return 'warning'
  }

  return 'good'
}

export function formatCompliancePct(value: number) {
  const rounded = Math.round(value * 10) / 10
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
}
