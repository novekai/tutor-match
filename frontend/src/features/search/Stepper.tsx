import clsx from 'clsx'
import { Check } from 'lucide-react'

const STEPS = ['Niveau scolaire', 'Matière', 'Disponibilités']
const SHORT = ['Niveau', 'Matière', 'Créneaux']

/** Stepper 3 étapes : la progression suit les champs remplis. */
export function Stepper({ done }: { done: [boolean, boolean, boolean] }) {
  const count = done.filter(Boolean).length
  const current = done.findIndex((d) => !d)
  return (
    <div>
      <ol className="flex items-center justify-between gap-2" aria-label={`Progression : ${count} étape${count > 1 ? 's' : ''} sur 3`}>
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === current ? 'step' : undefined}
            className={clsx(
              'flex items-center gap-1.5 text-caption font-semibold transition-colors sm:gap-2 sm:text-label',
              done[i] || i === current ? 'text-primary-600' : 'text-neutral-400',
            )}
          >
            <span
              className={clsx(
                'flex size-[18px] items-center justify-center rounded-full transition-all duration-300 sm:size-2',
                done[i] ? 'bg-primary-500 text-white sm:bg-primary-500' : i === current ? 'bg-primary-100 sm:bg-primary-500' : 'bg-neutral-200',
              )}
              aria-hidden="true"
            >
              {done[i] && <Check className="size-3 sm:hidden" strokeWidth={3} />}
            </span>
            <span className="sm:hidden">{SHORT[i]}</span>
            <span className="hidden sm:inline">
              {i + 1}. {label}
            </span>
            {done[i] && <span className="sr-only">(complété)</span>}
          </li>
        ))}
      </ol>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary-500 transition-[width] duration-500 ease-out-soft"
          style={{ width: `${Math.max(count / 3, 0.04) * 100}%` }}
        />
      </div>
    </div>
  )
}
