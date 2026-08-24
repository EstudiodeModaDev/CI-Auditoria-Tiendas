import type { ListItem } from "../../models/components/config"

type Props = {
  item: ListItem
  isActive: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ListItemCard({item, isActive, onOpen, onEdit, onDelete}: Props) {

  return (
    <article className={`list-config__item-card${isActive ? ' is-active' : ''}`}>
      <button className="list-config__item-main" type="button" onClick={onOpen}>
        <span className="list-config__item-status">{item.status}</span>
        <strong className="list-config__item-title">{item.title}</strong>
        <span className="list-config__item-subtitle">{item.subtitle}</span>
        <p className="list-config__item-summary">{item.summary}</p>
      </button>

      <div className="list-config__item-actions">
        <button className="list-config__ghost-button" type="button" onClick={onEdit}>
          Editar
        </button>
        <button
          className="list-config__ghost-button list-config__ghost-button--danger"
          type="button"
          onClick={onDelete}
        >
          {isActive ? "Inactivar" : "Activar"}
        </button>
      </div>
    </article>
  )
}
