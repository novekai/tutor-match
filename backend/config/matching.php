<?php

use App\Matching\Criteria\AvailabilityCriterion;
use App\Matching\Criteria\ExperienceCriterion;
use App\Matching\Criteria\LessonsCountCriterion;
use App\Matching\Criteria\LevelSpecializationCriterion;
use App\Matching\Criteria\RatingCriterion;

return [

    'timezone' => 'Europe/Paris',

    // Créneaux proposés : à partir de maintenant + min_notice_hours, sur horizon_days jours.
    'horizon_days' => 28,
    'min_notice_hours' => 2,
    'step_minutes' => 30,
    'lesson_minutes' => 90,

    // Un créneau appartient au moment qui contient son heure de début [start, end[.
    'periods' => [
        'matin' => ['name' => 'Matin', 'start' => '09:00', 'end' => '12:00'],
        'apres-midi' => ['name' => 'Après-midi', 'start' => '14:00', 'end' => '18:00'],
        'soir' => ['name' => 'Soir', 'start' => '18:00', 'end' => '20:00'],
    ],

    // 1 = lundi … 7 = dimanche (ISO 8601).
    'days' => [
        1 => ['short' => 'Lun', 'name' => 'Lundi'],
        2 => ['short' => 'Mar', 'name' => 'Mardi'],
        3 => ['short' => 'Mer', 'name' => 'Mercredi'],
        4 => ['short' => 'Jeu', 'name' => 'Jeudi'],
        5 => ['short' => 'Ven', 'name' => 'Vendredi'],
        6 => ['short' => 'Sam', 'name' => 'Samedi'],
        7 => ['short' => 'Dim', 'name' => 'Dimanche'],
    ],

    // Critère => poids (points maximum). Le score total est la somme des points (0-100).
    'criteria' => [
        AvailabilityCriterion::class => 30,
        RatingCriterion::class => 30,
        ExperienceCriterion::class => 20,
        LessonsCountCriterion::class => 10,
        LevelSpecializationCriterion::class => 10,
    ],

    'rating' => [
        'prior_mean' => 4.5,   // note moyenne supposée d'un tuteur sans avis
        'prior_weight' => 10,  // nombre d'avis « virtuels » à cette moyenne
        'floor' => 4.0,        // note bayésienne valant 0 point
    ],
    'experience_cap_years' => 10,
    'lessons_reference' => 500,

    // Suggestions de créneaux à ajouter quand il y a moins de N résultats.
    'suggestions' => ['below' => 3, 'max' => 4],

];
