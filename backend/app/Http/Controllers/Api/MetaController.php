<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LevelResource;
use App\Http\Resources\SubjectResource;
use App\Models\Level;
use App\Models\Subject;
use App\Models\Tutor;
use Illuminate\Http\JsonResponse;

class MetaController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'levels' => LevelResource::collection(Level::orderBy('rank')->get()),
            'subjects' => SubjectResource::collection(Subject::orderBy('position')->get()),
            'periods' => collect(config('matching.periods'))
                ->map(fn (array $period, string $slug) => [
                    'slug' => $slug,
                    'name' => $period['name'],
                    'range' => $this->hour($period['start']).' – '.$this->hour($period['end']),
                ])
                ->values(),
            'days' => collect(config('matching.days'))
                ->map(fn (array $day, int $value) => ['value' => $value, ...$day])
                ->values(),
            'tutorsCount' => Tutor::count(),
        ]);
    }

    /** « 09:00 » → « 9h », « 14:30 » → « 14h30 » */
    private function hour(string $time): string
    {
        [$hours, $minutes] = explode(':', $time);

        return (int) $hours.'h'.($minutes === '00' ? '' : $minutes);
    }
}
