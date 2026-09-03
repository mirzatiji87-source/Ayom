<?php
// app/Http/Controllers/LansiaDashboardController.php

namespace App\Http\Controllers;

use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LansiaDashboardController extends Controller
{
    /**
     * Halaman utama (dashboard) untuk role lansia.
     * Voice-first, minim teks, tombol besar — semua data yang
     * dibutuhkan disiapkan di sini agar frontend tinggal render.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['wallet', 'family']);
        $wallet = $user->wallet;

        // Tagihan paling dekat jatuh temponya (yang masih aktif)
        $upcomingBill = Bill::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('next_due_date')
            ->first();

        // Ada transaksi yang masih menunggu persetujuan orang tua?
        $pendingApprovals = ApprovalRequest::where('requested_by', $user->id)
            ->pending()
            ->count();

        // 5 transaksi terakhir, untuk riwayat singkat di dashboard
        $recentTransactions = Transaction::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get(['id', 'type', 'category', 'amount', 'description', 'status', 'created_at']);

        return Inertia::render('Lansia/Dashboard', [
            'lansia' => [
                'name' => $user->name,
                'family_name' => $user->family?->name,
                'family_phone' => $user->family?->owner?->phone,
            ],
            'wallet' => $wallet ? [
                'balance' => (float) $wallet->balance,
                'daily_limit' => $wallet->daily_limit !== null ? (float) $wallet->daily_limit : null,
                'daily_spent' => (float) $wallet->daily_spent,
                'daily_remaining' => $wallet->daily_limit !== null
                    ? max((float) $wallet->daily_limit - (float) $wallet->daily_spent, 0)
                    : null,
            ] : null,
            'upcomingBill' => $upcomingBill ? [
                'id' => $upcomingBill->id,
                'name' => $upcomingBill->name,
                'amount' => (float) $upcomingBill->amount,
                'next_due_date' => $upcomingBill->next_due_date->toDateString(),
                'is_due' => $upcomingBill->next_due_date->lte(today()),
            ] : null,
            'pendingApprovals' => $pendingApprovals,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}