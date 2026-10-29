<?php

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\MetaController;
use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::get('meta', MetaController::class);
Route::post('match', MatchController::class)->middleware('throttle:60,1');

Route::get('tutors/{tutor}', [TutorController::class, 'show'])->whereNumber('tutor');
Route::get('tutors/{tutor}/slots', [TutorController::class, 'slots'])->whereNumber('tutor');

Route::post('bookings', [BookingController::class, 'store'])->middleware('throttle:10,1');
Route::get('bookings/{booking}', [BookingController::class, 'show']);
Route::get('bookings/{booking}/ics', [BookingController::class, 'ics']);
