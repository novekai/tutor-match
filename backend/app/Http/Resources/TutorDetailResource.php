<?php

namespace App\Http\Resources;

use App\Matching\Candidate;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property Tutor $resource */
class TutorDetailResource extends JsonResource
{
    public function __construct(Tutor $tutor, private readonly ?Candidate $candidate = null)
    {
        parent::__construct($tutor);
    }

    public function toArray(Request $request): array
    {
        $data = [
            ...(new TutorSummaryResource($this->resource))->toArray($request),
            'bio' => $this->resource->bio,
            'tags' => $this->resource->tags ?? [],
        ];

        if ($this->candidate !== null) {
            $data['score'] = $this->candidate->score;
            $data['matchReasons'] = $this->candidate->reasons;
        }

        return $data;
    }
}
