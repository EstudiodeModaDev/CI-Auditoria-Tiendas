import './confirmModal.css'

type ConfirmModalMode = 'normal' | 'warning'

type ConfirmModalProps = {
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
  onSubmit: () => void
  mode?: ConfirmModalMode
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  onClose,
  onSubmit,
  mode = 'normal',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="confirm-modal__overlay" role="presentation" onClick={onClose}>
      <section
        aria-describedby="confirm-modal-description"
        aria-labelledby="confirm-modal-title"
        aria-modal="true"
        className={`confirm-modal confirm-modal--${mode}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="confirm-modal__badge" aria-hidden="true">
          {mode === 'warning' ? '!' : 'OK'}
        </div>

        <div className="confirm-modal__content">
          <h2 className="confirm-modal__title" id="confirm-modal-title">
            {title}
          </h2>
          <p className="confirm-modal__description" id="confirm-modal-description">
            {description}
          </p>
        </div>

        <div className="confirm-modal__actions">
          <button className="confirm-modal__button confirm-modal__button--secondary" type="button" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-modal__button confirm-modal__button--primary" type="button" onClick={onSubmit}>
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  )
}

export type { ConfirmModalMode, ConfirmModalProps }
