<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RemajaDashboardController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $user->wallet?->resetCountersIfNeeded();

        return Inertia::render('Remaja/Dashboard', [
            'wallet' => $user->wallet,

            'taskStats' => [
                'open' => $user->tasksAssigned()->open()->count(),
                'submitted' => $user->tasksAssigned()->submitted()->count(),
                'approved' => $user->tasksAssigned()
                    ->where('status', 'approved')
                    ->count(),
            ],

            'upcomingTasks' => $user->tasksAssigned()
                ->open()
                ->orderBy('due_date')
                ->limit(3)
                ->get([
                    'id',
                    'title',
                    'reward_amount',
                    'due_date',
                ]),

            'recentTransactions' => $user->transactions()
                ->latest()
                ->limit(5)
                ->get([
                    'id',
                    'type',
                    'category',
                    'amount',
                    'description',
                    'status',
                    'created_at',
                ]),
        ]);
    }
    public function spend(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        $wallet = $user->wallet;
        $wallet?->resetCountersIfNeeded();

        return Inertia::render('Remaja/Spend', [
            'wallet' => $wallet,
            'pendingExpenses' => $user->transactions()
                ->where('type', 'expense')
                ->where('status', 'pending')
                ->latest()
                ->limit(5)
                ->get(['id', 'category', 'amount', 'description', 'created_at']),
        ]);
    }
}
