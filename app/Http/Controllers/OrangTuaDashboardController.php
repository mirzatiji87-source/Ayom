<?php

namespace App\Http\Controllers;

use App\Models\ApprovalRequest;
use App\Models\Task;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrangTuaDashboardController extends Controller
{
    public function index(): Response
{
    /** @var User $actor */
    $actor = Auth::user();

    $family = $actor->family()
        ->withCount('members')
        ->firstOrFail();

    $familyId = $actor->family_id;

    // Semua dependent (lansia/remaja) dalam family yang sama
    $members = User::where('family_id', $familyId)
        ->whereIn('role', ['lansia', 'remaja'])
        ->where('is_active', true)
        ->with('wallet')
        ->orderBy('name')
        ->get();

    // Approval yang masih pending
    $pendingApprovals = ApprovalRequest::pending()
        ->whereHas(
            'requester',
            fn ($q) => $q->where('family_id', $familyId)
        )
        ->with([
            'transaction',
            'requester:id,name,role',
        ])
        ->latest()
        ->take(5)
        ->get();

    $pendingApprovalsCount = ApprovalRequest::pending()
        ->whereHas(
            'requester',
            fn ($q) => $q->where('family_id', $familyId)
        )
        ->count();

    // Misi remaja yang sudah disubmit
    $pendingTasksCount = Task::where('family_id', $familyId)
        ->submitted()
        ->count();

    // Transaksi terbaru seluruh anggota family
    $recentTransactions = Transaction::forFamily($familyId)
        ->with('user:id,name,role')
        ->latest()
        ->take(8)
        ->get();

    // Total pengeluaran bulan berjalan
    $monthlyExpense = Transaction::forFamily($familyId)
        ->whereIn('type', ['expense', 'bill_payment'])
        ->where('status', 'completed')
        ->whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->sum('amount');

    return Inertia::render('OrangTua/Dashboard', [
        'family' => [
            'name' => $family->name,
            'balance' => $family->balance,
            'members_count' => $family->members_count,
        ],

        'members' => $members->map(fn (User $member) => [
            'id' => $member->id,
            'name' => $member->name,
            'role' => $member->role,

            'wallet' => $member->wallet
                ? [
                    'balance' => $member->wallet->balance,
                    'daily_limit' => $member->wallet->daily_limit,
                    'monthly_limit' => $member->wallet->monthly_limit,
                    'daily_spent' => $member->wallet->daily_spent,
                    'monthly_spent' => $member->wallet->monthly_spent,
                ]
                : null,
        ]),

        'pendingApprovals' => $pendingApprovals,
        'pendingApprovalsCount' => $pendingApprovalsCount,
        'pendingTasksCount' => $pendingTasksCount,
        'recentTransactions' => $recentTransactions,
        'monthlyExpense' => $monthlyExpense,
    ]);
}
}