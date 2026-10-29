<?php

namespace App\Matching;

use App\Models\Booking;
use App\Models\Tutor;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Transforme les disponibilités hebdomadaires en créneaux datés libres :
 * pas de step_minutes, durée lesson_minutes, de maintenant + min_notice_hours à l'horizon,
 * hors réservations confirmées (aucun chevauchement).
 */
class SlotGenerator
{
    public function earliestStart(): CarbonImmutable
    {
        return $this->now()->addHours(config('matching.min_notice_hours'));
    }

    public function horizonEnd(): CarbonImmutable
    {
        return $this->now()->addDays(config('matching.horizon_days'));
    }

    /** @return Collection<int, Slot> */
    public function forTutor(
        Tutor $tutor,
        ?CarbonImmutable $from = null,
        ?CarbonImmutable $to = null,
        bool $ignoreBookings = false,
    ): Collection {
        return $this->forTutors(collect([$tutor]), $from, $to, $ignoreBookings)[$tutor->id];
    }

    /**
     * @param  Collection<int, Tutor>  $tutors  (relation availabilities chargée de préférence)
     * @return array<int, Collection<int, Slot>> créneaux triés par date, indexés par id de tuteur
     */
    public function forTutors(
        Collection $tutors,
        ?CarbonImmutable $from = null,
        ?CarbonImmutable $to = null,
        bool $ignoreBookings = false,
    ): array {
        $from = $from === null ? $this->earliestStart() : $from->max($this->earliestStart());
        $to = $to === null ? $this->horizonEnd() : $to->min($this->horizonEnd());

        $bookings = $ignoreBookings
            ? collect()
            : $this->confirmedBookings($tutors->pluck('id')->all(), $from, $to);

        $result = [];
        foreach ($tutors as $tutor) {
            $result[$tutor->id] = $this->generate($tutor, $from, $to, $bookings->get($tutor->id, collect()));
        }

        return $result;
    }

    /** @return Collection<int, Slot> */
    private function generate(Tutor $tutor, CarbonImmutable $from, CarbonImmutable $to, Collection $bookings): Collection
    {
        $lesson = $tutor->lesson_minutes ?: config('matching.lesson_minutes');
        $step = config('matching.step_minutes');
        $slots = collect();

        if ($from >= $to) {
            return $slots;
        }

        $byWeekday = $tutor->availabilities->groupBy('weekday');

        for ($date = $from->startOfDay(); $date < $to; $date = $date->addDay()) {
            foreach ($byWeekday->get($date->dayOfWeekIso, []) as $availability) {
                $windowEnd = $date->setTimeFromTimeString($availability->end_time);
                $start = $date->setTimeFromTimeString($availability->start_time);

                for (; $start->addMinutes($lesson) <= $windowEnd; $start = $start->addMinutes($step)) {
                    if ($start < $from || $start >= $to) {
                        continue;
                    }
                    $period = $this->periodOf($start);
                    $end = $start->addMinutes($lesson);
                    if ($period === null || $this->overlaps($bookings, $start, $end)) {
                        continue;
                    }
                    $slots->push(new Slot($start, $end, $start->dayOfWeekIso, $period));
                }
            }
        }

        return $slots->sortBy(fn (Slot $slot) => $slot->startsAt->getTimestamp())->values();
    }

    public function periodOf(CarbonImmutable $start): ?string
    {
        $time = $start->format('H:i');
        foreach (config('matching.periods') as $slug => $period) {
            if ($time >= $period['start'] && $time < $period['end']) {
                return $slug;
            }
        }

        return null;
    }

    private function overlaps(Collection $bookings, CarbonImmutable $start, CarbonImmutable $end): bool
    {
        return $bookings->contains(fn (Booking $booking) => $booking->starts_at < $end && $booking->ends_at > $start);
    }

    /** @return Collection<int, Collection<int, Booking>> */
    private function confirmedBookings(array $tutorIds, CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        $lesson = config('matching.lesson_minutes');

        return Booking::query()
            ->confirmed()
            ->whereIn('tutor_id', $tutorIds)
            ->where('ends_at', '>', $from->toIso8601String())
            ->where('starts_at', '<', $to->addMinutes($lesson * 2)->toIso8601String())
            ->get(['tutor_id', 'starts_at', 'ends_at'])
            ->groupBy('tutor_id');
    }

    private function now(): CarbonImmutable
    {
        return CarbonImmutable::now(config('matching.timezone'));
    }
}
