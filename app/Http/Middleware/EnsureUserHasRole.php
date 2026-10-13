<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        if (! $user->is_active) {
            abort(403, 'Akun Anda sudah dinonaktifkan.');
        }

        if ($user->isDeceased()) {
            abort(403, 'Akun ini tercatat milik anggota yang telah meninggal dunia (laporan terverifikasi di Ayom). Hubungi keluarga atau admin.');
        }

        return $next($request);
    }
}