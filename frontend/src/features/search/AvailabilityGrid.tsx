import clsx from 'clsx'
import { Check } from 'lucide-react'
import { Fragment } from 'react'
import type { Availability, Meta } from '../../api/types'
import { slotKey } from '../../lib/search'

type Props = {
  days: Meta['days']
  periods: Meta['periods']
  value: Availability[]
  onToggle: (a: Availability) => void
}

/**
 * Grille 7 jours × Matin/Après-midi/Soir, multi-sélection.
 * Mobile : le libellé du moment passe au-dessus de sa rangée pour que les 7 cases
 * occupent toute la largeur (≈ 44 px, utilisables au doigt).
 */
export function AvailabilityGrid({ days, periods, value, onToggle }: Props) {
  const selected = new Set(value.map(slotKey))
  return (
    <div className="rounded-md border border-neutral-100 bg-white p-2 sm:p-3" role="group" aria-labelledby="q-avail">
      <div className="grid grid-cols-7 gap-x-1.5 gap-y-1.5 sm:grid-cols-[84px_repeat(7,minmax(0,1fr))] sm:gap-x-2 sm:gap-y-2.5">
        <span className="hidden self-end pb-1 text-caption font-medium text-neutral-500 sm:block">Créneau</span>
        {days.map((d) => (
          <span key={d.value} className="pb-1 text-center text-caption font-semibold text-neutral-900 sm:text-small sm:font-medium" aria-hidden="true">
            {d.short}
          </span>
        ))}
        {periods.map((p) => (
          <Fragment key={p.slug}>
            <div className="col-span-7 mt-1 flex items-baseline gap-2 sm:col-span-1 sm:mt-0 sm:flex-col sm:justify-center sm:gap-0">
              <span className="text-small font-semibold text-neutral-900 sm:font-medium">{p.name}</span>
              <span className="text-caption font-medium text-neutral-500">{p.range}</span>
            </div>
            {days.map((d) => {
              const a: Availability = { day: d.value, period: p.slug }
              const on = selected.has(slotKey(a))
              return (
                <button
                  key={slotKey(a)}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${d.name} ${p.name.toLowerCase()} (${p.range})`}
                  onClick={() => onToggle(a)}
                  className={clsx(
                    'flex h-11 items-center justify-center rounded-sm border transition-all duration-150 active:scale-95 sm:h-12',
                    on
                      ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                      : 'border-neutral-100 bg-neutral-50 text-transparent hover:border-primary-300 hover:bg-primary-50',
                  )}
                >
                  <Check className={clsx('size-4 transition-transform duration-150', on ? 'scale-100' : 'scale-0')} strokeWidth={3} aria-hidden="true" />
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
