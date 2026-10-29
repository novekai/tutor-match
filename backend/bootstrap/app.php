<?php

use App\Models\Booking;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn (Request $request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen($isApi);

        // Messages d'erreur en français, au format du contrat d'API.
        $exceptions->render(function (ValidationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json([
                    'message' => collect($e->errors())->flatten()->first() ?? 'Données invalides.',
                    'errors' => $e->errors(),
                ], $e->status);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                $message = match (($e->getPrevious() instanceof ModelNotFoundException) ? $e->getPrevious()->getModel() : null) {
                    Tutor::class => 'Tuteur introuvable.',
                    Booking::class => 'Réservation introuvable.',
                    default => 'Ressource introuvable.',
                };

                return response()->json(['message' => $message], 404);
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json(
                    ['message' => 'Trop de tentatives, réessayez dans une minute.'],
                    429,
                    $e->getHeaders(),
                );
            }
        });
    })->create();
