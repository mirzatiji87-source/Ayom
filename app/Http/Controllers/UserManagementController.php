<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDependentRequest;
use App\Models\ActivityLog;
use App\Models\Family;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\QueryException;
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
            // Dipakai tombol "Tambah anggota" di halaman detail keluarga
            // supaya keluarga yang dipilih langsung terisi.
            'selectedFamilyId' => request()->integer('family_id') ?: null,
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

            if ($user->role !== 'orang_tua') {
                Wallet::create([
                    'user_id' => $user->id,
                    'daily_limit' => $request->daily_limit ?? 50000,
                    'monthly_limit' => $request->monthly_limit ?? 1000000,
                    'approval_threshold' => $request->approval_threshold ?? 100000,
                ]);
            }

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

    /**
     * Nonaktifkan akun (soft-disable), bukan hard delete,
     * supaya histori transaksi tetap utuh.
     */
    public function destroy(User $user): RedirectResponse
    {
        $actor = Auth::user();

        $this->authorizeOverMember($actor, $user);

        if ($user->id === $actor->id) {
            return back()->with('error', 'Kamu tidak bisa menonaktifkan akunmu sendiri.');
        }

        $user->update(['is_active' => false]);

        ActivityLog::record('deactivate_dependent', $actor, $user);

        return redirect()->back()->with('success', "Akun {$user->name} dinonaktifkan.");
    }

    /** Aktifkan kembali akun yang tadi dinonaktifkan. */
    public function reactivate(User $user): RedirectResponse
    {
        $actor = Auth::user();

        $this->authorizeOverMember($actor, $user);

        $user->update(['is_active' => true]);

        ActivityLog::record('reactivate_dependent', $actor, $user);

        return redirect()->back()->with('success', "Akun {$user->name} diaktifkan kembali.");
    }

    /**
     * Hapus permanen. Khusus admin, dan hanya untuk akun "bersih"
     * (misalnya akun dobel yang baru dibuat): tanpa transaksi dan tanpa saldo.
     * Selain itu, pakai Nonaktifkan supaya histori keuangan tidak hilang.
     */
    public function forceDestroy(User $user): RedirectResponse
    {
        /** @var User $actor */
        $actor = Auth::user();

        abort_unless($actor->isAdmin(), 403, 'Hanya admin yang boleh menghapus akun permanen.');

        if ($user->id === $actor->id || $user->isAdmin()) {
            return back()->with('error', 'Akun admin tidak bisa dihapus dari sini.');
        }

        if ($user->transactions()->exists()) {
            return back()->with('error', 'Akun ini sudah punya riwayat transaksi, jadi tidak bisa dihapus permanen. Gunakan Nonaktifkan.');
        }

        if ($user->wallet && (float) $user->wallet->balance > 0) {
            return back()->with('error', 'Akun ini masih punya saldo. Kosongkan saldo dulu atau gunakan Nonaktifkan.');
        }

        if ($user->role === 'orang_tua') {
            $orangTuaLain = User::where('family_id', $user->family_id)
                ->where('role', 'orang_tua')
                ->where('is_active', true)
                ->where('id', '!=', $user->id)
                ->exists();

            if (!$orangTuaLain) {
                return back()->with('error', 'Ini satu-satunya orang tua aktif di keluarga ini, jadi tidak bisa dihapus.');
            }
        }

        $nama = $user->name;

        try {
            DB::transaction(function () use ($user, $actor) {
                ActivityLog::record('delete_dependent', $actor, $user, [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]);

                $user->wallet?->delete();
                $user->delete();
            });
        } catch (QueryException $e) {
            report($e);

            return back()->with('error', 'Akun ini masih terhubung ke data lain, jadi gagal dihapus. Gunakan Nonaktifkan.');
        }

        return redirect()->back()->with('success', "Akun {$nama} dihapus permanen.");
    }

    public function families()
    {
        return Inertia::render('Admin/Families', [
            'families' => Family::withCount('members')->with('owner:id,name')->paginate(20),
        ]);
    }

    /** Detail satu keluarga beserta semua anggotanya. */
    public function showFamily(Family $family): Response
    {
        $family->load('owner:id,name');

        $members = $family->members()
            ->with('wallet:id,user_id,balance')
            ->withCount('transactions')
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        // Tandai kemungkinan akun dobel: nama dan peran yang sama dalam satu keluarga.
        $kunci = $members->map(fn($m) => mb_strtolower(trim($m->name)) . '|' . $m->role);
        $jumlah = $kunci->countBy();

        $rows = $members->values()->map(function ($m, $i) use ($kunci, $jumlah) {
            return [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'role' => $m->role,
                'is_active' => (bool) ($m->is_active ?? true),
                'balance' => (float) ($m->wallet?->balance ?? 0),
                'transactions_count' => $m->transactions_count,
                'possible_duplicate' => ($jumlah[$kunci[$i]] ?? 0) > 1,
                'created_at' => $m->created_at,
            ];
        });

        return Inertia::render('Admin/FamilyShow', [
            'family' => [
                'id' => $family->id,
                'name' => $family->name,
                'owner' => $family->owner?->name,
            ],
            'members' => $rows,
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