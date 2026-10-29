import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  ChevronDown,
  CircleCheck,
  MessageSquareQuote,
  Repeat,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
} from 'lucide-react'
import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMatch, useMeta } from '../api/hooks'
import type { Availability } from '../api/types'
import { Button } from '../components/ui/Button'
import { TutorPhoto } from '../components/ui/TutorPhoto'
import { AvailabilityGrid } from '../features/search/AvailabilityGrid'
import { LevelPicker } from '../features/search/LevelPicker'
import { Stepper } from '../features/search/Stepper'
import { SubjectPicker } from '../features/search/SubjectPicker'
import { FALLBACK_META } from '../lib/referentials'
import { criteriaFromParams, criteriaToParams, isComplete, slotKey, type SearchCriteria } from '../lib/search'
import { useDebounced } from '../lib/useDebounced'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const meta = useMeta().data ?? FALLBACK_META
  const criteria = useMemo(() => criteriaFromParams(params), [params])
  const [objectiveOpen, setObjectiveOpen] = useState(Boolean(criteria.objective))
  const objectiveId = useId()

  // L'état du formulaire vit dans l'URL (retour arrière / « Modifier la recherche » conservent la saisie).
  const update = (patch: Partial<SearchCriteria>) =>
    setParams(criteriaToParams({ ...criteria, ...patch }), { replace: true, preventScrollReset: true })

  const toggleSlot = (a: Availability) => {
    const k = slotKey(a)
    const exists = criteria.availability.some((x) => slotKey(x) === k)
    update({ availability: exists ? criteria.availability.filter((x) => slotKey(x) !== k) : [...criteria.availability, a] })
  }

  const complete = isComplete(criteria)
  // Aperçu en direct du nombre de tuteurs (le résultat est mis en cache pour la page suivante).
  const debounced = useDebounced(criteria, 350)
  const preview = useMatch({ ...debounced, objective: '' }, { keepPrevious: true })
  const previewTotal = complete && isComplete(debounced) ? preview.data?.total : undefined
  const n = previewTotal ?? (meta.tutorsCount || undefined)

  const level = meta.levels.find((l) => l.slug === criteria.level)
  const subject = meta.subjects.find((s) => s.slug === criteria.subject)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!complete) return
    navigate(`/tuteurs?${criteriaToParams(criteria).toString()}`)
  }

  const missing = [!criteria.level && 'la classe', !criteria.subject && 'la matière', !criteria.availability.length && 'au moins un créneau'].filter(
    Boolean,
  ) as string[]

  const ctaLabel = complete && previewTotal === 0 ? 'Voir les créneaux proches disponibles' : n ? `Voir les ${n} tuteurs disponibles` : 'Voir les tuteurs disponibles'

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary-50),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[900px] px-4 pt-10 pb-16 sm:px-6 sm:pt-12 lg:pb-20">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-caption font-medium text-neutral-700 shadow-sm">
            <Sparkles className="size-3.5 text-star" aria-hidden="true" /> Le soutien scolaire d'excellence, sans engagement
          </span>
          <h1 className="mx-auto mt-5 max-w-[820px] text-h1 text-balance text-neutral-900 sm:text-display">Trouvez le tuteur idéal pour votre enfant</h1>
          <p className="mx-auto mt-4 max-w-[580px] text-body text-neutral-500 sm:text-body-l">
            Répondez à 3 questions, nous vous proposons les tuteurs disponibles. Réservation immédiate.
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-caption font-medium text-neutral-700">
            <li className="flex items-center gap-1.5">
              <Star className="size-3.5 fill-primary-700 text-primary-700" aria-hidden="true" />
              <strong className="font-bold text-neutral-900">4.9/5</strong> par 1 200+ familles
            </li>
            <li className="hidden size-1 rounded-full bg-neutral-300 sm:block" aria-hidden="true" />
            <li className="flex items-center gap-1.5">
              <Award className="size-3.5 text-primary-600" aria-hidden="true" /> Enseignants certifiés &amp; Grandes Écoles
            </li>
            <li className="hidden size-1 rounded-full bg-neutral-300 sm:block" aria-hidden="true" />
            <li className="flex basis-full items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary-600" aria-hidden="true" /> Garantie premier cours offert si non conquis
            </li>
          </ul>
        </motion.section>

        {/* Carte formulaire */}
        <motion.form
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-lg border border-neutral-200/70 bg-white p-4 shadow-md sm:mt-10 sm:p-8 sm:px-10"
          aria-label="Votre besoin"
        >
          <Stepper done={[Boolean(criteria.level), Boolean(criteria.subject), criteria.availability.length > 0]} />

          <Question n={1} id="q-level" title="En quelle classe est votre enfant ?">
            <LevelPicker levels={meta.levels} value={criteria.level} onChange={(slug) => update({ level: slug })} />
          </Question>

          <Question
            n={2}
            id="q-subject"
            title="Quelle matière ?"
            aside={level ? `Matières adaptées au programme de ${level.name}` : 'Choisissez une matière'}
          >
            <SubjectPicker subjects={meta.subjects} value={criteria.subject} onChange={(slug) => update({ subject: slug })} />
          </Question>

          <Question n={3} id="q-avail" title="Quand est-il disponible ?" aside="Sélectionnez un ou plusieurs créneaux réguliers">
            <AvailabilityGrid days={meta.days} periods={meta.periods} value={criteria.availability} onToggle={toggleSlot} />
          </Question>

          {/* Objectif facultatif */}
          <div className="mt-8 rounded-md bg-neutral-50 sm:ml-[42px]">
            <button
              type="button"
              aria-expanded={objectiveOpen}
              aria-controls={objectiveId}
              onClick={() => setObjectiveOpen((o) => !o)}
              className="flex w-full items-center gap-2 rounded-md px-4 py-3.5 text-left text-label text-primary-600 transition-colors hover:bg-primary-50"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              <span className="flex-1">Ajouter une précision d'objectif (facultatif)</span>
              <ChevronDown className={clsx('size-4 transition-transform duration-200', objectiveOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {objectiveOpen && (
                <motion.div
                  id={objectiveId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <label htmlFor="objective" className="sr-only">
                      Objectif de l'accompagnement
                    </label>
                    <textarea
                      id="objective"
                      rows={3}
                      maxLength={500}
                      value={criteria.objective}
                      onChange={(e) => update({ objective: e.target.value })}
                      placeholder="ex. Reprendre confiance avant le brevet, consolider le théorème de Pythagore…"
                      className="block w-full resize-none rounded-md border border-neutral-200 bg-white px-4 py-3 text-body text-neutral-900 shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
                    />
                    <p className="mt-1.5 text-right text-caption font-medium text-neutral-400">{criteria.objective.length}/500</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="mt-8 sm:ml-[42px]">
            <Button type="submit" size="lg" block disabled={!complete} aria-describedby="cta-help" className="text-body-l">
              {ctaLabel}
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
            <p id="cta-help" className={clsx('mt-2 text-center text-caption font-medium text-neutral-500', complete && 'sr-only')} aria-live="polite">
              {complete ? `${n ?? 'Plusieurs'} tuteurs correspondent à votre demande.` : `Indiquez ${missing.join(', ')} pour continuer.`}
            </p>
            <ul className="mt-4 flex flex-col items-start gap-2 text-caption font-medium text-neutral-700 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6">
              {['Tuteurs vérifiés (diplômes & casier)', 'Sans engagement de durée', 'Confirmation sous 2 heures'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CircleCheck className="size-4 fill-primary-500 text-white" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.form>

        {/* Cartes de confiance */}
        <section aria-label="Pourquoi Studena" className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <TrustCard
            icon={<MessageSquareQuote className="size-5" aria-hidden="true" />}
            tone="primary"
            title={
              <>
                <span className="mb-1 flex gap-0.5" aria-label="5 étoiles">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-neutral-900 text-neutral-900" aria-hidden="true" />
                  ))}
                </span>
                4.9/5 sur +1 200 avis
              </>
            }
            text="Plébiscité par les associations de parents d'élèves."
          />
          <TrustCard
            icon={<Award className="size-5" aria-hidden="true" />}
            tone="primary"
            title="Pédagogues certifiés"
            text="Seulement 8% des candidats retenus après tests rigoureux."
          />
          <TrustCard
            icon={<Repeat className="size-5" aria-hidden="true" />}
            tone="star"
            title="Satisfait ou remplacé"
            text="Changement immédiat et gratuit si le contact ne passe pas."
          />
        </section>

        {/* Bandeau tuteurs pré-sélectionnés */}
        <PreselectedBanner
          levelName={level?.name}
          subjectName={subject?.name}
          tutors={complete ? (preview.data?.tutors ?? []).slice(0, 3) : []}
        />
      </div>
    </div>
  )
}

function Question({ n, id, title, aside, children }: { n: number; id: string; title: string; aside?: string; children: ReactNode }) {
  return (
    <section className="mt-9 sm:mt-10" aria-labelledby={id}>
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 id={id} className="flex items-center gap-3 text-h3 text-neutral-900">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary-100 text-label text-primary-600" aria-hidden="true">
            {n}
          </span>
          {title}
        </h2>
        {aside && <p className="pl-[42px] text-small text-neutral-500 sm:pl-0">{aside}</p>}
      </div>
      <div className="sm:pl-[42px]">{children}</div>
    </section>
  )
}

function TrustCard({ icon, title, text, tone }: { icon: ReactNode; title: ReactNode; text: string; tone: 'primary' | 'star' }) {
  return (
    <div className="flex gap-3 rounded-lg border border-neutral-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <span
        className={clsx(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          tone === 'primary' ? 'bg-primary-50 text-primary-600' : 'bg-star-bg text-neutral-900',
        )}
      >
        {icon}
      </span>
      <div>
        <p className="text-small font-bold text-neutral-900">{title}</p>
        <p className="mt-1 text-small text-neutral-500">{text}</p>
      </div>
    </div>
  )
}

function PreselectedBanner({
  levelName,
  subjectName,
  tutors,
}: {
  levelName?: string
  subjectName?: string
  tutors: { id: number; firstName: string; school: string; photoUrl: string; displayName: string }[]
}) {
  const title =
    levelName && subjectName
      ? `Tuteurs pré-sélectionnés en ${levelName} ${subjectName}`
      : 'Des tuteurs pré-sélectionnés pour votre enfant'
  const names = tutors.length
    ? tutors.map((t) => `${t.firstName} (${t.school})`).join(', ')
    : 'Normaliens, ingénieurs et professeurs agrégés, sélectionnés pour leur pédagogie.'
  return (
    <section className="mt-6 flex flex-col gap-4 rounded-lg bg-primary-50 p-5 sm:flex-row sm:items-center sm:px-6" aria-live="polite">
      <div className="flex shrink-0 -space-x-3">
        {tutors.length
          ? tutors.map((t) => <TutorPhoto key={t.id} src={t.photoUrl} name={t.displayName} size={44} verified={false} className="rounded-full ring-2 ring-primary-50" />)
          : ['CB', 'TL', 'IM'].map((i, idx) => (
              <span
                key={i}
                className={clsx(
                  'flex size-11 items-center justify-center rounded-full text-label text-white ring-2 ring-primary-50',
                  ['bg-primary-500', 'bg-primary-700', 'bg-primary-400'][idx],
                )}
                aria-hidden="true"
              >
                {i}
              </span>
            ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-small font-bold text-neutral-900">{title}</p>
        <p className="text-small text-neutral-700">{names}</p>
      </div>
      <p className="flex shrink-0 items-center gap-2 text-small font-semibold text-primary-600">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary-500" />
        </span>
        Disponibles cette semaine
      </p>
    </section>
  )
}
