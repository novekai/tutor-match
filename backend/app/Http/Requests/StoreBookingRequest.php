<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tutorId' => ['required', 'integer', 'exists:tutors,id'],
            'level' => ['required', 'string', 'exists:levels,slug'],
            'subject' => ['required', 'string', 'exists:subjects,slug'],
            'startsAt' => ['required', 'date'],
            'childFirstName' => ['required', 'string', 'max:60'],
            'parentName' => ['required', 'string', 'max:100'],
            'parentEmail' => ['required', 'email', 'max:150'],
            'smsReminder' => ['sometimes', 'boolean'],
            'objective' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'tutorId.required' => 'Le tuteur est obligatoire.',
            'tutorId.integer' => 'Le tuteur est invalide.',
            'tutorId.exists' => 'Ce tuteur n’existe pas.',
            'level.required' => 'Le niveau est obligatoire.',
            'level.exists' => 'Ce niveau n’existe pas.',
            'subject.required' => 'La matière est obligatoire.',
            'subject.exists' => 'Cette matière n’existe pas.',
            'startsAt.required' => 'Choisissez un créneau.',
            'startsAt.date' => 'Le créneau est invalide.',
            'childFirstName.required' => 'Indiquez le prénom de l’enfant.',
            'childFirstName.max' => 'Le prénom ne doit pas dépasser 60 caractères.',
            'parentName.required' => 'Indiquez votre nom.',
            'parentName.max' => 'Le nom ne doit pas dépasser 100 caractères.',
            'parentEmail.required' => 'Indiquez votre adresse e-mail.',
            'parentEmail.email' => 'L’adresse e-mail n’est pas valide.',
            'parentEmail.max' => 'L’adresse e-mail ne doit pas dépasser 150 caractères.',
            'smsReminder.boolean' => 'Le rappel SMS doit être vrai ou faux.',
            'objective.max' => 'L’objectif ne doit pas dépasser 500 caractères.',
            '*.string' => 'Ce champ doit être un texte.',
        ];
    }
}
