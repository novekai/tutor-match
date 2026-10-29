<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// SPA React : le build Vite est écrit dans public/ (index.html + assets/).
$spa = function (Request $request) {
    if ($request->is('api', 'api/*')) {
        abort(404);
    }

    $index = public_path('index.html');
    if (! is_file($index)) {
        return response('Front non construit.', 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    return response()->file($index, ['Content-Type' => 'text/html; charset=utf-8', 'Cache-Control' => 'no-cache']);
};

Route::get('/', $spa);
Route::fallback($spa);
