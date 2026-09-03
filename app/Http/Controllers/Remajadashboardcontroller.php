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
}