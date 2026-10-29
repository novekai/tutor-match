<?php

namespace App\Http\Requests;

use App\Matching\AvailabilitySelection;
use App\Matching\MatchQuery;
use App\Models\Level;
use App\Models\Subject;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MatchRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'level' => ['required', 'string', 'exists:levels,slug'],
            'subject' => ['required', 'string', 'exists:subjects,slug'],
            'availability' => ['required', 'array', 'min:1', 'max:21'],
            'availability.*' => ['array:day,period'],
            'availability.*.day' => ['required', 'integer', 'between:1,7'],
            'availability.*.period' => ['required', 'string', Rule::in(array_keys(config('matching.periods')))],
            'objective' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'level.required' => 'Choisissez le niveau de l’élève.',
            'level.exists' => 'Ce niveau n’existe pas.',
            'subject.required' => 'Choisissez une matière.',
            'subject.exists' => 'Cette matière n’existe pas.',
            'availability.required' => 'Sélectionnez au moins un créneau.',
            'availability.array' => 'Les créneaux sont invalides.',
            'availability.min' => 'Sélectionnez au moins un créneau.',
            'availability.max' => 'Sélectionnez au plus 21 créneaux.',
            'availability.*.array' => 'Ce créneau est invalide.',
            'availability.*.day.*' => 'Le jour doit être compris entre 1 (lundi) et 7 (dimanche).',
            'availability.*.period.*' => 'Le moment doit être matin, après-midi ou soir.',
            'objective.string' => 'L’objectif doit être un texte.',
            'objective.max' => 'L’objectif ne doit pas dépasser 500 caractères.',
        ];
    }

    public function toMatchQuery(): MatchQuery
    {
        return new MatchQuery(
            Level::where('slug', $this->validated('level'))->firstOrFail(),
            Subject::where('slug', $this->validated('subject'))->firstOrFail(),
            new AvailabilitySelection($this->validated('availability')),
            $this->validated('objective'),
        );
    }
}
