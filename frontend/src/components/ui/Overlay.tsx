import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

let lockCount = 0
function lockScroll() {
  lockCount += 1
  if (lockCount === 1) {
    const sw = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (sw > 0) document.body.style.paddingRight = `${sw}px`
  }
}
function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

type Props = {
  open: boolean
  onClose: () => void
  /** drawer : panneau à droite (plein écran en mobile) · modal : centrée (plein écran en mobile) */
  kind: 'drawer' | 'modal'
  labelledBy: string
  children: ReactNode
  className?: string
}

/** Calque modal accessible : portail, fond assombri, Échap, piège à focus, verrouillage du défilement. */
export function Overlay({ open, onClose, kind, labelledBy, children, className }: Props) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <OverlayInner key="overlay" onClose={onClose} kind={kind} labelledBy={labelledBy} className={className}>
          {children}
        </OverlayInner>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function OverlayInner({ onClose, kind, labelledBy, children, className }: Omit<Props, 'open'>) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    lockScroll()
    const t = window.setTimeout(() => {
      const panel = panelRef.current
      if (!panel) return
      const target = panel.querySelector<HTMLElement>('[data-autofocus]') ?? panel
      target.focus({ preventScroll: true })
    }, 30)

    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current
      if (!panel) return
      // Seul le calque le plus haut réagit (drawer + modale empilés).
      const layers = document.querySelectorAll('[data-overlay-panel]')
      if (layers[layers.length - 1] !== panel) return
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [])

  const isDrawer = kind === 'drawer'
  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 flex',
          isDrawer ? 'justify-end' : 'items-stretch justify-center sm:items-center sm:p-6',
        )}
      >
        <motion.div
          ref={panelRef}
          data-overlay-panel
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={clsx(
            'pointer-events-auto relative flex flex-col bg-white shadow-lg outline-none',
            isDrawer
              ? 'h-full w-full sm:max-w-[560px] sm:rounded-l-xl'
              : 'h-full w-full sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:max-w-[520px] sm:rounded-xl',
            className,
          )}
          initial={isDrawer ? { x: '100%' } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={isDrawer ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
          exit={isDrawer ? { x: '100%' } : { opacity: 0, y: 16, scale: 0.98 }}
          transition={isDrawer ? { type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
