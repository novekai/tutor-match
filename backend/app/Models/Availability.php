<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = ['weekday' => 'integer'];

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }
}
