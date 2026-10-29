<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TutorSlotsRequest;
use App\Http\Resources\TutorDetailResource;
use App\Matching\AvailabilitySelection;
use App\Matching\MatchingService;
use App\Matching\MatchQuery;
use App\Matching\Slot;
use App\Matching\SlotGenerator;
use App\Models\Level;
use App\Models\Subject;
use App\Models\Tutor;
use App\Support\FrenchDate;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TutorController extends Controller
{
    public function show(Request $request, Tutor $tutor, MatchingService $matching): TutorDetailResource
    {
        $tutor->load('teachings.subject');

        // Le score n'est calculé que si la recherche complète est fournie en query string.
        $level = Level::where('slug', (string) $request->query('level'))->first();
        $subject = Subject::where('slug', (string) $request->query('subject'))->first();
        $selection = AvailabilitySelection::fromQueryString((string) $request->query('availability'));

        $candidate = $level && $subject && ! $selection->isEmpty()
            ? $matching->evaluate($tutor, new MatchQuery($level, $subject, $selection))
            : null;

        return new TutorDetailResource($tutor, $candidate);
    }

    public function slots(TutorSlotsRequest $request, Tutor $tutor, SlotGenerator $generator): JsonResponse
    {
        $timezone = config('matching.timezone');
        $currentWeek = CarbonImmutable::now($timezone)->startOfWeek(CarbonInterface::MONDAY);
        $weekStart = $request->validated('week')
            ? CarbonImmutable::parse($request->validated('week'), $timezone)->startOfWeek(CarbonInterface::MONDAY)
            : $currentWeek;
        $nextWeekStart = $weekStart->addWeek();
        $selection = AvailabilitySelection::fromQueryString($request->validated('availability'));

        $slotsByDate = $generator
            ->forTutor($tutor->load('availabilities'), $weekStart, $nextWeekStart)
            ->groupBy(fn (Slot $slot) => $slot->startsAt->toDateString());

        $days = [];
        for ($date = $weekStart; $date < $nextWeekStart; $date = $date->addDay()) {
            $days[] = [
                'date' => $date->toDateString(),
                'label' => FrenchDate::dayLabel($date),
                'slots' => $slotsByDate->get($date->toDateString(), collect())
                    ->map(fn (Slot $slot) => $slot->toArray($selection))
                    ->values(),
            ];
        }

        return response()->json([
            'weekStart' => $weekStart->toDateString(),
            'weekEnd' => $weekStart->addDays(6)->toDateString(),
            'label' => FrenchDate::weekLabel($weekStart, $weekStart->addDays(6)),
            'previousWeek' => $weekStart > $currentWeek ? $weekStart->subWeek()->toDateString() : null,
            'nextWeek' => $nextWeekStart < $generator->horizonEnd() ? $nextWeekStart->toDateString() : null,
            'days' => $days,
        ]);
    }
}
