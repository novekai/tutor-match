<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MatchRequest;
use App\Http\Resources\LevelResource;
use App\Http\Resources\SubjectResource;
use App\Http\Resources\TutorMatchResource;
use App\Matching\Candidate;
use App\Matching\MatchingService;
use Illuminate\Http\JsonResponse;

class MatchController extends Controller
{
    public function __invoke(MatchRequest $request, MatchingService $matching): JsonResponse
    {
        $query = $request->toMatchQuery();
        $result = $matching->match($query);

        return response()->json([
            'query' => [
                'level' => new LevelResource($query->level),
                'subject' => new SubjectResource($query->subject),
                'availability' => $query->availability->toArray(),
            ],
            'total' => $result['tutors']->count(),
            'tutors' => $result['tutors']
                ->map(fn (Candidate $candidate, int $index) => new TutorMatchResource(
                    $candidate,
                    $query->availability,
                    isBestMatch: $index === 0,
                ))
                ->values(),
            'suggestions' => $result['suggestions'],
        ]);
    }
}
