<?php

namespace App\Matching\Criteria;

use App\Matching\Candidate;
use App\Matching\MatchQuery;

/** Critère de classement : ajouter un critère = une classe + une ligne dans config/matching.php. */
interface Criterion
{
    public function key(): string;

    public function label(): string;

    /** Valeur normalisée entre 0 et 1, multipliée ensuite par le poids configuré. */
    public function score(Candidate $candidate, MatchQuery $query): float;

    /** Raison lisible affichée au parent, ou null si le critère n'est pas un point fort. */
    public function reason(Candidate $candidate, MatchQuery $query): ?string;
}
