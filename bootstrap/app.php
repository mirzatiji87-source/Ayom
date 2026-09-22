<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);

        // Midtrans manggil endpoint ini langsung dari server mereka
        // (bukan dari form browser user), jadi harus dikecualikan dari
        // proteksi CSRF - kalau enggak, notifikasi mereka bakal ditolak
        // dan saldo gak pernah ke-update walau pembayaran sukses.
        $middleware->validateCsrfTokens(except: [
            'midtrans/notification',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();