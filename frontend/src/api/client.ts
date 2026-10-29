import type {
  Availability,
  Booking,
  BookingRequest,
  MatchRequest,
  MatchResponse,
  Meta,
  TutorDetail,
  WeekSlots,
} from './types'

/** Erreur HTTP normalisée (corps JSON conservé dans `body`). */
export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
  /** Erreurs de validation Laravel (422) : { champ: [messages] }. */
  get fieldErrors(): Record<string, string[]> {
    const b = this.body as { errors?: Record<string, string[]> } | null
    return b?.errors ?? {}
  }
  get isNetwork() {
    return this.status === 0
  }
}

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Connexion impossible. Vérifiez votre réseau puis réessayez.', null)
  }
  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }
  if (!res.ok) {
    const msg =
      (body as { message?: string } | null)?.message ??
      (res.status >= 500 ? 'Le service est momentanément indisponible.' : 'Une erreur est survenue.')
    throw new ApiError(res.status, msg, body)
  }
  return body as T
}

/** "3:apres-midi,6:matin" — format de la query string `availability` des routes GET. */
export const availabilityParam = (a: Availability[]) => a.map((x) => `${x.day}:${x.period}`).join(',')

const qs = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) s.set(k, v)
  const str = s.toString()
  return str ? `?${str}` : ''
}

export const api = {
  meta: () => request<Meta>('/meta'),
  match: (body: MatchRequest) => request<MatchResponse>('/match', { method: 'POST', body: JSON.stringify(body) }),
  tutor: (id: number, ctx: { level?: string; subject?: string; availability?: Availability[] }) =>
    request<TutorDetail>(
      `/tutors/${id}` +
        qs({
          level: ctx.level,
          subject: ctx.subject,
          availability: ctx.availability?.length ? availabilityParam(ctx.availability) : undefined,
        }),
    ),
  slots: (id: number, week: string | undefined, availability: Availability[]) =>
    request<WeekSlots>(
      `/tutors/${id}/slots` +
        qs({ week, availability: availability.length ? availabilityParam(availability) : undefined }),
    ),
  book: (body: BookingRequest) => request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  booking: (reference: string) => request<Booking>(`/bookings/${encodeURIComponent(reference)}`),
  icsUrl: (reference: string) => `${BASE}/bookings/${encodeURIComponent(reference)}/ics`,
}
