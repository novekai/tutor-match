import clsx from 'clsx'
import { Clock, GraduationCap, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Availability } from '../../api/types'
import { SubjectIcon } from '../../components/ui/SubjectIcon'
import { availabilityLabel } from '../../lib/referentials'
import { slotKey } from '../../lib/search'

type Props = {
  levelName?: string
  subject?: { name: string; icon: string }
  availability: Availability[]
  editHref: string
  onRemoveLevel: () => void
  onRemoveSubject: () => void
  onRemoveSlot: (a: Availability) => void
}

/** Barre « Filtres actifs » : chips supprimables + « Modifier la recherche ». */
export function FiltersBar({ levelName, subject, availability, editHref, onRemoveLevel, onRemoveSubject, onRemoveSlot }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200/70 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:px-4">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <span className="mt-1.5 flex shrink-0 items-center gap-1.5 text-caption font-semibold text-neutral-700">
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Filtres actifs :</span>
        </span>
        <ul className="scrollbar-none -mr-3 flex min-w-0 gap-1.5 overflow-x-auto pr-3 sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0" aria-label="Filtres actifs">
          {levelName && (
            <FilterChip strong onRemove={onRemoveLevel} removeLabel={`Retirer le filtre classe ${levelName}`}>
              <GraduationCap className="size-3.5" aria-hidden="true" />
              Classe : {levelName}
            </FilterChip>
          )}
          {subject && (
            <FilterChip strong onRemove={onRemoveSubject} removeLabel={`Retirer le filtre ${subject.name}`}>
              <SubjectIcon name={subject.icon} className="size-3.5" />
              {subject.name}
            </FilterChip>
          )}
          {availability.map((a) => {
            const label = availabilityLabel(a.day, a.period)
            return (
              <FilterChip key={slotKey(a)} onRemove={() => onRemoveSlot(a)} removeLabel={`Retirer le créneau ${label}`}>
                <Clock className="size-3.5" aria-hidden="true" />
                {label}
              </FilterChip>
            )
          })}
        </ul>
      </div>
      <Link
        to={editHref}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-label text-primary-600 transition-colors hover:bg-primary-50"
      >
        <RefreshCw className="size-4" aria-hidden="true" /> Modifier la recherche
      </Link>
    </div>
  )
}

function FilterChip({
  children,
  onRemove,
  removeLabel,
  strong,
}: {
  children: ReactNode
  onRemove: () => void
  removeLabel: string
  strong?: boolean
}) {
  return (
    <li
      className={clsx(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full pr-1 pl-3 text-caption font-semibold whitespace-nowrap',
        strong ? 'bg-primary-100 text-primary-800' : 'bg-primary-50 text-primary-700',
      )}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="flex size-6 items-center justify-center rounded-full text-current opacity-70 transition hover:bg-white hover:opacity-100"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </li>
  )
}
