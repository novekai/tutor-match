<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tutor extends Model
{
    protected $guarded = [];

    protected $casts = [
        'tags' => 'array',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'years_experience' => 'integer',
        'lessons_count' => 'integer',
        'response_rate' => 'integer',
        'hourly_rate' => 'integer',
        'lesson_minutes' => 'integer',
    ];

    public function teachings(): HasMany
    {
        return $this->hasMany(TutorTeaching::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function displayName(): string
    {
        return $this->first_name.' '.mb_substr($this->last_name, 0, 1).'.';
    }

    public function initials(): string
    {
        return mb_strtoupper(mb_substr($this->first_name, 0, 1).mb_substr($this->last_name, 0, 1));
    }

    public function teachingFor(Subject $subject): ?TutorTeaching
    {
        return $this->teachings->firstWhere('subject_id', $subject->id);
    }

    /** « Collège · Lycée » : cycles couverts par l'ensemble des matières enseignées. */
    public function levelsLabel(): string
    {
        $cycles = [];
        foreach ($this->teachings as $teaching) {
            for ($rank = $teaching->level_min_rank; $rank <= $teaching->level_max_rank; $rank++) {
                $cycles[Level::cycleOfRank($rank)] = true;
            }
        }

        return collect(Level::CYCLE_LABELS)
            ->filter(fn ($label, $cycle) => isset($cycles[$cycle]))
            ->implode(' · ');
    }
}
