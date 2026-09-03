<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Family;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Label bahasa Indonesia untuk setiap `action` di activity_logs, dipakai
     * di feed "Aktivitas Terbaru". Fallback ke action mentah kalau belum
     * ada mapping (misal action baru ditambahkan tapi lupa didaftarkan di sini).
     */
    private const ACTION_LABELS = [
        'create_dependent' => 'membuat akun dependent baru',
        'update_dependent' => 'memperbarui data akun dependent',
        'deactivate_dependent' => 'menonaktifkan akun dependent',
        'top_up' => 'melakukan top-up saldo keluarga',
        'set_limit' => 'mengubah limit wallet',
        'approve_transaction' => 'menyetujui transaksi',
        'reject_transaction' => 'menolak transaksi',
    ];

    public function index(): Response
    {
        $usersByRole = User::selectRaw('role, count(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $stats = [
            'total_families' => Family::count(),
            'total_users' => User::count(),
            'total_balance' => (float) Family::sum('balance'),
            'pending_approvals' => ApprovalRequest::where('status', 'pending')->count(),
            'active_bills' => Bill::where('is_active', true)->count(),
            'users_by_role' => [
                'admin' => (int) ($usersByRole['admin'] ?? 0),
                'orang_tua' => (int) ($usersByRole['orang_tua'] ?? 0),
                'lansia' => (int) ($usersByRole['lansia'] ?? 0),
                'remaja' => (int) ($usersByRole['remaja'] ?? 0),
            ],
        ];

        $recentFamilies = Family::withCount('members')
            ->with('owner:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'owner_id', 'balance', 'created_at']);

        $recentActivity = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'action_label' => self::ACTION_LABELS[$log->action] ?? str_replace('_', ' ', $log->action),
                'user' => $log->user,
                'created_at' => $log->created_at,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentFamilies' => $recentFamilies,
            'recentActivity' => $recentActivity,
        ]);
    }
}
