"use client"

import type React from "react"
import { useState, useEffect, useRef, useId, memo, useCallback } from "react"
import "./modal.css"

interface ModalProps {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode | (() => React.ReactNode)
  buttonClassName?: string
  buttonText?: string
  onclick?: () => void
  maxWidth?: string
  cancel?: boolean
  onCancel?: () => void
  cancelText?: string
  lazy?: boolean
  preventClose?: boolean
  onValidateClose?: () => boolean
  type?: "btn"
}

const Modal = memo(function Modal({
  title,
  icon,
  children,
  buttonClassName,
  buttonText = "Guardar",
  onclick,
  maxWidth = "500px",
  cancel = false,
  onCancel,
  cancelText = "Cancelar",
  lazy = true,
  preventClose = false,
  onValidateClose,
  type
}: ModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // [Bug 2] hasBeenOpened inicializa en !lazy:
  // lazy=true  → false (default, no pre-monta hijos)
  // lazy=false → true  (pre-monta hijos desde el primer render)
  const [hasBeenOpened, setHasBeenOpened] = useState(!lazy)

  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // [Bug 2] Ref separada para saber si el usuario abrió el modal al menos una vez.
  // Distinto de hasBeenOpened, que puede iniciar en true cuando lazy=false,
  // lo que causaría un focus indeseado sobre el trigger al montar el componente.
  const hasBeenOpenedByUser = useRef(false)

  const titleId = useId()

  const openModal = useCallback(() => {
    setIsOpen(true)
    setIsClosing(false)
    setHasBeenOpened(true)
    hasBeenOpenedByUser.current = true
  }, [])

  const closeModal = useCallback(() => {
    setIsClosing(true)
  }, [])

  const requestClose = useCallback(() => {
    if (preventClose) return
    closeModal()
  }, [preventClose, closeModal])

  const canCloseOnSave = useCallback(() => {
    if (onValidateClose) return onValidateClose()
    return true
  }, [onValidateClose])

  const handleSave = useCallback(() => {
    if (onclick) onclick()
    if (canCloseOnSave()) closeModal()
  }, [onclick, canCloseOnSave, closeModal])

  const handleCancel = useCallback(() => {
    if (onCancel) onCancel()
    closeModal()
  }, [onCancel, closeModal])

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  // [Bug 1] Antes: si la animación no disparaba (prefers-reduced-motion, CSS no cargado,
  // tab en segundo plano) el modal quedaba atascado con isClosing=true para siempre.
  // Fix: detectar prefers-reduced-motion y cerrar de inmediato; además escuchar
  // animationcancel como fallback para cuando la animación se interrumpe.
  useEffect(() => {
    if (!isClosing) return
    const content = contentRef.current

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsOpen(false)
      setIsClosing(false)
      return
    }

    const handleAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === "contentHide") {
        setIsOpen(false)
        setIsClosing(false)
      }
    }

    content?.addEventListener("animationend", handleAnimationEnd as any)
    content?.addEventListener("animationcancel", handleAnimationEnd as any) // fallback
    return () => {
      content?.removeEventListener("animationend", handleAnimationEnd as any)
      content?.removeEventListener("animationcancel", handleAnimationEnd as any)
    }
  }, [isClosing])

  // [Bug 3] Antes: "unset" escribe el keyword CSS como inline style en lugar de
  // eliminar la propiedad, pisando cualquier otra regla que controle body.overflow.
  // Fix: "" (cadena vacía) elimina la propiedad del inline style correctamente.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isClosing) return

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose()
    }

    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen, isClosing, requestClose])

  useEffect(() => {
    if (!isOpen || isClosing) return
    const content = contentRef.current
    if (!content) return

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      const focusables = content.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [isOpen, isClosing])

  useEffect(() => {
    if (isOpen && !isClosing) {
      contentRef.current?.focus()
    }
  }, [isOpen, isClosing])

  // [Bug 2] Usar hasBeenOpenedByUser (ref) en lugar de hasBeenOpened (state)
  // para evitar el focus indeseado al montar cuando lazy=false inicializa
  // hasBeenOpened=true antes de que el usuario haya abierto el modal.
  useEffect(() => {
    if (!isOpen && hasBeenOpenedByUser.current) {
      triggerRef.current?.focus()
    }
  }, [isOpen])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) requestClose()
    },
    [requestClose]
  )

  const isIconOnly = type === "btn"

  const renderButtonContent = useCallback(() => {
    if (isIconOnly) {
      return <span className="modal-trigger-icon">{icon}</span>
    }
    return (
      <>
        {icon && <span className="modal-trigger-icon">{icon}</span>}
        <span>{title}</span>
      </>
    )
  }, [isIconOnly, icon, title])

  // [Bug 2] renderModalContent simplificado: la lógica de lazy ahora se controla
  // a nivel del overlay (shouldRenderOverlay), no aquí. Solo se guarda con
  // hasBeenOpened para no renderizar nada antes de la primera apertura.
  const renderModalContent = useCallback(() => {
    if (!hasBeenOpened) return null
    return typeof children === "function" ? children() : children
  }, [hasBeenOpened, children])

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      className={`modal-trigger ${isIconOnly ? "modal-trigger-icon-only" : ""} ${buttonClassName || ""}`}
      onClick={openModal}
      title={isIconOnly ? (title || "Abrir modal") : undefined}
    >
      {renderButtonContent()}
    </button>
  )

  // [Bug 2] lazy=true  (default): el overlay solo existe en el DOM cuando isOpen=true.
  //          Los hijos se montan/desmontan en cada apertura (comportamiento original).
  // lazy=false: el overlay siempre está en el DOM (oculto con display:none cuando cerrado).
  //          Los hijos permanecen montados entre aperturas, conservando su estado interno.
  const shouldRenderOverlay = isOpen || !lazy

  if (!shouldRenderOverlay) {
    return triggerButton
  }

  return (
    <>
      {triggerButton}

      <div
        className={`modal-overlay ${isClosing ? "modal-overlay-closing" : ""}`}
        style={!isOpen ? { display: "none" } : undefined}
        onClick={isOpen ? handleOverlayClick : undefined}
        aria-hidden={!isOpen}
      >
        <div
          ref={contentRef}
          className={`modal-content ${isClosing ? "modal-content-closing" : ""}`}
          style={{ maxWidth }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className="modal-header">
            <h2 className="modal-title" id={titleId}>
              {icon && <span className="modal-title-icon">{icon}</span>}
              {title || "Modal"}
            </h2>
            <button type="button" className="modal-close" onClick={handleClose} aria-label="Cerrar modal">
              ×
            </button>
          </div>
          <div className="modal-body">{renderModalContent()}</div>
          <div className="modal-footer">
            <div className={`modal-footer-buttons ${cancel ? "modal-footer-buttons-with-cancel" : ""}`}>
              {cancel && (
                <button type="button" className="modal-cancel-button" onClick={handleCancel}>
                  {cancelText}
                </button>
              )}
              <button type="button" className="modal-save-button" onClick={handleSave}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

export default Modal