import { motion } from 'framer-motion'
import {
  CalendarCheck,
  CalendarDays,
  Check,
  CircleQuestionMark,
  CirclePlus,
  Copy,
  FolderOpen,
  GraduationCap,
  History,
  Info,
  Laptop,
  Mail,
  PartyPopper,
  ReceiptText,
  Star,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { useBooking } from '../api/hooks'
import type { Booking } from '../api/types'
import { buttonClass } from '../components/ui/buttonClass'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { TutorPhoto } from '../components/ui/TutorPhoto'
import { formatRating } from '../lib/format'
import { lastSearch } from '../lib/search'

export function ConfirmationPage() {
  const { reference = '' } = useParams()
  const q = useBooking(reference)

  useEffect(() => {
    document.title = 'Réservation confirmée – Studena'
  }, [])

  if (q.isError) {
    const notFound = q.error instanceof ApiError && q.error.status === 404
    return (
      <div className="mx-auto w-full max-w-[560px] px-4 py-16">
        <ErrorState
          title={notFound ? 'Réservation introuvable' : undefined}
          message={notFound ? `Aucune réservation ne correspond à la référence ${reference}.` : q.error.message}
          onRetry={notFound ? undefined : () => q.refetch()}
          action={
            <Link to="/" className={buttonClass('secondary')}>
              Nouvelle recherche
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(50%_60%_at_50%_0%,var(--color-primary-50),transparent_75%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-[608px] px-4 pt-10 pb-16 sm:px-6 sm:pt-12">
        <SuccessHero booking={q.data} />
        {q.data ? <BookingCard booking={q.data} /> : <CardSkeleton />}
        <Mentions />
      </div>
    </div>
  )
}

function SuccessHero({ booking }: { booking?: Booking }) {
  return (
    <section className="text-center" aria-live="polite">
      <SuccessBurst />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-caption font-semibold tracking-wide text-neutral-700 uppercase">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" /> Séance confirmée
        </span>
        <h1 className="mt-3 text-h1 text-neutral-900 sm:text-display">C'est réservé !</h1>
        <div className="mx-auto mt-2 max-w-[520px] text-body text-neutral-500 sm:text-body-l">
          {booking ? (
            <>
              {booking.childFirstName} a rendez-vous avec {booking.tutor.firstName}. Le créneau vous est réservé.
            </>
          ) : (
            <Skeleton className="mx-auto h-6 w-80 max-w-full" />
          )}
        </div>
      </motion.div>
    </section>
  )
}

/** Pastille ✓ animée + étincelles / confettis. */
function SuccessBurst() {
  const sparks = [
    { x: -78, y: 30, c: 'var(--color-star)', s: 22, star: true },
    { x: 84, y: 12, c: 'var(--color-success)', s: 18, star: true },
    { x: -104, y: 48, c: 'var(--color-success)', s: 7 },
    { x: 104, y: 60, c: 'var(--color-star)', s: 9 },
    { x: -124, y: 150, c: 'var(--color-primary-300)', s: 8 },
    { x: 124, y: 140, c: 'var(--color-primary-300)', s: 7 },
    { x: -40, y: -18, c: 'var(--color-primary-200)', s: 6 },
    { x: 56, y: -24, c: 'var(--color-star)', s: 6 },
  ]
  return (
    <div className="relative mx-auto flex size-[104px] items-center justify-center" aria-hidden="true">
      <motion.span
        className="absolute inset-0 rounded-full bg-success-bg/60"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.25, 1], opacity: [0, 0.9, 0.6] }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.span
        className="relative flex size-[72px] items-center justify-center rounded-full bg-success-bg shadow-md ring-8 ring-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
      >
        <svg viewBox="0 0 24 24" className="size-9 text-success" fill="none">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
      </motion.span>
      <motion.span
        className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary-100 text-primary-600"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 14 }}
      >
        <PartyPopper className="size-3.5" />
      </motion.span>
      {sparks.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-1/2 left-1/2"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: p.x, y: p.y - 40, scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 + i * 0.04, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {p.star ? (
            <motion.svg
              width={p.s}
              height={p.s}
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 12, 0], scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: 1 + i * 0.2 }}
            >
              <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill={p.c} opacity="0.75" />
            </motion.svg>
          ) : (
            <span className="block rounded-full" style={{ width: p.s, height: p.s, background: p.c, opacity: 0.7 }} />
          )}
        </motion.span>
      ))}
    </div>
  )
}

function tzAbbrev(iso: string) {
  try {
    return (
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', timeZoneName: 'short' })
        .formatToParts(new Date(iso))
        .find((p) => p.type === 'timeZoneName')?.value ?? 'CET'
    )
  } catch {
    return 'CET'
  }
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(b.reference)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = b.reference
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }
  const last = lastSearch()
  const againHref = last ? `/tuteurs${last}` : `/?niveau=${encodeURIComponent(b.level.slug)}&matiere=${encodeURIComponent(b.subject.slug)}`

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-lg border border-neutral-200/70 bg-white p-5 shadow-md sm:p-6"
      aria-label="Détails de la réservation"
    >
      <div className="flex flex-col gap-3 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <TutorPhoto src={b.tutor.photoUrl} name={b.tutor.displayName} size={56} />
          <div>
            <p className="flex items-center gap-2">
              <span className="text-h3 text-neutral-900">{b.tutor.displayName}</span>
              <span className="inline-flex items-center gap-0.5 text-caption font-semibold text-primary-600">
                <Star className="size-3 fill-current" aria-hidden="true" /> {formatRating(b.tutor.rating)}
              </span>
            </p>
            <p className="text-small text-neutral-700">
              {b.tutor.credential} · {b.tutor.school}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:flex-col sm:items-end">
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-caption font-semibold text-primary-800">
            {b.subject.name} · {b.level.name}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-caption font-semibold text-neutral-700">
            <Video className="size-3.5" aria-hidden="true" /> {b.durationLabel}
          </span>
        </div>
      </div>

      <dl className="mt-5 space-y-5">
        <Row icon={CalendarDays} label="Date & heure" value={b.dateLabel}>
          Fuseau horaire : {b.timezone} ({tzAbbrev(b.startsAt)})
        </Row>
        <Row icon={Laptop} label="Format & lieu" value="Visioconférence individuelle">
          Espace de travail interactif Studena (tableau blanc &amp; partage audio/vidéo)
        </Row>
        <Row icon={GraduationCap} label="Élève" value={b.childFirstName}>
          {b.objective ? `Objectif : ${b.objective}` : `${b.subject.name} · ${b.level.name}`}
        </Row>
      </dl>

      <div className="mt-5 flex items-center gap-2 rounded-md bg-primary-50 px-4 py-3">
        <ReceiptText className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
        <span className="text-small text-neutral-700"><span className="hidden sm:inline">Référence dossier :</span><span className="sm:hidden">Réf. :</span></span>
        <strong className="tabular text-body font-bold tracking-wider whitespace-nowrap text-neutral-900">{b.reference}</strong>
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-sm bg-white px-2.5 text-caption font-semibold text-neutral-700 shadow-sm transition-colors hover:text-primary-600"
          aria-live="polite"
        >
          {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? 'Copié !' : 'Copier'}
          <span className="sr-only"> la référence</span>
        </button>
      </div>

      <p className="mt-5 flex gap-2.5 rounded-md bg-primary-100/70 p-4 text-small text-neutral-700">
        <Info className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />
        <span>
          <strong className="font-bold text-neutral-900">Astuce préparation :</strong> Le lien sécurisé de la visioconférence sera actif 10 minutes
          avant le début du cours dans votre tableau de bord.
        </span>
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href={api.icsUrl(b.reference)} download={`studena-${b.reference}.ics`} className={buttonClass('primary', 'md', 'rounded-full')}>
          <CalendarCheck className="size-4" aria-hidden="true" /> Ajouter à mon agenda
        </a>
        <Link to={againHref} className={buttonClass('ghost', 'md', 'rounded-full text-neutral-900!')}>
          <CirclePlus className="size-4" aria-hidden="true" /> Réserver un autre créneau
        </Link>
      </div>
    </motion.section>
  )
}

function Row({ icon: Icon, label, value, children }: { icon: LucideIcon; label: string; value: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-caption font-semibold tracking-wide text-neutral-700 uppercase">{label}</dt>
        <dd className="mt-0.5 text-body-l font-semibold text-neutral-900">{value}</dd>
        <dd className="text-small text-neutral-500">{children}</dd>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="mt-8 rounded-lg border border-neutral-200/70 bg-white p-6 shadow-md" aria-busy="true">
      <span className="sr-only">Chargement de la réservation…</span>
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-64 max-w-full" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-12 w-full rounded-md" />
    </div>
  )
}

function Mentions() {
  return (
    <div className="mt-8 space-y-2 text-center">
      <p className="flex items-center justify-center gap-1.5 text-small text-neutral-700">
        <Mail className="size-4 shrink-0 text-primary-600" aria-hidden="true" /> Un récapitulatif complet et la facture ont été envoyés par email.
      </p>
      <p className="flex items-center justify-center gap-1.5 text-caption font-semibold text-neutral-700">
        <History className="size-3.5 shrink-0 text-success" aria-hidden="true" /> Modification ou annulation 100% gratuite jusqu'à 2h avant la séance.
      </p>
      <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 text-caption font-semibold text-neutral-700">
        <a href="mailto:support@studena.com" className="inline-flex items-center gap-1 hover:text-primary-600">
          <CircleQuestionMark className="size-3.5" aria-hidden="true" /> Assistance technique
        </a>
        <span className="size-1 rounded-full bg-neutral-400" aria-hidden="true" />
        <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 hover:text-primary-600">
          <FolderOpen className="size-3.5" aria-hidden="true" /> Accéder à mon espace parent
        </a>
      </p>
    </div>
  )
}
