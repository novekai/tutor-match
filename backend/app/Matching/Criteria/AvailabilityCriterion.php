<?php

namespace App\Matching\Criteria;

use App\Matching\Candidate;
use App\Matching\MatchQuery;

/** Part des plages cochées (jour × moment) où le tuteur a au moins un créneau libre. */
class AvailabilityCriterion implements Criterion
{
    public function key(): string
    {
        return 'availability';
    }

    public function label(): string
    {
        return 'Disponibilités';
    }

    public function score(Candidate $candidate, MatchQuery $query): float
    {
        $requested = $query->availability->count();

        return $requested === 0 ? 0.0 : min(1.0, $candidate->coveredSelectionCount() / $requested);
    }

    public function reason(Candidate $candidate, MatchQuery $query): ?string
    {
        $covered = $candidate->coveredSelectionCount();
        $requested = $query->availability->count();

        if ($requested > 1 && $covered === $requested) {
            return 'Disponible sur toutes vos plages';
        }

        if ($requested === 1) {
            return 'Disponible sur votre plage';
        }

        return 'Disponible sur '.$covered.' de vos '.$requested.' plages';
    }
}
