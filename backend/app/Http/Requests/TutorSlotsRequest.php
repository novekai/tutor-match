<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TutorSlotsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'week' => ['nullable', 'date_format:Y-m-d'],
            'availability' => ['nullable', 'string', 'max:300'],
        ];
    }

    public function messages(): array
    {
        return [
            'week.date_format' => 'La semaine doit être une date au format AAAA-MM-JJ.',
            'availability.*' => 'Les créneaux sont invalides.',
        ];
    }
}
