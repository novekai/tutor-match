import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, ChevronDown, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useMatch, useMeta, useTutor } from '../api/hooks'
import type { Availability, Slot, Suggestion, TutorMatch } from '../api/types'
import { ErrorState } from '../components/ui/ErrorState'
import { Overlay } from '../components/ui/Overlay'
import { Skeleton } from '../components/ui/Skeleton'
import { BookingModal } from '../features/booking/BookingModal'
import { TutorDrawer } from '../features/booking/TutorDrawer'
import { EmptyState } from '../features/results/EmptyState'
import { FiltersBar } from '../features/results/FiltersBar'
import { SortMenu, type SortKey } from '../features/results/SortMenu'
import { TutorCard, TutorCardSkeleton } from '../features/results/TutorCard'
import { addMinutes } from '../lib/format'
import { FALLBACK_META } from '../lib/referentials'
import { criteriaFromParams, criteriaToParams, isComplete, rememberSearch, slotKey, type SearchCriteria } from '../lib/search'

const VISIBLE = 4
const OVERLAY_PARAMS = ['tuteur', 'creneau', 'reserver']

type NavState = { depth?: number } | null

export function ResultsPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const meta = useMeta().data ?? FALLBACK_META
  const criteria = useMemo(() => criteriaFromParams(params), [params])
  const match = useMatch(criteria, { keepPrevious: true })
  const [sort, setSort] = useState<SortKey>('pertinence')
  const [expandedFor, setExpandedFor] = useState<string | null>(null)
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null)

  const searchString = criteriaToParams(criteria).toString()
  const showAll = expandedFor === searchString

  // Superposition (drawer / modale) pilotée par l'URL : ?tuteur=12&creneau=…&reserver=1
  const tutorId = params.get('tuteur') ? Number(params.get('tuteur')) : null
  const selected = params.get('creneau')
  const bookingOpen = params.get('reserver') === '1' && tutorId !== null && selected !== null
  const depth = (location.state as NavState)?.depth ?? 0

  useEffect(() => {
    rememberSearch(`?${searchString}`)
  }, [searchString])

  const data = match.data
  const sorted = useMemo(() => {
    const list = [...(data?.tutors ?? [])]
    if (sort === 'note') list.sort((a, b) => b.rating - a.rating || b.score - a.score)
    if (sort === 'prix') list.sort((a, b) => a.hourlyRate - b.hourlyRate || b.score - a.score)
    return list
  }, [data, sort])

  useEffect(() => {
    if (data) document.title = `${data.total} tuteur${data.total > 1 ? 's' : ''} disponible${data.total > 1 ? 's' : ''} – Studena`
  }, [data])

  const matched = data?.tutors.find((t) => t.id === tutorId)
  const tutorQ = useTutor(bookingOpen && !matched ? tutorId : null, {
    level: criteria.level,
    subject: criteria.subject,
    availability: criteria.availability,
  })
  const bookingTutor = matched ?? tutorQ.data

  if (!isComplete(criteria)) return <Navigate to={`/?${searchString}`} replace />

  const level = data?.query.level ?? meta.levels.find((l) => l.slug === criteria.level)
  const subject = data?.query.subject ?? meta.subjects.find((s) => s.slug === criteria.subject)

  // --- Navigation ---------------------------------------------------------
  const withParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) p.delete(k)
      else p.set(k, v)
    }
    return `?${p.toString()}`
  }
  const newSearch = (c: SearchCriteria) => navigate({ search: `?${criteriaToParams(c).toString()}` })

  const openTutor = (t: TutorMatch, slot?: Slot) =>
    navigate({ search: withParams({ tuteur: String(t.id), creneau: slot?.startsAt ?? null, reserver: null }) }, { state: { depth: 1 } })
  const bookTutor = (t: TutorMatch) => openTutor(t, t.compatibleSlots[0])
  const selectSlot = (s: Slot) => navigate({ search: withParams({ creneau: s.startsAt }) }, { replace: true, state: location.state })
  const closeAll = () => {
    if (depth > 0) navigate(-depth)
    else navigate({ search: withParams(Object.fromEntries(OVERLAY_PARAMS.map((k) => [k, null]))) }, { replace: true })
  }
  const openBooking = () => navigate({ search: withParams({ reserver: '1' }) }, { state: { depth: depth + 1 } })
  const backToDrawer = () => {
    if (depth >= 2) navigate(-1)
    else navigate({ search: withParams({ reserver: null }) }, { replace: true, state: { depth: Math.max(0, depth - 1) } })
  }

  const removeSlot = (a: Availability) => {
    const rest = criteria.availability.filter((x) => slotKey(x) !== slotKey(a))
    if (!rest.length) navigate(`/?${criteriaToParams({ ...criteria, availability: [] }).toString()}`)
    else newSearch({ ...criteria, availability: rest })
  }
  const addSuggestion = (s: Suggestion) => {
    setPendingSuggestion(`${s.day}-${s.period}`)
    newSearch({ ...criteria, availability: [...criteria.availability, { day: s.day as Availability['day'], period: s.period as Availability['period'] }] })
  }
  const editHref = `/?${searchString}`

  // --- Rendu -------------------------------------------------------------
  const total = data?.total ?? 0
  const visible = showAll ? sorted : sorted.slice(0, VISIBLE)
  const hidden = sorted.slice(VISIBLE)
  const hiddenScores = hidden.map((t) => t.score)

  let body: ReactNode
  if (match.isError && !data) {
    const err = match.error
    const is422 = err instanceof ApiError && err.status === 422
    body = (
      <div className="mt-8">
        <ErrorState
          title={is422 ? 'Recherche incomplète' : undefined}
          message={err.message}
          onRetry={is422 ? undefined : () => match.refetch()}
          action={
            <Link to={editHref} className="inline-flex h-12 items-center rounded-md border border-neutral-200 bg-white px-5 text-label shadow-sm hover:bg-neutral-50">
              Modifier la recherche
            </Link>
          }
        />
      </div>
    )
  } else if (!data) {
    body = (
      <div className="mt-8" aria-busy="true" aria-live="polite">
        <span className="sr-only">Recherche des tuteurs compatibles…</span>
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <TutorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  } else if (total === 0) {
    body = (
      <div className="mt-6">
        <EmptyState
          levelName={level?.name}
          subjectName={subject?.name}
          suggestions={data.suggestions}
          pending={match.isPlaceholderData ? pendingSuggestion : null}
          onAdd={addSuggestion}
          onEdit={() => navigate(editHref)}
        />
      </div>
    )
  } else {
    body = (
      <>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-h2 text-neutral-900 sm:text-h1" aria-live="polite">
              {total} tuteur{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''} pour votre enfant
            </h1>
            <p className="mt-1 text-small text-neutral-500 sm:text-body">
              Classés selon leur compatibilité avec vos besoins pédagogiques et vos créneaux renseignés
            </p>
          </div>
          <SortMenu value={sort} onChange={setSort} />
        </div>

        <motion.div className="mt-6 space-y-4" layout style={{ opacity: match.isPlaceholderData ? 0.6 : 1 }}>
          <AnimatePresence initial={false}>
            {visible.map((t, i) => (
              <TutorCard key={t.id} tutor={t} index={i} onOpen={(slot) => openTutor(t, slot)} onBook={() => bookTutor(t)} />
            ))}
          </AnimatePresence>
        </motion.div>

        {!showAll && hidden.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setExpandedFor(searchString)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-2 text-center text-label text-primary-600 shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
            >
              Afficher {hidden.length > 1 ? `les ${hidden.length} autres tuteurs disponibles` : "l'autre tuteur disponible"} (
              {hiddenScores.length === 1
                ? `${hiddenScores[0]}%`
                : hiddenScores.length === 2
                  ? `${hiddenScores[0]}% et ${hiddenScores[1]}%`
                  : `de ${Math.max(...hiddenScores)}% à ${Math.min(...hiddenScores)}%`}{' '}
              de compatibilité)
              <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        )}

        <section className="mt-8 flex flex-col gap-4 rounded-lg bg-primary-50 p-5 sm:flex-row sm:items-center sm:px-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm" aria-hidden="true">
            <ShieldCheck className="size-6" />
          </span>
          <div className="flex-1">
            <h2 className="text-h3 text-neutral-900">Pas certain de votre choix ?</h2>
            <p className="mt-0.5 text-small text-neutral-700">
              Le 1er cours est satisfait ou intégralement remboursé. Vous pouvez changer d'enseignant à tout moment, sans aucun frais
              d'engagement.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-caption font-semibold text-success shadow-sm sm:self-auto">
            <BadgeCheck className="size-4" aria-hidden="true" /> Garantie Sérénité Studena
          </span>
        </section>
      </>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1084px] px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
      <FiltersBar
        levelName={level?.name}
        subject={subject}
        availability={criteria.availability}
        editHref={editHref}
        onRemoveLevel={() => navigate(`/?${criteriaToParams({ ...criteria, level: '' }).toString()}`)}
        onRemoveSubject={() => navigate(`/?${criteriaToParams({ ...criteria, subject: '' }).toString()}`)}
        onRemoveSlot={removeSlot}
      />
      {body}

      <Overlay open={tutorId !== null && !bookingOpen} onClose={closeAll} kind="drawer" labelledBy="drawer-title">
        {tutorId !== null && (
          <TutorDrawer
            key={tutorId}
            tutorId={tutorId}
            summary={matched}
            criteria={criteria}
            selected={selected}
            onSelect={selectSlot}
            onBook={openBooking}
            onClose={closeAll}
          />
        )}
      </Overlay>

      <Overlay open={bookingOpen && Boolean(bookingTutor)} onClose={closeAll} kind="modal" labelledBy="booking-title">
        {bookingTutor && selected && level && subject && (
          <BookingModal
            tutor={bookingTutor}
            startsAt={selected}
            endsAt={addMinutes(selected, bookingTutor.lessonMinutes || 90)}
            level={level}
            subject={subject}
            objective={criteria.objective}
            onEdit={backToDrawer}
            onClose={closeAll}
            onPickAlternative={selectSlot}
            onBooked={(b) => navigate(`/reservation/${encodeURIComponent(b.reference)}`, { replace: true })}
          />
        )}
      </Overlay>
    </div>
  )
}
