<?php

namespace App\Matching;

use App\Support\FrenchDate;
use Carbon\CarbonImmutable;

/** Créneau de cours daté et libre, calculé à partir des disponibilités hebdomadaires. */
final readonly class Slot
{
    public function __construct(
        public CarbonImmutable $startsAt,
        public CarbonImmutable $endsAt,
        public int $day,
        public string $period,
    ) {}

    public function matches(AvailabilitySelection $selection): bool
    {
        return $selection->contains($this->day, $this->period);
    }

    public function toArray(AvailabilitySelection $selection): array
    {
        return [
            'startsAt' => $this->startsAt->toIso8601String(),
            'endsAt' => $this->endsAt->toIso8601String(),
            'day' => $this->day,
            'period' => $this->period,
            'label' => FrenchDate::slotLabel($this->startsAt),
            'timeLabel' => FrenchDate::timeRange($this->startsAt, $this->endsAt),
            'matchesAvailability' => $this->matches($selection),
        ];
    }
}
