import clsx from 'clsx'
import { Check } from 'lucide-react'
import type { Level } from '../../api/types'
import { CYCLES } from '../../lib/referentials'

type Props = { levels: Level[]; value: string; onChange: (slug: string) => void }

/** Chips de niveaux groupées par cycle (aucune liste déroulante). */
export function LevelPicker({ levels, value, onChange }: Props) {
  return (
    <div className="space-y-3" role="radiogroup" aria-labelledby="q-level">
      {CYCLES.map(({ cycle, label }) => {
        const items = levels.filter((l) => l.cycle === cycle).sort((a, b) => a.rank - b.rank)
        if (!items.length) return null
        return (
          <div key={cycle} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
            <span className="w-[92px] shrink-0 text-caption font-semibold tracking-wide text-neutral-500 uppercase">
              {items[0].cycleLabel || label}
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((l) => {
                const selected = l.slug === value
                return (
                  <button
                    key={l.slug}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(l.slug)}
                    className={clsx(
                      'inline-flex h-10 min-w-12 items-center justify-center gap-1 rounded-full border px-4 text-label transition-all duration-200',
                      selected
                        ? 'border-primary-500 bg-primary-500 text-white shadow-sm ring-4 ring-primary-100'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-900 hover:border-primary-300 hover:bg-primary-50',
                    )}
                  >
                    {l.name}
                    {selected && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
