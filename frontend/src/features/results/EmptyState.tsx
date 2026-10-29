import { motion } from 'framer-motion'
import { ArrowRight, CalendarSearch, CirclePlus, Headset, Lightbulb, Plus } from 'lucide-react'
import type { Suggestion } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

type Props = {
  levelName?: string
  subjectName?: string
  suggestions: Suggestion[]
  pending: string | null
  onAdd: (s: Suggestion) => void
  onEdit: () => void
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** État vide utile : illustration, suggestion personnalisée, alternatives proches. */
export function EmptyState({ levelName, subjectName, suggestions, pending, onAdd, onEdit }: Props) {
  const [main, ...others] = suggestions
  const keyOf = (s: Suggestion) => `${s.day}-${s.period}`
  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-lg border border-neutral-200/70 bg-white px-4 py-10 text-center shadow-sm sm:px-10 sm:py-16"
        aria-labelledby="empty-title"
      >
        <EmptyIllustration />
        <h1 id="empty-title" className="mt-8 text-h2 text-balance text-neutral-900 sm:text-h1">
          Aucun tuteur disponible sur ces créneaux
        </h1>
        <p className="mx-auto mt-3 max-w-[460px] text-body text-neutral-500">
          Élargissez vos disponibilités pour voir plus de tuteurs qualifiés prêts à accompagner votre enfant.
        </p>

        {main ? (
          <div className="mx-auto mt-8 flex max-w-[720px] flex-col gap-5 rounded-lg bg-primary-50 p-5 text-left sm:flex-row sm:items-center sm:p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600" aria-hidden="true">
              <Lightbulb className="size-5 fill-current" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-bold tracking-wide text-primary-600 uppercase">Suggestion personnalisée</p>
              <p className="mt-1 text-h3 text-neutral-900">
                {main.tutorsCount} tuteur{main.tutorsCount > 1 ? 's sont disponibles' : ' est disponible'} si vous ajoutez le {main.label}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {main.initials.slice(0, 3).map((ini, i) => (
                    <span
                      key={ini + i}
                      className={[
                        'flex size-8 items-center justify-center rounded-full text-caption font-bold text-white ring-2 ring-primary-50',
                        ['bg-primary-700', 'bg-neutral-500', 'bg-primary-500'][i % 3],
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {ini}
                    </span>
                  ))}
                </div>
                <span className="text-small text-neutral-500">
                  + {main.tutorsCount} enseignant{main.tutorsCount > 1 ? 's' : ''} qualifié{main.tutorsCount > 1 ? 's' : ''}
                  {levelName && subjectName ? ` en ${levelName} ${subjectName}` : ''}
                </span>
              </div>
            </div>
            <Button
              onClick={() => onAdd(main)}
              loading={pending === keyOf(main)}
              loadingLabel="Ajout…"
              className="shrink-0 rounded-full"
            >
              <CirclePlus className="size-5" aria-hidden="true" /> Ajouter ce créneau
            </Button>
          </div>
        ) : (
          <div className="mt-8">
            <Button onClick={onEdit}>
              Modifier mes disponibilités <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {others.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-caption font-semibold text-neutral-700">Autres suggestions proches :</span>
            {others.map((s) => (
              <button
                key={keyOf(s)}
                type="button"
                onClick={() => onAdd(s)}
                disabled={pending !== null}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-primary-50 px-3 text-caption font-semibold text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-60"
              >
                {pending === keyOf(s) ? <Spinner className="size-3.5" /> : <Plus className="size-3.5" aria-hidden="true" />}
                {capitalize(s.label)} (+{s.tutorsCount})
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="mt-8 inline-flex items-center gap-2 rounded-sm text-small font-medium text-neutral-700 transition-colors hover:text-primary-600"
        >
          <CalendarSearch className="size-4" aria-hidden="true" /> Ouvrir l'ensemble des créneaux de la semaine
        </button>
      </motion.section>

      <section className="mt-6 flex flex-col gap-4 rounded-lg bg-primary-50 p-5 sm:flex-row sm:items-center sm:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm" aria-hidden="true">
          <Headset className="size-5" />
        </span>
        <div className="flex-1">
          <h2 className="text-h3 text-neutral-900">Besoin d'un créneau sur-mesure ?</h2>
          <p className="text-small text-neutral-500">Notre équipe pédagogique s'occupe de trouver la solution adaptée à l'emploi du temps de votre enfant.</p>
        </div>
        <a
          href="mailto:contact@studena.com?subject=Cr%C3%A9neau%20sur-mesure"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full bg-white px-4 text-label text-primary-600 shadow-sm transition-colors hover:bg-primary-100"
        >
          Contacter un conseiller <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </section>
    </>
  )
}

/** Illustration calendrier + loupe (SVG inline, jetons de couleur). */
function EmptyIllustration() {
  return (
    <motion.svg
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto h-[128px] w-[164px]"
      viewBox="0 0 164 128"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="82" cy="120" rx="58" ry="5" fill="var(--color-primary-50)" />
      <rect x="22" y="14" width="120" height="98" rx="12" fill="var(--color-white)" stroke="var(--color-primary-700)" strokeWidth="3" />
      <path d="M22 26a12 12 0 0 1 12-12h96a12 12 0 0 1 12 12v8H22z" fill="var(--color-primary-700)" />
      {[50, 82, 114].map((x) => (
        <rect key={x} x={x - 3} y="4" width="6" height="18" rx="3" fill="var(--color-primary-700)" />
      ))}
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={46 + c * 24}
            cy={54 + r * 20}
            r="4"
            fill={r === 1 && c === 1 ? 'var(--color-primary-700)' : 'var(--color-primary-200)'}
          />
        )),
      )}
      <circle cx="118" cy="88" r="22" fill="var(--color-primary-50)" stroke="var(--color-primary-700)" strokeWidth="3.5" />
      <path d="M134 104l14 14" stroke="var(--color-primary-700)" strokeWidth="5" strokeLinecap="round" />
      <path d="M118 79v11" stroke="var(--color-primary-700)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="118" cy="96" r="2" fill="var(--color-primary-700)" />
      <path d="M12 54l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="var(--color-star)" />
      <path d="M150 0l1.6 3.9 3.9 1.6-3.9 1.6-1.6 3.9-1.6-3.9-3.9-1.6 3.9-1.6z" fill="var(--color-primary-400)" />
    </motion.svg>
  )
}
