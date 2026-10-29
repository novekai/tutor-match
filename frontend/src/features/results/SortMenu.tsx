import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type SortKey = 'pertinence' | 'note' | 'prix'
const SORT_LABELS: Record<SortKey, string> = { pertinence: 'Pertinence', note: 'Note', prix: 'Prix' }

/** Menu « Trier par » (bouton + liste d'options accessible au clavier). */
export function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const keys = Object.keys(SORT_LABELS) as SortKey[]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3.5 text-small text-neutral-500 shadow-sm transition-colors hover:border-neutral-300"
      >
        Trier par : <span className="font-semibold text-primary-600">{SORT_LABELS[value]}</span>
        <ChevronDown className={clsx('size-4 text-primary-600 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Trier les tuteurs"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
          >
            {keys.map((k) => (
              <li key={k} role="option" aria-selected={k === value}>
                <button
                  type="button"
                  autoFocus={k === value}
                  onClick={() => {
                    onChange(k)
                    setOpen(false)
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-small transition-colors hover:bg-primary-50',
                    k === value ? 'font-semibold text-primary-600' : 'text-neutral-700',
                  )}
                >
                  {SORT_LABELS[k]}
                  {k === value && <Check className="size-4" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
