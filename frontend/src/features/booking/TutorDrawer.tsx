import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, Lock, Star, Video, X } from 'lucide-react'
import { useState } from 'react'
import { useTutor, useTutorSlots } from '../../api/hooks'
import type { Slot, TutorDetail, TutorSummary } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { SubjectIcon } from '../../components/ui/SubjectIcon'
import { iconForSubjectSlug } from '../../lib/subjects'
import { TutorPhoto } from '../../components/ui/TutorPhoto'
import { addMinutes, formatDuration, formatRating, formatSlotLong } from '../../lib/format'
import { mondayOf, type SearchCriteria } from '../../lib/search'

type Props = {
  tutorId: number
  /** Données déjà connues (carte des résultats) : affichées immédiatement, sans squelette. */
  summary?: TutorSummary
  criteria: SearchCriteria
  selected: string | null
  onSelect: (slot: Slot) => void
  onBook: (tutor: TutorSummary, startsAt: string, endsAt: string) => void
  onClose: () => void
}

/** Contenu du drawer « Profil du tuteur & réservation ». */
export function TutorDrawer({ tutorId, summary, criteria, selected, onSelect, onBook, onClose }: Props) {
  const tutorQ = useTutor(tutorId, { level: criteria.level, subject: criteria.subject, availability: criteria.availability })
  const tutor: (TutorSummary & Partial<TutorDetail>) | undefined = tutorQ.data ?? summary
  const [week, setWeek] = useState<string | undefined>(selected ? mondayOf(selected) : undefined)
  const slotsQ = useTutorSlots(tutorId, week, criteria.availability)

  const duration = tutor?.lessonMinutes ?? 90
  const allSlots = slotsQ.data?.days.flatMap((d) => d.slots) ?? []
  const selectedSlot = allSlots.find((s) => s.startsAt === selected)
  const selectedEnd = selectedSlot?.endsAt ?? (selected ? addMinutes(selected, duration) : null)

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-6 sm:pt-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-caption font-semibold text-primary-800">
          <span className="size-1.5 rounded-full bg-primary-500" aria-hidden="true" /> Profil du tuteur &amp; réservation
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le profil"
          className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6" data-autofocus tabIndex={-1}>
        {!tutor && tutorQ.isError ? (
          <div className="pt-8">
            <ErrorState message={(tutorQ.error as Error).message} onRetry={() => tutorQ.refetch()} />
          </div>
        ) : !tutor ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* En-tête profil */}
            <div className="mt-3 flex items-center gap-4">
              <TutorPhoto src={tutor.photoUrl} name={tutor.displayName} size={88} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="drawer-title" className="text-h2 font-semibold text-neutral-900">
                    {tutor.displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-caption font-semibold text-success">
                    <BadgeCheck className="size-3.5" aria-hidden="true" /> Profil vérifié
                  </span>
                </div>
                <p className="mt-0.5 text-small text-neutral-500">
                  {tutor.credential} · {tutor.school}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-caption font-medium text-neutral-500">
                  <Star className="size-3.5 fill-star text-star" aria-hidden="true" />
                  <strong className="font-bold text-neutral-900">{formatRating(tutor.rating)}</strong>
                  <span aria-hidden="true">·</span> {tutor.reviewsCount} avis vérifiés <span aria-hidden="true">·</span>
                  <span className="text-primary-600">Taux de réponse {tutor.responseRate}%</span>
                </p>
              </div>
            </div>

            {/* Statistiques */}
            <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <Stat value={`${tutor.yearsExperience} ans`} label="d'expérience" accent />
              <Stat value={`${tutor.lessonsCount} cours`} label="dispensés" accent />
              <Stat value={tutor.levelsLabel} label="Niveaux enseignés" />
            </dl>

            {/* À propos */}
            <section className="mt-6 border-t border-neutral-100 pt-5">
              <h3 className="text-h3 text-neutral-900">À propos de {tutor.firstName}</h3>
              {tutor.bio ? (
                <p className="mt-2 text-small leading-6 text-neutral-700">{tutor.bio}</p>
              ) : tutorQ.isPending ? (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="mt-2 text-small leading-6 text-neutral-700">{tutor.headline}</p>
              )}
              {tutor.tags && tutor.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tutor.tags.map((t) => (
                    <li key={t.label} className="rounded-full bg-primary-50 px-2.5 py-1 text-caption font-semibold text-neutral-900">
                      <span aria-hidden="true">{t.emoji}</span> {t.label}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Matières */}
            <section className="mt-6">
              <h3 className="text-h3 text-neutral-900">Matières enseignées</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tutor.subjects.map((s) => (
                  <li
                    key={s.slug}
                    className={clsx(
                      'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-small',
                      s.isMajor ? 'bg-primary-100 font-semibold text-primary-700' : 'bg-neutral-100 text-neutral-700',
                    )}
                  >
                    <SubjectIcon name={iconForSubjectSlug(s.slug)} className="size-4" />
                    {s.name}
                    {s.isMajor && ' (Majeure)'}
                  </li>
                ))}
              </ul>
            </section>

            {/* Choix du créneau */}
            <section className="mt-8" aria-labelledby="slots-title">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 id="slots-title" className="text-h3 text-neutral-900">
                    Choisissez un créneau
                  </h3>
                  <span className="rounded-sm bg-primary-100 px-2 py-1 text-caption font-semibold tracking-wide text-primary-700 uppercase">
                    Étape clé
                  </span>
                </div>
                <span className="text-caption font-semibold text-neutral-700">Durée : {formatDuration(duration)}</span>
              </div>

              <div className="mt-4 flex gap-3 rounded-md bg-primary-50 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600" aria-hidden="true">
                  <Video className="size-5" />
                </span>
                <div>
                  <p className="text-small font-semibold text-neutral-900">Visioconférence individuelle en direct</p>
                  <p className="text-small text-neutral-700">Salle de cours interactive Studena avec tableau partagé et exercices guidés</p>
                </div>
              </div>

              {/* Navigation semaine */}
              <div className="mt-5 flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <WeekButton
                  dir="prev"
                  disabled={!slotsQ.data?.previousWeek || slotsQ.isFetching}
                  onClick={() => setWeek(slotsQ.data?.previousWeek ?? undefined)}
                />
                <p className="flex items-center gap-2 text-small font-semibold text-neutral-900" aria-live="polite">
                  <CalendarDays className="size-4 text-primary-600" aria-hidden="true" />
                  {slotsQ.data?.label ?? 'Chargement de la semaine…'}
                </p>
                <WeekButton
                  dir="next"
                  disabled={!slotsQ.data?.nextWeek || slotsQ.isFetching}
                  onClick={() => setWeek(slotsQ.data?.nextWeek ?? undefined)}
                />
              </div>

              {criteria.availability.length > 0 && (
                <p className="mt-3 flex items-start gap-2 text-small text-neutral-500">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary-500 ring-4 ring-primary-100" aria-hidden="true" />
                  Les créneaux marqués d'un point bleu correspondent à vos disponibilités renseignées.
                </p>
              )}

              <div className={clsx('mt-4 space-y-5 transition-opacity', slotsQ.isPlaceholderData && 'opacity-60')}>
                {slotsQ.isError ? (
                  <ErrorState message={(slotsQ.error as Error).message} onRetry={() => slotsQ.refetch()} />
                ) : !slotsQ.data ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <Skeleton className="h-12 rounded-md" />
                        <Skeleton className="h-12 rounded-md" />
                        <Skeleton className="h-12 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : allSlots.length === 0 ? (
                  <p className="rounded-md bg-neutral-50 px-4 py-6 text-center text-small text-neutral-500">
                    Aucun créneau libre cette semaine.{' '}
                    {slotsQ.data.nextWeek && (
                      <button type="button" className="font-semibold text-primary-600 underline-offset-2 hover:underline" onClick={() => setWeek(slotsQ.data?.nextWeek ?? undefined)}>
                        Voir la semaine suivante
                      </button>
                    )}
                  </p>
                ) : (
                  slotsQ.data.days
                    .filter((d) => d.slots.length > 0)
                    .map((d) => (
                      <div key={d.date} role="group" aria-label={d.label}>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-small font-semibold text-neutral-900">{d.label}</p>
                          <p className="text-caption font-medium text-neutral-500">
                            {d.slots.length} créneau{d.slots.length > 1 ? 'x' : ''}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {d.slots.map((s) => {
                            const isSel = s.startsAt === selected
                            return (
                              <button
                                key={s.startsAt}
                                type="button"
                                aria-pressed={isSel}
                                aria-label={`${d.label}, ${s.timeLabel}${s.matchesAvailability ? ', correspond à vos disponibilités' : ''}`}
                                onClick={() => onSelect(s)}
                                className={clsx(
                                  'relative flex h-12 items-center justify-center gap-1.5 rounded-md border text-small font-semibold transition-all duration-150 active:scale-[0.98]',
                                  isSel
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                                    : s.matchesAvailability
                                      ? 'border-primary-200 bg-primary-50 text-primary-700 hover:border-primary-400'
                                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50',
                                )}
                              >
                                {s.matchesAvailability && (
                                  <span className={clsx('size-2 rounded-full', isSel ? 'bg-white' : 'bg-primary-500')} aria-hidden="true" />
                                )}
                                <span className="tabular">{s.timeLabel}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Pied collant */}
      <div className="border-t border-neutral-100 bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(15_23_42/6%)] sm:px-6 sm:pt-4 sm:pb-4">
        <AnimatePresence initial={false} mode="wait">
          {selected && selectedEnd ? (
            <motion.p
              key={selected}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-neutral-700"
              aria-live="polite"
            >
              <CalendarCheck className="size-4 text-primary-600" aria-hidden="true" />
              Créneau sélectionné :
              <strong className="font-bold text-neutral-900">{formatSlotLong(selected, selectedEnd)}</strong>
              <span className="ml-auto rounded-full bg-success-bg px-2 py-0.5 text-caption font-semibold text-success">Disponible</span>
            </motion.p>
          ) : (
            <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 text-small text-neutral-500">
              Sélectionnez un créneau ci-dessus pour continuer.
            </motion.p>
          )}
        </AnimatePresence>
        <Button
          size="lg"
          block
          className="rounded-full"
          disabled={!selected || !tutor}
          onClick={() => tutor && selected && selectedEnd && onBook(tutor, selected, selectedEnd)}
        >
          {tutor ? `Réserver ce créneau avec ${tutor.firstName}` : 'Réserver ce créneau'}
          <ArrowRight className="size-5" aria-hidden="true" />
        </Button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-caption font-medium text-neutral-500">
          <Lock className="size-3.5 shrink-0" aria-hidden="true" />
          Réservation immédiate sans paiement requis maintenant · Annulation gratuite jusqu'à 24h avant
        </p>
      </div>
    </>
  )
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-primary-50 px-2 py-3 text-center">
      <dt className="sr-only">{label}</dt>
      <dd className={clsx('text-body font-bold sm:text-h3', accent ? 'text-primary-600' : 'text-neutral-900')}>{value}</dd>
      <dd className="text-caption font-medium text-neutral-700" aria-hidden="true">
        {label}
      </dd>
    </div>
  )
}

function WeekButton({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Semaine précédente' : 'Semaine suivante'}
      className="flex size-9 items-center justify-center rounded-sm border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}

function ProfileSkeleton() {
  return (
    <div className="mt-3 space-y-5" aria-hidden="true">
      <div className="flex items-center gap-4">
        <Skeleton className="size-[88px] rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="h-16 rounded-md" />
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
