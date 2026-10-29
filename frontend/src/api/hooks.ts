import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FALLBACK_META } from '../lib/referentials'
import { isComplete, slotKey, type SearchCriteria } from '../lib/search'
import { api } from './client'
import type { Availability } from './types'

export const useMeta = () =>
  useQuery({
    queryKey: ['meta'],
    queryFn: api.meta,
    placeholderData: FALLBACK_META,
    staleTime: 5 * 60_000,
  })

export const matchKey = (c: SearchCriteria) =>
  ['match', c.level, c.subject, c.availability.map(slotKey).join(','), c.objective.trim()] as const

export const useMatch = (c: SearchCriteria, opts?: { keepPrevious?: boolean }) =>
  useQuery({
    queryKey: matchKey(c),
    queryFn: () =>
      api.match({
        level: c.level,
        subject: c.subject,
        availability: c.availability,
        ...(c.objective.trim() ? { objective: c.objective.trim() } : {}),
      }),
    enabled: isComplete(c),
    staleTime: 30_000,
    placeholderData: opts?.keepPrevious ? keepPreviousData : undefined,
  })

export const useTutor = (id: number | null, ctx: { level?: string; subject?: string; availability?: Availability[] }) =>
  useQuery({
    queryKey: ['tutor', id, ctx.level, ctx.subject, ctx.availability?.map(slotKey).join(',')],
    queryFn: () => api.tutor(id!, ctx),
    enabled: id !== null,
    staleTime: 60_000,
  })

export const useTutorSlots = (id: number | null, week: string | undefined, availability: Availability[]) =>
  useQuery({
    queryKey: ['slots', id, week ?? 'current', availability.map(slotKey).join(',')],
    queryFn: () => api.slots(id!, week, availability),
    enabled: id !== null,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })

export const useBooking = (reference: string) =>
  useQuery({
    queryKey: ['booking', reference],
    queryFn: () => api.booking(reference),
    retry: (count, err) => count < 2 && (err as { status?: number }).status !== 404,
  })
