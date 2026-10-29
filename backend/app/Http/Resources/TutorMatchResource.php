<?php

namespace App\Http\Resources;

use App\Matching\AvailabilitySelection;
use App\Matching\Candidate;
use App\Matching\Slot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property Candidate $resource */
class TutorMatchResource extends JsonResource
{
    private const SLOTS_PREVIEW = 3;

    public function __construct(
        Candidate $candidate,
        private readonly AvailabilitySelection $selection,
        private readonly bool $isBestMatch = false,
    ) {
        parent::__construct($candidate);
    }

    public function toArray(Request $request): array
    {
        $candidate = $this->resource;

        return [
            ...(new TutorSummaryResource($candidate->tutor))->toArray($request),
            'score' => $candidate->score,
            'isBestMatch' => $this->isBestMatch,
            'scoreBreakdown' => $candidate->breakdown,
            'matchReasons' => $candidate->reasons,
            'compatibleSlotsCount' => $candidate->compatibleSlots->count(),
            'compatibleSlots' => $candidate->previewSlots(self::SLOTS_PREVIEW)
                ->map(fn (Slot $slot) => $slot->toArray($this->selection))
                ->all(),
        ];
    }
}
