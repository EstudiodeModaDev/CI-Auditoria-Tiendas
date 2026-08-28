
import './list-config-page.css'
import type { ItemMap, ListDefinition } from '../../models/components/config'
import { listDefinitions } from './entity-config'

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
