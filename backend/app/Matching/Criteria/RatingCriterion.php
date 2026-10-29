<?php

namespace App\Matching\Criteria;

use App\Matching\Candidate;
use App\Matching\MatchQuery;

/**
 * Moyenne bayésienne : (C × m + n × note) / (C + n). Un 5/5 sur 2 avis ne passe pas
 * devant un 4,8/5 sur 80 avis. Normalisée entre la note plancher (0) et 5 (1).
 */
class RatingCriterion implements Criterion
{
    public function key(): string
    {
        return 'rating';
    }

    public function label(): string
    {
        return 'Évaluations';
    }

    public function bayesianRating(Candidate $candidate): float
    {
        $prior = config('matching.rating.prior_mean');
        $weight = config('matching.rating.prior_weight');
        $count = $candidate->tutor->reviews_count;

        return ($weight * $prior + $count * $candidate->tutor->rating) / ($weight + $count);
    }

    public function score(Candidate $candidate, MatchQuery $query): float
    {
        $floor = config('matching.rating.floor');

        return max(0.0, min(1.0, ($this->bayesianRating($candidate) - $floor) / (5 - $floor)));
    }

    public function reason(Candidate $candidate, MatchQuery $query): ?string
    {
        $tutor = $candidate->tutor;
        if ($tutor->rating < 4.7 || $tutor->reviews_count < 10) {
            return null;
        }

        return number_format($tutor->rating, 1, ',', '').'/5 sur '.$tutor->reviews_count.' avis';
    }
}
