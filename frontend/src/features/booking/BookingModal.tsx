import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarDays,
  Check,
  CircleAlert,
  Flag,
  IdCard,
  Info,
  Lock,
  Mail,
  User,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { ApiError, api } from '../../api/client'
import type { Booking, Slot, SlotTakenError, TutorSummary } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { TutorPhoto } from '../../components/ui/TutorPhoto'
import { formatDuration, formatSlotFull } from '../../lib/format'

type Props = {
  tutor: TutorSummary
  startsAt: string
  endsAt: string
  level: { slug: string; name: string }
  subject: { slug: string; name: string }
  objective: string
  onEdit: () => void
  onClose: () => void
  onPickAlternative: (slot: Slot) => void
  onBooked: (booking: Booking) => void
}

type Fields = { childFirstName: string; parentName: string; parentEmail: string }
type FieldErrors = Partial<Record<keyof Fields, string>>

const PROFILE_KEY = 'studena:parent'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function loadProfile(): Fields {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return { childFirstName: '', parentName: '', parentEmail: '', ...JSON.parse(raw) }
  } catch {
    /* ignoré */
  }
  return { childFirstName: '', parentName: '', parentEmail: '' }
}

function validate(f: Fields): FieldErrors {
  const e: FieldErrors = {}
  if (!f.childFirstName.trim()) e.childFirstName = "Indiquez le prénom de votre enfant."
  if (!f.parentName.trim()) e.parentName = 'Indiquez votre nom et prénom.'
  else if (f.parentName.trim().length < 2) e.parentName = 'Votre nom semble incomplet.'
  if (!f.parentEmail.trim()) e.parentEmail = 'Indiquez votre adresse email.'
  else if (!EMAIL_RE.test(f.parentEmail.trim())) e.parentEmail = 'Adresse email incomplète ou invalide.'
  return e
}

/** Modale « Plus qu'une étape » : coordonnées + confirmation (gère 409 et 422). */
export function BookingModal({ tutor, startsAt, endsAt, level, subject, objective, onEdit, onClose, onPickAlternative, onBooked }: Props) {
  const qc = useQueryClient()
  const [fields, setFields] = useState<Fields>(loadProfile)
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [sms, setSms] = useState(true)
  const [conflict, setConflict] = useState<SlotTakenError | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const childRef = useRef<HTMLInputElement>(null)
  const parentRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const focusField = (k: keyof Fields) =>
    (k === 'childFirstName' ? childRef : k === 'parentName' ? parentRef : emailRef).current?.focus()

  const clientErrors = validate(fields)
  const errorFor = (k: keyof Fields) => serverErrors[k] ?? (touched[k] ? clientErrors[k] : undefined)

  const mutation = useMutation({
    mutationFn: () =>
      api.book({
        tutorId: tutor.id,
        level: level.slug,
        subject: subject.slug,
        startsAt,
        childFirstName: fields.childFirstName.trim(),
        parentName: fields.parentName.trim(),
        parentEmail: fields.parentEmail.trim(),
        smsReminder: sms,
        ...(objective.trim() ? { objective: objective.trim() } : {}),
      }),
    onSuccess: (booking) => {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ parentName: fields.parentName.trim(), parentEmail: fields.parentEmail.trim() }))
      } catch {
        /* ignoré */
      }
      qc.setQueryData(['booking', booking.reference], booking)
      qc.invalidateQueries({ queryKey: ['match'] })
      qc.invalidateQueries({ queryKey: ['slots'] })
      onBooked(booking)
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) {
        setGeneralError('Une erreur inattendue est survenue. Réessayez.')
        return
      }
      if (err.status === 409) {
        const body = err.body as Partial<SlotTakenError> | null
        setConflict({ message: body?.message ?? err.message, code: 'slot_taken', alternatives: body?.alternatives ?? [] })
        qc.invalidateQueries({ queryKey: ['match'] })
        qc.invalidateQueries({ queryKey: ['slots'] })
        return
      }
      if (err.status === 422) {
        const fe = err.fieldErrors
        const mapped: FieldErrors = {}
        for (const k of ['childFirstName', 'parentName', 'parentEmail'] as const) if (fe[k]?.[0]) mapped[k] = fe[k][0]
        setServerErrors(mapped)
        const others = Object.entries(fe).filter(([k]) => !(k in mapped)).map(([, v]) => v[0])
        setGeneralError(others.length ? others.join(' ') : Object.keys(mapped).length ? null : err.message)
        const first = (Object.keys(mapped) as (keyof Fields)[])[0]
        if (first) focusField(first)
        return
      }
      setGeneralError(err.message)
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched({ childFirstName: true, parentName: true, parentEmail: true })
    setGeneralError(null)
    const errs = validate(fields)
    const first = (['childFirstName', 'parentName', 'parentEmail'] as const).find((k) => errs[k])
    if (first) {
      focusField(first)
      return
    }
    setConflict(null)
    mutation.mutate()
  }

  const set = (k: keyof Fields) => (v: string) => {
    setFields((f) => ({ ...f, [k]: v }))
    if (serverErrors[k]) setServerErrors((s) => ({ ...s, [k]: undefined }))
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">
          <Flag className="size-3.5" aria-hidden="true" /> Dernière étape · Sans engagement
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={submit} noValidate className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6 sm:px-8 sm:pb-8">
        <h2 id="booking-title" className="text-h2 text-neutral-900 sm:text-h1">
          Plus qu'une étape
        </h2>
        <p className="mt-1 text-small text-neutral-500">Renseignez vos coordonnées pour valider la séance de votre enfant.</p>

        {/* Récapitulatif */}
        <div className="mt-5 rounded-md bg-primary-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-caption font-semibold tracking-wide text-neutral-700 uppercase">Récapitulatif séance</p>
            <button type="button" onClick={onEdit} className="rounded-sm text-caption font-semibold text-primary-600 underline underline-offset-2 hover:text-primary-800">
              Modifier
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <TutorPhoto src={tutor.photoUrl} name={tutor.displayName} size={56} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-h3 text-neutral-900">{tutor.displayName}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-caption font-semibold text-neutral-700">
                  Visio {formatDuration(tutor.lessonMinutes)}
                </span>
              </p>
              <p className="text-small text-neutral-700">
                {subject.name} · {level.name}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={startsAt}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-0.5 flex items-center gap-1.5 text-small font-semibold text-primary-600"
                >
                  <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                  {formatSlotFull(startsAt, endsAt)}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Conflit 409 */}
        <AnimatePresence>
          {conflict && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-md border border-error/30 bg-error-bg p-4">
                <p className="flex items-start gap-2 text-small font-semibold text-error">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {conflict.message} Choisissez un autre créneau avec{"\u00a0"}{tutor.firstName}{"\u00a0"}:
                </p>
                {conflict.alternatives.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {conflict.alternatives.map((s) => (
                      <li key={s.startsAt}>
                        <button
                          type="button"
                          onClick={() => {
                            setConflict(null)
                            onPickAlternative(s)
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-neutral-200 bg-white px-3 text-caption font-semibold text-primary-600 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
                        >
                          <CalendarDays className="size-3.5" aria-hidden="true" />
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <button type="button" onClick={onEdit} className="mt-2 text-small font-semibold text-primary-600 underline underline-offset-2">
                    Voir les autres créneaux disponibles
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 space-y-4">
          <Field
            inputRef={childRef}
            id="childFirstName"
            label="Prénom de l'enfant"
            icon={IdCard}
            value={fields.childFirstName}
            onChange={set('childFirstName')}
            onBlur={() => setTouched((t) => ({ ...t, childFirstName: true }))}
            error={errorFor('childFirstName')}
            placeholder="ex. Lucas"
            autoComplete="off"
          />
          <Field
            inputRef={parentRef}
            id="parentName"
            label="Votre nom et prénom"
            icon={User}
            value={fields.parentName}
            onChange={set('parentName')}
            onBlur={() => setTouched((t) => ({ ...t, parentName: true }))}
            error={errorFor('parentName')}
            placeholder="ex. Sophie Martin"
            autoComplete="name"
          />
          <Field
            inputRef={emailRef}
            id="parentEmail"
            type="email"
            label="Votre email"
            icon={Mail}
            value={fields.parentEmail}
            onChange={set('parentEmail')}
            onBlur={() => setTouched((t) => ({ ...t, parentEmail: true }))}
            error={errorFor('parentEmail')}
            placeholder="sophie.martin@email.fr"
            autoComplete="email"
            inputMode="email"
            help="Pour recevoir le lien de la séance et le rappel du cours"
          />
        </div>

        {/* SMS */}
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md bg-primary-50 p-4 transition-colors hover:bg-primary-100/60">
          <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="peer sr-only" />
          <span
            className={clsx(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-primary-200',
              sms ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-transparent',
            )}
            aria-hidden="true"
          >
            <Check className="size-3.5" strokeWidth={3.5} />
          </span>
          <span>
            <span className="block text-small font-semibold text-neutral-900">Recevoir un rappel par SMS 1h avant la séance</span>
            <span className="block text-small text-neutral-700">Notification utile avec le lien direct d'accès à la visio</span>
          </span>
        </label>

        {generalError && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-md bg-error-bg p-3 text-small font-medium text-error">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {generalError}
          </p>
        )}

        <Button type="submit" size="lg" block className="mt-5 text-body-l" loading={mutation.isPending} loadingLabel="Réservation en cours…">
          Confirmer la réservation <ArrowRight className="size-5" aria-hidden="true" />
        </Button>
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-caption font-semibold text-neutral-700">
          <Lock className="size-3.5" aria-hidden="true" /> Aucun paiement maintenant · Annulation gratuite
        </p>

        <ul className="mt-5 space-y-2 rounded-md bg-neutral-50 p-4 text-caption font-medium text-neutral-700">
          <li className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-primary-600" aria-hidden="true" /> Confirmation immédiate par email
          </li>
          <li className="flex items-center gap-2">
            <Video className="size-4 text-primary-600" aria-hidden="true" /> Lien de visio interactif inclus
          </li>
          <li className="flex items-center gap-2">
            <BellRing className="size-4 text-primary-600" aria-hidden="true" /> Tuteur notifié instantanément
          </li>
        </ul>
      </form>
    </>
  )
}

type FieldProps = {
  inputRef: RefObject<HTMLInputElement | null>
  id: keyof Fields
  label: string
  icon: LucideIcon
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  error?: string
  help?: string
  placeholder?: string
  type?: string
  autoComplete?: string
  inputMode?: 'email' | 'text'
}

function Field({ inputRef, id, label, icon: Icon, value, onChange, onBlur, error, help, placeholder, type = 'text', autoComplete, inputMode }: FieldProps) {
  const uid = useId()
  const helpId = `${uid}-help`
  const errId = `${uid}-err`
  return (
    <div>
      <label htmlFor={uid} className="mb-1.5 block text-label text-neutral-900">
        {label}
      </label>
      <div className="relative">
        <Icon
          className={clsx('pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2', error ? 'text-error' : 'text-neutral-500')}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={uid}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={clsx(error && errId, help && helpId) || undefined}
          className={clsx(
            'h-12 w-full rounded-md border bg-white pr-4 pl-11 text-body text-neutral-900 shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-neutral-400',
            error
              ? 'border-error focus:ring-4 focus:ring-error-bg'
              : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-50',
          )}
        />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errId}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 flex items-center gap-1 text-small font-medium text-error"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
      {help && !error && (
        <p id={helpId} className="mt-1.5 flex items-center gap-1 text-caption font-medium text-neutral-500">
          <Info className="size-3.5 shrink-0" aria-hidden="true" /> {help}
        </p>
      )}
    </div>
  )
}
