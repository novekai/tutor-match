<?php

namespace App\Matching\Criteria;

use App\Matching\Candidate;
use App\Matching\MatchQuery;

class ExperienceCriterion implements Criterion
{
    public function key(): string
    {
        return 'experience';
    }

    public function label(): string
    {
        return 'Expérience';
    }

    public function score(Candidate $candidate, MatchQuery $query): float
    {
        return min(1.0, $candidate->tutor->years_experience / config('matching.experience_cap_years'));
    }

    public function reason(Candidate $candidate, MatchQuery $query): ?string
    {
        $years = $candidate->tutor->years_experience;

        return $years >= 5 ? $years.' ans d’expérience' : null;
    }
}
