<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Family;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['required', 'string', 'regex:/^[0-9+\s-]{8,20}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.regex' => 'Nomor HP tidak valid. Gunakan angka saja, contoh 081234567890.',
        ]);

        $user = DB::transaction(function () use ($request) {
            $family = Family::create([
                'name' => 'Keluarga ' . $request->name,
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'orang_tua',
                'family_id' => $family->id,
            ]);

            $family->update(['owner_id' => $user->id]);

            Wallet::create(['user_id' => $user->id, 'balance' => 0]);

            ActivityLog::record('register', $user, $user);

            return $user;
        });

        try {
            event(new Registered($user));
        } catch (\Throwable $e) {
            Log::error('Gagal kirim email verifikasi', ['error' => $e->getMessage()]);
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
