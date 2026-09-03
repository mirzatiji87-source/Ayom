<?php

namespace App\Http\Controllers;

use App\Models\Family;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $usersByRole = User::selectRaw('role, COUNT(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_families' => Family::count(),
                'total_orang_tua' => $usersByRole->get('orang_tua', 0),
                'total_lansia' => $usersByRole->get('lansia', 0),
                'total_remaja' => $usersByRole->get('remaja', 0),
                'total_saldo_keluarga' => (float) Family::sum('balance'),
                'transaksi_pending' => Transaction::where('status', 'pending')->count(),
            ],
            'recentFamilies' => Family::withCount('members')
                ->with('owner:id,name')
                ->latest()
                ->take(6)
                ->get(['id', 'name', 'owner_id', 'balance', 'created_at']),
            'recentUsers' => User::with('family:id,name')
                ->latest()
                ->take(8)
                ->get(['id', 'name', 'email', 'role', 'family_id', 'is_active', 'created_at']),
        ]);
    }
}