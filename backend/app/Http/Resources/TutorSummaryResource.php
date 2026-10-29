<?php

namespace App\Http\Resources;

use App\Models\Tutor;
use App\Models\TutorTeaching;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Tutor */
class TutorSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'displayName' => $this->displayName(),
            'firstName' => $this->first_name,
            'photoUrl' => $this->photo_url,
            'credential' => $this->credential,
            'school' => $this->school,
            'headline' => $this->headline,
            'rating' => $this->rating,
            'reviewsCount' => $this->reviews_count,
            'yearsExperience' => $this->years_experience,
            'lessonsCount' => $this->lessons_count,
            'responseRate' => $this->response_rate,
            'hourlyRate' => $this->hourly_rate,
            'lessonMinutes' => $this->lesson_minutes,
            'levelsLabel' => $this->levelsLabel(),
            'subjects' => $this->teachings
                ->sortBy([['is_major', 'desc'], ['subject.position', 'asc']])
                ->map(fn (TutorTeaching $teaching) => [
                    'slug' => $teaching->subject->slug,
                    'name' => $teaching->subject->name,
                    'isMajor' => $teaching->is_major,
                ])
                ->values()
                ->all(),
        ];
    }
}
