import type { ListItem } from "../../models/components/config"

type Props = {
  item: ListItem
  isSelected: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  deactivateDisabled?: boolean
}

export function ListItemCard({item, isSelected, onOpen, onEdit, onDelete, deactivateDisabled = false}: Props) {

  return (
    <article className={`list-config__item-card${isSelected ? ' is-active' : ''}`}>
      <button className="list-config__item-main" type="button" onClick={onOpen}>
        <span className="list-config__item-status">{item.status ? 'Activo' : 'Inactivo'}</span>
        <strong className="list-config__item-title">{item.title}</strong>
        <span className="list-config__item-subtitle">{item.subtitle}</span>
        <p className="list-config__item-summary">{item.summary}</p>
      </button>

      <div className="list-config__item-actions">
        <button className="list-config__ghost-button" type="button" onClick={onEdit}>
          Editar
        </button>
        {deactivateDisabled ? null : (
          <button
            className="list-config__ghost-button list-config__ghost-button--danger"
            type="button"
            onClick={onDelete}
          >
            {item.status ? "Inactivar" : "Activar"}
          </button>
        )}
      </div>
    </article>
  )
}
