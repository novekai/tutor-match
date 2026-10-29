<?php

namespace App\Matching;

use App\Models\Level;
use App\Models\Subject;

final readonly class MatchQuery
{
    public function __construct(
        public Level $level,
        public Subject $subject,
        public AvailabilitySelection $availability,
        public ?string $objective = null,
    ) {}
}
