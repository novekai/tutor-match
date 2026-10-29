<?php

namespace App\Matching\Criteria;

use App\Matching\Candidate;
use App\Matching\MatchQuery;

/** Échelle logarithmique : les 100 premiers cours comptent plus que les suivants. */
class LessonsCountCriterion implements Criterion
{
    public function key(): string
    {
        return 'lessons';
    }

    public function label(): string
    {
        return 'Cours réalisés';
    }

    public function score(Candidate $candidate, MatchQuery $query): float
    {
        $reference = config('matching.lessons_reference');

        return min(1.0, log(1 + $candidate->tutor->lessons_count) / log(1 + $reference));
    }

    public function reason(Candidate $candidate, MatchQuery $query): ?string
    {
        $count = $candidate->tutor->lessons_count;

        return $count >= 200 ? $count.' cours donnés' : null;
    }
}
