
import './list-config-page.css'

type ListDefinition = {
  id: string
  name: string
  shortName: string
}

type ListItem = {
  id: string
  title: string
  subtitle: string
  summary: string
  status: boolean
  values: Record<string, string>
}

type ItemMap = Record<string, ListItem[]>

const listDefinitions: ListDefinition[] = [
    {
    id: 'auditores',
    name: 'Auditores',
    shortName: 'AU',
  },
  {
    id: 'causales',
    name: 'Causales',
    shortName: 'CA',
  },
  {
    id: 'zonas',
    name: 'Zonas',
    shortName: 'ZN',
  },
  {
    id: 'jefes-zona',
    name: 'Jefes de zona',
    shortName: 'JZ',
  },
  {
    id: 'tiendas',
    name: 'Tiendas',
    shortName: 'TD',
  },
  {
    id: 'tipos-tienda',
    name: 'Tipos de tienda',
    shortName: 'TT',
  },
  {
    id: 'marcas',
    name: 'Marcas',
    shortName: 'MK',
  },
  {
    id: 'bodegas',
    name: 'Bodegas',
    shortName: 'BG',
  },
  {
    id: 'items-evaluacion',
    name: 'Items de evaluacion',
    shortName: 'IE',
  },
]

type Props = {
  setSelectedListId: (s: string) => void
  selectedDefinition: ListDefinition
  itemsByList: ItemMap

}

export function ConfigSidebar({itemsByList, setSelectedListId,selectedDefinition}: Props) {

 return (
    <aside className="list-config__sidebar">
      <div className="list-config__brand">
        <span className="list-config__eyebrow">Control maestro</span>
        <h1>Configuración</h1>
      </div>

      <nav className="list-config__catalog" aria-label="Listas configurables">
        {listDefinitions.map((definition) => {
          const isActive = definition.id === selectedDefinition.id

          return (
            <button
              key={definition.id}
              className={`list-config__catalog-item${isActive ? ' is-active' : ''}`}
              type="button"
              onClick={() => setSelectedListId(definition.id)}
            >
              <span className="list-config__catalog-badge">{definition.shortName}</span>
              <span className="list-config__catalog-copy">
                <strong>{definition.name}</strong>
              </span>
              <span className="list-config__catalog-count">
                {itemsByList[definition.id]?.length ?? 0}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
