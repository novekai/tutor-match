<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    public const CYCLE_LABELS = [
        'primaire' => 'Primaire',
        'college' => 'Collège',
        'lycee' => 'Lycée',
    ];

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = ['rank' => 'integer'];

    public function cycleLabel(): string
    {
        return self::CYCLE_LABELS[$this->cycle];
    }

    public static function cycleOfRank(int $rank): string
    {
        return match (true) {
            $rank <= 5 => 'primaire',
            $rank <= 9 => 'college',
            default => 'lycee',
        };
    }
}
