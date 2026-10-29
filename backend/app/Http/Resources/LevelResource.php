<?php

namespace App\Http\Resources;

use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Level */
class LevelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'cycle' => $this->cycle,
            'cycleLabel' => $this->cycleLabel(),
            'rank' => $this->rank,
        ];
    }
}
