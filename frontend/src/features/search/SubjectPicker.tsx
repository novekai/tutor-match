import clsx from 'clsx'
import { Check } from 'lucide-react'
import type { Subject } from '../../api/types'
import { SubjectIcon } from '../../components/ui/SubjectIcon'

type Props = { subjects: Subject[]; value: string; onChange: (slug: string) => void }

/** Tuiles matières : icône, nom, sous-titre ; coche en haut à droite si sélectionnée. */
export function SubjectPicker({ subjects, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" role="radiogroup" aria-labelledby="q-subject">
      {subjects.map((s) => {
        const selected = s.slug === value
        return (
          <button
            key={s.slug}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(s.slug)}
            className={clsx(
              'group relative flex min-h-[84px] flex-col items-start gap-2 rounded-md border p-3 text-left transition-all duration-200 sm:flex-row sm:items-center sm:gap-3 sm:p-4',
              selected
                ? 'border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500'
                : 'border-neutral-200 bg-neutral-50 hover:-translate-y-px hover:border-primary-300 hover:bg-white hover:shadow-sm',
            )}
          >
            <span
              className={clsx(
                'flex size-10 shrink-0 items-center justify-center rounded-sm transition-colors',
                selected ? 'bg-primary-500 text-white' : 'border border-neutral-200 bg-white text-neutral-700 group-hover:text-primary-500',
              )}
            >
              <SubjectIcon name={s.icon} className="size-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 pr-5">
              <span className={clsx('block text-body font-semibold', selected ? 'text-primary-600' : 'text-neutral-900')}>{s.name}</span>
              <span className="block text-caption font-medium text-neutral-500">{s.hint}</span>
            </span>
            <span
              className={clsx(
                'absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary-500 text-white transition-all duration-200',
                selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
              )}
              aria-hidden="true"
            >
              <Check className="size-3" strokeWidth={3.5} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
