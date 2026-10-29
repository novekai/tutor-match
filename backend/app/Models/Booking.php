<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    public const STATUS_CONFIRMED = 'confirmed';

    protected $guarded = [];

    // Format avec décalage : les instants restent exacts quel que soit le fuseau de la session SQL.
    protected $dateFormat = 'Y-m-d H:i:sP';

    protected $casts = [
        'starts_at' => 'immutable_datetime',
        'ends_at' => 'immutable_datetime',
        'sms_reminder' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }
}
