<?php

namespace App\Providers;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
        Carbon::setLocale(config('app.locale'));
        CarbonImmutable::setLocale(config('app.locale'));
    }
}
