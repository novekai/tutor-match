<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorTeaching extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'level_min_rank' => 'integer',
        'level_max_rank' => 'integer',
        'is_major' => 'boolean',
    ];

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function covers(int $rank): bool
    {
        return $rank >= $this->level_min_rank && $rank <= $this->level_max_rank;
    }
}
