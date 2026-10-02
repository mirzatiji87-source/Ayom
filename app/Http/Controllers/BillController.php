<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBillRequest;
use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    public function store(StoreBillRequest $request): RedirectResponse
    {
        $bill = Bill::create(
            $request->validated() + ['created_by' => Auth::id()]
        );

        ActivityLog::record('create_bill', Auth::user(), $bill);

        return redirect()->back()->with(
            'success',
            'Tagihan berhasil ditambahkan.'
        );
    }

    public function update(
        StoreBillRequest $request,
        Bill $bill
    ): RedirectResponse {
        $bill->update($request->validated());

        return redirect()->back()->with(
            'success',
            'Tagihan diperbarui.'
        );
    }

    public function destroy(Bill $bill): RedirectResponse
    {
        $bill->update(['is_active' => false]);

        return redirect()->back()->with(
            'success',
            'Tagihan dinonaktifkan.'
        );
    }

    public function myBills(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('Lansia/BillsReminder', [
            'bills' => $user->bills()
                ->where('is_active', true)
                ->get(),
        ]);
    }

    /**
     * Bayar manual sekarang juga.
     *
     * Jika nominal tagihan melebihi approval_threshold wallet lansia,
     * transaksi dibuat pending dan menunggu persetujuan orang tua.
     */
    public function payNow(
        Request $request,
        Bill $bill
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        abort_unless($bill->user_id === $user->id, 403);

        $wallet = $user->wallet;

        abort_unless(
            $wallet,
            422,
            'Dompet belum tersedia.'
        );

        if (!$wallet->hasSufficientBalance((float) $bill->amount)) {
            return back()->withErrors([
                'amount' => 'Saldo tidak cukup untuk membayar tagihan ini.',
            ]);
        }

        if ($wallet->requiresApproval((float) $bill->amount)) {
            DB::transaction(function () use ($bill, $user) {
                $transaction = Transaction::create([
                    'user_id' => $bill->user_id,
                    'family_id' => $user->family_id,
                    'bill_id' => $bill->id,
                    'type' => 'bill_payment',
                    'category' => 'tagihan',
                    'amount' => $bill->amount,
                    'description' => $bill->name,
                    'status' => 'pending',
                ]);

                ApprovalRequest::create([
                    'transaction_id' => $transaction->id,
                    'requested_by' => $user->id,
                    'status' => 'pending',
                ]);

                ActivityLog::record(
                    'request_bill_payment_approval',
                    $user,
                    $bill
                );
            });

            return redirect()->back()->with(
                'success',
                'Nominal ini di atas batas normal - menunggu persetujuan orang tua terlebih dahulu.'
            );
        }

        DB::transaction(function () use ($bill, $wallet, $user) {
            Transaction::create([
                'user_id' => $bill->user_id,
                'family_id' => $user->family_id,
                'bill_id' => $bill->id,
                'type' => 'bill_payment',
                'category' => 'tagihan',
                'amount' => $bill->amount,
                'description' => $bill->name,
                'status' => 'completed',
            ]);

            $wallet->recordSpending((float) $bill->amount);
            $bill->markAsPaid();

            ActivityLog::record(
                'pay_bill',
                $user,
                $bill
            );
        });

        return redirect()->back()->with(
            'success',
            'Tagihan berhasil dibayar.'
        );
    }

    public function myBillsOrangTua(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('OrangTua/MyBills', [
            'bills' => $user->bills()
                ->where('is_active', true)
                ->orderBy('next_due_date')
                ->get(),
        ]);
    }
}