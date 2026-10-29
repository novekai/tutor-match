import type { Availability, Day, Period } from '../api/types'

/** Critères de recherche, sérialisés dans l'URL : ?niveau=4e&matiere=…&dispos=3-apres-midi,6-matin&objectif=… */
export type SearchCriteria = {
  level: string
  subject: string
  availability: Availability[]
  objective: string
}

const PERIODS: Period[] = ['matin', 'apres-midi', 'soir']

export const slotKey = (a: Availability) => `${a.day}-${a.period}`

export function parseDispos(raw: string | null): Availability[] {
  if (!raw) return []
  const seen = new Set<string>()
  const out: Availability[] = []
  for (const part of raw.split(',')) {
    const m = /^([1-7])-(matin|apres-midi|soir)$/.exec(part.trim())
    if (!m) continue
    const a = { day: Number(m[1]) as Day, period: m[2] as Period }
    if (seen.has(slotKey(a))) continue
    seen.add(slotKey(a))
    out.push(a)
  }
  return sortAvailability(out)
}

export const sortAvailability = (list: Availability[]) =>
  [...list].sort((a, b) => a.day - b.day || PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period))

export function criteriaFromParams(p: URLSearchParams): SearchCriteria {
  return {
    level: p.get('niveau') ?? '',
    subject: p.get('matiere') ?? '',
    availability: parseDispos(p.get('dispos')),
    objective: (p.get('objectif') ?? '').slice(0, 500),
  }
}

export function criteriaToParams(c: SearchCriteria): URLSearchParams {
  const p = new URLSearchParams()
  if (c.level) p.set('niveau', c.level)
  if (c.subject) p.set('matiere', c.subject)
  if (c.availability.length) p.set('dispos', sortAvailability(c.availability).map(slotKey).join(','))
  if (c.objective.trim()) p.set('objectif', c.objective.trim())
  return p
}

export const isComplete = (c: SearchCriteria) => Boolean(c.level && c.subject && c.availability.length > 0)

const LAST_SEARCH_KEY = 'studena:last-search'

export function rememberSearch(search: string) {
  try {
    sessionStorage.setItem(LAST_SEARCH_KEY, search)
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

export function lastSearch(): string | null {
  try {
    return sessionStorage.getItem(LAST_SEARCH_KEY)
  } catch {
    return null
  }
}

/** Lundi (YYYY-MM-DD) de la semaine d'une date ISO, en se basant sur la date locale Paris portée par la chaîne. */
export function mondayOf(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const dow = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - (dow - 1))
  return date.toISOString().slice(0, 10)
}
