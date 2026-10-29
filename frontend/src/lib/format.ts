const TZ = 'Europe/Paris'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const timeFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
const dayLongFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short' })
const dayFullFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })

/** "14h00" */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso)).replace(':', 'h')

export const addMinutes = (iso: string, minutes: number) => new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()

/** "Mercredi 5 nov. · 14h00 – 15h30" */
export function formatSlotLong(startsAt: string, endsAt: string) {
  return `${capitalize(dayLongFmt.format(new Date(startsAt)))} · ${formatTime(startsAt)} – ${formatTime(endsAt)}`
}

/** "Mercredi 5 novembre · 14h00 – 15h30" */
export function formatSlotFull(startsAt: string, endsAt: string) {
  return `${capitalize(dayFullFmt.format(new Date(startsAt)))} · ${formatTime(startsAt)} – ${formatTime(endsAt)}`
}

/** 90 → "1h30" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} min`
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

/** 4.9 → "4,9" */
export const formatRating = (r: number) => r.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })

export const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
