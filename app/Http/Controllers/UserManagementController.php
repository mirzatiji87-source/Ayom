<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Family;
use App\Models\User;
use App\Models\Wallet;
use App\Http\Requests\StoreDependentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function create(): Response
{
    /** @var User $actor */
    $actor = Auth::user();

    return Inertia::render('OrangTua/CreateDependent', [
        'families' => $actor->isAdmin()
            ? Family::select('id', 'name')->get()
            : [],
    ]);
}

    public function store(StoreDependentRequest $request): RedirectResponse
    {
        $actor = $request->user();

        $familyId = $actor->isAdmin() ? $request->family_id : $actor->family_id;

        $user = DB::transaction(function () use ($request, $actor, $familyId) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'family_id' => $familyId,
                'created_by' => $actor->id,
                'phone' => $request->phone,
                'date_of_birth' => $request->date_of_birth,
            ]);

            Wallet::create([
                'user_id' => $user->id,
                'daily_limit' => $request->daily_limit ?? 50000,
                'monthly_limit' => $request->monthly_limit ?? 1000000,
                'approval_threshold' => $request->approval_threshold ?? 100000,
            ]);

            ActivityLog::record('create_dependent', $actor, $user, [
                'role' => $user->role,
            ]);

            return $user;
        });

        return redirect()->back()->with('success', "Akun {$user->role} untuk {$user->name} berhasil dibuat.");
    }

    public function update(StoreDependentRequest $request, User $user): RedirectResponse
    {
        $this->authorizeOverMember($request->user(), $user);

        $user->update($request->only(['name', 'email', 'phone', 'date_of_birth']));

        ActivityLog::record('update_dependent', $request->user(), $user);

        return redirect()->back()->with('success', 'Data akun diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeOverMember(Auth::user(), $user);

        // Soft-disable, bukan hard delete, supaya histori transaksi tetap utuh.
        $user->update(['is_active' => false]);

        ActivityLog::record('deactivate_dependent', Auth::user(), $user);

        return redirect()->back()->with('success', 'Akun dinonaktifkan.');
    }

    public function families()
    {
        return Inertia::render('Admin/Families', [
            'families' => Family::withCount('members')->with('owner:id,name')->paginate(20),
        ]);
    }

    /** Pastikan admin, atau orang_tua yang memang guardian dari $member. */
    protected function authorizeOverMember(User $actor, User $member): void
    {
        abort_unless(
            $actor->isAdmin() || $actor->isGuardianOf($member),
            403,
            'Anda tidak berhak mengelola akun ini.'
        );
    }
}