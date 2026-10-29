<?php

namespace App\Matching;

use App\Models\Tutor;
use App\Models\TutorTeaching;
use Illuminate\Support\Collection;

/** Tuteur ayant passé les filtres obligatoires, avec ses créneaux et son score. */
final class Candidate
{
    public int $score = 0;

    /** @var list<array{key: string, label: string, points: int, max: int}> */
    public array $breakdown = [];

    /** @var list<string> */
    public array $reasons = [];

    /**
     * @param  Collection<int, Slot>  $freeSlots  tous les créneaux libres de l'horizon
     * @param  Collection<int, Slot>  $compatibleSlots  ceux qui tombent dans les plages du parent
     */
    public function __construct(
        public readonly Tutor $tutor,
        public readonly TutorTeaching $teaching,
        public readonly Collection $freeSlots,
        public readonly Collection $compatibleSlots,
    ) {}

    /** Nombre de couples (jour, moment) demandés pour lesquels le tuteur a au moins un créneau libre. */
    public function coveredSelectionCount(): int
    {
        return $this->compatibleSlots
            ->map(fn (Slot $slot) => AvailabilitySelection::key($slot->day, $slot->period))
            ->unique()
            ->count();
    }
}
