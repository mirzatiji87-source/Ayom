<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GuardianViewController extends Controller
{
    public function index(): Response
    {
        $familyId = Auth::user()->family_id;

        $members = User::where('family_id', $familyId)
            ->whereIn('role', ['lansia', 'remaja'])
            ->with('wallet')
            ->get();

        $transactions = Transaction::forFamily($familyId)
            ->with('user:id,name,role')
            ->latest()
            ->paginate(20);

        return Inertia::render('OrangTua/GuardianView', [
            'members' => $members,
            'transactions' => $transactions,
        ]);
    }

    public function show(User $user): Response
{
    /** @var User $actor */
    $actor = Auth::user();

    abort_unless($actor->isGuardianOf($user), 403);

    return Inertia::render('OrangTua/GuardianMemberDetail', [
        'member' => $user->load('wallet'),
        'transactions' => $user->transactions()
            ->latest()
            ->paginate(20),
    ]);
}
}