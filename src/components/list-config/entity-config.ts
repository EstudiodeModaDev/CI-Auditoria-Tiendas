import type { ListDefinition } from '../../models/components/config'

export type EntityId =
  | 'auditores'
  | 'causales'
  | 'zonas'
  | 'jefes-zona'
  | 'tiendas'
  | 'tipos-tienda'
  | 'marcas'
  | 'bodegas'
  | 'areas-responsables'
  | 'items-evaluacion'

// Fuente unica de las listas configurables: usada por la pagina y el sidebar
// para que ambos permanezcan sincronizados.
export const listDefinitions: ListDefinition[] = [
  { id: 'auditores', name: 'Auditores', shortName: 'AU' },
  { id: 'causales', name: 'Causales', shortName: 'CA' },
  { id: 'zonas', name: 'Zonas', shortName: 'ZN' },
  { id: 'jefes-zona', name: 'Jefes de zona', shortName: 'JZ' },
  { id: 'tiendas', name: 'Tiendas', shortName: 'TD' },
  { id: 'tipos-tienda', name: 'Tipos de tienda', shortName: 'TT' },
  { id: 'marcas', name: 'Marcas', shortName: 'MK' },
  { id: 'bodegas', name: 'Bodegas', shortName: 'BG' },
  { id: 'areas-responsables', name: 'Areas responsables', shortName: 'AR' },
  { id: 'items-evaluacion', name: 'Items de evaluacion', shortName: 'IE' },
]

const entityCopy: Record<EntityId, { article: 'el' | 'la'; noun: string }> = {
  auditores: { article: 'el', noun: 'auditor' },
  causales: { article: 'la', noun: 'causal' },
  zonas: { article: 'la', noun: 'zona' },
  'jefes-zona': { article: 'el', noun: 'jefe de zona' },
  tiendas: { article: 'la', noun: 'tienda' },
  'tipos-tienda': { article: 'el', noun: 'tipo de tienda' },
  marcas: { article: 'la', noun: 'marca' },
  bodegas: { article: 'la', noun: 'bodega' },
  'areas-responsables': { article: 'el', noun: 'area responsable' },
  'items-evaluacion': { article: 'el', noun: 'item de evaluacion' },
}

export function entityNoun(id: EntityId) {
  return entityCopy[id].noun
}

export function entityWithArticle(id: EntityId) {
  const { article, noun } = entityCopy[id]
  return `${article} ${noun}`
}

// Contraccion "de + el" -> "del" (p.ej. "del auditor" vs "de la zona").
export function entityWithDePrefix(id: EntityId) {
  const { article, noun } = entityCopy[id]
  return article === 'el' ? `del ${noun}` : `de la ${noun}`
}
