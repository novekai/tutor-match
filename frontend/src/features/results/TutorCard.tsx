import clsx from 'clsx'
import { motion } from 'framer-motion'
import { BadgeCheck, CalendarCheck, CalendarDays, CheckCheck, Clock, Star } from 'lucide-react'
import type { Slot, TutorMatch } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { ScoreRing } from '../../components/ui/ScoreRing'
import { Skeleton } from '../../components/ui/Skeleton'
import { TutorPhoto } from '../../components/ui/TutorPhoto'
import { formatRating } from '../../lib/format'

type Props = {
  tutor: TutorMatch
  index: number
  onOpen: (slot?: Slot) => void
  onBook: () => void
}

const Dot = () => <span className="size-1 shrink-0 rounded-full bg-neutral-300" aria-hidden="true" />

/** Carte tuteur des résultats (survol : shadow-md + translateY(-2px)). */
export function TutorCard({ tutor: t, index, onOpen, onBook }: Props) {
  const headingId = `tutor-${t.id}-name`
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby={headingId}
      className={clsx(
        'group relative rounded-lg border bg-white p-4 shadow-sm transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6',
        t.isBestMatch ? 'border-primary-200' : 'border-neutral-200/70',
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-1 gap-4 sm:gap-6">
          <TutorPhoto src={t.photoUrl} name={t.displayName} size={80} className="hidden sm:block" />
          <div className="min-w-0 flex-1">
            {t.isBestMatch && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-caption font-semibold text-primary-700">
                <Star className="size-3 fill-current" aria-hidden="true" /> Meilleur choix pour votre profil
              </span>
            )}
            <div className="flex items-center gap-3">
              <TutorPhoto src={t.photoUrl} name={t.displayName} size={56} className="sm:hidden" />
              <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2.5">
                <h3 id={headingId} className="text-h3 font-bold text-neutral-900 sm:text-h2 sm:font-semibold">
                  {t.displayName}
                </h3>
                <span className="inline-flex items-center gap-1 text-caption font-semibold text-success">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  {t.credential}
                </span>
              </div>
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-neutral-500">
              <span className="inline-flex items-center gap-1 font-semibold text-star">
                <Star className="size-3.5 fill-current" aria-hidden="true" />
                {formatRating(t.rating)}
              </span>
              <span className="text-neutral-700">({t.reviewsCount} avis)</span>
              <Dot />
              <span>{t.yearsExperience} ans d'expérience</span>
              <Dot />
              <span>{t.lessonsCount} cours dispensés</span>
              <Dot />
              <span className="tabular">{t.hourlyRate} €/h</span>
            </p>

            <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Matières et niveaux">
              {t.subjects.map((s) => (
                <li
                  key={s.slug}
                  className={clsx(
                    'rounded-full px-2.5 py-0.5 text-caption font-semibold',
                    s.isMajor ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100 text-neutral-700',
                  )}
                >
                  {s.name}
                </li>
              ))}
              <li className="text-caption font-semibold text-neutral-700">{t.levelsLabel.replace(' · ', ' • ')}</li>
            </ul>

            <p className="mt-3 line-clamp-3 text-body text-neutral-700 sm:line-clamp-2 sm:text-body-l">{t.headline}</p>

            {t.compatibleSlots.length > 0 && (
              <div className="mt-4 rounded-md bg-neutral-50 p-3 sm:p-4">
                <p className="flex items-center gap-1.5 text-caption font-semibold text-neutral-700">
                  <CalendarCheck className="size-3.5 text-primary-600" aria-hidden="true" />
                  {t.isBestMatch ? 'Créneaux compatibles avec vos disponibilités :' : 'Créneaux compatibles :'}
                </p>
                <ul className="mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {t.compatibleSlots.slice(0, 3).map((s) => (
                    <li key={s.startsAt}>
                      <button
                        type="button"
                        onClick={() => onOpen(s)}
                        aria-label={`Réserver le ${s.label} avec ${t.firstName}`}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-sm border px-2 sm:w-auto sm:px-3 border-neutral-200 bg-white text-caption font-semibold whitespace-nowrap text-primary-600 shadow-sm transition-all hover:-translate-y-px hover:border-primary-300 hover:bg-primary-50"
                      >
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {s.label.replace(' · ', ' • ')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Colonne compatibilité + actions */}
        <div className="flex flex-col gap-4 border-t border-neutral-100 pt-4 lg:w-[216px] lg:shrink-0 lg:items-stretch lg:border-t-0 lg:pt-0">
          <div className="flex items-center gap-4 lg:flex-col lg:gap-2 lg:text-center">
            <ScoreRing score={t.score} size={76} />
            <div className="min-w-0">
              <p className="text-small font-semibold text-neutral-900">Compatibilité</p>
              <MatchReasons tutor={t} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button block onClick={onBook}>
              Réserver ce tuteur
            </Button>
            <button
              type="button"
              onClick={() => onOpen()}
              className="h-10 rounded-md text-caption font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-primary-600"
            >
              Voir le profil complet
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function MatchReasons({ tutor: t }: { tutor: TutorMatch }) {
  const reasons = t.matchReasons.length
    ? t.matchReasons
    : [`${t.compatibleSlotsCount} créneau${t.compatibleSlotsCount > 1 ? 'x' : ''} en commun`]
  const Icon = t.isBestMatch ? CheckCheck : Clock
  return (
    <p
      className={clsx(
        'mt-0.5 flex items-start gap-1 text-caption font-medium lg:justify-center',
        t.isBestMatch ? 'text-success' : 'text-neutral-500',
      )}
    >
      <Icon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>{reasons.join(' • ')}</span>
    </p>
  )
}

export function TutorCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200/70 bg-white p-4 shadow-sm sm:p-6" aria-hidden="true">
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
        <div className="flex flex-1 gap-4 sm:gap-6">
          <Skeleton className="size-14 shrink-0 rounded-full sm:size-20" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 lg:w-[216px]">
          <Skeleton className="size-[76px] rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
