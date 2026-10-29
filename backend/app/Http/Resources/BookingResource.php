<?php

namespace App\Http\Resources;

use App\Models\Booking;
use App\Support\FrenchDate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Booking */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $startsAt = FrenchDate::local($this->starts_at);
        $endsAt = FrenchDate::local($this->ends_at);

        return [
            'reference' => $this->reference,
            'status' => $this->status,
            'startsAt' => $startsAt->toIso8601String(),
            'endsAt' => $endsAt->toIso8601String(),
            'dateLabel' => FrenchDate::longDateLabel($startsAt, $endsAt),
            'shortDateLabel' => FrenchDate::shortDateLabel($startsAt, $endsAt),
            'timezone' => config('matching.timezone'),
            'durationLabel' => FrenchDate::duration((int) $startsAt->diffInMinutes($endsAt)),
            'tutor' => [
                'id' => $this->tutor->id,
                'displayName' => $this->tutor->displayName(),
                'firstName' => $this->tutor->first_name,
                'photoUrl' => $this->tutor->photo_url,
                'credential' => $this->tutor->credential,
                'school' => $this->tutor->school,
                'rating' => $this->tutor->rating,
            ],
            'subject' => new SubjectResource($this->subject),
            'level' => new LevelResource($this->level),
            'childFirstName' => $this->child_first_name,
            'parentName' => $this->parent_name,
            'parentEmail' => $this->parent_email,
            'smsReminder' => $this->sms_reminder,
            'objective' => $this->objective,
            'createdAt' => FrenchDate::local($this->created_at)->toIso8601String(),
        ];
    }
}
