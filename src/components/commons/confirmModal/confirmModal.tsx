import { useEffect, type ReactNode } from 'react'
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
  isLoading?: boolean
  loadingText?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  children?: ReactNode
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
  isLoading = false,
  loadingText = 'Procesando...',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, isLoading, onClose])

  if (!isOpen) {
    return null
  }

  function handleOverlayClick() {
    if (closeOnOverlayClick && !isLoading) {
      onClose()
    }
  }

  return (
    <div className="confirm-modal__overlay" role="presentation" onClick={handleOverlayClick}>
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
          {children}
        </div>

        <div className="confirm-modal__actions">
          <button
            className="confirm-modal__button confirm-modal__button--secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className="confirm-modal__button confirm-modal__button--primary"
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </section>
    </div>
  )
}

export type { ConfirmModalMode, ConfirmModalProps }
