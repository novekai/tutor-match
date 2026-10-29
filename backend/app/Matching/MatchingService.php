<?php

namespace App\Matching;

use App\Matching\Criteria\Criterion;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Étape 1 : filtres obligatoires (matière, niveau dans l'intervalle enseigné en SQL,
 * puis au moins un créneau libre dans les plages du parent).
 * Étape 2 : score pondéré 0-100, critère par critère.
 */
class MatchingService
{
    private const REASONS_LIMIT = 3;

    public function __construct(private readonly SlotGenerator $slots) {}

    /**
     * @return array{tutors: Collection<int, Candidate>, suggestions: list<array>}
     */
    public function match(MatchQuery $query): array
    {
        $tutors = $this->eligibleTutors($query)->get();
        $freeSlots = $this->slots->forTutors($tutors);

        $candidates = $tutors
            ->map(fn (Tutor $tutor) => $this->candidate($tutor, $query, $freeSlots[$tutor->id]))
            ->filter(fn (Candidate $candidate) => $candidate->compatibleSlots->isNotEmpty())
            ->each(fn (Candidate $candidate) => $this->score($candidate, $query))
            ->sort(fn (Candidate $a, Candidate $b) => [$b->score, $b->tutor->rating, $b->tutor->lessons_count]
                <=> [$a->score, $a->tutor->rating, $a->tutor->lessons_count])
            ->values();

        $suggestions = $candidates->count() < config('matching.suggestions.below')
            ? $this->suggestions($tutors, $freeSlots, $query)
            : [];

        return ['tutors' => $candidates, 'suggestions' => $suggestions];
    }

    /** Évalue un tuteur précis (fiche détail) ; null s'il ne passe pas les filtres obligatoires. */
    public function evaluate(Tutor $tutor, MatchQuery $query): ?Candidate
    {
        $tutor = $this->eligibleTutors($query)->whereKey($tutor->id)->first();
        if ($tutor === null) {
            return null;
        }

        $candidate = $this->candidate($tutor, $query, $this->slots->forTutor($tutor));
        if ($candidate->compatibleSlots->isEmpty()) {
            return null;
        }

        return $this->score($candidate, $query);
    }

    /** Filtres stricts en SQL : matière enseignée et niveau dans [min, max]. */
    private function eligibleTutors(MatchQuery $query): Builder
    {
        $rank = $query->level->rank;

        return Tutor::query()
            ->whereHas('teachings', fn (Builder $teaching) => $teaching
                ->where('subject_id', $query->subject->id)
                ->where('level_min_rank', '<=', $rank)
                ->where('level_max_rank', '>=', $rank))
            ->with(['availabilities', 'teachings.subject']);
    }

    private function candidate(Tutor $tutor, MatchQuery $query, Collection $freeSlots): Candidate
    {
        return new Candidate(
            $tutor,
            $tutor->teachingFor($query->subject),
            $freeSlots,
            $freeSlots->filter(fn (Slot $slot) => $slot->matches($query->availability))->values(),
        );
    }

    private function score(Candidate $candidate, MatchQuery $query): Candidate
    {
        $breakdown = [];
        $reasons = [];

        foreach (config('matching.criteria') as $class => $weight) {
            /** @var Criterion $criterion */
            $criterion = app($class);
            $points = (int) round($weight * $criterion->score($candidate, $query));

            $breakdown[] = [
                'key' => $criterion->key(),
                'label' => $criterion->label(),
                'points' => $points,
                'max' => $weight,
            ];

            $reason = $criterion->reason($candidate, $query);
            if ($reason !== null) {
                $reasons[] = ['text' => $reason, 'points' => $points / $weight];
            }
        }

        // Les points forts les plus marqués d'abord.
        usort($reasons, fn ($a, $b) => $b['points'] <=> $a['points']);

        $candidate->breakdown = $breakdown;
        $candidate->score = min(100, array_sum(array_column($breakdown, 'points')));
        $candidate->reasons = array_slice(array_column($reasons, 'text'), 0, self::REASONS_LIMIT);

        return $candidate;
    }

    /**
     * Pour chaque plage (jour, moment) non cochée : combien de tuteurs, actuellement
     * incompatibles, le deviendraient si on l'ajoutait.
     *
     * @param  Collection<int, Tutor>  $tutors  tuteurs passant les filtres matière + niveau
     * @param  array<int, Collection<int, Slot>>  $freeSlots
     */
    private function suggestions(Collection $tutors, array $freeSlots, MatchQuery $query): array
    {
        $periods = config('matching.periods');
        $byPair = [];

        foreach ($tutors as $tutor) {
            $slots = $freeSlots[$tutor->id];
            if ($slots->contains(fn (Slot $slot) => $slot->matches($query->availability))) {
                continue;
            }
            foreach ($slots as $slot) {
                $byPair[AvailabilitySelection::key($slot->day, $slot->period)][$tutor->id] = $tutor;
            }
        }

        $days = config('matching.days');
        $order = array_keys($periods);

        return collect($byPair)
            ->map(function (array $pairTutors, string $key) use ($days, $periods, $order) {
                [$day, $period] = explode(':', $key, 2);

                return [
                    'day' => (int) $day,
                    'period' => $period,
                    'label' => mb_strtolower($days[(int) $day]['name'].' '.$periods[$period]['name']),
                    'tutorsCount' => count($pairTutors),
                    'initials' => collect($pairTutors)
                        ->sortByDesc('rating')
                        ->take(3)
                        ->map(fn (Tutor $tutor) => $tutor->initials())
                        ->values()
                        ->all(),
                    '_order' => (int) $day * 10 + array_search($period, $order, true),
                ];
            })
            ->sort(fn ($a, $b) => [$b['tutorsCount'], $a['_order']] <=> [$a['tutorsCount'], $b['_order']])
            ->take(config('matching.suggestions.max'))
            ->map(fn ($suggestion) => collect($suggestion)->except('_order')->all())
            ->values()
            ->all();
    }
}
