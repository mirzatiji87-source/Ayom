<?php

namespace App\Http\Controllers;

use App\Models\ApprovalRequest;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Simpan transaksi belanja (dipakai oleh form belanja lansia dan remaja).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'category' => 'required|in:makanan,transportasi,hiburan,tagihan,kesehatan,pendidikan,pakaian,belanja,lainnya',
            'description' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return back()->withErrors(['amount' => 'Dompet Anda belum diatur. Hubungi keluarga Anda.']);
        }

        // Reset hitungan harian/bulanan kalau sudah ganti hari/bulan
        $wallet->resetCountersIfNeeded();

        // Validasi ulang di backend (jangan andalkan frontend saja)
        if ($wallet->daily_limit && ($wallet->daily_spent + $validated['amount']) > $wallet->daily_limit) {
            return back()->withErrors(['amount' => 'Belanja hari ini sudah mencapai batas harian Anda.']);
        }

        if ($wallet->monthly_limit && ($wallet->monthly_spent + $validated['amount']) > $wallet->monthly_limit) {
            return back()->withErrors(['amount' => 'Belanja bulan ini sudah mencapai batas bulanan Anda.']);
        }

        if ($validated['amount'] > $wallet->balance) {
            return back()->withErrors(['amount' => 'Saldo Anda tidak mencukupi.']);
        }

        $butuhApproval = $wallet->requiresApproval((float) $validated['amount']);

        $transaction = DB::transaction(function () use ($validated, $user, $wallet, $butuhApproval) {
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'family_id' => $user->family_id,
                'type' => 'expense',
                'category' => $validated['category'],
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? null,
                'status' => $butuhApproval ? 'pending' : 'completed',
            ]);

            if ($butuhApproval) {
                ApprovalRequest::create([
                    'transaction_id' => $transaction->id,
                    'requested_by' => $user->id,
                    'status' => 'pending',
                ]);
            } else {
                // Transaksi kecil (di bawah approval_threshold) langsung dipotong dari saldo
                $wallet->recordSpending((float) $validated['amount']);
            }

            return $transaction;
        });

        $pesan = $transaction->status === 'pending'
            ? 'Belanja dicatat, menunggu persetujuan keluarga karena nominalnya cukup besar.'
            : 'Belanja berhasil dicatat.';

        return back()->with('success', $pesan);
    }

    /**
     * Riwayat transaksi milik user yang sedang login.
     */
    public function index(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return inertia('Shared/Transactions', [
            'transactions' => $transactions,
        ]);
    }
}