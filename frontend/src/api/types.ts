// Types calqués sur docs/API.md (source de vérité front ↔ back).

export type Cycle = 'primaire' | 'college' | 'lycee'
export type Period = 'matin' | 'apres-midi' | 'soir'
export type Day = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Level = { slug: string; name: string; cycle: Cycle; cycleLabel: string; rank: number }
export type Subject = { slug: string; name: string; hint: string; icon: string }
export type Availability = { day: Day; period: Period }

export type Slot = {
  startsAt: string
  endsAt: string
  day: number
  period: string
  label: string
  timeLabel: string
  matchesAvailability: boolean
}

export type TutorSummary = {
  id: number
  displayName: string
  firstName: string
  photoUrl: string
  credential: string
  school: string
  headline: string
  rating: number
  reviewsCount: number
  yearsExperience: number
  lessonsCount: number
  responseRate: number
  hourlyRate: number
  lessonMinutes: number
  levelsLabel: string
  subjects: { slug: string; name: string; isMajor: boolean }[]
}

export type TutorMatch = TutorSummary & {
  score: number
  isBestMatch: boolean
  scoreBreakdown: { key: string; label: string; points: number; max: number }[]
  matchReasons: string[]
  compatibleSlotsCount: number
  compatibleSlots: Slot[]
}

export type TutorDetail = TutorSummary & {
  bio: string
  tags: { emoji: string; label: string }[]
  score?: number
  matchReasons?: string[]
}

export type BookingTutor = {
  id: number
  displayName: string
  firstName: string
  photoUrl: string
  credential: string
  school: string
  rating: number
}

export type Booking = {
  reference: string
  status: 'confirmed'
  startsAt: string
  endsAt: string
  dateLabel: string
  shortDateLabel: string
  timezone: 'Europe/Paris'
  durationLabel: string
  tutor: BookingTutor
  subject: Subject
  level: Level
  childFirstName: string
  parentName: string
  parentEmail: string
  smsReminder: boolean
  objective: string | null
  createdAt: string
}

export type Suggestion = {
  day: number
  period: string
  label: string
  tutorsCount: number
  initials: string[]
}

export type Meta = {
  levels: Level[]
  subjects: Subject[]
  periods: { slug: Period; name: string; range: string }[]
  days: { value: Day; short: string; name: string }[]
  tutorsCount: number
}

export type MatchRequest = {
  level: string
  subject: string
  availability: Availability[]
  objective?: string
}

export type MatchResponse = {
  query: { level: Level; subject: Subject; availability: Availability[] }
  total: number
  tutors: TutorMatch[]
  suggestions: Suggestion[]
}

export type WeekSlots = {
  weekStart: string
  weekEnd: string
  label: string
  previousWeek: string | null
  nextWeek: string | null
  days: { date: string; label: string; slots: Slot[] }[]
}

export type BookingRequest = {
  tutorId: number
  level: string
  subject: string
  startsAt: string
  childFirstName: string
  parentName: string
  parentEmail: string
  smsReminder?: boolean
  objective?: string
}

export type SlotTakenError = {
  message: string
  code: 'slot_taken'
  alternatives: Slot[]
}
