<?php

namespace App\Matching\Criteria;

use App\Matching\Candidate;
use App\Matching\MatchQuery;
use App\Models\Level;

/**
 * Un tuteur qui enseigne sur un intervalle étroit, centré sur le niveau de l'élève,
 * et dont c'est la matière principale, est plus spécialisé.
 */
class LevelSpecializationCriterion implements Criterion
{
    private const RANK_SPAN = 11; // CP (1) → Terminale (12)

    public function key(): string
    {
        return 'specialization';
    }

    public function label(): string
    {
        return 'Spécialisation niveau';
    }

    public function score(Candidate $candidate, MatchQuery $query): float
    {
        $teaching = $candidate->teaching;
        $width = $teaching->level_max_rank - $teaching->level_min_rank;
        $center = ($teaching->level_min_rank + $teaching->level_max_rank) / 2;

        $narrowness = 1 - $width / self::RANK_SPAN;
        $centrality = 1 - abs($query->level->rank - $center) / ($width / 2 + 1);
        $value = 0.7 * $narrowness + 0.3 * $centrality;

        return max(0.0, min(1.0, $teaching->is_major ? $value : $value * 0.8));
    }

    public function reason(Candidate $candidate, MatchQuery $query): ?string
    {
        $teaching = $candidate->teaching;
        if (! $teaching->is_major) {
            return null;
        }

        $levels = Level::query()
            ->whereBetween('rank', [$teaching->level_min_rank, $teaching->level_max_rank])
            ->orderBy('rank')
            ->pluck('name');

        if ($levels->count() <= 2) {
            return 'Spécialiste '.$levels->implode(' & ');
        }

        $cycle = Level::cycleOfRank($teaching->level_min_rank);
        if ($cycle === Level::cycleOfRank($teaching->level_max_rank)) {
            return 'Spécialiste du '.mb_strtolower(Level::CYCLE_LABELS[$cycle]);
        }

        return null;
    }
}
